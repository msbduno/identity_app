package com.indentity.identity_app.dto.Request;

import lombok.Data;

// DTOs pour MFA avec JWT
@Data
public class LoginFirstRequest {
    public String email;
    public String password;
}
