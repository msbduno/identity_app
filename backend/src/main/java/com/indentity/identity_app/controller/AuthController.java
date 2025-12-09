package com.indentity.identity_app.controller;

import com.indentity.identity_app.dto.Request.*;
import com.indentity.identity_app.dto.Response.*;
import com.indentity.identity_app.entity.User;
import com.indentity.identity_app.service.AuthService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Enregistrement d'un nouvel utilisateur avec clé publique RSA
     */
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        authService.register(req.email, req.password, req.publicKey);
        return "User registered";
    }

    /**
     * STEP 1 du MFA : Validation du mot de passe
     * Retourne un token temporaire valide 5 minutes
     */
    @PostMapping("/login")
    public TempTokenResponse login(@RequestBody LoginFirstRequest req) {
        String tempToken = authService.loginStep1(req.email, req.password);
        return new TempTokenResponse(tempToken);
    }

    /**
     * STEP 2 du MFA : Demande un challenge (avec temporaryToken)
     * Le client doit ensuite signer ce challenge avec sa clé privée
     */
    @PostMapping("/challenge")
    public ChallengeResponse requestChallenge(@RequestBody ChallengeTokenRequest req) {
        String challenge = authService.requestChallengeWithToken(req.temporaryToken);
        return new ChallengeResponse(challenge);
    }

    /**
     * STEP 3 du MFA : Authentification par signature RSA
     * Le client envoie le temporaryToken + challenge + signature
     */
    @PostMapping("/authenticate")
    public JwtResponse authenticateWithSignature(@RequestBody AuthenticateRequest req) {
        String jwt = authService.authenticateWithSignature(
                req.temporaryToken,
                req.challenge,
                req.signature
        );
        return new JwtResponse(jwt);
    }

    /**
     * Récupère les informations de l'utilisateur connecté
     */
    @GetMapping("/me")
    public UserInfoResponse me(@AuthenticationPrincipal User user) {
        return new UserInfoResponse(user.getEmail(), user.getRole().name());
    }

}
