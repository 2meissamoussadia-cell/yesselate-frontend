export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  validateRequired,
  createSuccessResponse,
  HttpStatus,
} from '@/lib/api/error-handler';

const delayDays = (createdAt: Date) => {
  const diff = Date.now() - createdAt.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * GET /api/demands
 * Liste des demandes (legacy - utiliser /api/demandes à la place)
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = request.nextUrl;
    const queue = searchParams.get('queue') ?? 'pending';

    const where: { status?: string; priority?: string } = {};
    if (queue === 'pending') where.status = 'pending';
    if (queue === 'validated') where.status = 'validated';
    if (queue === 'rejected') where.status = 'rejected';
    if (queue === 'urgent') {
      where.status = 'pending';
      where.priority = 'urgent';
    }

    const demands = await prisma.demand.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      take: 200,
    });

    const items = demands
      .map(d => {
        const dd = delayDays(d.requestedAt);
        const isOverdue = dd > 7 && d.status !== 'validated';
        return {
          id: d.id,
          subject: d.subject,
          bureau: d.bureau,
          type: d.type,
          priority: d.priority,
          status: d.status,
          amount: d.amount,
          delayDays: dd,
          isOverdue,
        };
      })
      .filter(d => (queue !== 'overdue' ? true : d.isOverdue));

    return createSuccessResponse({
      items,
      now: new Date().toISOString(),
    });
  });
}

/**
 * POST /api/demands
 * Créer une demande (legacy - utiliser /api/demandes à la place)
 */
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();

    // Valider les champs requis
    validateRequired(body, ['subject', 'bureau', 'type']);

    const id = String(body?.id ?? `REQ-${Date.now()}`).trim();
    const subject = String(body.subject).trim();
    const bureau = String(body.bureau).trim();
    const type = String(body.type).trim();
    const priority = String(body?.priority ?? 'normal').trim();
    const status = 'pending';
    const amount = body?.amount ? Number(body.amount) : null;

    const demand = await prisma.demand.create({
      data: { id, subject, bureau, type, priority, status, amount },
    });

    return createSuccessResponse({ item: demand }, HttpStatus.CREATED);
  });
}
