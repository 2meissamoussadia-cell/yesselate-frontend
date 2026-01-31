/**
 * GET /api/dashboard/cash-flow-previsions
 * Prévisionnel trésorerie 90j — Phase 2 audit ERP BTP 2026.
 * Query: ?days=90 (optionnel, défaut 90).
 * À terme : calculer à partir de factures clients/fournisseurs, salaires, chantiers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTresoreriePrevisionnelleMock } from '@/modules/dashboard/data/tresoreriePrevisionnelleMock';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? Math.min(180, Math.max(7, parseInt(daysParam, 10) || 90)) : 90;

    // Pour l'instant : mock (même logique que le front). Plus tard : lecture BDD / calcul.
    const previsions = getTresoreriePrevisionnelleMock();

    // Limiter au nombre de jours demandé (le mock génère par pas de 7 j)
    const filtered = previsions.filter((_, i) => i * 7 <= days);

    return NextResponse.json({
      previsions: filtered,
      days,
      seuilMinimal: 5_000_000,
    });
  } catch (error) {
    console.error('[cash-flow-previsions]', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du prévisionnel trésorerie' },
      { status: 500 }
    );
  }
}
