// lib/server/security/keyRotation.ts
// Phase P18: Rotation de clés de chiffrement

import { pgPool } from '../db/pool';
import { withReq } from '../logging';
import { generateEncryptionKey } from './encryption';

const log = withReq('key-rotation');

/**
 * Structure d'une clé de chiffrement dans la DB
 */
interface EncryptionKey {
  id: string;
  key_id: string;
  key_material: string; // Chiffré avec la clé maître
  algorithm: string;
  created_at: Date;
  expires_at: Date | null;
  active: boolean;
}

/**
 * Crée une nouvelle clé de chiffrement
 */
export async function createEncryptionKey(
  keyId: string,
  expiresInDays?: number
): Promise<string> {
  const client = await pgPool.connect();
  try {
    // Générer la nouvelle clé
    const keyMaterial = generateEncryptionKey();
    
    // TODO: Chiffrer keyMaterial avec la clé maître (KMS)
    // Pour l'instant, on stocke en clair (à sécuriser avec KMS)
    const encryptedKeyMaterial = keyMaterial; // Placeholder
    
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;
    
    await client.query(
      `INSERT INTO encryption_keys (key_id, key_material, algorithm, expires_at, active)
       VALUES ($1, $2, 'aes-256-gcm', $3, true)
       ON CONFLICT (key_id) DO UPDATE
       SET key_material = EXCLUDED.key_material,
           expires_at = EXCLUDED.expires_at,
           active = true`,
      [keyId, encryptedKeyMaterial, expiresAt]
    );
    
    log.info({ keyId, expiresAt }, 'encryption key created');
    
    return keyMaterial;
  } finally {
    client.release();
  }
}

/**
 * Récupère la clé active pour un key_id
 */
export async function getActiveKey(keyId: string): Promise<string | null> {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      `SELECT key_material FROM encryption_keys
       WHERE key_id = $1 AND active = true
       ORDER BY created_at DESC
       LIMIT 1`,
      [keyId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // TODO: Déchiffrer avec la clé maître (KMS)
    const encryptedKeyMaterial = result.rows[0].key_material;
    return encryptedKeyMaterial; // Placeholder
  } finally {
    client.release();
  }
}

/**
 * Désactive une clé (après rotation)
 */
export async function deactivateKey(keyId: string, oldKeyId: string): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query(
      `UPDATE encryption_keys
       SET active = false
       WHERE key_id = $1 AND key_id != $2`,
      [oldKeyId, keyId]
    );
    
    log.info({ keyId, oldKeyId }, 'encryption key deactivated');
  } finally {
    client.release();
  }
}

/**
 * Rotation automatique des clés expirées
 * 
 * Cette fonction doit être appelée périodiquement (CRON)
 */
export async function rotateExpiredKeys(): Promise<void> {
  const client = await pgPool.connect();
  try {
    // Trouver les clés expirées ou proches de l'expiration
    const result = await client.query(
      `SELECT key_id, expires_at FROM encryption_keys
       WHERE active = true
       AND (expires_at IS NOT NULL AND expires_at < NOW() + INTERVAL '7 days')
       ORDER BY expires_at ASC`
    );
    
    for (const row of result.rows) {
      const keyId = row.key_id;
      const newKeyId = `${keyId}-${Date.now()}`;
      
      // Créer une nouvelle clé
      await createEncryptionKey(newKeyId, 90); // 90 jours
      
      // Désactiver l'ancienne
      await deactivateKey(newKeyId, keyId);
      
      log.info({ oldKeyId: keyId, newKeyId }, 'encryption key rotated');
    }
  } finally {
    client.release();
  }
}
