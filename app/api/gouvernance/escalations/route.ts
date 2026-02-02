/**
 * POST /api/gouvernance/escalations
 * Soumission d'une escalade vers un niveau supérieur
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, recipient, urgency, description, source } = body as {
      level: number;
      recipient?: string;
      urgency?: string;
      description?: string;
      source?: Record<string, unknown>;
    };
    if (!recipient || !description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Destinataire et description requis' },
        { status: 400 }
      );
    }
    // En production: persister en BDD, envoyer notification, etc.
    return NextResponse.json({
      success: true,
      message: 'Escalade envoyée',
      id: `ESC-${Date.now()}`,
    });
  } catch (err) {
    console.error('[gouvernance/escalations]', err);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
