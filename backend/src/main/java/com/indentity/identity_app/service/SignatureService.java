package com.indentity.identity_app.service;

import com.indentity.identity_app.exception.InvalidCredentialsException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Service de vérification des signatures RSA
 * 
 * Vérifie qu'une signature a bien été créée avec la clé privée
 * correspondant à la clé publique stockée
 */
@Service
@Slf4j
public class SignatureService {

    /**
     * Vérifie qu'une signature est valide
     * 
     * @param challenge Le challenge original (texte)
     * @param signatureBase64 La signature encodée en Base64
     * @param publicKeyBase64 La clé publique encodée en Base64 (format SPKI)
     * @return true si la signature est valide, false sinon
     */
    public boolean verifySignature(String challenge, String signatureBase64, String publicKeyBase64) {
        try {
            // 1. Décoder la clé publique depuis Base64
            PublicKey publicKey = decodePublicKey(publicKeyBase64);
            
            // 2. Décoder la signature depuis Base64
            byte[] signatureBytes = Base64.getDecoder().decode(signatureBase64);
            
            // 3. Créer le vérificateur de signature
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            
            // 4. Fournir les données originales (le challenge)
            signature.update(challenge.getBytes());
            
            // 5. Vérifier la signature
            boolean isValid = signature.verify(signatureBytes);
            
            if (isValid) {
                log.info(" Signature valide");
            } else {
                log.warn(" Signature invalide");
            }
            
            return isValid;
            
        } catch (Exception e) {
            log.error("Erreur lors de la vérification de la signature: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Décode une clé publique RSA depuis Base64 (format SPKI)
     * 
     * @param publicKeyBase64 La clé publique en Base64
     * @return L'objet PublicKey Java
     */
    private PublicKey decodePublicKey(String publicKeyBase64) {
        try {
            // Décoder le Base64
            byte[] keyBytes = Base64.getDecoder().decode(publicKeyBase64);
            
            // Créer la spécification X.509 (format SPKI)
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            
            // Générer la clé publique RSA
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePublic(spec);
            
        } catch (Exception e) {
            log.error("Erreur lors du décodage de la clé publique: {}", e.getMessage());
            throw new InvalidCredentialsException("Clé publique invalide");
        }
    }
}
