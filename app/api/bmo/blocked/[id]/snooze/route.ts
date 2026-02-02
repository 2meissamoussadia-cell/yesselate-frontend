/**
 * POST /api/bmo/blocked/[id]/snooze
 * Reporter une alerte SLA
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { hours = 24, comment } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    // TODO: Persister en BDD, recalculer prochaine alerte
    return NextResponse.json({
      success: true,
      message: `Alerte reportée de ${hours}h`,
      nextAlertAt: new Date(Date.now() + (hours || 24) * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error('[blocked/snooze]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
