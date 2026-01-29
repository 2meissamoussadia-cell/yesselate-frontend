/**
 * GET /api/paiements/[id]/full
 * Détails complets d'un paiement (enrichi) + cohérence avec validation BC
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitRedis } from '@lib-root/server/observability/rateLimitRedis';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimitRedis(`paiements:full:${ip}`, 120, 2);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': String(rl.remaining) } }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Paiement ID is required' },
        { status: 400 }
      );
    }

    // TODO: Récupérer paiement depuis DB avec relations
    // const paiement = await prisma.paiement.findUnique({
    //   where: { id },
    //   include: {
    //     fournisseur: true,
    //     documentSource: true, // BC / facture / contrat
    //     schedule: true,
    //     reconcile: true,
    //     timeline: true,
    //   },
    // });

    // Mock: détails complets + lien BC
    const documentSourceId = `bc-${id.slice(-6)}`;
    const fullPaiement = {
      id,
      reference: `PAY-2026-01-${id.slice(-4)}`,
      status: 'pending',
      bureau: 'BMO',
      montant: 10_000_000,
      currency: 'XOF',
      documentSourceType: 'bc' as const,
      documentSourceId,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      urgency: 'high',
      description: 'Paiement fournisseur SENELEC - BC validé',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      demandeur: {
        id: 'user-1',
        nom: 'Amadou DIALLO',
        email: 'adiallo@example.com',
        fonction: 'Chef de Service Infrastructure',
        bureau: 'BMO',
      },

      fournisseur: {
        id: 'four-1',
        nom: 'SENELEC',
        rib: 'SN08 1234 5678 9012 3456 7890 123',
        iban: 'SN08 1234 5678 9012 3456 7890 123',
        bic: 'ABCDSNKA',
        email: 'contact@senelec.sn',
      },

      schedule: null as {
        scheduledAt: string;
        scheduledBy: string;
        reason: string;
      } | null,
      reconciled: null as { reconciledAt: string; reconciledBy: string } | null,

      // Cohérence validation BC : lien vers le document BC source
      validationBC: {
        documentId: documentSourceId,
        status: 'validated',
        validatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        validators: [
          { niveau: 1, nom: 'A. DIALLO', statut: 'validated' },
          { niveau: 2, nom: 'M. KANE', statut: 'validated' },
        ],
        montantBC: 10_030_000,
        montantTTC: 10_030_000,
        coherence: true,
        message: 'Paiement aligné sur BC validé',
        documentUrl: `/api/validation-bc/documents/${documentSourceId}/full`,
        frontPath: `/maitre-ouvrage/validation-bc?id=${documentSourceId}`,
      },

      permissions: {
        canEdit: true,
        canCancel: true,
        canSchedule: true,
        canReconcile: false,
      },

      timeline: [
        {
          id: 'evt-1',
          action: 'created',
          actorName: 'Amadou DIALLO',
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          details: 'Paiement créé à partir du BC validé',
        },
        {
          id: 'evt-2',
          action: 'submitted',
          actorName: 'Amadou DIALLO',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          details: 'Soumis au circuit de validation paiement',
        },
      ],
    };

    return NextResponse.json(fullPaiement);
  } catch (error) {
    console.error(`[paiements/${(await params).id}/full] Error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to get full paiement',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
