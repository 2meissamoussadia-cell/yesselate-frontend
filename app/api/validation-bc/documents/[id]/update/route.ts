// API Route: PATCH /api/validation-bc/documents/[id]/update
// Met à jour un document (avant validation uniquement)

import { NextRequest, NextResponse } from 'next/server';

export interface UpdateDocumentBody {
  objet?: string;
  fournisseurId?: string;
  projetId?: string;
  montantHT?: number;
  tva?: number;
  dateEmission?: string;
  dateLimite?: string;
  urgent?: boolean;
  lignes?: Array<{
    id?: string;
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
    montant: number;
    categorie?: string;
  }>;
  commentaire?: string;
  addAttachments?: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  removeAttachments?: string[]; // IDs des attachments à supprimer
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateDocumentBody = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // TODO: Récupérer le document depuis DB
    // const document = await prisma.validationDocument.findUnique({
    //   where: { id },
    //   include: { lignes: true, attachments: true }
    // });

    // Mock: Récupérer document existant
    const existingDocument = {
      id,
      type: 'bc',
      status: 'pending',
      bureau: 'DRE',
      fournisseur: 'SENELEC',
      objet: 'Fourniture équipements électriques',
      montantHT: 8500000,
      montantTTC: 10030000,
      tva: 18,
      createdAt: '2024-01-15T00:00:00.000Z',
      validatedAt: null,
    };

    // Vérifier que le document existe
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Vérifier que le document n'est pas déjà validé
    if (existingDocument.status !== 'pending' && existingDocument.status !== 'info_requested') {
      return NextResponse.json(
        { error: 'Cannot update document: already validated or rejected' },
        { status: 400 }
      );
    }

    // TODO: Vérifier les permissions de l'utilisateur
    // Seul le demandeur ou un admin peut modifier

    // Construire les données mises à jour
    const updates: Partial<UpdateDocumentBody> = {};

    if (body.objet !== undefined) updates.objet = body.objet;
    if (body.fournisseurId !== undefined) updates.fournisseurId = body.fournisseurId;
    if (body.projetId !== undefined) updates.projetId = body.projetId;
    if (body.montantHT !== undefined) {
      if (body.montantHT <= 0) {
        return NextResponse.json(
          { error: 'MontantHT must be positive' },
          { status: 400 }
        );
      }
      updates.montantHT = body.montantHT;
    }
    if (body.tva !== undefined) updates.tva = body.tva;
    if (body.dateEmission !== undefined) updates.dateEmission = body.dateEmission;
    if (body.dateLimite !== undefined) updates.dateLimite = body.dateLimite;
    if (body.urgent !== undefined) updates.urgent = body.urgent;
    if (body.commentaire !== undefined) updates.commentaire = body.commentaire;

    // Vérifier cohérence montants si lignes modifiées
    if (body.lignes) {
      const totalLignes = body.lignes.reduce((sum, ligne) => sum + ligne.montant, 0);
      const montantHT = updates.montantHT || existingDocument.montantHT;
      
      if (Math.abs(totalLignes - montantHT) > 0.01) {
        return NextResponse.json(
          { error: 'Sum of lignes does not match montantHT' },
          { status: 400 }
        );
      }

      updates.lignes = body.lignes;
    }

    // Calculer nouveau montantTTC si montantHT ou tva changé
    const newMontantHT = updates.montantHT || existingDocument.montantHT;
    const newTva = updates.tva !== undefined ? updates.tva : existingDocument.tva;
    const newMontantTTC = newMontantHT * (1 + newTva / 100);

    // TODO: Mettre à jour en DB
    // await prisma.validationDocument.update({
    //   where: { id },
    //   data: updates
    // });

    // TODO: Mettre à jour les lignes si modifiées
    // if (body.lignes) {
    //   await prisma.validationLigne.deleteMany({ where: { documentId: id } });
    //   await prisma.validationLigne.createMany({ data: body.lignes });
    // }

    // TODO: Gérer les attachments
    // if (body.addAttachments) {
    //   await prisma.attachment.createMany({ data: body.addAttachments });
    // }
    // if (body.removeAttachments) {
    //   await prisma.attachment.deleteMany({
    //     where: { id: { in: body.removeAttachments } }
    //   });
    // }

    // TODO: Créer entrée dans timeline
    // await prisma.timeline.create({
    //   data: {
    //     documentId: id,
    //     type: 'modified',
    //     actorId: currentUser.id,
    //     details: JSON.stringify(updates),
    //   }
    // });

    // TODO: Re-vérifier les contrôles automatiques
    // TODO: Notifier les validateurs si changements significatifs

    // Mock response
    const updatedDocument = {
      ...existingDocument,
      ...updates,
      montantTTC: newMontantTTC,
      updatedAt: new Date().toISOString(),
    };

    console.log(`[validation-bc/documents/${id}/update] Document updated:`, {
      id,
      changes: Object.keys(updates),
      newMontantTTC,
    });

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      document: updatedDocument,
      changes: Object.keys(updates),
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[validation-bc/documents/${id}/update] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to update document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

