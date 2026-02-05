/**
 * Fonctionnalités métier avancées pour la console RH
 * Règles de gestion, validations automatiques, calculs spécifiques
 */

import * as rhBusinessService from './rhBusinessService';

// ============================================
// Types métier avancés
// ============================================

export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  bureau: string;
  service: string;
  poste: string;
  dateEmbauche: string;
  salaire: number;
  soldeConges: {
    annuel: number;
    maladie: number;
    exceptionnel: number;
    recuperation: number;
  };
  historique: Array<{
    type: string;
    date: string;
    details: string;
  }>;
}

export interface BudgetControl {
  bureau: string;
  annee: number;
  budgets: {
    deplacements: {
      alloue: number;
      utilise: number;
      restant: number;
      pourcentage: number;
    };
    formations: {
      alloue: number;
      utilise: number;
      restant: number;
      pourcentage: number;
    };
    depenses: {
      alloue: number;
      utilise: number;
      restant: number;
      pourcentage: number;
    };
  };
}

// ============================================
// Règles métier - Congés
// ============================================

export const congesRules = {
  /**
   * Calculer le solde de congés d'un agent
   */
  calculateSolde: (agent: Agent, annee: number) => {
    // Droits annuels de base: 30 jours
    const droitsBase = 30;
    
    // Ancienneté: +1 jour par tranche de 3 ans
    const anciennete = new Date().getFullYear() - new Date(agent.dateEmbauche).getFullYear();
    const bonusAnciennete = Math.floor(anciennete / 3);
    
    // Total des droits
    const droitsTotaux = droitsBase + bonusAnciennete;
    
    return {
      droitsTotaux,
      soldeActuel: agent.soldeConges.annuel,
      bonusAnciennete,
      anciennete,
    };
  },

  /**
   * Vérifier si une demande de congé peut être validée automatiquement
   */
  canAutoValidate: (demande: any, agent: Agent): { canValidate: boolean; reason?: string } => {
    // Règle 1: Durée <= 3 jours et solde suffisant
    if (demande.workingDays <= 3 && agent.soldeConges.annuel >= demande.workingDays) {
      return { canValidate: true };
    }

    // Règle 2: Congés déjà planifiés (+ de 2 mois à l'avance)
    const debut = new Date(demande.dateDebut);
    const now = new Date();
    const delaiMois = (debut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (delaiMois >= 2 && agent.soldeConges.annuel >= demande.workingDays) {
      return { canValidate: true };
    }

    return {
      canValidate: false,
      reason: 'Validation manuelle requise (durée > 3 jours ou solde insuffisant)',
    };
  },

  /**
   * Détecter les conflits de planning
   */
  detectConflicts: (demande: any, equipe: Agent[]): Array<{ type: string; message: string }> => {
    const conflicts: Array<{ type: string; message: string }> = [];
    const debut = new Date(demande.dateDebut);
    const fin = new Date(demande.dateFin);

    // Vérifier les absences simultanées dans l'équipe
    const absentsSimultanes = equipe.filter(membre => {
      // Logique de vérification des périodes qui se chevauchent
      return membre.id !== demande.agentId; // Simplifié pour l'exemple
    });

    if (absentsSimultanes.length >= 3) {
      conflicts.push({
        type: 'team_shortage',
        message: `${absentsSimultanes.length} membres de l'équipe seront absents simultanément`,
      });
    }

    // Vérifier les périodes de forte charge
    const isHighSeason = debut.getMonth() >= 5 && debut.getMonth() <= 8;
    if (isHighSeason) {
      conflicts.push({
        type: 'high_season',
        message: 'Période de forte activité (été) - vérifier la charge de travail',
      });
    }

    return conflicts;
  },
};

// ============================================
// Règles métier - Dépenses
// ============================================

export const depensesRules = {
  /**
   * Déterminer le niveau de validation requis selon le montant
   */
  getValidationLevel: (montant: number): {
    level: number;
    validators: string[];
    conditions: string[];
  } => {
    if (montant < 10000) {
      return {
        level: 1,
        validators: ['Chef d\'équipe'],
        conditions: ['Justificatif requis'],
      };
    } else if (montant < 30000) {
      return {
        level: 2,
        validators: ['Chef d\'équipe', 'Responsable RH'],
        conditions: ['Justificatif + Devis', 'Budget disponible'],
      };
    } else if (montant < 100000) {
      return {
        level: 3,
        validators: ['Chef d\'équipe', 'Responsable RH', 'Contrôleur financier'],
        conditions: ['Justificatif + Devis + Bon de commande', 'Budget disponible', 'Approbation préalable'],
      };
    } else {
      return {
        level: 4,
        validators: ['Chef d\'équipe', 'Responsable RH', 'Contrôleur financier', 'Direction Générale'],
        conditions: [
          'Justificatif + Devis + Bon de commande',
          'Budget disponible',
          'Approbation préalable',
          'Validation DG obligatoire',
        ],
      };
    }
  },

  /**
   * Vérifier la disponibilité budgétaire
   */
  checkBudget: (montant: number, bureau: string, budgetControl: BudgetControl): {
    available: boolean;
    message: string;
    pourcentageUtilise: number;
  } => {
    const budget = budgetControl.budgets.depenses;
    const nouveauMontant = budget.utilise + montant;
    const pourcentageUtilise = (nouveauMontant / budget.alloue) * 100;

    if (nouveauMontant > budget.alloue) {
      return {
        available: false,
        message: `Budget dépassé de ${nouveauMontant - budget.alloue} DZD`,
        pourcentageUtilise,
      };
    }

    if (pourcentageUtilise > 90) {
      return {
        available: true,
        message: `Attention: ${pourcentageUtilise.toFixed(1)}% du budget utilisé`,
        pourcentageUtilise,
      };
    }

    return {
      available: true,
      message: `Budget disponible: ${budget.restant - montant} DZD restants`,
      pourcentageUtilise,
    };
  },

  /**
   * Calculer les frais kilométriques
   */
  calculateFraisKm: (distance: number, typeVehicule: 'voiture' | 'moto' | 'velo'): number => {
    const tarifsParKm = {
      voiture: 15, // DZD/km
      moto: 8,
      velo: 3,
    };

    return distance * tarifsParKm[typeVehicule];
  },
};

// ============================================
// Règles métier - Avances sur salaire
// ============================================

export const avancesRules = {
  /**
   * Calculer le montant maximum d'avance autorisé
   */
  calculateMaxAvance: (agent: Agent): {
    maxAmount: number;
    pourcentageSalaire: number;
    conditions: string[];
  } => {
    // Maximum 80% du salaire net
    const maxAmount = agent.salaire * 0.8;
    
    return {
      maxAmount,
      pourcentageSalaire: 80,
      conditions: [
        'Maximum 80% du salaire mensuel',
        'Remboursement automatique sur 3 mois',
        'Une seule avance active à la fois',
        'Ancienneté minimum: 6 mois',
      ],
    };
  },

  /**
   * Vérifier l'éligibilité pour une avance
   */
  checkEligibility: (agent: Agent, montantDemande: number): {
    eligible: boolean;
    reasons: string[];
  } => {
    const reasons: string[] = [];
    
    // Vérifier l'ancienneté
    const ancienneteMois = (new Date().getTime() - new Date(agent.dateEmbauche).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (ancienneteMois < 6) {
      reasons.push('Ancienneté insuffisante (minimum 6 mois requis)');
    }

    // Vérifier le montant demandé
    const maxAvance = agent.salaire * 0.8;
    if (montantDemande > maxAvance) {
      reasons.push(`Montant trop élevé (maximum: ${maxAvance} DZD)`);
    }

    // Vérifier s'il n'y a pas d'avance en cours
    const avanceEnCours = agent.historique.some(h => 
      h.type === 'avance' && h.details.includes('en cours')
    );
    if (avanceEnCours) {
      reasons.push('Une avance est déjà en cours de remboursement');
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  },

  /**
   * Calculer le plan de remboursement
   */
  calculateRemboursement: (montant: number, nombreMois: number = 3): Array<{
    mois: number;
    montant: number;
    reste: number;
  }> => {
    const mensualite = Math.ceil(montant / nombreMois);
    const plan: Array<{ mois: number; montant: number; reste: number }> = [];
    let reste = montant;

    for (let i = 1; i <= nombreMois; i++) {
      const montantMois = i === nombreMois ? reste : mensualite;
      reste -= montantMois;
      plan.push({
        mois: i,
        montant: montantMois,
        reste,
      });
    }

    return plan;
  },
};

// ============================================
// Règles métier - Déplacements
// ============================================

export const deplacementsRules = {
  /**
   * Calculer les indemnités de déplacement
   */
  calculateIndemnites: (
    destination: string,
    dureeJours: number,
    type: 'national' | 'international'
  ): {
    indemniteJournaliere: number;
    transport: number;
    hebergement: number;
    total: number;
  } => {
    const tarifs = {
      national: {
        indemniteJournaliere: 2000, // DZD
        hebergement: 5000,
        transport: 3000,
      },
      international: {
        indemniteJournaliere: 50, // EUR converti en DZD (environ 8000 DZD)
        hebergement: 100,
        transport: 150,
      },
    };

    const tarifApplicable = tarifs[type];
    const multiplier = type === 'international' ? 160 : 1; // Taux de conversion EUR->DZD

    return {
      indemniteJournaliere: tarifApplicable.indemniteJournaliere * multiplier * dureeJours,
      transport: tarifApplicable.transport * multiplier,
      hebergement: tarifApplicable.hebergement * multiplier * dureeJours,
      total: (tarifApplicable.indemniteJournaliere + tarifApplicable.hebergement) * multiplier * dureeJours + 
             tarifApplicable.transport * multiplier,
    };
  },

  /**
   * Vérifier les documents requis selon la destination
   */
  getRequiredDocuments: (type: 'national' | 'international'): string[] => {
    const baseDocuments = [
      'Ordre de mission',
      'Justificatif de transport',
      'Factures d\'hébergement',
    ];

    if (type === 'international') {
      return [
        ...baseDocuments,
        'Passeport',
        'Visa (si requis)',
        'Assurance voyage',
        'Autorisation de sortie du territoire',
        'Billet d\'avion',
      ];
    }

    return baseDocuments;
  },
};

// ============================================
// Utilitaires métier
// ============================================

export const businessUtils = {
  /**
   * Calculer le nombre de jours ouvrables entre deux dates
   */
  calculateWorkingDays: rhBusinessService.calculateWorkingDays,

  /**
   * Déterminer la priorité d'une demande
   */
  determinePriority: (demande: any): 'normal' | 'high' | 'urgent' => {
    const now = new Date();
    const dateDebut = new Date(demande.dateDebut);
    const delaiJours = (dateDebut.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    // Urgence selon le délai
    if (delaiJours < 7) return 'urgent';
    if (delaiJours < 15) return 'high';
    return 'normal';
  },

  /**
   * Générer un rapport de validation complet
   */
  generateValidationReport: (demande: any, agent: Agent): {
    validations: Array<{ check: string; status: 'ok' | 'warning' | 'error'; message: string }>;
    recommendation: 'approve' | 'review' | 'reject';
    score: number;
  } => {
    const validations: Array<{ check: string; status: 'ok' | 'warning' | 'error'; message: string }> = [];
    let score = 100;

    // Vérifications spécifiques selon le type
    if (demande.type === 'Congé') {
      const soldeCheck = agent.soldeConges.annuel >= demande.workingDays;
      validations.push({
        check: 'Solde de congés',
        status: soldeCheck ? 'ok' : 'error',
        message: soldeCheck
          ? `Solde suffisant (${agent.soldeConges.annuel} jours disponibles)`
          : `Solde insuffisant (${agent.soldeConges.annuel} jours, ${demande.workingDays} demandés)`,
      });
      if (!soldeCheck) score -= 50;
    }

    // Vérification des documents
    const hasDocuments = demande.documents && demande.documents.length > 0;
    validations.push({
      check: 'Documents justificatifs',
      status: hasDocuments ? 'ok' : 'warning',
      message: hasDocuments ? 'Documents fournis' : 'Aucun document fourni',
    });
    if (!hasDocuments) score -= 20;

    // Recommandation finale
    let recommendation: 'approve' | 'review' | 'reject';
    if (score >= 80) recommendation = 'approve';
    else if (score >= 50) recommendation = 'review';
    else recommendation = 'reject';

    return { validations, recommendation, score };
  },
};

export default {
  conges: congesRules,
  depenses: depensesRules,
  avances: avancesRules,
  deplacements: deplacementsRules,
  utils: businessUtils,
};

