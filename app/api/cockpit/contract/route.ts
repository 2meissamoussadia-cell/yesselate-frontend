/**
 * API Contrat Auto — V5 Ultimate (stub)
 * POST /api/cockpit/contract
 * Génération de contrat par IA (stub). En prod : GPT + template + signature.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface ContractPayload {
  chantierId?: string;
  type?: string;
  partieA?: string;
  partieB?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as ContractPayload;
    const { chantierId, type = 'chantier', partieA, partieB } = body;

    // Stub : log et retourne succès (à remplacer par génération IA + template)
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('[api/cockpit/contract]', { chantierId, type, partieA, partieB });
    }

    const contractId = `CT-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return NextResponse.json({
      success: true,
      contractId,
      pdfUrl: `/api/cockpit/contract/download?id=${contractId}`,
      message: 'Contrat généré (stub). Brancher GPT + template en production.',
    });
  } catch (err) {
    console.error('[api/cockpit/contract]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
