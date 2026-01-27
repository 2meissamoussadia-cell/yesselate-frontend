// app/api/cron/alerts-escalations/route.ts
// Phase P17: Règles d'alerting avancées — CRON pour escalades

import { NextRequest, NextResponse } from 'next/server';
import { processEscalations } from '@lib-root/server/dashboard/alerting/escalationWorker';
import { withReq } from '@/lib/server/logging';

const log = withReq('cron-alerts-escalations');

const CRON_SECRET = process.env.CRON_SECRET || 'change-me-in-production';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'cron-' + Date.now();
  const logReq = log.child({ reqId });

  try {
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.headers.get('x-cron-secret');

    if (providedSecret !== CRON_SECRET) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.warn({ seconds }, 'cron alerts escalations unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await processEscalations();

    const seconds = (performance.now() - t0) / 1000;
    logReq.info({ seconds }, 'cron alerts escalations completed');

    return NextResponse.json(
      { success: true, message: 'Escalations processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'cron alerts escalations error');
    return NextResponse.json(
      {
        error: 'Failed to process escalations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      message: 'Alerts escalations endpoint',
      method: 'POST',
      requiredHeader: 'x-cron-secret or Authorization: Bearer <CRON_SECRET>',
    },
    { status: 200 }
  );
}
