/**
 * API Route pour rafraîchissement manuel/CRON des vues matérialisées
 * Phase P3: CRON de secours via API
 * 
 * Protection: Vérifier un secret dans les headers ou l'environnement
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeRefreshCronJob } from '@/lib/server/dashboard/workers/refreshMViewsCron';

/**
 * Secret pour protéger l'endpoint (à définir dans .env)
 * Ex: CRON_SECRET=your-secret-key
 */
const CRON_SECRET = process.env.CRON_SECRET || 'change-me-in-production';

export async function POST(req: NextRequest) {
  try {
    // Vérification du secret
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.headers.get('x-cron-secret');
    
    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Exécuter le job
    await executeRefreshCronJob();
    
    return NextResponse.json(
      { success: true, message: 'Views refreshed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CronAPI] Error executing refresh job:', error);
    return NextResponse.json(
      {
        error: 'Failed to refresh views',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET pour vérifier que l'endpoint est accessible (sans exécution)
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Refresh views endpoint',
      method: 'POST',
      requiredHeader: 'x-cron-secret or Authorization: Bearer <CRON_SECRET>',
    },
    { status: 200 }
  );
}
