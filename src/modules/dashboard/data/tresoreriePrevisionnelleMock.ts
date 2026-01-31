/**
 * Données mock Prévisionnel Trésorerie 90j — à remplacer par API /api/cash-flow-previsions.
 * Phase 2 audit ERP BTP 2026.
 */

import type { CashFlowPrevision } from '../types/tresoreriePrevisionnelle';

const SEUIL_MINIMAL = 5_000_000; // 5 M XOF — seuil alerte
const TRESO_INITIALE = 12_000_000; // 12 M XOF

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Génère 90 jours de prévisions mock (un point par semaine ≈ 13 points). Inclut des tensions (solde &lt; seuil) pour démo. */
export function getTresoreriePrevisionnelleMock(): CashFlowPrevision[] {
  const start = new Date();
  const previsions: CashFlowPrevision[] = [];
  let solde = TRESO_INITIALE;

  for (let i = 0; i <= 90; i += 7) {
    const date = addDays(start, i);
    const encaissements = i % 14 === 0 ? 4_000_000 + (i / 7) * 80_000 : 0;
    const decaissements = 1_800_000 + (i % 21 === 0 ? 8_000_000 : 0); // gros décaissement J+21, J+42 pour créer tension
    solde = solde + encaissements - decaissements;

    const optimiste = solde + encaissements * 0.2;
    const pessimiste = solde - encaissements * 0.3;

    previsions.push({
      date: toISO(date),
      encaissementsPrevus: encaissements,
      decaissementsPrevus: decaissements,
      soldePrevu: Math.round(solde),
      scenarios: {
        optimiste: Math.round(optimiste),
        realiste: Math.round(solde),
        pessimiste: Math.round(pessimiste),
      },
    });
  }

  return previsions;
}

export const SEUIL_TRESORERIE_MIN = SEUIL_MINIMAL;

/** Retourne les dates où le solde prévu est sous le seuil minimal. */
export function getTensionsTresorerie(
  previsions: CashFlowPrevision[],
  seuil: number = SEUIL_MINIMAL
): CashFlowPrevision[] {
  return previsions.filter((p) => p.soldePrevu < seuil);
}
