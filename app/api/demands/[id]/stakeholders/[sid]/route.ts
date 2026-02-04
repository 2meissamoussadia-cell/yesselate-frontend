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
 * DELETE /api/demands/[id]/stakeholders/[sid]
 * Supprimer une partie prenante
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  return withErrorHandler(async () => {
    const { id, sid } = await params;
    validateId(id, 'demande');
    validateId(sid, 'partie prenante');

    const stakeholder = await prisma.demandStakeholder.findUnique({
      where: { id: sid },
    });

    if (!stakeholder) {
      throw notFound('Partie prenante', sid);
    }

    await prisma.demandStakeholder.delete({ where: { id: sid } });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: 'stakeholder_remove',
        details: `Partie prenante supprimée: ${stakeholder.personName}`,
      },
    });

    return createSuccessResponse({
      ok: true,
      message: 'Partie prenante supprimée avec succès',
    });
  });
}
