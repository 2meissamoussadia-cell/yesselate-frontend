/**
 * GET /api/bmo/blocked/[id]/download
 * Téléchargement d'un export ou d'une pièce jointe du dossier
 * Query: ?type=export|attachment&attachmentId=xxx
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dossierId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'export';
    const attachmentId = searchParams.get('attachmentId');

    const dossier = await prisma.blockedDossier.findUnique({
      where: { id: dossierId },
    });
    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    if (type === 'export') {
      // TODO: generate PDF/Excel and stream
      return NextResponse.json(
        { error: 'Export not implemented', message: 'Use POST /api/bmo/blocked/export for bulk export' },
        { status: 501 }
      );
    }

    if (type === 'attachment' && attachmentId) {
      // TODO: resolve attachment from storage and stream file
      return NextResponse.json(
        { error: 'Attachment download not implemented', attachmentId },
        { status: 501 }
      );
    }

    return NextResponse.json({ error: 'Invalid type or missing attachmentId' }, { status: 400 });
  } catch (error) {
    console.error('[blocked/[id]/download] error:', error);
    return NextResponse.json(
      { error: 'Download failed', details: String(error) },
      { status: 500 }
    );
  }
}
