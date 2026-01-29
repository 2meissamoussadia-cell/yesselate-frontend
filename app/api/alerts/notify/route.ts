/**
 * POST /api/alerts/notify
 * Envoi d'une alerte critique par email ou SMS (urgences critiques).
 * Placeholder : enregistre la demande ; à brancher sur un service email/SMS réel.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, channel, recipients } = body as {
      alertId?: string;
      channel?: 'email' | 'sms';
      recipients?: string[];
    };

    if (!alertId || !channel) {
      return NextResponse.json(
        { error: 'Missing required fields: alertId, channel (email|sms)' },
        { status: 400 }
      );
    }

    if (channel !== 'email' && channel !== 'sms') {
      return NextResponse.json(
        { error: 'channel must be email or sms' },
        { status: 400 }
      );
    }

    // Placeholder : log / queue pour envoi réel (SendGrid, Twilio, etc.)
    // await emailService.sendCriticalAlert(alertId, recipients);
    // await smsService.sendCriticalAlert(alertId, recipients);
    console.info('[alerts/notify]', { alertId, channel, recipients });

    return NextResponse.json(
      { ok: true, message: `Demande d'envoi ${channel} enregistrée` },
      { status: 202 }
    );
  } catch (error) {
    console.error('[alerts/notify]', error);
    return NextResponse.json(
      { error: 'Failed to send notification', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
