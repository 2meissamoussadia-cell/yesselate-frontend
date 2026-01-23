import { NextRequest, NextResponse } from 'next/server';
import type { DocumentAnomaly } from '@/lib/types/document-validation.types';

/**
 * POST /api/validation-bc/anomalies/[anomalyId]/resolve
 * Résout une anomalie
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ anomalyId: string }> }
) {
  try {
    const { anomalyId } = await params;
    const body = await req.json();
    const { comment } = body || {};

    // TODO: Remplacer par une vraie mise à jour en base de données
    // Mock data pour développement
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
      resolvedBy: 'Current User', // TODO: Récupérer depuis la session
    };

    return NextResponse.json(resolvedAnomaly);
  } catch (error) {
    console.error('Error resolving anomaly:', error);
    return NextResponse.json(
      { error: 'Failed to resolve anomaly' },
      { status: 500 }
    );
  }
}

