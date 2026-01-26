import { NextRequest } from 'next/server';
import { healthCheck } from '@/lib/server/observability/health';

/**
 * GET /api/health
 * 
 * Health check amélioré pour monitoring
 * Phase P4: Observabilité & Robustesse
 */
export async function GET(request: NextRequest) {
  return healthCheck(request);
}

