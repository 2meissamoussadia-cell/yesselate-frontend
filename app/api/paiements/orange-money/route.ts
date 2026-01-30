/**
 * Phase 6 — POST /api/paiements/orange-money
 * Orange Money sandbox / réel : paiement instantané XOF.
 * En prod : ORANGE_MONEY_TOKEN dans env → appel API Orange Money.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface OrangeMoneyBody {
  amount: number;
  currency: string;
  customer: { phone: string };
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrangeMoneyBody;
    const { amount, currency, customer, reference } = body;

    if (amount == null || amount <= 0) {
      return NextResponse.json(
        { error: 'amount requis et > 0', status: 'ERROR' },
        { status: 400 }
      );
    }

    const token = process.env.ORANGE_MONEY_TOKEN;
    if (token) {
      // Appel API Orange Money Sandbox réelle
      const res = await fetch('https://sandbox.orangemoney.sn/api/v1/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: currency || 'XOF',
          debtor: { msisdn: customer?.phone?.replace(/\D/g, '') || '221778123456' },
          reference: reference || `PAY-${Date.now()}`,
        }),
      });
      const result = await res.json();
      return NextResponse.json({
        status: result.status === 'SUCCESS' ? 'SUCCESS' : result.status ?? 'PENDING',
        transactionId: result.id ?? result.transactionId ?? `om-${Date.now()}`,
      });
    }

    // Mock sandbox : succès immédiat
    const transactionId = `mock-om-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return NextResponse.json({
      status: 'SUCCESS',
      transactionId,
      message: 'Paiement Orange Money mock (sandbox)',
    });
  } catch (e) {
    console.error('[paiements/orange-money]', e);
    return NextResponse.json(
      { error: 'Erreur serveur', status: 'ERROR' },
      { status: 500 }
    );
  }
}
