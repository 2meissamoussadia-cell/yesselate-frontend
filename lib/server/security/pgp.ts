// lib/server/security/pgp.ts
// Phase P18: Support PGP pour chiffrement E2E (alternative à AES-GCM avec secret éphémère)

/**
 * Chiffrement PGP pour exports sensibles
 * 
 * Note: Nécessite l'installation de 'openpgp' ou 'pgp' package
 * npm install openpgp
 * 
 * Usage:
 * 1. Le destinataire génère une paire de clés PGP (clé publique + privée)
 * 2. La clé publique est stockée dans la DB (table user_keys ou similaire)
 * 3. Le serveur chiffre avec la clé publique
 * 4. Seul le destinataire peut déchiffrer avec sa clé privée
 */

// Type pour éviter les erreurs si openpgp n'est pas installé
type OpenPGP = typeof import('openpgp');

let openpgpModule: OpenPGP | null = null;

/**
 * Charge le module openpgp (lazy loading)
 */
async function loadOpenPGP(): Promise<OpenPGP> {
  if (!openpgpModule) {
    try {
      openpgpModule = await import('openpgp');
    } catch (error) {
      throw new Error(
        'openpgp package is required for PGP encryption. Install it with: npm install openpgp'
      );
    }
  }
  return openpgpModule;
}

/**
 * Chiffre un buffer avec une clé publique PGP
 * 
 * @param plaintext - Données à chiffrer
 * @param publicKeyArmored - Clé publique PGP (format armored)
 * @returns Message chiffré (format armored)
 */
export async function encryptWithPGP(
  plaintext: Buffer,
  publicKeyArmored: string
): Promise<string> {
  const openpgp = await loadOpenPGP();
  
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  
  const message = await openpgp.createMessage({
    binary: plaintext,
  });
  
  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: publicKey,
  });
  
  return encrypted as string; // Format armored
}

/**
 * Déchiffre un message PGP avec une clé privée
 * 
 * @param encryptedArmored - Message chiffré (format armored)
 * @param privateKeyArmored - Clé privée PGP (format armored)
 * @param passphrase - Passphrase pour déverrouiller la clé privée (optionnel)
 * @returns Données déchiffrées
 */
export async function decryptWithPGP(
  encryptedArmored: string,
  privateKeyArmored: string,
  passphrase?: string
): Promise<Buffer> {
  const openpgp = await loadOpenPGP();
  
  const privateKey = await openpgp.readPrivateKey({
    armoredKey: privateKeyArmored,
  });
  
  if (passphrase) {
    const key = privateKey as unknown as { decrypt?: (p: string) => Promise<void> };
    if (typeof key.decrypt === 'function') await key.decrypt(passphrase);
  }
  
  const message = await openpgp.readMessage({
    armoredMessage: encryptedArmored,
  });
  
  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
  });
  
  return Buffer.from(await data.arrayBuffer());
}

/**
 * Génère une paire de clés PGP
 * 
 * @param userId - Identité de l'utilisateur (ex: 'user@example.com')
 * @param passphrase - Passphrase pour protéger la clé privée (optionnel)
 * @returns Paire de clés (publique + privée)
 */
export async function generatePGPKeyPair(
  userId: string,
  passphrase?: string
): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const openpgp = await loadOpenPGP();
  
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 4096,
    userIDs: [{ name: userId }],
    passphrase,
  });
  
  const pubArmored = typeof publicKey === 'string' ? publicKey : (publicKey as unknown as { armor: () => string }).armor();
  const privArmored = typeof privateKey === 'string' ? privateKey : (privateKey as unknown as { armor: () => string }).armor();
  return {
    publicKey: pubArmored,
    privateKey: privArmored,
  };
}
