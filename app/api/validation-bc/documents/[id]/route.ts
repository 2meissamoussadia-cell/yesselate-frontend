// API Route: DELETE /api/validation-bc/documents/[id]
// Supprime un document (soft delete avec motif)

import { NextRequest, NextResponse } from 'next/server';

export interface DeleteDocumentBody {
  reason: 'duplicate' | 'error' | 'cancelled' | 'obsolete' | 'autre';
  comment: string;
  hardDelete?: boolean; // Réservé aux admins uniquement
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Parse body (DELETE peut avoir un body)
    let body: DeleteDocumentBody | null = null;
    try {
      body = await request.json();
    } catch {
      // Body optionnel pour DELETE
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Validation du body si fourni
    if (body) {
      if (!body.reason || !body.comment) {
        return NextResponse.json(
          { error: 'Reason and comment are required for deletion' },
          { status: 400 }
        );
      }

      if (body.comment.length < 10) {
        return NextResponse.json(
          { error: 'Comment must be at least 10 characters' },
          { status: 400 }
        );
      }
    }

    // TODO: Récupérer le document
    // const document = await prisma.validationDocument.findUnique({
    //   where: { id },
    //   include: { timeline: true, comments: true, attachments: true }
    // });

    // Mock document
    const existingDocument = {
      id,
      type: 'bc',
      status: 'pending',
      bureau: 'DRE',
      createdAt: '2024-01-15T00:00:00.000Z',
      validatedAt: null,
      demandeurId: 'user-123',
    };

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // TODO: Vérifier permissions
    // - Demandeur peut supprimer si status = pending et pas encore validé
    // - Admin peut supprimer n'importe quand
    // const currentUser = await getCurrentUser(request);
    // if (currentUser.id !== document.demandeurId && !currentUser.isAdmin) {
    //   return 403 Forbidden
    // }

    // Vérifier si le document peut être supprimé
    if (existingDocument.status === 'validated') {
      return NextResponse.json(
        { error: 'Cannot delete validated document. Contact administrator.' },
        { status: 400 }
      );
    }

    // Hard delete (suppression définitive) - ADMIN ONLY
    if (body?.hardDelete) {
      // TODO: Vérifier que l'utilisateur est admin
      // if (!currentUser.isAdmin) {
      //   return 403 Forbidden
      // }

      // TODO: Supprimer définitivement
      // await prisma.validationDocument.delete({ where: { id } });
      // await prisma.validationLigne.deleteMany({ where: { documentId: id } });
      // await prisma.attachment.deleteMany({ where: { documentId: id } });
      // await prisma.comment.deleteMany({ where: { documentId: id } });
      // await prisma.timeline.deleteMany({ where: { documentId: id } });

      console.log(`[validation-bc/documents/${id}] HARD DELETE by admin`);

      return NextResponse.json({
        success: true,
        message: 'Document permanently deleted',
        deletionType: 'hard',
      });
    }

    // Soft delete (par défaut) - conservation des données
    const deleteReason = body?.reason || 'cancelled';
    const deleteComment = body?.comment || 'Suppression sans commentaire';
    const deletedAt = new Date().toISOString();

    // TODO: Soft delete en DB
    // await prisma.validationDocument.update({
    //   where: { id },
    //   data: {
    //     status: 'deleted',
    //     deletedAt,
    //     deleteReason,
    //     deleteComment,
    //   }
    // });

    // TODO: Créer entrée timeline
    // await prisma.timeline.create({
    //   data: {
    //     documentId: id,
    //     type: 'deleted',
    //     actorId: currentUser.id,
    //     details: JSON.stringify({ reason: deleteReason, comment: deleteComment }),
    //   }
    // });

    // TODO: Notifier les validateurs en attente
    // TODO: Annuler les rappels/notifications planifiés

    // Mock response
    const deletedDocument = {
      id,
      status: 'deleted',
      deletedAt,
      deleteReason,
      deleteComment,
      deletedBy: {
        id: 'user-123',
        name: 'Current User',
      },
    };

    console.log(`[validation-bc/documents/${id}] Soft delete:`, {
      id,
      reason: deleteReason,
      comment: deleteComment.substring(0, 50),
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully (soft delete)',
      deletionType: 'soft',
      document: deletedDocument,
      note: 'Document is archived and can be restored by administrator',
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[validation-bc/documents/${id}] Delete error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET pour récupérer les documents supprimés (ADMIN)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    if (!includeDeleted) {
      return NextResponse.json(
        { error: 'Use includeDeleted=true query param to access deleted documents' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permission admin
    // TODO: Récupérer document supprimé
    // const document = await prisma.validationDocument.findUnique({
    //   where: { id },
    //   include: { timeline: true }
    // });

    const deletedDocument = {
      id,
      status: 'deleted',
      deletedAt: '2024-01-18T10:00:00.000Z',
      deleteReason: 'error',
      deleteComment: 'Erreur de saisie',
      canRestore: true,
    };

    return NextResponse.json(deletedDocument);
  } catch (error) {
    const { id } = await params;
    console.error(`[validation-bc/documents/${id}] Get deleted error:`, error);
    return NextResponse.json(
      { error: 'Failed to retrieve deleted document' },
      { status: 500 }
    );
  }
}

// PUT pour restaurer un document supprimé (ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.restore) {
      return NextResponse.json(
        { error: 'Use { "restore": true } to restore deleted document' },
        { status: 400 }
      );
    }

    // TODO: Vérifier permission admin
    // TODO: Récupérer document supprimé
    // TODO: Restaurer
    // await prisma.validationDocument.update({
    //   where: { id },
    //   data: {
    //     status: 'pending',
    //     deletedAt: null,
    //     deleteReason: null,
    //     deleteComment: null,
    //   }
    // });

    console.log(`[validation-bc/documents/${id}] Document restored by admin`);

    return NextResponse.json({
      success: true,
      message: 'Document restored successfully',
      document: {
        id,
        status: 'pending',
        restoredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`[validation-bc/documents/${id}] Restore error:`, error);
    return NextResponse.json(
      { error: 'Failed to restore document' },
      { status: 500 }
    );
  }
}
