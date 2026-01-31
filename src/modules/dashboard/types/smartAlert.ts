/**
 * Types pour les alertes intelligentes — Phase 2 audit ERP BTP 2026.
 * Inspiré Graneet + Procore : prédictif, impact €, actions suggérées.
 */

export type SmartAlertType = 'budget' | 'delai' | 'tresorerie' | 'qualite' | 'securite';
export type SmartAlertSeverity = 'info' | 'warning' | 'critical';
export type PredictionTrend = 'deterioration' | 'stable' | 'amelioration';

export interface SmartAlertPrediction {
  trend: PredictionTrend;
  /** Impact estimé (€ / XOF) */
  impact_eur: number;
  proba: number; // 0-100%
}

export interface SmartAlertAction {
  label: string;
  impact?: number; // impact € estimé (ex. -150000)
}

export interface SmartAlert {
  id: string;
  type: SmartAlertType;
  severity: SmartAlertSeverity;
  chantier: string;
  message: string;
  prediction?: SmartAlertPrediction;
  actions_suggerees: SmartAlertAction[];
  created_at: string; // ISO
}
