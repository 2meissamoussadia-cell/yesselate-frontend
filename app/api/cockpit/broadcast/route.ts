/**
 * API Broadcast — V5 Ultimate (stub)
 * POST /api/cockpit/broadcast
 * Envoi d’annonce à toutes les équipes / chantiers (stub). En prod : WebSocket ou push.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface BroadcastPayload {
  message?: string;
  scope?: 'all' | 'chantiers' | 'bureaux';
  priority?: 'normal' | 'high' | 'urgent';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as BroadcastPayload;
    const { message = '', scope = 'all', priority = 'normal' } = body;

    // Stub : log et retourne succès (à remplacer par WebSocket / push)
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('[api/cockpit/broadcast]', { message: message.slice(0, 100), scope, priority });
    }

    const broadcastId = `BC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return NextResponse.json({
      success: true,
      broadcastId,
      recipients: scope === 'all' ? 'tous chantiers + bureaux' : scope,
      message: 'Annonce diffusée (stub). Brancher WebSocket/Push en production.',
    });
  } catch (err) {
    console.error('[api/cockpit/broadcast]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
