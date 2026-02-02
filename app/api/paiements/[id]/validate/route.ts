/**
 * POST /api/paiements/[id]/validate
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    // TODO: Valider en BDD, notifier
    return NextResponse.json({ success: true, message: 'Paiement validé' });
  } catch (err) {
    console.error('[paiements/validate]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
