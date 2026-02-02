/**
 * POST /api/paiements/[id]/huissier
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    // TODO: Transmettre à huissier, créer dossier recouvrement
    return NextResponse.json({ success: true, message: 'Transmis à l\'huissier' });
  } catch (err) {
    console.error('[paiements/huissier]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
