import { generateRSAKeyPair, storePrivateKey, getPrivateKey, signChallenge } from "./crypto-utils";

export const API_URL = "http://localhost:8080/auth";

interface JwtResponse {
    token: string; // JWT token
}

interface UserResponse {
    email: string;
    role: string;
}

interface ChallengeResponse {
    challenge: string;
}

interface TempTokenResponse {
    temporaryToken: string;
}

/**
 * Inscription avec génération automatique de clés RSA
 * La clé publique est envoyée au serveur
 * La clé privée est stockée localement
 */
export async function register(email: string, password: string) {
    // 1. Générer la paire de clés RSA
    const { publicKey, privateKey } = await generateRSAKeyPair();
    
    // 2. Envoyer au serveur : email + password + publicKey
    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email, 
            password,
            publicKey  // ← Clé publique RSA
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
    }

    // 3. Stocker la clé privée localement
    await storePrivateKey(email, privateKey);

    return res.text();
}

/**
 * Connexion avec MFA (Multi-Factor Authentication)
 * STEP 1 : Validation du mot de passe → temporaryToken
 * STEP 2 : Challenge avec temporaryToken → challenge
 * STEP 3 : Signature du challenge → authentification complète avec JWT
 */
export async function loginWithMFA(email: string, password: string): Promise<JwtResponse> {
    // STEP 1 : Valider le mot de passe et obtenir un token temporaire
    const step1Res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!step1Res.ok) {
        const text = await step1Res.text();
        throw new Error(text || "Invalid email or password");
    }

    const { temporaryToken }: TempTokenResponse = await step1Res.json();

    // STEP 2 : Récupérer la clé privée et demander un challenge
    const privateKey = await getPrivateKey(email);
    if (!privateKey) {
        throw new Error("Clé privée non trouvée. Veuillez vous réinscrire.");
    }

    const challengeRes = await fetch(`${API_URL}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temporaryToken }),
    });

    if (!challengeRes.ok) {
        const text = await challengeRes.text();
        throw new Error(text || "Failed to get challenge");
    }

    const { challenge }: ChallengeResponse = await challengeRes.json();

    // STEP 3 : Signer le challenge et s'authentifier
    const signature = await signChallenge(challenge, privateKey);

    const authRes = await fetch(`${API_URL}/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            temporaryToken,
            challenge,
            signature,
        }),
    });

    if (!authRes.ok) {
        const text = await authRes.text();
        throw new Error(text || "Authentication failed");
    }

    return authRes.json();
}

export async function getCurrentUser(token: string): Promise<UserResponse> {
    const res = await fetch(`${API_URL}/me`, { // ← Devient /auth/me
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        throw new Error("Unauthorized");
    }

    return res.json();
}