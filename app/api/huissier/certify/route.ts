/**
 * API Huissier UCIE — V5 Ultimate (stub)
 * POST /api/huissier/certify
 * Génère un PDF de certification et envoie au partenaire UCIE (stub).
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface HuissierCertifyPayload {
  dossierId?: string;
  chantierId?: string;
  type?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as HuissierCertifyPayload;
    const { dossierId, chantierId, type = 'certification' } = body;

    // Stub : log et retourne succès (à remplacer par génération PDF + envoi API UCIE)
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('[api/huissier/certify]', { dossierId, chantierId, type });
    }

    const token = `ucie-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    return NextResponse.json({
      success: true,
      pdfUrl: `/api/huissier/certify/download?token=${token}`,
      token,
      message: 'Certification Huissier UCIE générée (stub). Brancher UCIE_API en production.',
    });
  } catch (err) {
    console.error('[api/huissier/certify]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
