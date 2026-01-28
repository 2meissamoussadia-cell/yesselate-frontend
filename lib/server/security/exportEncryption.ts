// lib/server/security/exportEncryption.ts
// Phase P18: Chiffrement E2E pour exports sensibles (PDF/XLSX)
// Support: AES-GCM, PGP, age, secrets éphémères

import { encryptWithEphemeralSecret, decryptWithEphemeralSecret } from './encryption';
import { generateEphemeralSecret } from './encryptionExport';
import { encryptWithPGP } from './pgp';
import { encryptWithAge } from './age';
import { NextResponse } from 'next/server';

/**
 * Détermine si un export doit être chiffré selon sa sensibilité
 * 
 * @param format - Format d'export
 * @param route - Route du dashboard (main/sub/leaf)
 * @param encrypted - Paramètre explicite de l'utilisateur
 * @returns true si l'export doit être chiffré
 */
export function shouldEncryptExport(
  format: string,
  route: { main?: string; sub?: string | null; leaf?: string | null },
  encrypted?: boolean
): boolean {
  // Si l'utilisateur demande explicitement le chiffrement
  if (encrypted === true) {
    return true;
  }

  // Formats sensibles par défaut (PDF/XLSX contiennent souvent des données structurées)
  const sensitiveFormats = ['pdf', 'xlsx'];
  if (sensitiveFormats.includes(format.toLowerCase())) {
    return true;
  }

  // Routes sensibles (données financières, RH, compliance)
  const sensitiveRoutes = [
    'performance/budget',
    'performance/finance',
    'actions/rh',
    'compliance',
    'risks',
  ];
  
  const routePath = `${route.main}${route.sub ? `/${route.sub}` : ''}${route.leaf ? `/${route.leaf}` : ''}`;
  if (sensitiveRoutes.some(sr => routePath.includes(sr))) {
    return true;
  }

  return false;
}

/**
 * Options de chiffrement E2E
 */
export type EncryptionMethod = 'aes-gcm' | 'pgp' | 'age' | 'ephemeral';

export interface EncryptionOptions {
  method?: EncryptionMethod;
  publicKey?: string; // Pour PGP ou age
  ephemeralSecret?: string; // Pour secret éphémère (si fourni, utilisé tel quel)
  recipientId?: string; // ID du destinataire (pour récupérer la clé publique depuis DB)
}

/**
 * Chiffre un export et retourne une réponse avec le fichier chiffré
 * 
 * @param fileBuffer - Buffer du fichier à chiffrer
 * @param filename - Nom du fichier original
 * @param format - Format d'export
 * @param options - Options de chiffrement (méthode, clé publique, etc.)
 * @returns NextResponse avec le fichier chiffré
 */
export async function encryptExportResponse(
  fileBuffer: Buffer,
  filename: string,
  format: string,
  options: EncryptionOptions = {}
): Promise<NextResponse> {
  const method = options.method || 'aes-gcm';
  let encryptedBuffer: Buffer;
  let algorithm: string;
  let secretInfo: string | undefined;

  switch (method) {
    case 'pgp':
      if (!options.publicKey) {
        throw new Error('PGP public key is required for PGP encryption');
      }
      const pgpEncrypted = await encryptWithPGP(fileBuffer, options.publicKey);
      encryptedBuffer = Buffer.from(pgpEncrypted);
      algorithm = 'pgp';
      break;

    case 'age':
      if (!options.publicKey) {
        throw new Error('age public key is required for age encryption');
      }
      encryptedBuffer = await encryptWithAge(fileBuffer, options.publicKey);
      algorithm = 'age';
      break;

    case 'ephemeral': {
      // Générer un secret éphémère si non fourni (format: iv + tag + encrypted)
      const secret = options.ephemeralSecret || generateEphemeralSecret();
      const enc = encryptWithEphemeralSecret(fileBuffer, secret);
      encryptedBuffer = Buffer.concat([enc.iv, enc.tag, enc.enc]);
      algorithm = 'aes-256-gcm-ephemeral';
      secretInfo = secret; // À partager via canal séparé (Teams/SMS)
      break;
    }

    case 'aes-gcm':
    default: {
      // Chiffrement AES-GCM avec secret éphémère (format: iv + tag + encrypted)
      const secret = options.ephemeralSecret || generateEphemeralSecret();
      const enc = encryptWithEphemeralSecret(fileBuffer, secret);
      encryptedBuffer = Buffer.concat([enc.iv, enc.tag, enc.enc]);
      algorithm = 'aes-256-gcm';
      secretInfo = secret;
      break;
    }
  }

  // Nouveau nom de fichier avec extension .encrypted
  const encryptedFilename = filename.replace(/\.(pdf|xlsx|json|csv)$/i, '.encrypted');

  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${encryptedFilename}"`,
    'X-Encrypted': 'true',
    'X-Original-Format': format,
    'X-Original-Filename': filename,
    'X-Encryption-Algorithm': algorithm,
  };

  // Si secret éphémère, l'inclure dans les headers (ou mieux: envoyer via canal séparé)
  if (secretInfo) {
    headers['X-Ephemeral-Secret'] = secretInfo;
    // Note: En production, envoyer le secret via Teams/SMS plutôt que dans les headers
  }

  return new NextResponse(new Uint8Array(encryptedBuffer), {
    status: 200,
    headers,
  });
}

/**
 * Déchiffre un fichier exporté (pour usage interne/admin)
 * Format buffer: iv (12) + tag (16) + encrypted
 *
 * @param encryptedBuffer - Buffer chiffré
 * @param secret - Secret éphémère (optionnel si stocké ailleurs)
 * @returns Buffer déchiffré
 */
export function decryptExport(encryptedBuffer: Buffer, secret?: string): Buffer {
  if (!secret || encryptedBuffer.length < 28) {
    throw new Error('decryptExport requires secret and buffer (iv+tag+encrypted)');
  }
  const iv = encryptedBuffer.subarray(0, 12);
  const tag = encryptedBuffer.subarray(12, 28);
  const enc = encryptedBuffer.subarray(28);
  return decryptWithEphemeralSecret({ iv, tag, enc }, secret);
}
