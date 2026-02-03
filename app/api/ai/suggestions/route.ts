/**
 * Phase 3 #10 — Suggestions IA : prédictions, anomalies, recommandations
 * GET /api/ai/suggestions — Données mock (à brancher sur un modèle réel plus tard)
 */

import { NextRequest, NextResponse } from 'next/server';

export type SuggestionType = 'prediction' | 'anomaly' | 'recommendation';

export interface AISuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
  actionLabel?: string;
  actionRoute?: string;
  createdAt: string;
}

function mockSuggestions(): AISuggestion[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'pred-1',
      type: 'prediction',
      title: 'Retard probable sur chantier #042',
      description: 'Modèle prédictif : probabilité 78 % de dépassement de 5+ jours d\'ici J+14 (livraison peinture).',
      severity: 'high',
      context: 'Chantier #042 — NICE RÉNOVATION',
      actionLabel: 'Voir chantier',
      actionRoute: '/maitre-ouvrage/chantiers',
      createdAt: now,
    },
    {
      id: 'anom-1',
      type: 'anomaly',
      title: 'Écart budget lot peinture',
      description: 'Écart détecté : +12 % vs prévision sur les 30 derniers jours (chantiers #042, #038).',
      severity: 'medium',
      context: 'Budget — Lot peinture',
      actionLabel: 'Ouvrir budget',
      actionRoute: '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default',
      createdAt: now,
    },
    {
      id: 'rec-1',
      type: 'recommendation',
      title: 'Regrouper les validations BC',
      description: '5 bons de commande du même fournisseur en attente — validation groupée recommandée.',
      severity: 'low',
      context: 'Validation BC',
      actionLabel: 'Voir validations',
      actionRoute: '/maitre-ouvrage/validation-bc',
      createdAt: now,
    },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const suggestions = mockSuggestions();
    return NextResponse.json({
      suggestions,
      total: suggestions.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/ai/suggestions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des suggestions IA' },
      { status: 500 }
    );
  }
}
