/**
 * Utilitaires de chiffrement côté client
 * Phase P15: Sécurité des données - Déchiffrement E2E pour exports
 * 
 * Permet de déchiffrer les exports chiffrés côté client
 */

'use client';

/**
 * Parse un buffer chiffré (format : IV + Tag + Encrypted)
 * 
 * @param encryptedBuffer - Buffer chiffré (IV 12 bytes + Tag 16 bytes + Encrypted)
 * @returns Objet avec IV, tag et données chiffrées (Uint8Array)
 */
export function parseEncryptedBuffer(encryptedBuffer: ArrayBuffer): {
  iv: Uint8Array;
  tag: Uint8Array;
  enc: Uint8Array;
} {
  const buf = new Uint8Array(encryptedBuffer);
  
  if (buf.length < 28) {
    throw new Error('Invalid encrypted buffer: too short');
  }
  
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  
  return { iv, tag, enc };
}

/**
 * Déchiffre un export chiffré avec secret éphémère (côté client)
 * 
 * @param encryptedBuffer - Buffer chiffré
 * @param secret - Secret éphémère (partagé via canal séparé)
 * @returns ArrayBuffer déchiffré
 * 
 * @example
 * ```ts
 * const res = await fetch('/api/export/dashboard?format=xlsx&encrypt=true&encrypt_mode=ephemeral&secret=...');
 * const encrypted = await res.arrayBuffer();
 * const decrypted = await decryptExport(encrypted, secret);
 * downloadFile(decrypted, 'export.xlsx');
 * ```
 */
export async function decryptExport(encryptedBuffer: ArrayBuffer, secret: string): Promise<ArrayBuffer> {
  const { iv, tag, enc } = parseEncryptedBuffer(encryptedBuffer);
  
  // Dériver la clé depuis le secret (SHA-256, comme côté serveur)
  const secretBytes = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
  const key = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Web Crypto API nécessite que le tag soit concaténé à la fin des données chiffrées
  const encryptedWithTag = new Uint8Array(enc.length + tag.length);
  encryptedWithTag.set(enc, 0);
  encryptedWithTag.set(tag, enc.length);
  
  // Déchiffrer avec AES-GCM (copier iv pour garantir ArrayBuffer pour Web Crypto)
  const ivCopy = new Uint8Array(iv);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivCopy,
      tagLength: 128, // 16 bytes = 128 bits
    },
    key,
    encryptedWithTag
  );
  
  return decrypted;
}

/**
 * Génère un secret éphémère côté client
 * 
 * @returns Secret base64url (URL-safe)
 */
export function generateEphemeralSecret(): string {
  // Utiliser Web Crypto API si disponible, sinon fallback
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  // Fallback pour Node.js (ne devrait pas arriver côté client)
  throw new Error('Web Crypto API not available');
}
