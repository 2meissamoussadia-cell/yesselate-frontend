import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  createSuccessResponse,
  validateId,
} from '@/lib/api/error-handler';
import type { DocumentAnnotation } from '@/lib/types/document-validation.types';
import type { UpdateAnnotationDto } from '@/lib/services/validation-bc-anomalies.service';

/**
 * PATCH /api/validation-bc/annotations/[id]
 * Met à jour une annotation existante
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'annotation');

    let body: UpdateAnnotationDto;
    try {
      body = await req.json();
    } catch {
      body = {} as UpdateAnnotationDto;
    }

    // TODO: Remplacer par une vraie mise à jour en base de données
    const updatedAnnotation: DocumentAnnotation = {
      id,
      documentId: 'BC-123',
      documentType: 'bc',
      comment: body.comment,
      createdBy: 'Jean Dupont',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      type: 'comment',
    };

    return createSuccessResponse(updatedAnnotation);
  });
}

/**
 * DELETE /api/validation-bc/annotations/[id]
 * Supprime une annotation
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    validateId(id, 'annotation');

    // TODO: Remplacer par une vraie suppression en base de données
    return createSuccessResponse({ deleted: true, id });
  });
}

