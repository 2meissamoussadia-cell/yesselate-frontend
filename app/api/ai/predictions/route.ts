/**
 * API Prédictions ML — V5 Ultimate
 * GET /api/ai/predictions
 * Retourne prédictions retard, budget, qualité, satisfaction client (dérivées chantiers).
 * Cache 5 min, refresh client 5 min.
 */

import { NextRequest, NextResponse } from 'next/server';
import { chantiers } from '@/modules/dashboard/data/chantiersMock';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface CockpitPredictions {
  retardRisk: number; // 0–100 % probabilité retard
  budgetRisk: number; // 0–100 % dépassement budget
  qualityScore: number; // 0–100 score qualité
  satisfactionClient: number; // 0–100 satisfaction client prédite
  updatedAt: string;
  source: 'mock' | 'ml';
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
let cache: { data: CockpitPredictions; at: number } | null = null;

/** Dérive des chantiers (santé, marge, BC) — à remplacer par XGBoost/TF.js */
function computePredictions(): CockpitPredictions {
  const n = chantiers.length;
  if (n === 0) {
    return {
      retardRisk: 25,
      budgetRisk: 15,
      qualityScore: 78,
      satisfactionClient: 72,
      updatedAt: new Date().toISOString(),
      source: 'mock',
    };
  }
  const avgSante = chantiers.reduce((a, c) => a + c.sante, 0) / n;
  const avgMarge = chantiers.reduce((a, c) => a + c.marge, 0) / n;
  const lowSanteCount = chantiers.filter((c) => c.sante < 0.65).length;
  const lowMargeCount = chantiers.filter((c) => c.marge < 0.18).length;
  const bcOk = chantiers.filter((c) => c.bureauControle === '3/3').length / Math.max(n, 1);

  const retardRisk = Math.round((lowSanteCount / n) * 50 + (1 - avgSante) * 40);
  const budgetRisk = Math.round((lowMargeCount / n) * 45 + (1 - avgMarge) * 35);
  const qualityScore = Math.round(avgSante * 55 + avgMarge * 25);
  const satisfactionClient = Math.round(avgSante * 40 + bcOk * 35 + avgMarge * 15);

  return {
    retardRisk: Math.max(0, Math.min(100, retardRisk)),
    budgetRisk: Math.max(0, Math.min(100, budgetRisk)),
    qualityScore: Math.max(0, Math.min(100, qualityScore)),
    satisfactionClient: Math.max(0, Math.min(100, satisfactionClient)),
    updatedAt: new Date().toISOString(),
    source: 'mock',
  };
}

export async function GET(_req: NextRequest) {
  try {
    const now = Date.now();
    if (cache && now - cache.at < CACHE_TTL_MS) {
      return NextResponse.json(cache.data, {
        headers: { 'Cache-Control': 'private, max-age=300' },
      });
    }
    const predictions = computePredictions();
    cache = { data: predictions, at: now };
    return NextResponse.json(predictions, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (err) {
    console.error('[api/ai/predictions]', err);
    return NextResponse.json(
      {
        error: 'Erreur lors du calcul des prédictions',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}
