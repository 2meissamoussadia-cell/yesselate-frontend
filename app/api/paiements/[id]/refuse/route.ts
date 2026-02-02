/**
 * POST /api/paiements/[id]/refuse
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { motif } = body;
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    // TODO: Refuser en BDD, notifier
    return NextResponse.json({ success: true, message: 'Paiement refusé' });
  } catch (err) {
    console.error('[paiements/refuse]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
