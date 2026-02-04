export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateId,
  notFound,
  badRequest,
  createSuccessResponse,
} from '@/lib/api/error-handler';

/**
 * POST /api/demands/[id]/actions
 * Actions sur une demande (legacy - utiliser /api/demandes à la place)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id: rawId } = await params;
    const id = decodeURIComponent(rawId);
    validateId(id, 'demande');

    const body = await request.json();
    const type: string = body.type ?? body.action;
    const payload = body.payload ?? body;

    const demand = await prisma.demand.findUnique({ where: { id } });
    if (!demand) {
      throw notFound('Demande', id);
    }

    if (!type) {
      throw badRequest('Type d\'action requis');
    }

    const actorId = payload.actorId ?? 'SYS';
    const actorName = payload.actorName ?? 'A. DIALLO';

    if (type === 'validate') {
      await prisma.demand.update({
        where: { id },
        data: { status: 'validated' },
      });
      await prisma.demandEvent.create({
        data: {
          demandId: id,
          actorId,
          actorName,
          action: 'validation',
          details: 'Demande validée',
        },
      });
    }

    if (type === 'reject') {
      await prisma.demand.update({
        where: { id },
        data: { status: 'rejected' },
      });
      await prisma.demandEvent.create({
        data: {
          demandId: id,
          actorId,
          actorName,
          action: 'rejection',
          details: 'Demande rejetée',
        },
      });
    }

    if (type === 'request_complement') {
      const msg = String(payload.message ?? '').trim();
      await prisma.demandEvent.create({
        data: {
          demandId: id,
          actorId,
          actorName,
          action: 'request_complement',
          details: msg || 'Complément demandé',
        },
      });
    }

    if (type === 'assign') {
      const employeeId = payload.employeeId ?? null;
      const employeeName = payload.employeeName ?? null;
      await prisma.demand.update({
        where: { id },
        data: { assignedToId: employeeId, assignedToName: employeeName },
      });
      await prisma.demandEvent.create({
        data: {
          demandId: id,
          actorId,
          actorName,
          action: 'assign',
          details: `Affectée à ${employeeName ?? employeeId ?? 'N/A'}`,
        },
      });
    }

    return createSuccessResponse({
      ok: true,
      message: `Action ${type} exécutée avec succès`,
    });
  });
}
