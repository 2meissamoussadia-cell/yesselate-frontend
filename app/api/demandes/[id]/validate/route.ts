export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateId,
  notFound,
  createSuccessResponse,
} from '@/lib/api/error-handler';

/**
 * POST /api/demandes/[id]/validate
 * Valider une demande
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const body = await request.json();

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
      data: { status: 'validated' },
    });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: body?.actorId ?? 'USR-001',
        actorName: body?.actorName ?? 'A. DIALLO',
        action: 'validation',
        details: body?.comment ?? 'Demande validée',
      },
    });

    return createSuccessResponse({
      demand: updated,
      message: 'Demande validée avec succès',
    });
  });
}
