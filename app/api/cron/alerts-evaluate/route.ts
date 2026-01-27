// app/api/cron/alerts-evaluate/route.ts
// Phase P15: Moteur d'alertes - CRON pour évaluation périodique

import { NextRequest, NextResponse } from 'next/server';
import { evaluateAllTenantsRules } from '@/lib/server/dashboard/alerting/alertsEvaluatorWorker';
import { withReq } from '@/lib/server/logging';

const log = withReq('cron-alerts-evaluate');

/**
 * Secret pour protéger l'endpoint (à définir dans .env)
 * Ex: CRON_SECRET=your-secret-key
 */
const CRON_SECRET = process.env.CRON_SECRET || 'change-me-in-production';

/**
 * POST /api/cron/alerts-evaluate
 * 
 * Évalue toutes les règles d'alerte pour tous les tenants
 * Phase P15: Moteur d'alertes
 * 
 * Protection: Vérifier CRON_SECRET dans les headers
 * 
 * Usage CRON: Toutes les 5-10 minutes
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const t0 = performance.now();
  const reqId = req.headers.get('x-request-id') ?? 'cron-' + Date.now();
  const logReq = log.child({ reqId });

  try {
    // Vérification du secret
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.headers.get('x-cron-secret');
    
    if (providedSecret !== CRON_SECRET) {
      const seconds = (performance.now() - t0) / 1000;
      logReq.warn({ seconds }, 'cron alerts evaluate unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Exécuter l'évaluation
    await evaluateAllTenantsRules();
    
    const seconds = (performance.now() - t0) / 1000;
    logReq.info({ seconds }, 'cron alerts evaluate completed');
    
    return NextResponse.json(
      { success: true, message: 'Alerts evaluated successfully' },
      { status: 200 }
    );
  } catch (error) {
    const seconds = (performance.now() - t0) / 1000;
    logReq.error({ err: error, seconds }, 'cron alerts evaluate error');
    return NextResponse.json(
      {
        error: 'Failed to evaluate alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET pour vérifier que l'endpoint est accessible (sans exécution)
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      message: 'Alerts evaluation endpoint',
      method: 'POST',
      requiredHeader: 'x-cron-secret or Authorization: Bearer <CRON_SECRET>',
    },
    { status: 200 }
  );
}
