// API Route: PATCH /api/paiements/[id]/update
// Met à jour un paiement (avant validation uniquement)

import { NextRequest, NextResponse } from 'next/server';

export interface UpdatePaiementBody {
  montant?: number;
  dueDate?: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  fournisseurDetails?: {
    rib?: string;
    iban?: string;
    bic?: string;
  };
  scheduledDate?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePaiementBody = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Paiement ID is required' },
        { status: 400 }
      );
    }

    // TODO: Récupérer paiement depuis DB
    const existingPaiement = {
      id,
      status: 'pending',
      montant: 10000000,
      createdAt: '2024-01-15',
    };

    // Vérifier que le paiement peut être modifié
    if (existingPaiement.status !== 'pending' && existingPaiement.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Cannot update paiement: already validated, executed, or rejected' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permissions utilisateur
    // Seul demandeur, validateurs ou admin peuvent modifier

    // Construire updates
    const updates: Partial<UpdatePaiementBody> = {};

    if (body.montant !== undefined) {
      if (body.montant <= 0) {
        return NextResponse.json(
          { error: 'Montant must be positive' },
          { status: 400 }
        );
      }
      updates.montant = body.montant;

      // TODO: Re-vérifier budget et trésorerie si montant change
      // TODO: Re-calculer workflow si montant franchit seuils
    }

    if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
    if (body.urgency !== undefined) updates.urgency = body.urgency;
    if (body.description !== undefined) updates.description = body.description;
    if (body.scheduledDate !== undefined) updates.scheduledDate = body.scheduledDate;

    if (body.fournisseurDetails) {
      // TODO: Re-valider RIB/IBAN si modifié
      updates.fournisseurDetails = body.fournisseurDetails;
    }

    // TODO: Mettre à jour en DB
    // await prisma.paiement.update({ where: { id }, data: updates });

    // TODO: Créer timeline entry
    // TODO: Re-exécuter contrôles automatiques
    // TODO: Notifier validateurs si changements significatifs

    const updatedPaiement = {
      ...existingPaiement,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    console.log(`[paiements/${id}/update] Paiement mis à jour:`, {
      id,
      changes: Object.keys(updates),
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement mis à jour avec succès',
      paiement: updatedPaiement,
      changes: Object.keys(updates),
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[paiements/${id}/update] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update paiement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

