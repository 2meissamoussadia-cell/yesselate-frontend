import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';
import {
  withErrorHandler,
  validateId,
  notFound,
  createSuccessResponse,
} from '@/lib/api/error-handler';

/**
 * GET /api/alerts/[id]
 * Récupérer une alerte par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'alerte');

    // Chercher l'alerte dans les données mockées
    const alerts = generateMockAlerts(100);
    const alert = alerts.find(a => a.id === id);

    if (!alert) {
      throw notFound('Alerte', id);
    }

    return createSuccessResponse({ alert });
  });
}

/**
 * PATCH /api/alerts/[id]
 * Mettre à jour une alerte
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'alerte');
    
    const body = await request.json();

    // Simuler la mise à jour
    const alerts = generateMockAlerts(100);
    const alert = alerts.find(a => a.id === id);

    if (!alert) {
      throw notFound('Alerte', id);
    }

    // Fusionner les données
    const updatedAlert = {
      ...alert,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return createSuccessResponse({
      alert: updatedAlert,
      message: 'Alerte mise à jour avec succès',
    });
  });
}

/**
 * DELETE /api/alerts/[id]
 * Supprimer une alerte (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'alerte');

    // Vérifier que l'alerte existe
    const alerts = generateMockAlerts(100);
    const alert = alerts.find(a => a.id === id);

    if (!alert) {
      throw notFound('Alerte', id);
    }

    return createSuccessResponse({
      message: 'Alerte supprimée avec succès',
    });
  });
}
