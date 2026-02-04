export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Demand } from '@prisma/client';
import { withErrorHandler } from '@/lib/api/error-handler';

const toCSV = (rows: Demand[]) => {
  const header = [
    'id',
    'subject',
    'bureau',
    'type',
    'priority',
    'status',
    'amount',
    'requestedAt',
    'assignedToName',
  ];
  const escape = (v: string | number | Date | null | undefined) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.subject,
        r.bureau,
        r.type,
        r.priority,
        r.status,
        r.amount ?? '',
        r.requestedAt?.toISOString?.() ?? '',
        r.assignedToName ?? '',
      ]
        .map(escape)
        .join(',')
    );
  }
  return lines.join('\n');
};

/**
 * GET /api/demandes/export
 * Exporter les demandes
 */
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = request.nextUrl;
    const format = (searchParams.get('format') ?? 'csv').toLowerCase();
    const queue = searchParams.get('queue');

    type WhereClause = {
      status?: string;
      priority?: string;
    };

    const where: WhereClause = {};
    if (queue === 'pending') where.status = 'pending';
    if (queue === 'validated') where.status = 'validated';
    if (queue === 'rejected') where.status = 'rejected';
    if (queue === 'urgent') {
      where.status = 'pending';
      where.priority = 'urgent';
    }

    const rows = await prisma.demand.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
    });

    if (format === 'json') {
      return NextResponse.json(
        { rows },
        {
          headers: {
            'Content-Disposition': `attachment; filename="demandes.json"`,
          },
        }
      );
    }

    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="demandes.csv"`,
      },
    });
  });
}
