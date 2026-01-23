/**
 * Règles d'approbation pour les demandes
 * Détermine qui peut approuver selon le montant et autres critères
 */

import type { Demande, ApproverLevel } from '../types/demande.types';

export class ApprovalRules {
  // Seuils d'approbation (en FCFA)
  private static readonly SEUIL_AUTO = 500000; // 500K - Auto-approbation
  private static readonly SEUIL_MANAGER = 5000000; // 5M - Manager
  private static readonly SEUIL_DIRECTION = 50000000; // 50M - Direction
  // Au-delà de 50M : COMEX

  /**
   * Détermine le niveau d'approbation requis pour une demande
   */
  static getApproverLevel(demande: Demande): ApproverLevel {
    const amount = demande.amount || demande.montant || 0;

    if (amount < this.SEUIL_AUTO) {
      return {
        level: 'auto',
        reason: `Montant < ${this.SEUIL_AUTO.toLocaleString()} FCFA - Auto-approbation`,
        threshold: this.SEUIL_AUTO
      };
    }

    if (amount < this.SEUIL_MANAGER) {
      return {
        level: 'manager',
        reason: `Montant entre ${this.SEUIL_AUTO.toLocaleString()} et ${this.SEUIL_MANAGER.toLocaleString()} FCFA - Approbation manager requise`,
        threshold: this.SEUIL_MANAGER
      };
    }

    if (amount < this.SEUIL_DIRECTION) {
      return {
        level: 'direction',
        reason: `Montant entre ${this.SEUIL_MANAGER.toLocaleString()} et ${this.SEUIL_DIRECTION.toLocaleString()} FCFA - Approbation direction requise`,
        threshold: this.SEUIL_DIRECTION
      };
    }

    return {
      level: 'comex',
      reason: `Montant ≥ ${this.SEUIL_DIRECTION.toLocaleString()} FCFA - Approbation COMEX requise`,
      threshold: this.SEUIL_DIRECTION
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
   * Vérifie si une demande nécessite une approbation spéciale
   */
  static requiresSpecialApproval(demande: Demande): boolean {
    const approver = this.getApproverLevel(demande);
    return approver.level === 'direction' || approver.level === 'comex';
  }

  /**
   * Obtient le prochain seuil à atteindre pour changer de niveau
   */
  static getNextThreshold(currentAmount: number): number | null {
    if (currentAmount < this.SEUIL_AUTO) return this.SEUIL_AUTO;
    if (currentAmount < this.SEUIL_MANAGER) return this.SEUIL_MANAGER;
    if (currentAmount < this.SEUIL_DIRECTION) return this.SEUIL_DIRECTION;
    return null; // Déjà au maximum
  }
}

