/**
 * Règles de validation pour les demandes
 * Extrait de la logique métier des composants
 */

import type { Demande } from '../types/demande.types';

export class ValidationRules {
  // Longueurs minimales
  private static readonly MIN_TITLE_LENGTH = 10;
  private static readonly MIN_DESCRIPTION_LENGTH = 20;
  
  // Montants
  private static readonly MIN_AMOUNT = 1;
  private static readonly MAX_AMOUNT = 100000000; // 100M FCFA

  /**
   * Valide le titre d'une demande
   */
  static isTitleValid(title: string | undefined | null): boolean {
    if (!title) return false;
    return title.trim().length >= this.MIN_TITLE_LENGTH;
  }

  /**
   * Valide le montant d'une demande
   */
  static isAmountValid(amount: number | undefined | null): boolean {
    if (amount === undefined || amount === null) return false;
    return amount >= this.MIN_AMOUNT && amount <= this.MAX_AMOUNT;
  }

  /**
   * Valide la description d'une demande
   */
  static isDescriptionValid(description: string | undefined | null): boolean {
    if (!description) return true; // Optionnel
    return description.trim().length >= this.MIN_DESCRIPTION_LENGTH;
  }

  /**
   * Valide le bureau
   */
  static isBureauValid(bureau: string | undefined | null): boolean {
    if (!bureau) return false;
    const validBureaux = ['BMO', 'BF', 'BJ', 'BCT', 'BOP', 'BCG', 'BJA', 'BRC', 'BPL', 'BEX'];
    return validBureaux.includes(bureau.toUpperCase());
  }

  /**
   * Valide la date de délai
   */
  static isDeadlineValid(deadline: Date | string | undefined | null): boolean {
    if (!deadline) return true; // Optionnel
    const date = new Date(deadline);
    return !isNaN(date.getTime());
  }

  /**
   * Valide qu'une demande a au moins un document si montant > seuil
   */
  static requiresDocuments(demande: Demande): boolean {
    const amount = demande.amount || demande.montant || 0;
    const SEUIL_DOCUMENTS = 1000000; // 1M FCFA
    
    if (amount >= SEUIL_DOCUMENTS) {
      return (demande.documents?.length || 0) > 0;
    }
    
    return true; // Pas de document requis en dessous du seuil
  }

  /**
   * Valide qu'une demande a une justification si montant > seuil
   */
  static requiresJustification(demande: Demande): boolean {
    const amount = demande.amount || demande.montant || 0;
    const SEUIL_JUSTIFICATION = 500000; // 500K FCFA
    
    if (amount >= SEUIL_JUSTIFICATION) {
      return !!(demande.justification && demande.justification.trim().length > 0);
    }
    
    return true; // Pas de justification requise en dessous du seuil
  }

  /**
   * Valide qu'une demande urgente a une raison d'urgence
   */
  static requiresUrgencyReason(demande: Demande): boolean {
    if (demande.priority === 'urgent' || demande.priority === 'critical') {
      return !!(demande.urgencyReason && demande.urgencyReason.trim().length > 0);
    }
    
    return true; // Pas de raison requise si pas urgent
  }
}

