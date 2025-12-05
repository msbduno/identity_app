package com.indentity.identity_app.service;

import com.indentity.identity_app.entity.Role;
import com.indentity.identity_app.entity.SessionToken;
import com.indentity.identity_app.entity.User;
import com.indentity.identity_app.exception.InvalidCredentialsException;
import com.indentity.identity_app.exception.InvalidTokenException;
import com.indentity.identity_app.exception.TokenExpiredException;
import com.indentity.identity_app.repository.SessionTokenRepository;
import com.indentity.identity_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionTokenRepository sessionTokenRepository;

    public void register(String email, String rawPassword) {
        if (userRepository.existsByEmail(email))
            throw new InvalidCredentialsException("User already exists with email: " + email);

        String hashed = passwordEncoder.encode(rawPassword);

        User user = User.builder()
                .email(email)
                .password(hashed)
                .role(Role.USER)
                .build();

        userRepository.save(user);
    }

    public SessionToken login(String email, String rawPassword) {
        sessionTokenRepository.deleteByExpiresAtBefore(Instant.now());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofHours(24));

        SessionToken sessionToken = SessionToken.builder()
                .token(generateSecureToken())
                .user(user)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        sessionTokenRepository.save(sessionToken);

        return sessionToken;
    }

    private String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

    }

    public User getUserFromToken(String token) {
        SessionToken session = sessionTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid token"));

        if (session.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException("Token expired");
        }

        return session.getUser();
    }

    public void logout(User user, String token) {
        SessionToken session = sessionTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid token"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new InvalidTokenException("Token does not belong to the user");
        }

        sessionTokenRepository.delete(session);
    }

}
