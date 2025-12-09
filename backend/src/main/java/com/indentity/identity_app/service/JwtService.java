package com.indentity.identity_app.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.indentity.identity_app.entity.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final Algorithm algorithm;
    private final JWTVerifier verifier;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs
    ) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.verifier = JWT.require(algorithm)
                .withIssuer("identity-app")
                .build();
        this.expirationMs = expirationMs;
    }

    /**
     * Génère un JWT pour un utilisateur authentifié
     * 
     * @param email Email de l'utilisateur
     * @param role Rôle de l'utilisateur (USER ou ADMIN)
     * @return Le token JWT signé
     */
    public String generateToken(String email, Role role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusMillis(expirationMs);

        return JWT.create()
                .withIssuer("identity-app")
                .withSubject(email) // Subject = email de l'utilisateur
                .withClaim("role", role.name()) // Claim custom pour le rôle
                .withIssuedAt(Date.from(now))
                .withExpiresAt(Date.from(expiresAt))
                .sign(algorithm);
    }

    /**
     * Valide et décode un JWT
     * 
     * @param token Le token JWT à valider
     * @return Le JWT décodé avec ses claims
     * @throws JWTVerificationException Si le token est invalide ou expiré
     */
    public DecodedJWT verifyToken(String token) throws JWTVerificationException {
        return verifier.verify(token);
    }

    /**
     * Extrait l'email depuis un JWT
     * 
     * @param token Le token JWT
     * @return L'email de l'utilisateur
     */
    public String getEmailFromToken(String token) {
        DecodedJWT jwt = verifyToken(token);
        return jwt.getSubject();
    }

    /**
     * Extrait le rôle depuis un JWT
     * 
     * @param token Le token JWT
     * @return Le rôle de l'utilisateur
     */
    public Role getRoleFromToken(String token) {
        DecodedJWT jwt = verifyToken(token);
        String roleName = jwt.getClaim("role").asString();
        return Role.valueOf(roleName);
    }

    /**
     * Vérifie si un token est valide (non expiré et signature correcte)
     * 
     * @param token Le token JWT
     * @return true si valide, false sinon
     */
    public boolean isTokenValid(String token) {
        try {
            verifyToken(token);
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }
}
