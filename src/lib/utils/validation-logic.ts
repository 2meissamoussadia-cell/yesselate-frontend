// ============================================
// Logique métier de validation
// Centre de pilotage BMO - Automatisation et Décision
// ============================================

import type {
  BCEscalationReason,
  FactureEscalationReason,
  AvenantEscalationReason,
  BMOCheck,
  BMOBCDecision,
  BMOFactureDecision,
  BMOAvenantDecision,
  PilotageRule,
  ControlParameter,
} from '@/lib/types/validation.types';
import type { PurchaseOrder, Invoice, Amendment } from '@/lib/types/bmo.types';

// ============================================
// Analyse d'un BC pour déterminer pourquoi il arrive au BMO
// ============================================

export function analyzeBCForBMO(bc: PurchaseOrder): {
  escalationReasons: BCEscalationReason[];
  bmoChecks: BMOCheck[];
  automatedDecision?: 'approve' | 'reject' | 'request_complement' | 'escalate';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  const reasons: BCEscalationReason[] = [];
  const checks: BMOCheck[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Extraire le montant
  const montant = parseFloat(bc.amount.replace(/[^\d.]/g, '')) || 0;
  const seuilBMO = 5000000;  // 5M FCFA
  const seuilDG = 20000000;  // 20M FCFA

  // 1. Vérifier le montant
  if (montant >= seuilDG) {
    reasons.push('decision_strategique');
    checks.push({
      id: 'check_montant',
      type: 'budget',
      label: 'Montant très élevé',
      description: `Montant de ${bc.amount} nécessite validation DG`,
      status: 'warning',
      details: `Montant supérieur au seuil de ${seuilDG.toLocaleString('fr-FR')} FCFA`,
      automated: true,
    });
    riskLevel = 'critical';
  } else if (montant >= seuilBMO) {
    reasons.push('montant_eleve');
    checks.push({
      id: 'check_montant',
      type: 'budget',
      label: 'Montant élevé',
      description: `Montant de ${bc.amount} nécessite validation BMO`,
      status: 'passed',
      details: `Montant supérieur au seuil de ${seuilBMO.toLocaleString('fr-FR')} FCFA`,
      automated: true,
    });
    riskLevel = montant >= 10000000 ? 'high' : 'medium';
  }

  // 2. Vérifier l'urgence non justifiée
  if (bc.priority === 'urgent') {
    const bcDate = new Date(bc.date);
    const daysDiff = Math.floor((Date.now() - bcDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 3) {
      reasons.push('urgence_non_justifiee');
      checks.push({
        id: 'check_urgence',
        type: 'conformity',
        label: 'Urgence non justifiée',
        description: `BC urgent en attente depuis ${daysDiff} jours`,
        status: 'warning',
        details: 'L\'urgence doit être justifiée',
        automated: true,
      });
      if (riskLevel === 'low') riskLevel = 'medium';
    }
  }

  // 3. Vérifier le fournisseur (simulation - normalement depuis base de données)
  const fournisseursNonHabituels = ['NOUVEAU_FOURNISSEUR', 'SUSPECT'];
  if (fournisseursNonHabituels.includes(bc.supplier.toUpperCase())) {
    reasons.push('fournisseur_non_habituel');
    checks.push({
      id: 'check_fournisseur',
      type: 'risk',
      label: 'Fournisseur non référencé',
      description: `Fournisseur ${bc.supplier} non dans la base référencée`,
      status: 'warning',
      details: 'Vérification de la fiabilité requise',
      automated: true,
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Décision automatique suggérée
  let automatedDecision: 'approve' | 'reject' | 'request_complement' | 'escalate' | undefined;
  
  if (montant >= seuilDG) {
    automatedDecision = 'escalate';
  } else if (reasons.includes('fournisseur_non_habituel')) {
    automatedDecision = 'request_complement';
  } else if (montant < seuilBMO && reasons.length === 0) {
    automatedDecision = 'approve';  // BC normal, peut être approuvé automatiquement
  }

  return {
    escalationReasons: reasons,
    bmoChecks: checks,
    automatedDecision,
    riskLevel,
  };
}

// ============================================
// Analyse d'une Facture pour déterminer pourquoi elle arrive au BMO
// ============================================

export function analyzeFactureForBMO(facture: Invoice): {
  escalationReasons: FactureEscalationReason[];
  bmoChecks: BMOCheck[];
  automatedDecision?: 'approve' | 'reject' | 'contest' | 'request_complement' | 'escalate';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  const reasons: FactureEscalationReason[] = [];
  const checks: BMOCheck[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Extraire le montant
  const montant = parseFloat(facture.montant.replace(/[^\d.]/g, '')) || 0;
  const seuilBMO = 3000000;  // 3M FCFA

  // 1. Vérifier le montant
  if (montant >= seuilBMO) {
    reasons.push('montant_eleve');
    checks.push({
      id: 'check_montant',
      type: 'budget',
      label: 'Montant élevé',
      description: `Montant de ${facture.montant} nécessite validation BMO`,
      status: 'passed',
      details: `Montant supérieur au seuil de ${seuilBMO.toLocaleString('fr-FR')} FCFA`,
      automated: true,
    });
    riskLevel = montant >= 10000000 ? 'high' : 'medium';
  }

  // 2. Vérifier l'échéance
  const [day, month, year] = facture.dateEcheance.split('/').map(Number);
  const dueDate = new Date(year, month - 1, day);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysOverdue > 0) {
    reasons.push('echeance_imminente');
    checks.push({
      id: 'check_echeance',
      type: 'risk',
      label: 'Facture échue',
      description: `Facture échue depuis ${daysOverdue} jour(s)`,
      status: 'failed',
      details: 'Risque de pénalités de retard',
      automated: true,
    });
    riskLevel = daysOverdue > 7 ? 'critical' : 'high';
  } else if (daysUntilDue <= 7 && daysUntilDue > 0) {
    reasons.push('echeance_imminente');
    checks.push({
      id: 'check_echeance',
      type: 'risk',
      label: 'Échéance imminente',
      description: `Échéance dans ${daysUntilDue} jour(s)`,
      status: 'warning',
      details: 'Traitement urgent requis',
      automated: true,
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // 3. Vérifier les documents (simulation - normalement depuis la facture)
  // En production, vérifier facture.documents ou facture.hasRequiredDocuments
  const documentsRequis = ['facture_originale', 'bon_commande', 'bon_livraison'];
  const documentsManquants = documentsRequis.filter(doc => !facture.id.includes('COMPLET')); // Simulation
  if (documentsManquants.length > 0) {
    reasons.push('facture_non_conforme');
    checks.push({
      id: 'check_documents',
      type: 'conformity',
      label: 'Documents manquants',
      description: `${documentsManquants.length} document(s) manquant(s)`,
      status: 'failed',
      details: `Documents requis: ${documentsManquants.join(', ')}`,
      automated: true,
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Décision automatique suggérée
  let automatedDecision: 'approve' | 'reject' | 'contest' | 'request_complement' | 'escalate' | undefined;
  
  if (daysOverdue > 7) {
    automatedDecision = 'escalate';  // Escalade vers DG si trop de retard
  } else if (documentsManquants.length > 0) {
    automatedDecision = 'request_complement';
  } else if (daysOverdue > 0) {
    automatedDecision = 'approve';  // Approbation urgente pour éviter pénalités
  } else if (montant < seuilBMO && reasons.length === 0) {
    automatedDecision = 'approve';  // Facture normale
  }

  return {
    escalationReasons: reasons,
    bmoChecks: checks,
    automatedDecision,
    riskLevel,
  };
}

// ============================================
// Analyse d'un Avenant pour déterminer pourquoi il arrive au BMO
// ============================================

export function analyzeAvenantForBMO(avenant: Amendment): {
  escalationReasons: AvenantEscalationReason[];
  bmoChecks: BMOCheck[];
  automatedDecision?: 'approve' | 'reject' | 'modify' | 'request_complement' | 'escalate';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  const reasons: AvenantEscalationReason[] = [];
  const checks: BMOCheck[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Extraire l'impact financier
  const impactFinancier = avenant.montant ? parseFloat(avenant.montant.replace(/[^\d.]/g, '')) || 0 : 0;
  const seuilBMO = 5000000;  // 5M FCFA
  const seuilDG = 20000000;  // 20M FCFA

  // 1. Vérifier l'impact financier
  if (impactFinancier >= seuilDG) {
    reasons.push('decision_strategique');
    checks.push({
      id: 'check_impact_financier',
      type: 'budget',
      label: 'Impact financier très élevé',
      description: `Impact de ${avenant.montant} nécessite validation DG`,
      status: 'warning',
      details: `Impact supérieur au seuil de ${seuilDG.toLocaleString('fr-FR')} FCFA`,
      automated: true,
    });
    riskLevel = 'critical';
  } else if (impactFinancier >= seuilBMO) {
    reasons.push('impact_financier_eleve');
    checks.push({
      id: 'check_impact_financier',
      type: 'budget',
      label: 'Impact financier élevé',
      description: `Impact de ${avenant.montant} nécessite validation BMO`,
      status: 'passed',
      details: `Impact supérieur au seuil de ${seuilBMO.toLocaleString('fr-FR')} FCFA`,
      automated: true,
    });
    riskLevel = impactFinancier >= 10000000 ? 'high' : 'medium';
  }

  // 2. Vérifier l'impact sur les délais
  if (avenant.impact === 'Délai') {
    reasons.push('impact_delai');
    checks.push({
      id: 'check_impact_delai',
      type: 'risk',
      label: 'Impact sur les délais',
      description: 'Modification des délais contractuels',
      status: 'warning',
      details: 'Évaluation de l\'impact sur le planning requise',
      automated: true,
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // 3. Vérifier l'impact technique
  if (avenant.impact === 'Technique') {
    reasons.push('impact_technique');
    checks.push({
      id: 'check_impact_technique',
      type: 'risk',
      label: 'Impact technique',
      description: 'Modification des spécifications techniques',
      status: 'warning',
      details: 'Validation technique requise',
      automated: true,
    });
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  // Décision automatique suggérée
  let automatedDecision: 'approve' | 'reject' | 'modify' | 'request_complement' | 'escalate' | undefined;
  
  if (impactFinancier >= seuilDG) {
    automatedDecision = 'escalate';
  } else if (avenant.impact === 'Technique') {
    automatedDecision = 'request_complement';  // Demander évaluation technique
  } else if (impactFinancier < seuilBMO && reasons.length === 0) {
    automatedDecision = 'approve';  // Avenant normal
  }

  return {
    escalationReasons: reasons,
    bmoChecks: checks,
    automatedDecision,
    riskLevel,
  };
}

// ============================================
// Génération de recommandation de décision BMO
// ============================================

export function generateBMODecisionRecommendation(
  context: 'bc' | 'facture' | 'avenant',
  analysis: ReturnType<typeof analyzeBCForBMO> | ReturnType<typeof analyzeFactureForBMO> | ReturnType<typeof analyzeAvenantForBMO>,
  item: PurchaseOrder | Invoice | Amendment
): {
  recommendation: string;
  actions: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
} {
  const { automatedDecision, riskLevel, bmoChecks } = analysis;
  
  let recommendation = '';
  const actions: string[] = [];
  let priority: 'low' | 'medium' | 'high' | 'urgent' = riskLevel === 'critical' ? 'urgent' : riskLevel === 'high' ? 'high' : riskLevel === 'medium' ? 'medium' : 'low';

  // Générer recommandation selon le contexte
  if (context === 'bc') {
    const bc = item as PurchaseOrder;
    if (automatedDecision === 'approve') {
      recommendation = `Le BC ${bc.id} peut être approuvé automatiquement. Montant dans les limites autorisées et conforme aux critères.`;
      actions.push('Approuver le BC');
      actions.push('Notifier le Bureau Achat');
    } else if (automatedDecision === 'escalate') {
      recommendation = `Le BC ${bc.id} nécessite une validation au niveau DG en raison du montant élevé (${bc.amount}).`;
      actions.push('Escalader vers le DG');
      actions.push('Préparer le dossier de validation');
      priority = 'urgent';
    } else if (automatedDecision === 'request_complement') {
      recommendation = `Le BC ${bc.id} nécessite des compléments avant validation (fournisseur non référencé, documents manquants).`;
      actions.push('Demander des compléments au Bureau Achat');
      actions.push('Mettre en attente');
    }
  } else if (context === 'facture') {
    const facture = item as Invoice;
    if (automatedDecision === 'approve') {
      recommendation = `La facture ${facture.id} peut être validée. Conforme et dans les délais.`;
      actions.push('Valider la facture');
      actions.push('Programmer le paiement');
    } else if (automatedDecision === 'escalate') {
      recommendation = `La facture ${facture.id} nécessite une escalade urgente (échéance dépassée de plus de 7 jours).`;
      actions.push('Escalader vers le DG');
      actions.push('Alerter le Bureau Finance');
      priority = 'urgent';
    } else if (automatedDecision === 'request_complement') {
      recommendation = `La facture ${facture.id} nécessite des documents complémentaires.`;
      actions.push('Demander les documents manquants');
      actions.push('Mettre en attente');
    }
  } else if (context === 'avenant') {
    const avenant = item as Amendment;
    if (automatedDecision === 'approve') {
      recommendation = `L'avenant ${avenant.id} peut être approuvé. Impact maîtrisé et conforme.`;
      actions.push('Approuver l\'avenant');
      actions.push('Notifier le Bureau Juridique');
    } else if (automatedDecision === 'escalate') {
      recommendation = `L'avenant ${avenant.id} nécessite une validation DG (impact financier très élevé: ${avenant.montant}).`;
      actions.push('Escalader vers le DG');
      actions.push('Préparer l\'analyse d\'impact');
      priority = 'urgent';
    } else if (automatedDecision === 'request_complement') {
      recommendation = `L'avenant ${avenant.id} nécessite une évaluation technique complémentaire.`;
      actions.push('Demander l\'évaluation technique');
      actions.push('Mettre en attente');
    }
  }

  // Ajouter actions basées sur les checks échoués
  const failedChecks = bmoChecks.filter(c => c.status === 'failed');
  if (failedChecks.length > 0) {
    actions.push(`Corriger ${failedChecks.length} problème(s) détecté(s)`);
  }

  return {
    recommendation,
    actions,
    priority,
  };
}

