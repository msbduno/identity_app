// Fichier quin permet de générer et utiliser les clés RSA
/**
 * Génère une paire de clés RSA (publique + privée)
 * La clé privée reste dans le navigateur, seule la publique est envoyée au serveur
 */
export async function generateRSAKeyPair() {
  // Générer la paire de clés avec l'API Web Crypto (natif navigateur)
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5", // Algorithme compatible avec Java
      modulusLength: 2048, // Longueur de la clé (2048 bits = sécurisé)
      publicExponent: new Uint8Array([1, 0, 1]), // 65537 (standard)
      hash: "SHA-256", // Algorithme de hash
    },
    true, // extractable = true (on peut exporter la clé publique)
    ["sign", "verify"] // Utilisations autorisées
  );

  // Exporter la clé publique au format SPKI (Standard Public Key Infrastructure)
  const publicKeyBuffer = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );

  // Convertir en Base64 pour l'envoyer au serveur
  const publicKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(publicKeyBuffer))
  );

  return {
    publicKey: publicKeyBase64, // À envoyer au serveur
    privateKey: keyPair.privateKey, // À GARDER dans le navigateur
  };
}

/**
 * Signe un challenge avec la clé privée
 * C'est la preuve qu'on possède bien la clé privée
 */
export async function signChallenge(
  challenge: string,
  privateKey: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(challenge);

  // Signer avec la clé privée
  const signature = await window.crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    data
  );

  // Convertir la signature en Base64
  const signatureBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return signatureBase64;
}

/**
 * Stocke la clé privée de manière sécurisée dans IndexedDB
 * (plus sécurisé que localStorage)
 */
export async function storePrivateKey(email: string, privateKey: CryptoKey) {
  // Pour simplifier, on utilise localStorage dans cet exemple
  // En production, utilisez IndexedDB pour plus de sécurité
  const keyData = await window.crypto.subtle.exportKey("jwk", privateKey);
  localStorage.setItem(`privateKey_${email}`, JSON.stringify(keyData));
}

/**
 * Récupère la clé privée stockée
 */
export async function getPrivateKey(email: string): Promise<CryptoKey | null> {
  const keyDataStr = localStorage.getItem(`privateKey_${email}`);
  if (!keyDataStr) return null;

  const keyData = JSON.parse(keyDataStr);
  
  return await window.crypto.subtle.importKey(
    "jwk",
    keyData,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["sign"]
  );
}
