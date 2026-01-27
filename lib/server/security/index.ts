/**
 * Module de sécurité
 * Phase P15: Sécurité des données
 * 
 * Export centralisé des utilitaires de sécurité
 */

export {
  encryptAesGcm,
  decryptAesGcm,
  generateAesKey,
  encryptWithEphemeralSecret,
  decryptWithEphemeralSecret,
  encryptWithPgp,
  encryptWithAge,
  wrapDek,
  unwrapDek,
  encryptExportFile,
  decryptExportFile,
  type AesGcmEncrypted,
  type KeyEnvelope,
} from './encryption';

export {
  encryptExport,
  createEncryptedResponse,
  generateEphemeralSecret,
  parseEncryptionOptions,
} from './encryptionExport';

export { setSecurityContextForPool } from '../db/pool';
