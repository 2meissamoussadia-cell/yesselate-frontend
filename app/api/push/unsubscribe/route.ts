/**
 * POST /api/push/unsubscribe
 * Supprime un abonnement push par endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { removeSubscription } from '../subscriptions-store';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { endpoint?: string };
    const endpoint = body?.endpoint;
    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'endpoint required' },
        { status: 400 }
      );
    }
    removeSubscription(endpoint);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[api/push/unsubscribe]', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
