/**
 * Service d'évaluation des risques pour les demandes
 * Stub minimal pour compilation - à compléter avec la logique métier.
 */

import type { Demande, Risk, RiskEvaluationResult } from '../types/demande.types';

export const RiskService = {
  calculateGlobalRiskScore(risks: Risk[]): number {
    if (risks.length === 0) return 0;
    return Math.max(...risks.map((r) => r.score));
  },

  getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  },

  evaluateRisks(_demande: Demande): Risk[] {
    return [];
  },

  evaluateRisksComplete(demande: Demande): RiskEvaluationResult {
    const risks = this.evaluateRisks(demande);
    const globalScore = this.calculateGlobalRiskScore(risks);
    const highestRisk = risks.length > 0 ? risks.reduce((a, b) => (a.score >= b.score ? a : b)) : null;
    return {
      risks,
      globalScore,
      highestRisk,
      riskLevel: this.getRiskLevel(globalScore),
    };
  },
};
