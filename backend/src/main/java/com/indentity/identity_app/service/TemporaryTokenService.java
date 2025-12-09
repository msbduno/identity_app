package com.indentity.identity_app.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

@Service
public class TemporaryTokenService {

    private static final String TEMP_TOKEN_PREFIX = "temp_token:";
    private static final Duration TOKEN_VALIDITY = Duration.ofMinutes(5); // 5 minutes pour compléter le MFA
    private final RedisTemplate<String, String> redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public TemporaryTokenService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Génère un token temporaire après validation du mot de passe
     * @param email Email de l'utilisateur
     * @return Le token temporaire (Base64)
     */
    public String generateTemporaryToken(String email) {
        // Générer un token aléatoire de 32 bytes
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        // Stocker dans Redis : token → email
        String key = TEMP_TOKEN_PREFIX + token;
        redisTemplate.opsForValue().set(key, email, TOKEN_VALIDITY);

        return token;
    }

    /**
     * Valide et récupère l'email associé au token temporaire
     * @param token Le token temporaire
     * @return L'email si valide, null sinon
     */
    public String validateTemporaryToken(String token) {
        String key = TEMP_TOKEN_PREFIX + token;
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Consomme le token temporaire (suppression après usage)
     * @param token Le token temporaire
     * @return L'email si valide et consommé, null sinon
     */
    public String consumeTemporaryToken(String token) {
        String key = TEMP_TOKEN_PREFIX + token;
        String email = redisTemplate.opsForValue().get(key);
        
        if (email != null) {
            redisTemplate.delete(key);
        }
        
        return email;
    }
}
