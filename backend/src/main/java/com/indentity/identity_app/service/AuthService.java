package com.indentity.identity_app.service;

import com.indentity.identity_app.entity.User;
import com.indentity.identity_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void register(String email, String rawPassword) {
        if (userRepository.existsByEmail(email))
            throw new RuntimeException("User already exists");

        String hashed = passwordEncoder.encode(rawPassword);

        User user = User.builder()
                .email(email)
                .password(hashed)
                .build();

        userRepository.save(user);
    }

    public boolean login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        return passwordEncoder.matches(rawPassword, user.getPassword());
    }
}
