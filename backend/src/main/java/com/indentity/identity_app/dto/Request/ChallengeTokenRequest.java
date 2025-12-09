package com.indentity.identity_app.dto.Request;

import lombok.Data;

@Data
public class ChallengeTokenRequest {
    public String temporaryToken;
}