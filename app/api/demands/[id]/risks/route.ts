export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const clamp15 = (n: unknown) => Math.max(1, Math.min(5, Number(n)));

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await prisma.demandRisk.findMany({
    where: { demandId: id },
    orderBy: [{ opportunity: 'asc' }, { category: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ rows });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const category = String(body?.category ?? '').trim();
  if (!category) return NextResponse.json({ error: 'category requis' }, { status: 400 });

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

  return NextResponse.json({ row });
}
