/**
 * Intégration du chiffrement dans les exports sensibles
 * Phase P15: Sécurité des données - Chiffrement E2E pour exports
 * 
 * Chiffre les exports PDF/XLSX sensibles avec :
 * - Option 1 : Clé publique du destinataire (PGP/age)
 * - Option 2 : Secret éphémère partagé via canal séparé (Teams/SMS)
 */

import { NextRequest, NextResponse } from 'next/server';
import { encryptWithPgp, encryptWithEphemeralSecret, AesGcmEncrypted } from './encryption';
import crypto from 'node:crypto';

// ============================================================================
// Options de chiffrement pour exports
// ============================================================================

export interface ExportEncryptionOptions {
  /** Mode de chiffrement */
  mode: 'pgp' | 'age' | 'ephemeral';
  /** Clé publique du destinataire (pour PGP/age) */
  recipientPublicKey?: string;
  /** Secret éphémère (pour mode ephemeral) */
  ephemeralSecret?: string;
  /** Générer un secret éphémère automatiquement */
  generateSecret?: boolean;
}

/**
 * Chiffre un export selon les options
 * 
 * @param fileBuffer - Buffer du fichier à chiffrer
 * @param options - Options de chiffrement
 * @returns Buffer chiffré + métadonnées
 */
export async function encryptExport(
  fileBuffer: Buffer,
  options: ExportEncryptionOptions
): Promise<{
  encrypted: Buffer;
  metadata: {
    mode: string;
    algorithm: string;
    originalSize: number;
    encryptedSize: number;
    encryptedAt: Date;
    secret?: string; // Secret généré (si mode ephemeral avec generateSecret)
  };
}> {
  let encrypted: Buffer;
  let secret: string | undefined;

  switch (options.mode) {
    case 'pgp':
      if (!options.recipientPublicKey) {
        throw new Error('PGP mode requires recipientPublicKey');
      }
      encrypted = await encryptWithPgp(fileBuffer, options.recipientPublicKey);
      break;

    case 'age':
      if (!options.recipientPublicKey) {
        throw new Error('age mode requires recipientPublicKey');
      }
      // Placeholder : utiliser ephemeral comme fallback
      if (options.ephemeralSecret) {
        const aesEncrypted = encryptWithEphemeralSecret(fileBuffer, options.ephemeralSecret);
        encrypted = Buffer.concat([aesEncrypted.iv, aesEncrypted.tag, aesEncrypted.enc]);
      } else {
        throw new Error('age encryption not yet implemented - use ephemeral mode');
      }
      break;

    case 'ephemeral':
      if (options.generateSecret) {
        // Générer un secret aléatoire (16 bytes = 128 bits)
        secret = crypto.randomBytes(16).toString('base64url');
      } else if (options.ephemeralSecret) {
        secret = options.ephemeralSecret;
      } else {
        throw new Error('ephemeral mode requires ephemeralSecret or generateSecret=true');
      }
      
      const aesEncrypted = encryptWithEphemeralSecret(fileBuffer, secret);
      // Format : IV (12) + Tag (16) + Encrypted (variable)
      encrypted = Buffer.concat([aesEncrypted.iv, aesEncrypted.tag, aesEncrypted.enc]);
      break;

    default:
      throw new Error(`Unsupported encryption mode: ${options.mode}`);
  }

  return {
    encrypted,
    metadata: {
      mode: options.mode,
      algorithm: options.mode === 'ephemeral' ? 'aes-256-gcm' : options.mode,
      originalSize: fileBuffer.length,
      encryptedSize: encrypted.length,
      encryptedAt: new Date(),
      secret, // Secret généré (à partager via canal séparé)
    },
  };
}

/**
 * Crée une réponse Next.js avec fichier chiffré
 * 
 * @param encrypted - Buffer chiffré
 * @param metadata - Métadonnées du chiffrement
 * @param originalFilename - Nom de fichier original
 * @returns NextResponse avec fichier chiffré
 */
export function createEncryptedResponse(
  encrypted: Buffer,
  metadata: { mode: string; algorithm: string; secret?: string },
  originalFilename: string
): NextResponse {
  const extension = metadata.mode === 'pgp' ? 'pgp' : metadata.mode === 'age' ? 'age' : 'enc';
  const filename = `${originalFilename}.${extension}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'X-Encryption-Mode': metadata.mode,
    'X-Encryption-Algorithm': metadata.algorithm,
    'X-Content-Length': String(encrypted.length),
  };

  // Si secret éphémère généré, l'inclure dans les headers (à partager via canal séparé)
  // En production, ne PAS l'inclure dans les headers HTTP, mais le partager via Teams/SMS
  if (metadata.secret) {
    headers['X-Ephemeral-Secret'] = metadata.secret; // ⚠️ À retirer en production, partager via canal séparé
  }

  return new NextResponse(new Uint8Array(encrypted), {
    status: 200,
    headers,
  });
}

/**
 * Génère un secret éphémère pour partage via canal séparé
 * 
 * @returns Secret base64url (URL-safe)
 */
export function generateEphemeralSecret(): string {
  return crypto.randomBytes(16).toString('base64url');
}

/**
 * Valide les options de chiffrement depuis la requête
 * 
 * @param req - Requête Next.js
 * @returns Options de chiffrement validées ou null si pas de chiffrement
 */
export function parseEncryptionOptions(req: NextRequest): ExportEncryptionOptions | null {
  const searchParams = req.nextUrl.searchParams;
  const encrypt = searchParams.get('encrypt');
  
  if (!encrypt || encrypt === 'false' || encrypt === '0') {
    return null; // Pas de chiffrement
  }

  const mode = searchParams.get('encrypt_mode') || 'ephemeral';
  
  if (mode === 'pgp' || mode === 'age') {
    const publicKey = searchParams.get('recipient_key');
    if (!publicKey) {
      throw new Error(`${mode} mode requires recipient_key parameter`);
    }
    return { mode: mode as 'pgp' | 'age', recipientPublicKey: publicKey };
  }
  
  if (mode === 'ephemeral') {
    const secret = searchParams.get('secret');
    const generate = searchParams.get('generate_secret') === 'true';
    
    if (generate) {
      return { mode: 'ephemeral', generateSecret: true };
    }
    
    if (secret) {
      return { mode: 'ephemeral', ephemeralSecret: secret };
    }
    
    // Par défaut, générer un secret
    return { mode: 'ephemeral', generateSecret: true };
  }
  
  throw new Error(`Unsupported encryption mode: ${mode}`);
}
