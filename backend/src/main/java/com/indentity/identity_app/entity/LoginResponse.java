package com.indentity.identity_app.entity;

import java.time.Instant;

public record LoginResponse(
        String token,
        Instant expiresAt
) {}
