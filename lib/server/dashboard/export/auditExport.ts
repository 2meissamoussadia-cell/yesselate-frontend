// lib/server/dashboard/export/auditExport.ts
// Phase P12.b: Audit logging pour les exports

import { pgPool } from '@lib-root/server/db/pool';

/**
 * Enregistre un export dans l'audit trail
 * 
 * @param params - Paramètres de l'export
 */
export async function auditExport(params: {
  tenantId: string;
  userId: string;
  route: string; // ex: "performance/reporting/monthly"
  format: 'csv' | 'json' | 'excel' | 'xlsx' | 'pdf';
  filename: string;
  sizeBytes: number;
  rows: number;
  hash: string;
  durationMs: number;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}): Promise<void> {
  const client = await pgPool.connect();
  
  try {
    // Phase P12.b: Enregistrer dans audit_traces (si table existe)
    // Note: La table audit_traces doit avoir les colonnes appropriées
    // Si la table n'existe pas, on log en console (non-bloquant)
    await client.query(
      `INSERT INTO audit_traces 
       (tenant_id, user_id, action, resource_type, resource_id, details, when_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, now(), $7, $8)`,
      [
        params.tenantId,
        params.userId,
        'export',
        'dashboard',
        params.route,
        JSON.stringify({
          format: params.format,
          filename: params.filename,
          sizeBytes: params.sizeBytes,
          rows: params.rows,
          hash: params.hash,
          durationMs: params.durationMs,
          success: params.success,
          errorMessage: params.errorMessage,
        }),
        params.ipAddress || null,
        params.userAgent || null,
      ]
    );
  } catch (error: any) {
    // Non-bloquant : si l'audit échoue (table inexistante ou autre), on continue
    // Log console pour traçabilité
    console.log('[Export Audit]', {
      tenantId: params.tenantId,
      userId: params.userId,
      route: params.route,
      format: params.format,
      filename: params.filename,
      sizeBytes: params.sizeBytes,
      rows: params.rows,
      hash: params.hash,
      durationMs: params.durationMs,
      success: params.success,
      error: error?.message || 'Unknown error',
    });
  } finally {
    client.release();
  }
}
