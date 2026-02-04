import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';
import {
  withErrorHandler,
  validateId,
  notFound,
  createSuccessResponse,
} from '@/lib/api/error-handler';

/**
 * POST /api/alerts/[id]/escalate
 * Escalader une alerte
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

    // Simuler l'escalade
    const escalatedAlert = {
      ...alert,
      status: 'escalated',
      escalatedAt: new Date().toISOString(),
      escalatedTo: body.escalateTo || 'manager',
      escalationReason: body.reason || '',
      priority: body.priority || alert.priority,
      updatedAt: new Date().toISOString(),
    };

    return createSuccessResponse({
      alert: escalatedAlert,
      notification: {
        sent: true,
        to: body.escalateTo,
        type: 'email',
      },
      message: 'Alerte escaladée avec succès',
    });
  });
}
