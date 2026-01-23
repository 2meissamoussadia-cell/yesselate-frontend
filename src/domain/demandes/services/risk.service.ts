/**
 * Service d'évaluation des risques pour les demandes
 * Extrait de la logique métier des composants
 */

import type { Demande, Risk, RiskEvaluationResult, RiskType } from '../types/demande.types';
import { BudgetService } from './budget.service';

export class RiskService {
  /**
   * Calcule le score de risque global à partir d'une liste de risques
   */
  static calculateGlobalRiskScore(risks: Risk[]): number {
    if (!risks || risks.length === 0) {
      return 0;
    }
    
    // Prendre le score le plus élevé
    return Math.max(...risks.map(r => r.score));
  }

  /**
   * Détermine le niveau de risque global
   */
  static getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Évalue les risques d'une demande
   */
  static evaluateRisks(demande: Demande): Risk[] {
    const risks: Risk[] = [];
    const now = new Date();
    
    // Risque budget
    if (demande.budget) {
      const budgetMetrics = BudgetService.calculateBudgetMetrics(demande, demande.budget);
      
      if (budgetMetrics.critical) {
        risks.push({
          id: `risk-budget-critical-${demande.id}`,
          type: 'budget',
          score: 90,
          description: 'Budget critique : plus de 90% utilisé',
          mitigation: 'Réviser le budget ou reporter la demande',
          detectedAt: now
        });
      } else if (budgetMetrics.warning) {
        risks.push({
          id: `risk-budget-warning-${demande.id}`,
          type: 'budget',
          score: 60,
          description: 'Budget en alerte : plus de 80% utilisé',
          mitigation: 'Surveiller le budget restant',
          detectedAt: now
        });
      } else if (budgetMetrics.exceeded) {
        risks.push({
          id: `risk-budget-exceeded-${demande.id}`,
          type: 'budget',
          score: 100,
          description: 'Budget dépassé',
          mitigation: 'Réviser le budget ou réduire le montant de la demande',
          detectedAt: now
        });
      }
    }

    // Risque délai
    if (demande.deadline) {
      const deadline = new Date(demande.deadline);
      const daysUntilDeadline = this.calculateDaysUntil(deadline);
      
      if (daysUntilDeadline < 0) {
        risks.push({
          id: `risk-delay-overdue-${demande.id}`,
          type: 'delay',
          score: 95,
          description: `Délai dépassé de ${Math.abs(daysUntilDeadline)} jour(s)`,
          mitigation: 'Négocier un nouveau délai ou accélérer le processus',
          detectedAt: now
        });
      } else if (daysUntilDeadline < 3) {
        risks.push({
          id: `risk-delay-critical-${demande.id}`,
          type: 'delay',
          score: 85,
          description: `Délai très court : ${daysUntilDeadline} jour(s) restant(s)`,
          mitigation: 'Accélérer le processus ou négocier un délai',
          detectedAt: now
        });
      } else if (daysUntilDeadline < 7) {
        risks.push({
          id: `risk-delay-warning-${demande.id}`,
          type: 'delay',
          score: 50,
          description: `Délai serré : ${daysUntilDeadline} jour(s) restant(s)`,
          mitigation: 'Surveiller le respect du délai',
          detectedAt: now
        });
      }
    }

    // Risque montant élevé
    const amount = demande.amount || demande.montant || 0;
    if (amount > 5000000) { // > 5M FCFA
      risks.push({
        id: `risk-amount-high-${demande.id}`,
        type: 'compliance',
        score: 70,
        description: `Montant élevé : ${amount.toLocaleString()} FCFA`,
        mitigation: 'Vérifier les autorisations et procédures spéciales',
        detectedAt: now
      });
    }

    // Risque demande en retard
    if (demande.isOverdue) {
      risks.push({
        id: `risk-overdue-${demande.id}`,
        type: 'delay',
        score: 80,
        description: `Demande en retard de ${demande.delayDays || 0} jour(s)`,
        mitigation: 'Traiter en priorité ou réévaluer la demande',
        detectedAt: now
      });
    }

    return risks;
  }

  /**
   * Évalue tous les risques et retourne un résultat complet
   */
  static evaluateRisksComplete(demande: Demande): RiskEvaluationResult {
    const risks = this.evaluateRisks(demande);
    const globalScore = this.calculateGlobalRiskScore(risks);
    const highestRisk = risks.length > 0 
      ? risks.reduce((max, risk) => risk.score > max.score ? risk : max, risks[0])
      : null;
    const riskLevel = this.getRiskLevel(globalScore);

    return {
      risks,
      globalScore,
      highestRisk,
      riskLevel
    };
  }

  /**
   * Calcule le nombre de jours jusqu'à une date
   */
  private static calculateDaysUntil(targetDate: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Filtre les risques par type
   */
  static filterRisksByType(risks: Risk[], type: RiskType): Risk[] {
    return risks.filter(r => r.type === type);
  }

  /**
   * Filtre les risques critiques (score >= 80)
   */
  static getCriticalRisks(risks: Risk[]): Risk[] {
    return risks.filter(r => r.score >= 80);
  }
}

