export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateId,
  validateRequired,
  createSuccessResponse,
  HttpStatus,
} from '@/lib/api/error-handler';

/**
 * GET /api/demands/[id]/stakeholders
 * Liste des parties prenantes d'une demande
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const rows = await prisma.demandStakeholder.findMany({
      where: { demandId: id },
      orderBy: [{ required: 'desc' }, { role: 'asc' }, { createdAt: 'asc' }],
    });

    return createSuccessResponse({ rows });
  });
}

/**
 * POST /api/demands/[id]/stakeholders
 * Ajouter une partie prenante à une demande
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const body = await request.json();
    validateRequired(body, ['personId', 'personName', 'role']);

    const personId = String(body.personId).trim();
    const personName = String(body.personName).trim();
    const role = body.role;
    const required = body?.required ? 1 : 0;
    const note = body?.note ? String(body.note) : null;

    const row = await prisma.demandStakeholder.create({
      data: { demandId: id, personId, personName, role, required, note },
    });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: 'stakeholder_add',
        details: `${personName} ajouté (${role}${required ? ', requis' : ''})`,
      },
    });

    return createSuccessResponse({ row }, HttpStatus.CREATED);
  });
}
