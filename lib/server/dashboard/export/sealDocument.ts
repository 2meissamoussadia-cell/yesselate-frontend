// lib/server/dashboard/export/sealDocument.ts
// Phase P9: Scellement de document (hash SHA-256 + horodatage)

import { createHash } from 'crypto';
import { pgPool } from '@/lib/server/db/pool';
import { withReq } from '@/lib/server/logging';

export async function sealDocument(
  content: string,
  tenantId: string,
  meta: { main?: string; sub?: string | null; leaf?: string | null; format?: string },
  reqId?: string
): Promise<string> {
  const log = withReq(reqId);
  const client = await pgPool.connect();

  try {
    // Calculer le hash SHA-256
    const hash = createHash('sha256').update(content).digest('hex');
    const whenAt = new Date();

    // Stocker dans document_seals (si la table existe)
    try {
      await client.query(
        `INSERT INTO document_seals (tenant_id, hash_sha256, format, route_main, route_sub, route_leaf, when_at, req_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (hash_sha256) DO NOTHING`,
        [tenantId, hash, meta.format ?? 'unknown', meta.main ?? null, meta.sub ?? null, meta.leaf ?? null, whenAt, reqId ?? null]
      );
    } catch (err: any) {
      // Si la table n'existe pas encore, on continue sans erreur
      if (err?.code !== '42P01') throw err;
      log.warn({ hash, meta }, 'document_seals table not found, skipping seal storage');
    }

    log.info({ hash, format: meta.format, route: { main: meta.main, sub: meta.sub, leaf: meta.leaf } }, 'document sealed');

    return hash;
  } catch (error) {
    log.warn({ err: error, meta }, 'failed to seal document (non-blocking)');
    // Ne pas faire échouer l'export si le scellement échoue
    return '';
  } finally {
    client.release();
  }
}
