export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const clamp15 = (n: unknown) => Math.max(1, Math.min(5, Number(n)));

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; rid: string }> }) {
  const { id, rid } = await params;
  const body = await req.json().catch(() => null);

  const data: {
    category?: string;
    opportunity?: number;
    probability?: number;
    impact?: number;
    mitigation?: string | null;
    ownerName?: string | null;
  } = {};

  if (body?.category) data.category = String(body.category).trim();
  if ('opportunity' in body) data.opportunity = Boolean(body.opportunity) ? 1 : 0;
  if ('probability' in body) data.probability = clamp15(body.probability);
  if ('impact' in body) data.impact = clamp15(body.impact);
  if ('mitigation' in body) data.mitigation = body.mitigation ? String(body.mitigation) : null;
  if ('ownerName' in body) data.ownerName = body.ownerName ? String(body.ownerName) : null;

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

  return NextResponse.json({ row });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; rid: string }> }) {
  const { id, rid } = await params;
  
  const risk = await prisma.demandRisk.findUnique({ where: { id: rid } });

  await prisma.demandRisk.delete({ where: { id: rid } });

  await prisma.demandEvent.create({
    data: {
      demandId: id,
      actorId: 'SYS',
      actorName: 'System',
      action: risk?.opportunity ? 'opportunity_remove' : 'risk_remove',
      details: `${risk?.opportunity ? 'Opportunité' : 'Risque'} supprimé: ${risk?.category ?? rid}`,
    },
  });

  return NextResponse.json({ ok: true });
}
