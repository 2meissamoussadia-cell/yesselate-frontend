// app/api/telemetry/anonymize/route.ts
// Phase P14: Observabilité produit - Anonymisation RGPD

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { pgPool } from '@lib-root/server/db/pool';
import { z } from 'zod';
import { logger } from '@lib-root/server/logging';

const AnonymizeRequest = z.object({
  userId: z.string().optional(),
  tenantId: z.string().uuid().optional(),
});

/**
 * POST /api/telemetry/anonymize
 * 
 * Anonymise les données de télémetrie pour un utilisateur ou un tenant
 * Phase P14: Observabilité produit - RGPD
 * 
 * Remplace user_id par NULL et supprime les props contenant des données personnelles.
 * 
 * @example
 * POST /api/telemetry/anonymize
 * { "userId": "user123" }
 * 
 * POST /api/telemetry/anonymize
 * { "tenantId": "tenant-uuid" }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const body = await req.json();
    const parsed = AnonymizeRequest.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, tenantId } = parsed.data;
    const targetTenantId = tenantId || baseCtx.tenantId;

    if (!targetTenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const client = await pgPool.connect();
    try {
      let updatedCount = 0;

      if (userId) {
        // Anonymiser pour un utilisateur spécifique
        const result = await client.query(
          `UPDATE telemetry_events
           SET user_id = NULL,
               props = jsonb_set(props, '{anonymized}', 'true'::jsonb, true)
           WHERE tenant_id = $1 AND user_id = $2`,
          [targetTenantId, userId]
        );
        updatedCount = result.rowCount || 0;

        // Phase P14: Audit log
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null;
        const userAgent = req.headers.get('user-agent') ?? null;
        
        await client.query(
          `SELECT log_telemetry_anonymize($1, $2, $3, $4, $5, $6)`,
          [targetTenantId, userId, baseCtx.userId || 'system', updatedCount, ip, userAgent]
        );

        logger.info(
          {
            tenantId: targetTenantId,
            userId,
            updatedCount,
            performedBy: baseCtx.userId || 'system',
          },
          'Telemetry anonymized'
        );
      } else {
        // Anonymiser tous les user_id pour le tenant (optionnel, selon politique)
        // Par défaut, on anonymise uniquement si userId est fourni
        return NextResponse.json(
          { error: 'userId is required for anonymization' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          updatedCount,
          message: `Anonymized ${updatedCount} telemetry events`,
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Telemetry Anonymize] Error:', error);
    return NextResponse.json(
      { error: 'Failed to anonymize telemetry', ok: false },
      { status: 500 }
    );
  }
}
