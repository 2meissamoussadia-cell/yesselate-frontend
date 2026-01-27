// lib/server/security/encryption.ts
// Phase P18: Chiffrement E2E pour exports sensibles (AES-256-GCM, PGP, age, secrets éphémères)

import crypto from 'node:crypto';

/**
 * Clé de chiffrement (doit être stockée de manière sécurisée, voir secrets management)
 * En production, utiliser un KMS (AWS KMS, HashiCorp Vault, etc.)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  // Si la clé est en hex, la convertir
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // Sinon, dériver une clé depuis la chaîne (SHA-256)
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Chiffre un buffer avec AES-256-GCM
 * 
 * @param plaintext - Données à chiffrer
 * @returns Objet avec ciphertext, iv, et authTag
 */
export function encrypt(plaintext: Buffer): {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16); // 128 bits pour AES
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return { ciphertext, iv, authTag };
}

/**
 * Déchiffre un buffer avec AES-256-GCM
 * 
 * @param encrypted - Objet avec ciphertext, iv, et authTag
 * @returns Données déchiffrées
 */
export function decrypt(encrypted: {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
}): Buffer {
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, encrypted.iv);
  decipher.setAuthTag(encrypted.authTag);
  
  return Buffer.concat([
    decipher.update(encrypted.ciphertext),
    decipher.final(),
  ]);
}

/**
 * Chiffre un fichier pour export E2E
 * 
 * @param fileBuffer - Buffer du fichier à chiffrer
 * @returns Buffer chiffré avec métadonnées (format: [ivLength][iv][authTagLength][authTag][ciphertext])
 */
export function encryptFile(fileBuffer: Buffer): Buffer {
  const { ciphertext, iv, authTag } = encrypt(fileBuffer);
  
  // Format: [ivLength(1)][iv][authTagLength(1)][authTag][ciphertext]
  const result = Buffer.concat([
    Buffer.from([iv.length]),
    iv,
    Buffer.from([authTag.length]),
    authTag,
    ciphertext,
  ]);
  
  return result;
}

/**
 * Déchiffre un fichier exporté avec E2E
 * 
 * @param encryptedBuffer - Buffer chiffré
 * @returns Buffer déchiffré
 */
export function decryptFile(encryptedBuffer: Buffer): Buffer {
  let offset = 0;
  
  // Lire IV
  const ivLength = encryptedBuffer[offset];
  offset += 1;
  const iv = encryptedBuffer.subarray(offset, offset + ivLength);
  offset += ivLength;
  
  // Lire authTag
  const authTagLength = encryptedBuffer[offset];
  offset += 1;
  const authTag = encryptedBuffer.subarray(offset, offset + authTagLength);
  offset += authTagLength;
  
  // Lire ciphertext
  const ciphertext = encryptedBuffer.subarray(offset);
  
  return decrypt({ ciphertext, iv, authTag });
}

/**
 * Génère une clé de chiffrement aléatoire (pour rotation)
 * 
 * @returns Clé hex (64 caractères pour AES-256)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Chiffre avec AES-256-GCM (version améliorée avec IV 12 bytes)
 * Phase P18: Aligné sur les meilleures pratiques (IV 12 bytes pour GCM)
 * 
 * @param plaintext - Données à chiffrer
 * @param rawKey - Clé brute (32 bytes pour AES-256)
 * @returns Objet avec ciphertext, iv (12 bytes), et authTag
 */
export function encryptAesGcm(buf: Buffer, rawKey: Buffer): {
  iv: Buffer;
  tag: Buffer;
  enc: Buffer;
} {
  // IV 12 bytes (96 bits) pour AES-GCM (recommandé)
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', rawKey, iv);
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, tag, enc };
}

/**
 * Déchiffre avec AES-256-GCM
 * 
 * @param encrypted - Objet avec enc, iv, tag
 * @param rawKey - Clé brute (32 bytes pour AES-256)
 * @returns Données déchiffrées
 */
export function decryptAesGcm(
  encrypted: { enc: Buffer; iv: Buffer; tag: Buffer },
  rawKey: Buffer
): Buffer {
  const decipher = crypto.createDecipheriv('aes-256-gcm', rawKey, encrypted.iv);
  decipher.setAuthTag(encrypted.tag);
  return Buffer.concat([decipher.update(encrypted.enc), decipher.final()]);
}

/**
 * Génère un secret éphémère (TOTP-like) pour chiffrement E2E
 * 
 * @param length - Longueur du secret en bytes (défaut: 32)
 * @returns Secret éphémère (base64url)
 */
export function generateEphemeralSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Chiffre avec un secret éphémère (pour partage via canal séparé)
 * 
 * Usage:
 * 1. Générer un secret éphémère
 * 2. Partager le secret via Teams/SMS (canal séparé)
 * 3. Chiffrer le fichier avec ce secret
 * 4. Le destinataire déchiffre avec le secret reçu
 * 
 * @param buf - Fichier à chiffrer
 * @param ephemeralSecret - Secret éphémère (base64url)
 * @returns Buffer chiffré avec métadonnées
 */
export function encryptWithEphemeralSecret(
  buf: Buffer,
  ephemeralSecret: string
): Buffer {
  // Dériver une clé depuis le secret éphémère
  const rawKey = crypto.createHash('sha256').update(ephemeralSecret).digest();
  
  // Chiffrer avec AES-256-GCM
  const { iv, tag, enc } = encryptAesGcm(buf, rawKey);
  
  // Format: [ivLength(1)][iv][authTagLength(1)][authTag][ciphertext]
  return Buffer.concat([
    Buffer.from([iv.length]),
    iv,
    Buffer.from([tag.length]),
    tag,
    enc,
  ]);
}

/**
 * Déchiffre avec un secret éphémère
 * 
 * @param encryptedBuffer - Buffer chiffré
 * @param ephemeralSecret - Secret éphémère (base64url)
 * @returns Buffer déchiffré
 */
export function decryptWithEphemeralSecret(
  encryptedBuffer: Buffer,
  ephemeralSecret: string
): Buffer {
  // Dériver la clé depuis le secret éphémère
  const rawKey = crypto.createHash('sha256').update(ephemeralSecret).digest();
  
  // Parser le buffer
  let offset = 0;
  const ivLength = encryptedBuffer[offset];
  offset += 1;
  const iv = encryptedBuffer.subarray(offset, offset + ivLength);
  offset += ivLength;
  const tagLength = encryptedBuffer[offset];
  offset += 1;
  const tag = encryptedBuffer.subarray(offset, offset + tagLength);
  offset += tagLength;
  const enc = encryptedBuffer.subarray(offset);
  
  return decryptAesGcm({ enc, iv, tag }, rawKey);
}

/**
 * Chiffre avec AES-256-GCM (format simplifié pour exports)
 * Phase P18: Format recommandé pour exports sensibles
 * 
 * @param buf - Buffer à chiffrer
 * @param rawKey - Clé brute (32 bytes pour AES-256)
 * @returns Objet avec iv, tag, enc
 */
export function encryptAesGcm(buf: Buffer, rawKey: Buffer): {
  iv: Buffer;
  tag: Buffer;
  enc: Buffer;
} {
  const iv = crypto.randomBytes(12); // 12 bytes pour GCM (96 bits)
  const cipher = crypto.createCipheriv('aes-256-gcm', rawKey, iv);
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, tag, enc };
}

/**
 * Déchiffre avec AES-256-GCM
 * 
 * @param encrypted - Objet avec iv, tag, enc
 * @param rawKey - Clé brute (32 bytes pour AES-256)
 * @returns Buffer déchiffré
 */
export function decryptAesGcm(
  encrypted: { iv: Buffer; tag: Buffer; enc: Buffer },
  rawKey: Buffer
): Buffer {
  const decipher = crypto.createDecipheriv('aes-256-gcm', rawKey, encrypted.iv);
  decipher.setAuthTag(encrypted.tag);
  return Buffer.concat([decipher.update(encrypted.enc), decipher.final()]);
}

/**
 * Génère un secret éphémère (TOTP-like) pour chiffrement E2E
 * Phase P18: Alternative à PGP/age pour partage sécurisé
 * 
 * @param length - Longueur du secret en bytes (défaut: 32)
 * @returns Secret base64url (sûr pour URLs)
 */
export function generateEphemeralSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Chiffre avec un secret éphémère (pour partage via canal séparé)
 * Phase P18: E2E avec secret partagé (Teams/SMS)
 * 
 * @param buf - Buffer à chiffrer
 * @param secret - Secret éphémère (base64url)
 * @returns Buffer chiffré avec métadonnées
 */
export function encryptWithEphemeralSecret(buf: Buffer, secret: string): Buffer {
  // Dériver une clé depuis le secret (HKDF)
  const secretBuffer = Buffer.from(secret, 'base64url');
  const key = crypto.createHash('sha256').update(secretBuffer).digest();
  
  // Chiffrer avec AES-256-GCM
  const { iv, tag, enc } = encryptAesGcm(buf, key);
  
  // Format: [ivLength(1)][iv][authTagLength(1)][authTag][ciphertext]
  return Buffer.concat([
    Buffer.from([iv.length]),
    iv,
    Buffer.from([tag.length]),
    tag,
    enc,
  ]);
}

/**
 * Déchiffre avec un secret éphémère
 * 
 * @param encryptedBuffer - Buffer chiffré
 * @param secret - Secret éphémère (base64url)
 * @returns Buffer déchiffré
 */
export function decryptWithEphemeralSecret(encryptedBuffer: Buffer, secret: string): Buffer {
  let offset = 0;
  
  // Lire IV
  const ivLength = encryptedBuffer[offset];
  offset += 1;
  const iv = encryptedBuffer.subarray(offset, offset + ivLength);
  offset += ivLength;
  
  // Lire authTag
  const authTagLength = encryptedBuffer[offset];
  offset += 1;
  const tag = encryptedBuffer.subarray(offset, offset + authTagLength);
  offset += authTagLength;
  
  // Lire ciphertext
  const enc = encryptedBuffer.subarray(offset);
  
  // Dériver la clé depuis le secret
  const secretBuffer = Buffer.from(secret, 'base64url');
  const key = crypto.createHash('sha256').update(secretBuffer).digest();
  
  return decryptAesGcm({ iv, tag, enc }, key);
}
