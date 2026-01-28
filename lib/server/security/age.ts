// lib/server/security/age.ts
// Phase P18: Support age pour chiffrement E2E (alternative moderne à PGP)

/**
 * Chiffrement age pour exports sensibles
 * 
 * age (Actually Good Encryption) est une alternative moderne à PGP
 * Plus simple, plus rapide, et plus sûr que PGP.
 * 
 * Note: Nécessite l'installation de '@age-js/age' ou utilisation d'un wrapper CLI
 * npm install @age-js/age
 * 
 * Usage:
 * 1. Le destinataire génère une paire de clés age (clé publique + privée)
 * 2. La clé publique est stockée dans la DB
 * 3. Le serveur chiffre avec la clé publique
 * 4. Seul le destinataire peut déchiffrer avec sa clé privée
 */

// Type minimal pour éviter les erreurs si @age-js/age n'est pas installé
type AgeJS = {
  x25519RecipientFrom: (key: string) => unknown;
  x25519IdentityFrom: (key: string) => unknown;
  encrypt: (plaintext: Buffer, recipients: unknown[]) => Promise<ArrayBuffer | Uint8Array>;
  decrypt: (encrypted: Buffer | Uint8Array, identities: unknown[]) => Promise<ArrayBuffer | Uint8Array>;
  generateIdentity: () => { recipient: () => { toString: () => string }; toString: () => string };
};

let ageModule: AgeJS | null = null;

/**
 * Charge le module @age-js/age (lazy loading)
 */
const AGE_MODULE_PATH = '@age-js/age';

async function loadAge(): Promise<AgeJS> {
  if (!ageModule) {
    try {
      ageModule = (await import(/* @vite-ignore */ AGE_MODULE_PATH)) as AgeJS;
    } catch (error) {
      throw new Error(
        '@age-js/age package is required for age encryption. Install it with: npm install @age-js/age'
      );
    }
  }
  return ageModule;
}

/**
 * Chiffre un buffer avec une clé publique age
 * 
 * @param plaintext - Données à chiffrer
 * @param publicKey - Clé publique age (format X25519)
 * @returns Message chiffré (format age)
 */
export async function encryptWithAge(
  plaintext: Buffer,
  publicKey: string
): Promise<Buffer> {
  const age = await loadAge();
  
  // age utilise X25519 pour les clés publiques
  const recipient = age.x25519RecipientFrom(publicKey);
  const encrypted = await age.encrypt(plaintext, [recipient]);
  const arr = encrypted instanceof Uint8Array ? encrypted : new Uint8Array(encrypted);
  return Buffer.from(arr);
}

/**
 * Déchiffre un message age avec une clé privée
 * 
 * @param encrypted - Message chiffré
 * @param privateKey - Clé privée age (format X25519)
 * @returns Données déchiffrées
 */
export async function decryptWithAge(
  encrypted: Buffer,
  privateKey: string
): Promise<Buffer> {
  const age = await loadAge();
  
  const identity = age.x25519IdentityFrom(privateKey);
  const decrypted = await age.decrypt(encrypted, [identity]);
  const arr = decrypted instanceof Uint8Array ? decrypted : new Uint8Array(decrypted);
  return Buffer.from(arr);
}

/**
 * Génère une paire de clés age (X25519)
 * 
 * @returns Paire de clés (publique + privée)
 */
export async function generateAgeKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const age = await loadAge();
  
  const identity = age.generateIdentity();
  
  return {
    publicKey: identity.recipient().toString(),
    privateKey: identity.toString(),
  };
}
