/**
 * POST /api/paiements/[id]/demande-pieces
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { pieces } = body;
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    // TODO: Enregistrer demande, notifier bénéficiaire
    return NextResponse.json({ success: true, message: 'Demande de pièces envoyée' });
  } catch (err) {
    console.error('[paiements/demande-pieces]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
