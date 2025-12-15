package com.flfe.config;

import com.flfe.email.EmailService;
import com.flfe.jwt.JwtService;
import com.flfe.user.AuthProvider;
import com.flfe.user.Role;
import com.flfe.user.User;
import com.flfe.user.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.oauth2.redirectUri:http://localhost:3000/oauth/callback}")
    private String frontendRedirectUri;

    public OAuth2SuccessHandler(JwtService jwtService, UserRepository userRepository, EmailService emailService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();
        String email = (String) oauthUser.getAttributes().get("email");
        String name = (String) oauthUser.getAttributes().getOrDefault("name", email);
        String picture = (String) oauthUser.getAttributes().get("picture");

        // Find or create user
        boolean isNew = !userRepository.existsByEmail(email);
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProvider(AuthProvider.GOOGLE);
            newUser.setPicture(picture);
            Set<Role> roles = new HashSet<>();
            roles.add(Role.USER);
            newUser.setRoles(roles);
            return userRepository.save(newUser);
        });

        // Update latest info
        user.setName(name);
        user.setPicture(picture);
        userRepository.save(user);

        // Send welcome email for new users
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
                System.err.println("Failed to send welcome email: " + e.getMessage());
            }
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRoles().stream().findFirst().map(Enum::name).orElse("USER"));
        claims.put("name", name);
        claims.put("picture", picture);
        String token = jwtService.generateToken(email, claims);

        String redirectUrl = frontendRedirectUri + "?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}
