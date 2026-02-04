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
 * PATCH /api/demands/[id]/tasks/[tid]
 * Mettre à jour une tâche
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tid: string }> }
) {
  return withErrorHandler(async () => {
    const { id, tid } = await params;
    validateId(id, 'demande');
    validateId(tid, 'tâche');

    const body = await request.json();

    const data: {
      status?: string;
      title?: string;
      description?: string | null;
      dueAt?: Date | null;
      completedAt?: Date;
    } = {};

    if (body?.status) data.status = body.status;
    if (body?.title) data.title = String(body.title).trim();
    if (body?.description !== undefined)
      data.description = body.description ? String(body.description) : null;
    if (body?.dueAt !== undefined)
      data.dueAt = body.dueAt ? new Date(body.dueAt) : null;

    if (body?.status === 'DONE') data.completedAt = new Date();

    const row = await prisma.demandTask.update({ where: { id: tid }, data });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: 'task_update',
        details: `Tâche mise à jour: ${row.title}`,
      },
    });

    return createSuccessResponse({
      row,
      message: 'Tâche mise à jour avec succès',
    });
  });
}

/**
 * DELETE /api/demands/[id]/tasks/[tid]
 * Supprimer une tâche
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; tid: string }> }
) {
  return withErrorHandler(async () => {
    const { id, tid } = await params;
    validateId(id, 'demande');
    validateId(tid, 'tâche');

    const task = await prisma.demandTask.findUnique({ where: { id: tid } });

    if (!task) {
      throw notFound('Tâche', tid);
    }

    await prisma.demandTask.delete({ where: { id: tid } });

    await prisma.demandEvent.create({
      data: {
        demandId: id,
        actorId: 'SYS',
        actorName: 'System',
        action: 'task_remove',
        details: `Tâche supprimée: ${task.title}`,
      },
    });

    return createSuccessResponse({
      ok: true,
      message: 'Tâche supprimée avec succès',
    });
  });
}
