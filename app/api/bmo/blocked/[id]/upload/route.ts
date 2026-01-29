/**
 * POST /api/bmo/blocked/[id]/upload
 * Upload d'un fichier (pièce jointe) pour un dossier bloqué
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dossierId } = await params;

    const dossier = await prisma.blockedDossier.findUnique({
      where: { id: dossierId },
    });
    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Field "file" is required' },
        { status: 400 }
      );
    }

    // TODO: persist file to storage (S3, local disk, etc.) and save reference in DB
    // For now return a mock attachment record
    const attachmentId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const attachment = {
      id: attachmentId,
      dossierId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: `/api/bmo/blocked/${dossierId}/download/${attachmentId}`,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'File uploaded',
      attachment,
    }, { status: 201 });
  } catch (error) {
    console.error('[blocked/[id]/upload] error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    );
  }
}
