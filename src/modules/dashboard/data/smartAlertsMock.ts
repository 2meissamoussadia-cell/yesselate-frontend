/**
 * Données mock alertes intelligentes — Phase 2 audit ERP BTP 2026.
 * À remplacer par API / alertes prédictives.
 */

import type { SmartAlert } from '../types/smartAlert';

export const smartAlertsMock: SmartAlert[] = [
  {
    id: '1',
    type: 'budget',
    severity: 'critical',
    chantier: '#042',
    message: 'Dépassement prévu de 12 % dans 15 jours',
    prediction: {
      trend: 'deterioration',
      impact_eur: 288_000,
      proba: 87,
    },
    actions_suggerees: [
      { label: 'Renégocier lot peinture', impact: -150_000 },
      { label: 'Replanifier phase 3', impact: -80_000 },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'tresorerie',
    severity: 'warning',
    chantier: 'Portefeuille',
    message: 'Tension trésorerie possible J+21 (gros décaissement)',
    prediction: {
      trend: 'deterioration',
      impact_eur: -2_000_000,
      proba: 72,
    },
    actions_suggerees: [
      { label: 'Relancer créances > 30 j', impact: 800_000 },
      { label: 'Décaler paiement fournisseur', impact: 500_000 },
    ],
    created_at: new Date().toISOString(),
  },
];
