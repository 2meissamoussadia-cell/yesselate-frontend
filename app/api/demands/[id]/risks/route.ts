export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateId,
  validateRequired,
  badRequest,
  createSuccessResponse,
  HttpStatus,
} from '@/lib/api/error-handler';

const clamp15 = (n: unknown) => Math.max(1, Math.min(5, Number(n)));

/**
 * GET /api/demands/[id]/risks
 * Liste des risques d'une demande
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const rows = await prisma.demandRisk.findMany({
      where: { demandId: id },
      orderBy: [
        { opportunity: 'asc' },
        { category: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return createSuccessResponse({ rows });
  });
}

/**
 * POST /api/demands/[id]/risks
 * Ajouter un risque à une demande
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const body = await request.json();
    validateRequired(body, ['category']);

    const category = String(body.category).trim();
    if (!category) {
      throw badRequest('La catégorie ne peut pas être vide');
    }

    const row = await prisma.demandRisk.create({
      data: {
        demandId: id,
        category,
        opportunity: Boolean(body?.opportunity ?? false) ? 1 : 0,
        probability: clamp15(body?.probability ?? 3),
        impact: clamp15(body?.impact ?? 3),
        mitigation: body?.mitigation ? String(body.mitigation) : null,
        ownerName: body?.ownerName ? String(body.ownerName) : null,
      },
    });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: 'risk_add',
        details: `${row.opportunity ? 'Opportunité' : 'Risque'} ajouté: ${category} (P${row.probability}/I${row.impact})`,
      },
    });

    return createSuccessResponse({ row }, HttpStatus.CREATED);
  });
}
