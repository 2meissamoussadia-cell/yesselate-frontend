/**
 * Types spécifiques pour les risques de gouvernance
 */

import type { Risque, RisqueSeverite } from './gouvernance.types';

export interface RisqueMetrics {
  score: number; // 0-100
  criticite: RisqueSeverite;
  is_critical: boolean;
  is_high: boolean;
  exposition: number; // Impact financier potentiel
}

export interface RisqueAlert {
  type: 'critical' | 'high' | 'medium';
  message: string;
  action_required: boolean;
}

export function calculateRisqueScore(risque: Risque): number {
  // Score = (probabilité * impact) / 100
  return Math.round((risque.probabilite * risque.impact) / 100);
}

export function calculateRisqueCriticite(risque: Risque): RisqueSeverite {
  const score = calculateRisqueScore(risque);
  
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export function isRisqueCritical(risque: Risque): boolean {
  return calculateRisqueCriticite(risque) === 'critical';
}

export function isRisqueHigh(risque: Risque): boolean {
  const criticite = calculateRisqueCriticite(risque);
  return criticite === 'critical' || criticite === 'high';
}

export function calculateRisqueMetrics(risque: Risque): RisqueMetrics {
  const score = calculateRisqueScore(risque);
  const criticite = calculateRisqueCriticite(risque);
  
  // Exposition financière (estimation basée sur l'impact)
  // À adapter selon la logique métier réelle
  const exposition = risque.impact * 1000; // Exemple: 1 point d'impact = 1000€
  
  return {
    score,
    criticite,
    is_critical: isRisqueCritical(risque),
    is_high: isRisqueHigh(risque),
    exposition,
  };
}

export function getRisqueAlerts(risque: Risque): RisqueAlert[] {
  const alerts: RisqueAlert[] = [];
  const metrics = calculateRisqueMetrics(risque);
  
  if (metrics.is_critical) {
    alerts.push({
      type: 'critical',
      message: `Risque critique: score ${metrics.score}/100`,
      action_required: true,
    });
  } else if (metrics.is_high) {
    alerts.push({
      type: 'high',
      message: `Risque élevé: score ${metrics.score}/100`,
      action_required: true,
    });
  } else if (metrics.criticite === 'medium') {
    alerts.push({
      type: 'medium',
      message: `Risque modéré: score ${metrics.score}/100`,
      action_required: false,
    });
  }
  
  return alerts;
}
