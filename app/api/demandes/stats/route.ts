export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  withErrorHandler,
  createSuccessResponse,
} from '@/lib/api/error-handler';

const daysBetween = (a: Date, b: Date) =>
  Math.ceil((a.getTime() - b.getTime()) / 86400000);

/**
 * GET /api/demandes/stats
 * Statistiques sur les demandes
 */
export async function GET(_request: NextRequest) {
  return withErrorHandler(async () => {
    const rows = await prisma.demand.findMany({
      select: { status: true, priority: true, requestedAt: true },
    });

    const now = new Date();
    const total = rows.length;
    const pending = rows.filter(r => r.status === 'pending').length;
    const validated = rows.filter(r => r.status === 'validated').length;
    const rejected = rows.filter(r => r.status === 'rejected').length;

    const urgent = rows.filter(
      r => r.priority === 'urgent' && r.status === 'pending'
    ).length;
    const high = rows.filter(
      r => r.priority === 'high' && r.status === 'pending'
    ).length;

    const delays = rows.map(r => Math.max(0, daysBetween(now, r.requestedAt)));
    const avgDelay = total
      ? Math.round(delays.reduce((a, b) => a + b, 0) / total)
      : 0;

    const overdue = rows.filter(
      r => daysBetween(now, r.requestedAt) > 7 && r.status !== 'validated'
    ).length;

    return createSuccessResponse({
      total,
      pending,
      validated,
      rejected,
      urgent,
      high,
      overdue,
      avgDelay,
      ts: now.toISOString(),
    });
  });
}
