/**
 * Phase 6 — PATCH /api/chantiers/[id]/paye
 * Marque le chantier comme payé (transactionId Orange Money).
 * En prod : mise à jour DB (Prisma) ; ici mock OK.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface PayeBody {
  transactionId: string;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as PayeBody;
    const { transactionId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id chantier requis' },
        { status: 400 }
      );
    }
    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId requis' },
        { status: 400 }
      );
    }

    // Mock : en prod → prisma.chantier.update({ where: { id }, data: { paye: true, transactionId } })
    return NextResponse.json({
      ok: true,
      chantierId: id,
      transactionId,
      message: 'Chantier marqué payé (mock)',
    });
  } catch (e) {
    console.error('[chantiers/[id]/paye]', e);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
