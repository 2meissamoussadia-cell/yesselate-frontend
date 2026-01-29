/**
 * POST /api/push/send
 * Envoie une notification push à tous les abonnés (test ou broadcast).
 * Corps : { title?: string, body?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllSubscriptions } from '../subscriptions-store';

export async function POST(request: NextRequest) {
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return NextResponse.json(
      { success: false, error: 'VAPID keys not configured' },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { title?: string; body?: string };
    const title = body?.title ?? 'Cockpit DG';
    const payload = JSON.stringify({ title, body: body?.body ?? '' });

    const subs = getAllSubscriptions();
    if (subs.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No subscriptions' });
    }

    // web-push est optionnel : si absent, on retourne 503 avec message
    let webpush: typeof import('web-push');
    try {
      webpush = await import('web-push');
    } catch {
      return NextResponse.json(
        { success: false, error: 'web-push not installed. Run: npm install web-push' },
        { status: 503 }
      );
    }

    webpush.setVapidDetails(
      'mailto:contact@nicerenovation.sn',
      publicKey,
      privateKey
    );

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.keys.auth, p256dh: sub.keys.p256dh },
          },
          payload,
          { TTL: 86400 }
        )
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    return NextResponse.json({ success: true, sent, failed });
  } catch (e) {
    console.error('[api/push/send]', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
