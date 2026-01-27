// lib/server/security/atRest.ts
// Phase P18: Chiffrement at-rest avec modèle enveloppe (KEK/DEK)

import crypto from 'node:crypto';
import { getSecret } from './secrets';

/**
 * Modèle enveloppe (Envelope Encryption) :
 * - KEK (Key Encryption Key) : géré par KMS, rotation annuelle
 * - DEK (Data Encryption Key) : généré par objet, chiffré avec KEK
 * - Données : chiffrées avec DEK
 */

/**
 * Interface pour une clé chiffrée (enveloppe)
 */
interface EncryptedKey {
  kekId: string; // ID de la KEK utilisée
  encryptedDek: Buffer; // DEK chiffré avec KEK
  algorithm: string; // Algorithme de chiffrement (aes-256-gcm)
}

/**
 * Génère un DEK (Data Encryption Key) et le chiffre avec la KEK
 * 
 * @param kekId - ID de la KEK (Key Encryption Key)
 * @param tenantId - ID du tenant (pour isolation)
 * @returns DEK chiffré (enveloppe)
 */
export async function generateAndEncryptDEK(
  kekId: string,
  tenantId: string
): Promise<EncryptedKey> {
  // 1. Générer un DEK aléatoire (32 bytes pour AES-256)
  const dek = crypto.randomBytes(32);
  
  // 2. Récupérer la KEK depuis le KMS
  const kek = await getSecret(tenantId, `kek-${kekId}`);
  if (!kek) {
    throw new Error(`KEK not found: ${kekId}`);
  }
  
  // 3. Chiffrer le DEK avec la KEK (AES-256-GCM)
  const kekBuffer = Buffer.from(kek, 'hex');
  const { iv, tag, enc } = encryptAesGcm(dek, kekBuffer);
  
  return {
    kekId,
    encryptedDek: Buffer.concat([iv, tag, enc]), // Format: [iv][tag][enc]
    algorithm: 'aes-256-gcm',
  };
}

/**
 * Déchiffre un DEK depuis son enveloppe
 * 
 * @param encryptedKey - DEK chiffré (enveloppe)
 * @param tenantId - ID du tenant
 * @returns DEK déchiffré
 */
export async function decryptDEK(
  encryptedKey: EncryptedKey,
  tenantId: string
): Promise<Buffer> {
  // 1. Récupérer la KEK depuis le KMS
  const kek = await getSecret(tenantId, `kek-${encryptedKey.kekId}`);
  if (!kek) {
    throw new Error(`KEK not found: ${encryptedKey.kekId}`);
  }
  
  // 2. Parser l'enveloppe
  const kekBuffer = Buffer.from(kek, 'hex');
  let offset = 0;
  const iv = encryptedKey.encryptedDek.subarray(offset, offset + 12); // 12 bytes pour GCM
  offset += 12;
  const tag = encryptedKey.encryptedDek.subarray(offset, offset + 16); // 16 bytes pour GCM
  offset += 16;
  const enc = encryptedKey.encryptedDek.subarray(offset);
  
  // 3. Déchiffrer le DEK
  return decryptAesGcm({ enc, iv, tag }, kekBuffer);
}

/**
 * Chiffre des données avec le modèle enveloppe
 * 
 * @param plaintext - Données à chiffrer
 * @param kekId - ID de la KEK
 * @param tenantId - ID du tenant
 * @returns Données chiffrées + enveloppe (DEK chiffré)
 */
export async function encryptWithEnvelope(
  plaintext: Buffer,
  kekId: string,
  tenantId: string
): Promise<{
  encryptedKey: EncryptedKey;
  encryptedData: Buffer;
}> {
  // 1. Générer et chiffrer un DEK
  const encryptedKey = await generateAndEncryptDEK(kekId, tenantId);
  
  // 2. Déchiffrer le DEK (temporairement, en mémoire)
  const dek = await decryptDEK(encryptedKey, tenantId);
  
  // 3. Chiffrer les données avec le DEK
  const { iv, tag, enc } = encryptAesGcm(plaintext, dek);
  
  // 4. Format: [encryptedKey][iv][tag][encryptedData]
  const encryptedData = Buffer.concat([
    Buffer.from(JSON.stringify(encryptedKey)),
    Buffer.from([0x00]), // Séparateur
    iv,
    tag,
    enc,
  ]);
  
  // Nettoyer le DEK de la mémoire (best practice)
  dek.fill(0);
  
  return {
    encryptedKey,
    encryptedData,
  };
}

/**
 * Déchiffre des données avec le modèle enveloppe
 * 
 * @param encryptedBuffer - Données chiffrées + enveloppe
 * @param tenantId - ID du tenant
 * @returns Données déchiffrées
 */
export async function decryptWithEnvelope(
  encryptedBuffer: Buffer,
  tenantId: string
): Promise<Buffer> {
  // 1. Parser l'enveloppe
  const separatorIndex = encryptedBuffer.indexOf(0x00);
  const encryptedKeyJson = encryptedBuffer.subarray(0, separatorIndex).toString('utf-8');
  const encryptedKey: EncryptedKey = JSON.parse(encryptedKeyJson);
  
  let offset = separatorIndex + 1;
  const iv = encryptedBuffer.subarray(offset, offset + 12);
  offset += 12;
  const tag = encryptedBuffer.subarray(offset, offset + 16);
  offset += 16;
  const enc = encryptedBuffer.subarray(offset);
  
  // 2. Déchiffrer le DEK
  const dek = await decryptDEK(encryptedKey, tenantId);
  
  // 3. Déchiffrer les données
  const decrypted = decryptAesGcm({ enc, iv, tag }, dek);
  
  // Nettoyer le DEK de la mémoire
  dek.fill(0);
  
  return decrypted;
}

/**
 * Helpers AES-GCM (réutilisés depuis encryption.ts)
 */
function encryptAesGcm(buf: Buffer, rawKey: Buffer): {
  iv: Buffer;
  tag: Buffer;
  enc: Buffer;
} {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', rawKey, iv);
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, tag, enc };
}

function decryptAesGcm(
  encrypted: { enc: Buffer; iv: Buffer; tag: Buffer },
  rawKey: Buffer
): Buffer {
  const decipher = crypto.createDecipheriv('aes-256-gcm', rawKey, encrypted.iv);
  decipher.setAuthTag(encrypted.tag);
  return Buffer.concat([decipher.update(encrypted.enc), decipher.final()]);
}
