import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';
import {
  withErrorHandler,
  validateId,
  notFound,
  createSuccessResponse,
} from '@/lib/api/error-handler';

/**
 * POST /api/alerts/[id]/acknowledge
 * Acquitter une alerte
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'alerte');
    
    const body = await request.json().catch(() => ({}));

    // Chercher l'alerte
    const alerts = generateMockAlerts(100);
    const alert = alerts.find(a => a.id === id);

    if (!alert) {
      throw notFound('Alerte', id);
    }

    // Simuler l'acquittement
    const acknowledgedAlert = {
      ...alert,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: body.userId || 'system',
      updatedAt: new Date().toISOString(),
    };

    return createSuccessResponse({
      alert: acknowledgedAlert,
      message: 'Alerte acquittée avec succès',
    });
  });
}
