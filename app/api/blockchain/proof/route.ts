/**
 * Phase 4 — Blockchain traçabilité : preuve d'existence (mock)
 * GET /api/blockchain/proof?documentId=xxx — Retourne une preuve mock (hash, block, timestamp)
 */

import { NextRequest, NextResponse } from 'next/server';

export interface BlockchainProof {
  documentId: string;
  hash: string;
  blockNumber: string;
  timestamp: string;
  network: string;
  verified: boolean;
}

function mockProof(documentId: string): BlockchainProof {
  const hash = `0x${Buffer.from(documentId + Date.now().toString(36)).toString('hex').slice(0, 64)}`;
  return {
    documentId,
    hash,
    blockNumber: '1847291',
    timestamp: new Date().toISOString(),
    network: 'Ethereum (testnet)',
    verified: true,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId') || searchParams.get('id') || 'default';

    const proof = mockProof(documentId);
    return NextResponse.json(proof);
  } catch (error) {
    console.error('GET /api/blockchain/proof:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la preuve' },
      { status: 500 }
    );
  }
}
