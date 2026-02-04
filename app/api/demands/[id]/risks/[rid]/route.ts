export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateId,
  notFound,
  createSuccessResponse,
} from '@/lib/api/error-handler';

const clamp15 = (n: unknown) => Math.max(1, Math.min(5, Number(n)));

/**
 * PATCH /api/demands/[id]/risks/[rid]
 * Mettre à jour un risque
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  return withErrorHandler(async () => {
    const { id, rid } = await params;
    validateId(id, 'demande');
    validateId(rid, 'risque');

    const body = await request.json();

    const data: {
      category?: string;
      opportunity?: number;
      probability?: number;
      impact?: number;
      mitigation?: string | null;
      ownerName?: string | null;
    } = {};

    if (body?.category) data.category = String(body.category).trim();
    if ('opportunity' in body)
      data.opportunity = Boolean(body.opportunity) ? 1 : 0;
    if ('probability' in body) data.probability = clamp15(body.probability);
    if ('impact' in body) data.impact = clamp15(body.impact);
    if ('mitigation' in body)
      data.mitigation = body.mitigation ? String(body.mitigation) : null;
    if ('ownerName' in body)
      data.ownerName = body.ownerName ? String(body.ownerName) : null;

    const row = await prisma.demandRisk.update({
      where: { id: rid },
      data,
    });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: 'risk_update',
        details: `${row.opportunity ? 'Opportunité' : 'Risque'} mis à jour: ${row.category} (P${row.probability}/I${row.impact})`,
      },
    });

    return createSuccessResponse({
      row,
      message: 'Risque mis à jour avec succès',
    });
  });
}

/**
 * DELETE /api/demands/[id]/risks/[rid]
 * Supprimer un risque
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  return withErrorHandler(async () => {
    const { id, rid } = await params;
    validateId(id, 'demande');
    validateId(rid, 'risque');

    const risk = await prisma.demandRisk.findUnique({ where: { id: rid } });

    if (!risk) {
      throw notFound('Risque', rid);
    }

    await prisma.demandRisk.delete({ where: { id: rid } });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: risk.opportunity ? 'opportunity_remove' : 'risk_remove',
        details: `${risk.opportunity ? 'Opportunité' : 'Risque'} supprimé: ${risk.category}`,
      },
    });

    return createSuccessResponse({
      ok: true,
      message: 'Risque supprimé avec succès',
    });
  });
}
