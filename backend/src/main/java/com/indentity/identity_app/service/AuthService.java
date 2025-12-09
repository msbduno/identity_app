package com.indentity.identity_app.service;

import com.indentity.identity_app.entity.Role;
import com.indentity.identity_app.entity.User;
import com.indentity.identity_app.exception.InvalidCredentialsException;
import com.indentity.identity_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChallengeService challengeService;
    private final SignatureService signatureService;
    private final TemporaryTokenService temporaryTokenService;
    private final JwtService jwtService;

    public void register(String email, String rawPassword, String publicKey) {
        if (userRepository.existsByEmail(email))
            throw new InvalidCredentialsException("User already exists with email: " + email);

        String hashed = passwordEncoder.encode(rawPassword);

        User user = User.builder()
                .email(email)
                .password(hashed)
                .publicKey(publicKey) // Stocker la clé publique (peut être null)
                .role(Role.USER)
                .build();

        userRepository.save(user);
    }

    // ========== MÉTHODES MFA AVEC JWT ==========

    /**
     * STEP 1 du MFA : Validation du mot de passe
     * Valide email + password et retourne un token temporaire (5 min)
     * 
     * @param email L'email de l'utilisateur
     * @param rawPassword Le mot de passe en clair
     * @return Un token temporaire à utiliser pour la suite du MFA
     */
    public String loginStep1(String email, String rawPassword) {
        // Vérifier que l'utilisateur existe
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        // Vérifier que l'utilisateur a une clé publique (sinon pas de MFA possible)
        if (user.getPublicKey() == null || user.getPublicKey().isEmpty()) {
            throw new InvalidCredentialsException("User does not have RSA keys configured");
        }

        // Générer et retourner un token temporaire
        return temporaryTokenService.generateTemporaryToken(email);
    }

    /**
     * Génère un challenge pour un utilisateur authentifié (via temporaryToken)
     * Le challenge est stocké dans Redis pendant 2 minutes
     * 
     * @param temporaryToken Token temporaire obtenu après validation du password
     * @return Le challenge généré
     */
    public String requestChallengeWithToken(String temporaryToken) {
        // Valider le token temporaire et récupérer l'email
        String email = temporaryTokenService.validateTemporaryToken(temporaryToken);
        
        if (email == null) {
            throw new InvalidCredentialsException("Invalid or expired temporary token");
        }

        // Générer et retourner le challenge
        return challengeService.generateChallenge(email);
    }

    /**
     * Authentifie un utilisateur en vérifiant sa signature RSA
     * STEP 3 du MFA : Validation finale avec temporaryToken + signature
     * 
     * @param temporaryToken Token temporaire obtenu au step1
     * @param challenge Le challenge reçu précédemment
     * @param signature La signature du challenge (signée avec la clé privée)
     * @return Un JWT si l'authentification réussit
     */
    public String authenticateWithSignature(String temporaryToken, String challenge, String signature) {
        // 1. Consommer le token temporaire et récupérer l'email
        String email = temporaryTokenService.consumeTemporaryToken(temporaryToken);
        
        if (email == null) {
            throw new InvalidCredentialsException("Invalid or expired temporary token");
        }

        // 2. Récupérer l'utilisateur
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        // 3. Vérifier que le challenge est valide et le consommer (usage unique)
        if (!challengeService.validateAndConsumeChallenge(email, challenge)) {
            throw new InvalidCredentialsException("Invalid or expired challenge");
        }

        // 4. Vérifier la signature avec la clé publique de l'utilisateur
        if (!signatureService.verifySignature(challenge, signature, user.getPublicKey())) {
            throw new InvalidCredentialsException("Invalid signature");
        }

        // 5. Générer et retourner un JWT (authentification MFA complète)
        return jwtService.generateToken(user.getEmail(), user.getRole());
    }

}
