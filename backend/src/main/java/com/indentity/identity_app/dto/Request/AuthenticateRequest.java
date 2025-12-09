package com.indentity.identity_app.dto.Request;

import lombok.Data;

@Data
public class AuthenticateRequest {
    public String temporaryToken;
    public String challenge;
    public String signature; // Signature du challenge en Base64
}