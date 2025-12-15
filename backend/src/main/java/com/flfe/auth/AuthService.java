package com.flfe.auth;

import com.flfe.auth.dto.AuthResponse;
import com.flfe.auth.dto.LoginRequest;
import com.flfe.auth.dto.SignupRequest;
import com.flfe.email.EmailService;
import com.flfe.jwt.JwtService;
import com.flfe.user.AuthProvider;
import com.flfe.user.Role;
import com.flfe.user.User;
import com.flfe.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        Set<Role> roles = new HashSet<>();
        roles.add(Role.USER);
        user.setRoles(roles);
        userRepository.save(user);

        sendWelcome(user);

        String token = issueToken(user);
        return new AuthResponse(token, user.getEmail(), user.getName(), "USER");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new IllegalArgumentException("Use Google login for this account");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String role = user.getRoles().stream().findFirst().map(Enum::name).orElse("USER");
        String token = issueToken(user);
        return new AuthResponse(token, user.getEmail(), user.getName(), role);
    }

    public AuthResponse issueAfterOAuth(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String role = user.getRoles().stream().findFirst().map(Enum::name).orElse("USER");
        String token = issueToken(user);
        return new AuthResponse(token, user.getEmail(), user.getName(), role);
    }

    private String issueToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRoles().stream().findFirst().map(Enum::name).orElse("USER"));
        claims.put("name", user.getName());
        claims.put("picture", user.getPicture());
        return jwtService.generateToken(user.getEmail(), claims);
    }

    private void sendWelcome(User user) {
        emailService.sendWelcomeEmail(
                user.getEmail(),
                user.getName(),
                Arrays.asList(
                        "Manage your profile and preferences",
                        "Invite team members and set roles",
                        "Access dashboards and reports",
                        "Upload files and collaborate securely"
                )
        );
    }
}
