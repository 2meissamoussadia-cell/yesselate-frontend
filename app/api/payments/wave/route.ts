/**
 * API Wave — V5 Ultimate (stub)
 * POST /api/payments/wave
 * En production : appeler l’API Wave avec les credentials.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface WavePayload {
  amount?: number;
  currency?: string;
  recipientId?: string;
  recipientPhone?: string;
  reference?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as WavePayload;
    const { amount = 0, currency = 'XOF', recipientId, recipientPhone, reference } = body;

    // Stub : log et retourne succès (à remplacer par appel API Wave)
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('[api/payments/wave]', {
        amount,
        currency,
        recipientId,
        recipientPhone,
        reference,
      });
    }

    const transactionId = `WV-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Paiement Wave initié (stub). Brancher WAVE_API en production.',
    });
  } catch (err) {
    console.error('[api/payments/wave]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
