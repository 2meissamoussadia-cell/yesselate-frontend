/**
 * Utilitaires de chiffrement
 * Phase P15: Sécurité des données - Chiffrement at-rest et E2E
 * 
 * Supporte :
 * - AES-256-GCM pour chiffrement symétrique
 * - PGP/age pour chiffrement E2E (clé publique destinataire)
 * - Rotation de clés (KEK/DEK)
 */

import crypto from 'node:crypto';

// ============================================================================
// AES-256-GCM (Chiffrement symétrique)
// ============================================================================

export interface AesGcmEncrypted {
  iv: Buffer;      // Initialization Vector (12 bytes pour GCM)
  tag: Buffer;     // Authentication Tag (16 bytes)
  enc: Buffer;     // Données chiffrées
}

/**
 * Chiffre un buffer avec AES-256-GCM
 * 
 * @param buf - Buffer à chiffrer
 * @param rawKey - Clé brute (32 bytes pour AES-256)
 * @returns Objet avec IV, tag d'authentification et données chiffrées
 * 
 * @example
 * ```ts
 * const key = crypto.randomBytes(32);
 * const encrypted = encryptAesGcm(Buffer.from('sensitive data'), key);
 * // Stocker encrypted.iv, encrypted.tag, encrypted.enc séparément
 * ```
 */
export function encryptAesGcm(buf: Buffer, rawKey: Buffer): AesGcmEncrypted {
  if (rawKey.length !== 32) {
    throw new Error('AES-256 requires a 32-byte key');
  }

  const iv = crypto.randomBytes(12); // 12 bytes pour GCM (recommandé)
  const cipher = crypto.createCipheriv('aes-256-gcm', rawKey, iv);
  
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag(); // 16 bytes par défaut
  
  return { iv, tag, enc };
}

/**
 * Déchiffre un buffer chiffré avec AES-256-GCM
 * 
 * @param encrypted - Objet avec IV, tag et données chiffrées
 * @param rawKey - Clé brute (32 bytes pour AES-256)
 * @returns Buffer déchiffré
 * 
 * @example
 * ```ts
 * const decrypted = decryptAesGcm(encrypted, key);
 * const text = decrypted.toString('utf-8');
 * ```
 */
export function decryptAesGcm(encrypted: AesGcmEncrypted, rawKey: Buffer): Buffer {
  if (rawKey.length !== 32) {
    throw new Error('AES-256 requires a 32-byte key');
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', rawKey, encrypted.iv);
  decipher.setAuthTag(encrypted.tag);
  
  return Buffer.concat([decipher.update(encrypted.enc), decipher.final()]);
}

/**
 * Génère une clé AES-256 aléatoire
 * 
 * @returns Buffer de 32 bytes
 */
export function generateAesKey(): Buffer {
  return crypto.randomBytes(32);
}

// ============================================================================
// Chiffrement avec secret éphémère (TOTP/one-time link)
// ============================================================================

/**
 * Chiffre avec un secret éphémère (pour partage sécurisé)
 * 
 * @param buf - Buffer à chiffrer
 * @param secret - Secret éphémère (peut être un TOTP ou secret partagé)
 * @returns Objet chiffré avec IV, tag et données
 * 
 * @example
 * ```ts
 * // Secret partagé via canal séparé (Teams/SMS)
 * const secret = 'one-time-secret-from-teams';
 * const key = crypto.createHash('sha256').update(secret).digest();
 * const encrypted = encryptAesGcm(buf, key);
 * ```
 */
export function encryptWithEphemeralSecret(buf: Buffer, secret: string): AesGcmEncrypted {
  // Dériver une clé AES-256 depuis le secret (SHA-256)
  const key = crypto.createHash('sha256').update(secret).digest();
  return encryptAesGcm(buf, key);
}

/**
 * Déchiffre avec un secret éphémère
 * 
 * @param encrypted - Données chiffrées
 * @param secret - Secret éphémère (même que pour le chiffrement)
 * @returns Buffer déchiffré
 */
export function decryptWithEphemeralSecret(encrypted: AesGcmEncrypted, secret: string): Buffer {
  const key = crypto.createHash('sha256').update(secret).digest();
  return decryptAesGcm(encrypted, key);
}

// ============================================================================
// PGP/age (Chiffrement E2E avec clé publique)
// ============================================================================

/**
 * Chiffre avec une clé publique PGP (via openpgp)
 * 
 * Note: Nécessite le package 'openpgp' installé
 * 
 * @param buf - Buffer à chiffrer
 * @param publicKeyArmored - Clé publique PGP au format armored
 * @returns Buffer chiffré (message PGP)
 * 
 * @example
 * ```ts
 * const publicKey = await fs.readFile('recipient.pub', 'utf-8');
 * const encrypted = await encryptWithPgp(buf, publicKey);
 * ```
 */
export async function encryptWithPgp(buf: Buffer, publicKeyArmored: string): Promise<Buffer> {
  try {
    // Dynamique import pour éviter dépendance si non utilisée
    const openpgp = await import('openpgp');
    
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ binary: buf }),
      encryptionKeys: publicKey,
    });
    
    return Buffer.from(await encrypted.getBytes());
  } catch (error) {
    throw new Error(`PGP encryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Chiffre avec age (format simple, alternative à PGP)
 * 
 * Note: Nécessite le package '@age-js/encryption' ou implémentation native
 * 
 * @param buf - Buffer à chiffrer
 * @param recipientPublicKey - Clé publique age (format X25519)
 * @returns Buffer chiffré (format age)
 */
export async function encryptWithAge(buf: Buffer, recipientPublicKey: string): Promise<Buffer> {
  // Placeholder : implémentation age nécessite une bibliothèque spécifique
  // Pour l'instant, utiliser AES-GCM avec secret éphémère comme alternative
  throw new Error('age encryption not yet implemented - use encryptWithEphemeralSecret as alternative');
}

// ============================================================================
// Utilitaires de rotation de clés
// ============================================================================

/**
 * Structure pour gestion KEK/DEK (Key Encryption Key / Data Encryption Key)
 */
export interface KeyEnvelope {
  kekId: string;        // ID de la KEK (géré par KMS)
  dek: Buffer;          // DEK chiffré avec KEK
  algorithm: string;    // 'aes-256-gcm'
  createdAt: Date;
}

/**
 * Chiffre une DEK avec une KEK (enveloppe)
 * 
 * @param dek - Data Encryption Key (clé de données)
 * @param kek - Key Encryption Key (clé de chiffrement de clé)
 * @param kekId - Identifiant de la KEK (pour rotation)
 * @returns Enveloppe avec DEK chiffrée
 */
export function wrapDek(dek: Buffer, kek: Buffer, kekId: string): KeyEnvelope {
  const encrypted = encryptAesGcm(dek, kek);
  
  // Encoder l'enveloppe (kekId + iv + tag + enc)
  return {
    kekId,
    dek: Buffer.concat([encrypted.iv, encrypted.tag, encrypted.enc]),
    algorithm: 'aes-256-gcm',
    createdAt: new Date(),
  };
}

/**
 * Déchiffre une DEK depuis une enveloppe
 * 
 * @param envelope - Enveloppe avec DEK chiffrée
 * @param kek - Key Encryption Key
 * @returns DEK déchiffrée
 */
export function unwrapDek(envelope: KeyEnvelope, kek: Buffer): Buffer {
  const iv = envelope.dek.subarray(0, 12);
  const tag = envelope.dek.subarray(12, 28);
  const enc = envelope.dek.subarray(28);
  
  return decryptAesGcm({ iv, tag, enc }, kek);
}

// ============================================================================
// Helpers pour exports
// ============================================================================

/**
 * Chiffre un fichier exporté (PDF/XLSX) avec secret éphémère
 * 
 * @param fileBuffer - Buffer du fichier à chiffrer
 * @param secret - Secret éphémère (partagé via canal séparé)
 * @returns Buffer chiffré + métadonnées
 */
export function encryptExportFile(fileBuffer: Buffer, secret: string): {
  encrypted: AesGcmEncrypted;
  metadata: {
    originalSize: number;
    algorithm: string;
    encryptedAt: Date;
  };
} {
  const encrypted = encryptWithEphemeralSecret(fileBuffer, secret);
  
  return {
    encrypted,
    metadata: {
      originalSize: fileBuffer.length,
      algorithm: 'aes-256-gcm',
      encryptedAt: new Date(),
    },
  };
}

/**
 * Déchiffre un fichier exporté
 * 
 * @param encrypted - Données chiffrées
 * @param secret - Secret éphémère (même que pour le chiffrement)
 * @returns Buffer du fichier déchiffré
 */
export function decryptExportFile(encrypted: AesGcmEncrypted, secret: string): Buffer {
  return decryptWithEphemeralSecret(encrypted, secret);
}
