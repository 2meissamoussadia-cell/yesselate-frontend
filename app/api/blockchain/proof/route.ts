/**
 * Phase 4 — Blockchain traçabilité : preuve d'existence (mock)
 * GET /api/blockchain/proof?documentId=xxx — Retourne une preuve mock (hash, block)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const documentId = request.nextUrl.searchParams.get('documentId') || 'doc-default';
    // Mock : en production on interrogerait un ledger ou un service de preuve
    const proof = {
      documentId,
      hash: `0x${Buffer.from(documentId + Date.now().toString()).toString('hex').slice(0, 64)}`,
      blockNumber: 12_450_000 + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      network: 'mock-chain',
      verified: true,
    };
    return NextResponse.json(proof);
  } catch (error) {
    console.error('GET /api/blockchain/proof:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la preuve' },
      { status: 500 }
    );
  }
}
