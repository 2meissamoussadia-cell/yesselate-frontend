/**
 * POST /api/push/subscribe
 * Enregistre un abonnement push (PushSubscription JSON).
 * En prod : persister en base (par utilisateur/session).
 */

import { NextRequest, NextResponse } from 'next/server';
import { addSubscription } from '../subscriptions-store';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { endpoint: string; keys: { auth: string; p256dh: string }; expirationTime?: number | null };
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.auth || !keys?.p256dh) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription (endpoint, keys.auth, keys.p256dh required)' },
        { status: 400 }
      );
    }
    addSubscription(body);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[api/push/subscribe]', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
