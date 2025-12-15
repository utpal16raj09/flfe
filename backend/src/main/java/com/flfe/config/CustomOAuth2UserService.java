package com.flfe.config;

import com.flfe.user.AuthProvider;
import com.flfe.user.Role;
import com.flfe.user.User;
import com.flfe.user.UserRepository;
import com.flfe.email.EmailService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public CustomOAuth2UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.getOrDefault("name", email);
        String picture = (String) attributes.get("picture");

        boolean isNew = !userRepository.existsByEmail(email);
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProvider(AuthProvider.GOOGLE);
            Set<Role> roles = new HashSet<>();
            roles.add(Role.USER);
            newUser.setRoles(roles);
            return newUser;
        });

        user.setName(name);
        user.setProvider(AuthProvider.GOOGLE);
        user.setPicture(picture);
        userRepository.saveAndFlush(user);

        if (isNew) {
            try {
                emailService.sendWelcomeEmail(
                        user.getEmail(),
                        user.getName(),
                        java.util.Arrays.asList(
                                "Access dashboards and reports",
                                "Manage your profile and preferences",
                                "Invite teammates and set roles"
                        )
                );
            } catch (Exception e) {
                // Log but don't fail OAuth if email fails
                System.err.println("Failed to send welcome email: " + e.getMessage());
            }
        }

        return oAuth2User;
    }
}
