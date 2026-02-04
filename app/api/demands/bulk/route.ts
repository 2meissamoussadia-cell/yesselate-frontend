export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateRequired,
  badRequest,
  createSuccessResponse,
} from '@/lib/api/error-handler';

type Action = 'validate' | 'reject' | 'assign' | 'request_complement';

/**
 * POST /api/demands/bulk
 * Actions en masse sur les demandes (legacy - utiliser /api/demandes/batch à la place)
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    validateRequired(body, ['ids', 'action']);

    const ids: string[] = body.ids ?? [];
    const action: Action | undefined = body.action;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw badRequest('Le tableau ids ne peut pas être vide');
    }

    if (!action) {
      throw badRequest('Action requise');
    }

    const actorId = body.actorId ?? 'USR-001';
    const actorName = body.actorName ?? 'A. DIALLO';

    const updated: string[] = [];
    const skipped: Array<{ id: string; reason: string }> = [];

    await prisma.$transaction(async tx => {
      const demands = await tx.demand.findMany({ where: { id: { in: ids } } });

      for (const d of demands) {
        // règles métier
        if (
          (action === 'validate' || action === 'reject') &&
          d.status !== 'pending'
        ) {
          skipped.push({ id: d.id, reason: 'Statut non pending' });
          continue;
        }

        if (action === 'validate') {
          await tx.demand.update({
            where: { id: d.id },
            data: { status: 'validated' },
          });
          await tx.demandEvent.create({
            data: {
              demandId: d.id,
              actorId,
              actorName,
              action: 'validation',
              details: body.details ?? 'Validée',
            },
          });
          updated.push(d.id);
          continue;
        }

        if (action === 'reject') {
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
              details: body.details ?? 'Rejetée',
            },
          });
          updated.push(d.id);
          continue;
        }

        if (action === 'assign') {
          const employeeId = body.employeeId;
          const employeeName = body.employeeName;
          if (!employeeId || !employeeName) {
            skipped.push({
              id: d.id,
              reason: 'employeeId/employeeName manquant',
            });
            continue;
          }
          await tx.demand.update({
            where: { id: d.id },
            data: { assignedToId: employeeId, assignedToName: employeeName },
          });
          await tx.demandEvent.create({
            data: {
              demandId: d.id,
              actorId,
              actorName,
              action: 'delegation',
              details: `Assignée à ${employeeName}`,
            },
          });
          updated.push(d.id);
          continue;
        }

        if (action === 'request_complement') {
          const message = (body.message ?? '').trim();
          if (!message) {
            skipped.push({ id: d.id, reason: 'message manquant' });
            continue;
          }
          await tx.demandEvent.create({
            data: {
              demandId: d.id,
              actorId,
              actorName,
              action: 'request_complement',
              details: message,
            },
          });
          updated.push(d.id);
        }
      }
    });

    return createSuccessResponse({
      updated,
      skipped,
      message: `${updated.length} demande(s) traitée(s)`,
    });
  });
}

