package com.indentity.identity_app.service;

import com.indentity.identity_app.repository.SessionTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionCleanupService {

    private final SessionTokenRepository sessionTokenRepository;

    @Transactional
    @Scheduled(fixedRate = 600_000)
    public void removeExpiredTokens() {
        Instant now = Instant.now();
        sessionTokenRepository.deleteByExpiresAtBefore(now);
        log.info("Expired session tokens removed at " + now);
    }
}
