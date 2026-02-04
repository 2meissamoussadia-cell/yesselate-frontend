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

/**
 * GET /api/demands/[id]/tasks
 * Liste des tâches d'une demande
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const rows = await prisma.demandTask.findMany({
      where: { demandId: id },
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'asc' }],
    });

    return createSuccessResponse({ rows });
  });
}

/**
 * POST /api/demands/[id]/tasks
 * Créer une tâche pour une demande
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'demande');

    const body = await request.json();
    validateRequired(body, ['title']);

    const title = String(body.title).trim();
    if (!title) {
      throw badRequest('Le titre ne peut pas être vide');
    }

    const row = await prisma.demandTask.create({
      data: {
        demandId: id,
        title,
        description: body?.description ? String(body.description) : null,
        dueAt: body?.dueAt ? new Date(body.dueAt) : null,
        assignedToId: body?.assignedToId ?? null,
        assignedToName: body?.assignedToName ?? null,
        status: body?.status ?? 'OPEN',
      },
    });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: 'task_add',
        details: `Tâche créée: ${title}`,
      },
    });

    return createSuccessResponse({ row }, HttpStatus.CREATED);
  });
}
