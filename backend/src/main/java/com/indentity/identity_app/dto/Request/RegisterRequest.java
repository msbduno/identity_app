package com.indentity.identity_app.dto.Request;

import lombok.Data;

@Data
public class RegisterRequest {
    public String email;
    public String password;
    public String publicKey; // Clé publique RSA au format Base64
}