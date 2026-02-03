/**
 * Phase 3 #24 — Enregistrement d'un webhook (API publique)
 * POST /api/webhooks/register — Ajoute une URL de webhook (mock : retourne succès, liste via GET /api/webhooks)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, events } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'url requise' },
        { status: 400 }
      );
    }

    // Mock : en production on persisterait en base (table webhooks)
    const id = `wh-${Date.now()}`;
    const webhook = {
      id,
      name: name || 'Nouveau webhook',
      url: url.trim(),
      events: Array.isArray(events) ? events : ['calendar.event.created', 'analytics.alert.triggered'],
      active: true,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
    };

    return NextResponse.json(
      { id: webhook.id, message: 'Webhook enregistré', webhook },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/webhooks/register:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du webhook' },
      { status: 500 }
    );
  }
}
