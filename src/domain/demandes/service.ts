/**
 * Service métier pour le domaine Demandes
 * Version consolidée - Extrait de la logique métier des composants
 */

import type { Demande, ValidationResult, ApproverLevel, BudgetInfo, Risk, DemandePriority } from './types';

// ============================================
// Règles de validation
// ============================================

const MIN_TITLE_LENGTH = 10;
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000000; // 100M FCFA
const SEUIL_DOCUMENTS = 1000000; // 1M FCFA
const SEUIL_JUSTIFICATION = 500000; // 500K FCFA

const VALID_BUREAUX = ['BMO', 'BF', 'BJ', 'BCT', 'BOP', 'BCG', 'BJA', 'BRC', 'BPL', 'BEX'];

// ============================================
// Règles d'approbation
// ============================================

const SEUIL_AUTO = 500000; // 500K - Auto-approbation
const SEUIL_MANAGER = 5000000; // 5M - Manager
const SEUIL_DIRECTION = 50000000; // 50M - Direction

// ============================================
// Service Principal
// ============================================

export class DemandesService {
  /**
   * Valide une demande selon toutes les règles métier
   */
  static validate(demande: Demande): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation titre
    const title = demande.subject || demande.title || '';
    if (!title || title.trim().length < MIN_TITLE_LENGTH) {
      errors.push('Le titre est requis et doit faire au moins 10 caractères');
    }

    // Validation montant
    const amount = demande.amount || demande.montant || 0;
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      errors.push('Le montant doit être positif et inférieur à 100M FCFA');
    }

    // Validation bureau
    if (!demande.bureau || !VALID_BUREAUX.includes(demande.bureau.toUpperCase())) {
      errors.push('Le bureau est requis et doit être valide');
    }

    // Validation délai
    if (demande.deadline) {
      const deadline = new Date(demande.deadline);
      if (isNaN(deadline.getTime())) {
        errors.push('La date de délai n\'est pas valide');
      }
    }

    // Warnings budget
    if (demande.budget) {
      const budgetMetrics = this.calculateBudgetMetrics(demande, demande.budget);
      if (budgetMetrics.critical) {
        warnings.push('Budget critique : plus de 90% utilisé');
      } else if (budgetMetrics.warning) {
        warnings.push('Budget en alerte : plus de 80% utilisé');
      }
    }

    // Warnings risques
    const risks = this.evaluateRisks(demande);
    if (risks.length > 0) {
      warnings.push(`${risks.length} risque(s) détecté(s)`);
    }

    // Validation documents requis
    if (amount >= SEUIL_DOCUMENTS && (!demande.documents || demande.documents.length === 0)) {
      errors.push('Des documents sont requis pour les demandes ≥ 1M FCFA');
    }

    // Validation justification requise
    if (amount >= SEUIL_JUSTIFICATION && (!demande.justification || demande.justification.trim().length === 0)) {
      errors.push('Une justification est requise pour les demandes ≥ 500K FCFA');
    }

    // Validation raison d'urgence
    if ((demande.priority === 'urgent' || demande.priority === 'critical') && 
        (!demande.urgencyReason || demande.urgencyReason.trim().length === 0)) {
      errors.push('Une raison d\'urgence est requise pour les demandes urgentes/critiques');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calcule les métriques budgétaires
   */
  static calculateBudgetMetrics(demande: Demande, budget: BudgetInfo) {
    const amount = demande.amount || demande.montant || 0;
    const usage = budget.available > 0 
      ? Math.round(((budget.consumed + amount) / budget.available) * 100)
      : 0;
    const remaining = budget.available - (budget.consumed + amount);

    return {
      usage,
      remaining,
      exceeded: usage > 100,
      warning: usage > 80 && usage <= 90,
      critical: usage > 90
    };
  }

  /**
   * Évalue les risques d'une demande
   */
  static evaluateRisks(demande: Demande): Risk[] {
    const risks: Risk[] = [];
    const amount = demande.amount || demande.montant || 0;

    // Risque budget
    if (demande.budget) {
      const metrics = this.calculateBudgetMetrics(demande, demande.budget);
      if (metrics.critical) {
        risks.push({
          id: 'budget-critical',
          type: 'budget',
          score: 90,
          description: 'Budget critique : plus de 90% utilisé',
          mitigation: 'Réviser le budget ou reporter la demande'
        });
      } else if (metrics.warning) {
        risks.push({
          id: 'budget-warning',
          type: 'budget',
          score: 70,
          description: 'Budget en alerte : plus de 80% utilisé',
          mitigation: 'Surveiller le budget restant'
        });
      }
    }

    // Risque délai
    if (demande.deadline) {
      const deadline = new Date(demande.deadline);
      const now = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        risks.push({
          id: 'delay-overdue',
          type: 'delay',
          score: 95,
          description: `Délai dépassé de ${Math.abs(daysUntil)} jour(s)`,
          mitigation: 'Accélérer le processus ou négocier un nouveau délai'
        });
      } else if (daysUntil < 7) {
        risks.push({
          id: 'delay-critical',
          type: 'delay',
          score: 80,
          description: `Délai très court (${daysUntil} jour(s))`,
          mitigation: 'Accélérer le processus ou négocier un délai'
        });
      }
    }

    // Risque montant élevé
    if (amount >= 10000000) { // 10M FCFA
      risks.push({
        id: 'amount-high',
        type: 'compliance',
        score: 75,
        description: 'Montant très élevé nécessitant validation renforcée',
        mitigation: 'Vérifier conformité et approbations requises'
      });
    }

    return risks;
  }

  /**
   * Calcule la priorité automatique
   */
  static calculateAutoPriority(demande: Demande): Demande['priority'] {
    // Si priorité déjà définie manuellement, la respecter
    if (demande.priority && demande.priority !== 'normal') {
      return demande.priority;
    }

    // Évaluer les risques
    const risks = this.evaluateRisks(demande);
    const maxRiskScore = risks.length > 0 ? Math.max(...risks.map(r => r.score)) : 0;
    
    // Règles de priorité basées sur les risques
    if (maxRiskScore >= 80) {
      return 'critical';
    }
    
    if (maxRiskScore >= 60) {
      return 'urgent';
    }

    // Règles basées sur le montant
    const amount = demande.amount || demande.montant || 0;
    
    if (amount >= 10000000) { // 10M
      return 'critical';
    }
    
    if (amount >= 5000000) { // 5M
      return 'urgent';
    }
    
    if (amount >= 1000000) { // 1M
      return 'high';
    }

    // Par défaut
    return 'normal';
  }

  /**
   * Détermine le niveau d'approbation requis
   */
  static getApproverLevel(demande: Demande): ApproverLevel {
    const amount = demande.amount || demande.montant || 0;

    if (amount < SEUIL_AUTO) {
      return {
        level: 'auto',
        reason: `Montant < ${SEUIL_AUTO.toLocaleString()} FCFA - Auto-approbation`,
        threshold: SEUIL_AUTO
      };
    }

    if (amount < SEUIL_MANAGER) {
      return {
        level: 'manager',
        reason: `Montant entre ${SEUIL_AUTO.toLocaleString()} et ${SEUIL_MANAGER.toLocaleString()} FCFA - Approbation manager requise`,
        threshold: SEUIL_MANAGER
      };
    }

    if (amount < SEUIL_DIRECTION) {
      return {
        level: 'direction',
        reason: `Montant entre ${SEUIL_MANAGER.toLocaleString()} et ${SEUIL_DIRECTION.toLocaleString()} FCFA - Approbation direction requise`,
        threshold: SEUIL_DIRECTION
      };
    }

    return {
      level: 'comex',
      reason: `Montant ≥ ${SEUIL_DIRECTION.toLocaleString()} FCFA - Approbation COMEX requise`,
      threshold: SEUIL_DIRECTION
    };
  }

  /**
   * Vérifie si une demande peut être auto-approuvée
   */
  static canAutoApprove(demande: Demande): boolean {
    const approver = this.getApproverLevel(demande);
    return approver.level === 'auto';
  }

  /**
   * Prépare une demande pour l'action (calculs automatiques)
   */
  static prepareForAction(demande: Demande): Demande {
    // Évaluer les risques
    const risks = this.evaluateRisks(demande);
    
    // Calculer la priorité auto si non définie ou normale
    const priority = (demande.priority && demande.priority !== 'normal')
      ? demande.priority
      : this.calculateAutoPriority(demande);

    // Calculer délai si deadline présente
    let delayDays: number | undefined;
    let isOverdue = false;
    
    if (demande.deadline) {
      const deadline = new Date(demande.deadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();
      delayDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      isOverdue = delayDays < 0;
    }

    return {
      ...demande,
      risks,
      priority,
      delayDays,
      isOverdue
    };
  }
}

