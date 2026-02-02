/**
 * POST /api/gouvernance/decisions
 * Soumission d'une décision (approbation, rejet, report)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { option, comment, data } = body as {
      option: 'approve' | 'reject' | 'defer';
      comment?: string;
      data?: Record<string, unknown>;
    };
    if (!option) {
      return NextResponse.json(
        { success: false, error: 'option requise' },
        { status: 400 }
      );
    }
    // En production: persister en BDD, notifier, etc.
    return NextResponse.json({
      success: true,
      message: `Décision ${option} enregistrée`,
      id: `DEC-${Date.now()}`,
    });
  } catch (err) {
    console.error('[gouvernance/decisions]', err);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
