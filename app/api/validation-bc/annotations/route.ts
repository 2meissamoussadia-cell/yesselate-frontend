import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  createSuccessResponse,
  validateRequired,
  badRequest,
  HttpStatus,
} from '@/lib/api/error-handler';
import type { DocumentAnnotation } from '@/lib/types/document-validation.types';
import type { CreateAnnotationDto } from '@/lib/services/validation-bc-anomalies.service';

/**
 * POST /api/validation-bc/annotations
 * Crée une nouvelle annotation
 */
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    let body: CreateAnnotationDto;
    try {
      body = await req.json();
    } catch {
      throw badRequest('Corps JSON invalide');
    }

    validateRequired(
      body as unknown as Record<string, unknown>,
      ['documentId', 'documentType', 'createdBy']
    );

    // TODO: Remplacer par une vraie création en base de données
    const newAnnotation: DocumentAnnotation = {
      id: `ANN-${Date.now()}`,
      documentId: body.documentId,
      documentType: body.documentType,
      field: body.field,
      comment: body.comment,
      anomalyId: body.anomalyId,
      createdBy: body.createdBy,
      createdAt: new Date().toISOString(),
      type: body.type || 'comment',
    };

    return createSuccessResponse(newAnnotation, HttpStatus.CREATED);
  });
}

