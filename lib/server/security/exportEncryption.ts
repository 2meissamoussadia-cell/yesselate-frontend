// lib/server/security/exportEncryption.ts
// Phase P18: Chiffrement E2E pour exports sensibles (PDF/XLSX)
// Support: AES-GCM, PGP, age, secrets éphémères

import { encryptFile, decryptFile, encryptWithEphemeralSecret, generateEphemeralSecret } from './encryption';
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

    case 'ephemeral':
      // Générer un secret éphémère si non fourni
      const secret = options.ephemeralSecret || generateEphemeralSecret();
      encryptedBuffer = encryptWithEphemeralSecret(fileBuffer, secret);
      algorithm = 'aes-256-gcm-ephemeral';
      secretInfo = secret; // À partager via canal séparé (Teams/SMS)
      break;

    case 'aes-gcm':
    default:
      // Chiffrement AES-GCM standard (clé partagée)
      encryptedBuffer = encryptFile(fileBuffer);
      algorithm = 'aes-256-gcm';
      break;
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

  return new NextResponse(encryptedBuffer, {
    status: 200,
    headers,
  });
}

/**
 * Déchiffre un fichier exporté (pour usage interne/admin)
 * 
 * @param encryptedBuffer - Buffer chiffré
 * @returns Buffer déchiffré
 */
export function decryptExport(encryptedBuffer: Buffer): Buffer {
  return decryptFile(encryptedBuffer);
}
