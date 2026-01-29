/**
 * API Orange Money — V5 Ultimate (stub)
 * POST /api/payments/orange-money
 * En production : appeler l’API Orange Money avec les credentials.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface OrangeMoneyPayload {
  amount?: number;
  currency?: string;
  recipientId?: string;
  recipientPhone?: string;
  reference?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as OrangeMoneyPayload;
    const { amount = 0, currency = 'XOF', recipientId, recipientPhone, reference } = body;

    // Stub : log et retourne succès (à remplacer par appel API Orange Money)
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('[api/payments/orange-money]', {
        amount,
        currency,
        recipientId,
        recipientPhone,
        reference,
      });
    }

    const transactionId = `OM-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json({
      success: true,
      transactionId,
      message: 'Paiement Orange Money initié (stub). Brancher ORANGE_MONEY_API en production.',
    });
  } catch (err) {
    console.error('[api/payments/orange-money]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
