package com.indentity.identity_app.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

/**
 * Service de gestion des challenges d'authentification
 * Un challenge est une chaîne aléatoire que le client doit signer
 * avec sa clé privée pour prouver son identité
 */
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final RedisTemplate<String, String> redisTemplate;
    
    // Préfixe pour les clés Redis
    private static final String CHALLENGE_PREFIX = "challenge:";
    
    // Durée de vie du challenge : 2 minutes
    private static final Duration CHALLENGE_TTL = Duration.ofMinutes(2);

    /**
     * Génère un nouveau challenge pour un utilisateur
     * 
     * @param email L'email de l'utilisateur
     * @return Le challenge généré (chaîne Base64)
     */
    public String generateChallenge(String email) {
        String challenge = generateRandomString();
        
        // Stocker dans Redis avec TTL (Time To Live)
        String redisKey = CHALLENGE_PREFIX + email;
        redisTemplate.opsForValue().set(redisKey, challenge, CHALLENGE_TTL);
        
        return challenge;
    }

    /**
     * Valide un challenge et le supprime (usage unique)
     * 
     * @param email L'email de l'utilisateur
     * @param challenge Le challenge à valider
     * @return true si le challenge est valide, false sinon
     */
    public boolean validateAndConsumeChallenge(String email, String challenge) {
        String redisKey = CHALLENGE_PREFIX + email;
        
        // Récupérer le challenge stocké
        String storedChallenge = redisTemplate.opsForValue().get(redisKey);
        
        // Vérifier qu'il existe et correspond
        if (storedChallenge != null && storedChallenge.equals(challenge)) {
            // Supprimer le challenge (usage unique)
            redisTemplate.delete(redisKey);
            return true;
        }
        
        return false;
    }

    /**
     * Génère une chaîne aléatoire sécurisée de 32 octets
     * 
     * @return Chaîne Base64 URL-safe
     */
    private String generateRandomString() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32]; // 32 octets = 256 bits
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
