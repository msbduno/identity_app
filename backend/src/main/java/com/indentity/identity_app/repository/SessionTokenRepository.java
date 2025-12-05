package com.indentity.identity_app.repository;

import com.indentity.identity_app.entity.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface SessionTokenRepository extends JpaRepository<SessionToken, Long> {
    void deleteByExpiresAtBefore(Instant now);

    Optional<SessionToken> findByToken(String token);

}