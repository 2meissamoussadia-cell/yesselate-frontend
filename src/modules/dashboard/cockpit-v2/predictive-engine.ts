/**
 * Moteur prédictif Cockpit DG V2 — Règles heuristiques (sans ML/LLM)
 * Prêt à brancher TensorFlow.js / LangChain plus tard (loadModel, analyzeLLM)
 * Détection anomalies 3–7 jours avant (retards, ruptures, opportunités)
 */

import type {
  PredictiveInsight,
  AutoPilotAction,
  ChantierForPrediction,
} from '@/modules/dashboard/types/cockpitV2';
import type { ChantierMock } from '../data/chantiersMock';

/** Chantier unifié (mock ou enrichi) pour prédictions */
export type ChantierInput = ChantierMock | (ChantierMock & Partial<ChantierForPrediction>);

function toChantierForPrediction(c: ChantierInput): ChantierForPrediction {
  const progress = 'progress_percentage' in c && typeof c.progress_percentage === 'number'
    ? c.progress_percentage
    : (c.sante ?? 0.7) * 100;
  const elapsed = 'elapsed_days' in c && typeof c.elapsed_days === 'number' ? c.elapsed_days : 60;
  const planned = 'planned_days' in c && typeof c.planned_days === 'number' ? c.planned_days : 90;
  const dailyCost = 'daily_cost' in c && typeof c.daily_cost === 'number'
    ? c.daily_cost
    : (c.ca ?? 1_000_000) / Math.max(planned, 1);
  return {
    id: c.id,
    sante: c.sante,
    ca: c.ca,
    progress_percentage: progress,
    elapsed_days: elapsed,
    planned_days: planned,
    daily_cost: dailyCost,
    workers_count: 'workers_count' in c ? c.workers_count : 8,
    stock_cement: 'stock_cement' in c ? c.stock_cement : 50,
    cement_weekly_usage: 'cement_weekly_usage' in c ? c.cement_weekly_usage : 20,
    stockPeinture: c.stockPeinture,
    photosManquantes: c.photosManquantes,
    bureauControle: c.bureauControle,
  };
}

/** Génère un insight de type risque retard */
function riskRetard(
  chantier: ChantierForPrediction,
  days: number,
  confidence: number,
  etaDays: number
): PredictiveInsight {
  const impact = (chantier.daily_cost ?? 50_000) * days;
  return {
    id: `risk-${chantier.id}-${Date.now()}`,
    type: 'risk',
    severity: days > 7 ? 'critical' : 'high',
    chantier_id: chantier.id,
    prediction: `Retard probable de ${days}j dans ${etaDays}j`,
    confidence,
    impact_financial: impact,
    recommended_action: {
      id: `boost-${chantier.id}`,
      type: 'resource_reallocation',
      auto_executable: false,
      params: {
        extra_workers: 3,
        overtime_hours: 20,
        cost: impact * 0.3,
      },
      estimated_gain: impact * 0.7,
    },
    deadline: new Date(Date.now() + etaDays * 86400000),
  };
}

/** Génère un insight opportunité (rupture stock) */
function opportunityRupture(
  chantier: ChantierForPrediction,
  message: string,
  impactFcfa: number,
  autoExec: boolean
): PredictiveInsight {
  return {
    id: `opp-${chantier.id}-${Date.now()}`,
    type: 'opportunity',
    severity: 'high',
    chantier_id: chantier.id,
    prediction: message,
    confidence: 90,
    impact_financial: impactFcfa,
    recommended_action: {
      id: `order-${chantier.id}`,
      type: 'payment_acceleration',
      auto_executable: autoExec,
      params: {
        supplier: 'SOCOCIM',
        quantity: Math.ceil((chantier.cement_weekly_usage ?? 20) * 2),
        amount: impactFcfa,
      },
      estimated_gain: 0,
    },
    deadline: new Date(Date.now() + 2 * 86400000),
  };
}

/**
 * Prédire risques/opportunités sur les 7 prochains jours (heuristique)
 * Pas de TensorFlow/LangChain : règles BTP Sénégal (avancement, stock, BC)
 */
export function predictNextWeek(chantiers: ChantierInput[]): PredictiveInsight[] {
  const insights: PredictiveInsight[] = [];

  for (const c of chantiers) {
    const chantier = toChantierForPrediction(c);

    // Heuristique retard : avancement en retard sur le temps écoulé
    const progress = chantier.progress_percentage ?? 70;
    const elapsed = chantier.elapsed_days ?? 60;
    const planned = chantier.planned_days ?? 90;
    const expectedProgress = (elapsed / planned) * 100;
    if (progress < expectedProgress - 10) {
      const delayDays = Math.ceil((expectedProgress - progress) / 5);
      const confidence = Math.min(85, 50 + (expectedProgress - progress));
      insights.push(
        riskRetard(chantier, Math.min(delayDays, 14), confidence, 3)
      );
    }

    // Heuristique rupture ciment (stock bas)
    const stockCiment = chantier.stock_cement ?? 50;
    const weeklyUsage = chantier.cement_weekly_usage ?? 20;
    if (weeklyUsage > 0 && stockCiment < weeklyUsage * 0.5) {
      const impact = weeklyUsage * 5000;
      insights.push(
        opportunityRupture(
          chantier,
          'Rupture ciment probable dans 2–3j',
          impact,
          true
        )
      );
    }

    // Heuristique peinture (données mock existantes)
    const stockPeinture = chantier.stockPeinture ?? 1;
    if (stockPeinture < 0.1) {
      insights.push({
        id: `risk-paint-${chantier.id}-${Date.now()}`,
        type: 'risk',
        severity: 'critical',
        chantier_id: chantier.id,
        prediction: 'Stock peinture critique',
        confidence: 95,
        impact_financial: 300_000,
        recommended_action: {
          id: `order-paint-${chantier.id}`,
          type: 'payment_acceleration',
          auto_executable: true,
          params: { supplier: 'Peintures du Sénégal', amount: 150_000 },
          estimated_gain: 0,
        },
        deadline: new Date(Date.now() + 1 * 86400000),
      });
    }

    // Bureau contrôle incomplet
    const bc = chantier.bureauControle ?? '';
    const match = bc.match(/(\d+)\/(\d+)/);
    if (match) {
      const done = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      if (total > 0 && done < total && progress > 50) {
        insights.push({
          id: `bottleneck-bc-${chantier.id}-${Date.now()}`,
          type: 'bottleneck',
          severity: 'medium',
          chantier_id: chantier.id,
          prediction: `Bureau de contrôle ${done}/${total} — risque blocage livraison`,
          confidence: 70,
          impact_financial: 100_000,
          recommended_action: {
            id: `relance-bc-${chantier.id}`,
            type: 'emergency_call',
            auto_executable: false,
            params: {},
            estimated_gain: 50_000,
          },
          deadline: new Date(Date.now() + 7 * 86400000),
        });
      }
    }
  }

  return insights.sort((a, b) => b.impact_financial - a.impact_financial);
}

/** Singleton pour usage dans composants (chargement modèle ML futur) */
export const predictiveEngine = {
  loadModel: async (): Promise<void> => {
    // Stub: plus tard tf.loadLayersModel('/models/btp-predictor/model.json')
  },
  predictNextWeek,
};
