package com.indentity.identity_app.controller;

import com.indentity.identity_app.entity.LoginResponse;
import com.indentity.identity_app.entity.SessionToken;
import com.indentity.identity_app.entity.User;
import com.indentity.identity_app.service.AuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public LoginResponse login(@RequestBody LoginRequest req) {
       SessionToken session = authService.login(req.email, req.password);
         return new LoginResponse(session.getToken(), session.getExpiresAt());
    }


    @GetMapping("/me")
    public UserInfoResponse me(@AuthenticationPrincipal User user) {
        return new UserInfoResponse(user.getEmail(), user.getRole().name());
    }


    @PostMapping("/logout")
    public String logout(@AuthenticationPrincipal User user, @RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(user, token);
            return "Logged out successfully";
        } else {
            return "No valid token provided";
        }
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

    @Data
    @AllArgsConstructor
    static class UserInfoResponse {
        private String email;
        private String role;
    }
}
