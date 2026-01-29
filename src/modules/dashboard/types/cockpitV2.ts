/**
 * Types Cockpit DG V2 — IA prédictive, auto-pilot, 4D, collaboration
 * Alignés sur le cahier des charges V2 révolutionnaire 2027
 */

export type PredictiveInsightType = 'risk' | 'opportunity' | 'bottleneck' | 'optimization';
export type PredictiveSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AutoPilotActionType =
  | 'emergency_call'
  | 'resource_reallocation'
  | 'payment_acceleration'
  | 'supplier_change';

export interface AutoPilotAction {
  id: string;
  type: AutoPilotActionType;
  /** True si peut s'exécuter sans confirmation DG (garde-fou budget) */
  auto_executable: boolean;
  params: Record<string, unknown>;
  /** FCFA économisés ou gagnés */
  estimated_gain: number;
}

export interface PredictiveInsight {
  id: string;
  type: PredictiveInsightType;
  severity: PredictiveSeverity;
  chantier_id: string;
  prediction: string;
  /** 0-100 */
  confidence: number;
  /** FCFA */
  impact_financial: number;
  recommended_action: AutoPilotAction;
  deadline: Date;
}

export type AutoPilotDecisionStatus =
  | 'pending_dg'
  | 'auto_executed'
  | 'rejected'
  | 'completed';

export interface AutoPilotDecision {
  id: string;
  insight: PredictiveInsight;
  action: AutoPilotAction;
  status: AutoPilotDecisionStatus;
  executed_at?: Date;
  result?: {
    success: boolean;
    actual_gain: number;
    feedback: string;
  };
}

/** Chantier enrichi pour le moteur prédictif (champs optionnels si mock) */
export interface ChantierForPrediction {
  id: string;
  /** Avancement 0-100 */
  progress_percentage?: number;
  elapsed_days?: number;
  planned_days?: number;
  workers_count?: number;
  /** Coût journalier estimé FCFA */
  daily_cost?: number;
  /** Stock ciment (sacs) */
  stock_cement?: number;
  cement_weekly_usage?: number;
  stock_iron?: number;
  /** Absences dernière semaine */
  absences_last_week?: number;
  budget?: number;
  spent?: number;
  /** Données mock existantes */
  sante: number;
  ca: number;
  stockPeinture?: number;
  photosManquantes?: number;
  bureauControle?: string;
  [key: string]: unknown;
}
