package com.indentity.identity_app.controller;

import com.indentity.identity_app.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        authService.register(req.email, req.password);
        return "User registered";
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest req) {
        boolean ok = authService.login(req.email, req.password);
        return ok ? "Login success" : "Invalid credentials";
    }

    @Data
    static class RegisterRequest {
        public String email;
        public String password;
    }

    @Data
    static class LoginRequest {
        public String email;
        public String password;
    }
}
