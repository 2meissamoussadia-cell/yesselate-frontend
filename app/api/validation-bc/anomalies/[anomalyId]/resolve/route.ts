import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  createSuccessResponse,
  validateId,
} from '@/lib/api/error-handler';
import type { DocumentAnomaly } from '@/lib/types/document-validation.types';

/**
 * POST /api/validation-bc/anomalies/[anomalyId]/resolve
 * Résout une anomalie
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ anomalyId: string }> }
) {
  return withErrorHandler(async () => {
    const { anomalyId } = await params;
    validateId(anomalyId, 'anomalie');

    let body: { comment?: string } = {};
    try {
      body = await req.json();
    } catch {
      // body optionnel
    }

    // TODO: Remplacer par une vraie mise à jour en base de données
    const resolvedAnomaly: DocumentAnomaly = {
      id: anomalyId,
      field: 'montant_ttc',
      type: 'montant_incoherent',
      severity: 'critical',
      message: 'Le montant TTC (15 450 €) ne correspond pas à HT + TVA (15 230 €). Différence: 220 €',
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      detectedBy: 'BMO-AUDIT-SYSTEM',
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'Current User',
    };

    return createSuccessResponse(resolvedAnomaly);
  });
}

