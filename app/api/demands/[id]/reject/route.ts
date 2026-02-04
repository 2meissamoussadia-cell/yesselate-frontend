export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateId,
  validateRequired,
  notFound,
  badRequest,
  createSuccessResponse,
} from '@/lib/api/error-handler';

/**
 * POST /api/demands/[id]/reject
 * Rejeter une demande (legacy - utiliser /api/demandes à la place)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const body = await request.json();
    validateRequired(body, ['reason']);

    if (!body.reason?.trim()) {
      throw badRequest('Le motif de rejet ne peut pas être vide');
    }

    // Vérifier que la demande existe
    const exists = await prisma.demand.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw notFound('Demande', id);
    }

    const updated = await prisma.demand.update({
      where: { id },
      data: { status: 'rejected' },
    });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: body.actorId ?? 'USR-001',
        actorName: body.actorName ?? 'A. DIALLO',
        action: 'rejection',
        details: body.reason,
      },
    });

    return createSuccessResponse({
      demand: updated,
      message: 'Demande rejetée avec succès',
    });
  });
}
