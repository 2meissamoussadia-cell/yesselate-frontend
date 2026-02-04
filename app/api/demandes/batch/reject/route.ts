export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateRequired,
  badRequest,
  createSuccessResponse,
} from '@/lib/api/error-handler';

/**
 * POST /api/demandes/batch/reject
 * Rejeter plusieurs demandes en masse
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    validateRequired(body, ['ids', 'reason']);

    const ids: string[] = body.ids ?? [];
    const reason = body.reason;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw badRequest('Le tableau ids ne peut pas être vide');
    }

    if (!reason?.trim()) {
      throw badRequest('Le motif de rejet ne peut pas être vide');
    }

    const actorId = body.actorId ?? 'USR-001';
    const actorName = body.actorName ?? 'A. DIALLO';

    const updated: string[] = [];
    const skipped: Array<{ id: string; reason: string }> = [];

    await prisma.$transaction(async tx => {
      const demands = await tx.demand.findMany({ where: { id: { in: ids } } });

      for (const d of demands) {
        if (d.status !== 'pending') {
          skipped.push({ id: d.id, reason: 'Statut non pending' });
          continue;
        }

        await tx.demand.update({
          where: { id: d.id },
          data: { status: 'rejected' },
        });

        await tx.demandEvent.create({
          data: {
            demandId: d.id,
            actorId,
            actorName,
            action: 'rejection',
            details: reason,
          },
        });

        updated.push(d.id);
      }
    });

    return createSuccessResponse({
      updated,
      skipped,
      message: `${updated.length} demande(s) rejetée(s)`,
    });
  });
}
