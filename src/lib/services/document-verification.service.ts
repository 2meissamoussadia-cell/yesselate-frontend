// ============================================
// Service de vérification approfondie des documents
// ============================================

import type {
  EnrichedBC,
  EnrichedFacture,
  EnrichedAvenant,
  DocumentVerificationResult,
  DocumentAnomaly,
  VerificationCheck,
  AnomalyType,
  AnomalySeverity,
} from '@/lib/types/document-validation.types';

// Générer un ID unique pour une anomalie
function generateAnomalyId(): string {
  return `ANOM-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Créer une anomalie
function createAnomaly(
  field: string,
  type: AnomalyType,
  severity: AnomalySeverity,
  message: string
): DocumentAnomaly {
  return {
    id: generateAnomalyId(),
    field,
    type,
    severity,
    message,
    detectedAt: new Date().toISOString(),
    detectedBy: 'BMO-SYSTEM',
    resolved: false,
  };
}

// Vérifier la cohérence des montants (HT, TVA, TTC)
function verifyAmounts(
  montantHT: number,
  tva: number,
  montantTTC: number
): { isValid: boolean; anomalies: DocumentAnomaly[] } {
  const anomalies: DocumentAnomaly[] = [];
  
  // Calculer le montant TTC attendu
  const tvaAmount = (montantHT * tva) / 100;
  const expectedTTC = montantHT + tvaAmount;
  const tolerance = 0.01; // Tolérance de 1 centime
  
  // Vérifier si le TTC correspond
  if (Math.abs(montantTTC - expectedTTC) > tolerance) {
    anomalies.push(
      createAnomaly(
        'montant_ttc',
        'montant_incoherent',
        'error',
        `Montant TTC incohérent. Attendu: ${expectedTTC.toFixed(2)} FCFA, Reçu: ${montantTTC.toFixed(2)} FCFA`
      )
    );
  }
  
  // Vérifier si la TVA est correcte
  if (tva !== 0 && tva !== 18 && tva !== 20) {
    anomalies.push(
      createAnomaly(
        'tva',
        'tva_incorrecte',
        'warning',
        `Taux de TVA inhabituel: ${tva}% (taux standard: 0%, 18%, 20%)`
      )
    );
  }
  
  return {
    isValid: anomalies.length === 0,
    anomalies,
  };
}

// Vérifier les dates
function verifyDates(
  dateEmission: string,
  dateLimite: string,
  documentType: 'bc' | 'facture' | 'avenant'
): { isValid: boolean; anomalies: DocumentAnomaly[] } {
  const anomalies: DocumentAnomaly[] = [];
  
  const emission = new Date(dateEmission);
  const limite = new Date(dateLimite);
  const today = new Date();
  
  // Vérifier que la date limite est après la date d'émission
  if (limite < emission) {
    anomalies.push(
      createAnomaly(
        'date_limite',
        'date_invalide',
        'error',
        'La date limite est antérieure à la date d\'émission'
      )
    );
  }
  
  // Vérifier si la date d'émission est dans le futur
  if (emission > today) {
    anomalies.push(
      createAnomaly(
        'date_emission',
        'date_invalide',
        'warning',
        'La date d\'émission est dans le futur'
      )
    );
  }
  
  // Vérifier si la date limite est dépassée
  if (limite < today) {
    anomalies.push(
      createAnomaly(
        'date_limite',
        'date_invalide',
        'error',
        `Date limite dépassée (${Math.floor((today.getTime() - limite.getTime()) / (1000 * 60 * 60 * 24))} jours)`
      )
    );
  }
  
  return {
    isValid: anomalies.length === 0,
    anomalies,
  };
}

// Vérifier le budget (simulation - normalement depuis base de données)
function verifyBudget(
  projet: string,
  montantTTC: number
): { isValid: boolean; anomalies: DocumentAnomaly[]; budgetRestant?: number } {
  const anomalies: DocumentAnomaly[] = [];
  
  // Simulation : budgets par projet (normalement depuis API)
  const budgets: Record<string, { total: number; utilise: number }> = {
    'PRJ-INFRA-2026-0012': { total: 5000000, utilise: 3000000 },
    'PRJ-0017': { total: 3000000, utilise: 2500000 },
  };
  
  const budget = budgets[projet];
  if (!budget) {
    anomalies.push(
      createAnomaly(
        'projet',
        'projet_incorrect',
        'warning',
        `Projet ${projet} non trouvé dans la base de données`
      )
    );
    return { isValid: false, anomalies };
  }
  
  const budgetRestant = budget.total - budget.utilise;
  
  // Vérifier le dépassement
  if (montantTTC > budgetRestant) {
    anomalies.push(
      createAnomaly(
        'montant_ttc',
        'depassement_budget',
        'critical',
        `Dépassement budgétaire: ${(montantTTC - budgetRestant).toFixed(2)} FCFA. Budget restant: ${budgetRestant.toFixed(2)} FCFA`
      )
    );
  } else if (montantTTC > budgetRestant * 0.9) {
    anomalies.push(
      createAnomaly(
        'montant_ttc',
        'depassement_budget',
        'warning',
        `Approche de la limite budgétaire. Budget restant: ${budgetRestant.toFixed(2)} FCFA (${((budgetRestant - montantTTC) / budget.total * 100).toFixed(1)}%)`
      )
    );
  }
  
  return {
    isValid: anomalies.length === 0,
    anomalies,
    budgetRestant,
  };
}

// Vérifier un BC
export function verifyBC(bc: EnrichedBC): DocumentVerificationResult {
  const anomalies: DocumentAnomaly[] = [];
  const checks: VerificationCheck[] = [];
  
  // 1. Vérification des montants
  const amountCheck = verifyAmounts(bc.montantHT, bc.tva, bc.montantTTC);
  anomalies.push(...amountCheck.anomalies);
  checks.push({
    id: 'check_amounts',
    name: 'Cohérence des montants (HT/TVA/TTC)',
    category: 'amount',
    passed: amountCheck.isValid,
    message: amountCheck.isValid ? 'Montants cohérents' : 'Incohérence détectée',
    severity: amountCheck.isValid ? undefined : 'error',
  });
  
  // 2. Vérification des dates
  const dateCheck = verifyDates(bc.dateEmission, bc.dateLimite, 'bc');
  anomalies.push(...dateCheck.anomalies);
  checks.push({
    id: 'check_dates',
    name: 'Cohérence des dates',
    category: 'administrative',
    passed: dateCheck.isValid,
    message: dateCheck.isValid ? 'Dates cohérentes' : 'Incohérence de dates détectée',
    severity: dateCheck.isValid ? undefined : 'error',
  });
  
  // 3. Vérification du budget
  const budgetCheck = verifyBudget(bc.projet, bc.montantTTC);
  anomalies.push(...budgetCheck.anomalies);
  checks.push({
    id: 'check_budget',
    name: 'Vérification budgétaire',
    category: 'amount',
    passed: budgetCheck.isValid,
    message: budgetCheck.isValid 
      ? `Budget disponible: ${budgetCheck.budgetRestant?.toFixed(2)} FCFA`
      : 'Problème budgétaire détecté',
    severity: budgetCheck.isValid ? undefined : 'critical',
  });
  
  // 4. Vérification administrative
  if (!bc.fournisseur || bc.fournisseur.trim() === '') {
    anomalies.push(
      createAnomaly('fournisseur', 'reference_manquante', 'error', 'Fournisseur manquant')
    );
  }
  
  if (!bc.projet || bc.projet.trim() === '') {
    anomalies.push(
      createAnomaly('projet', 'reference_manquante', 'error', 'Projet manquant')
    );
  }
  
  if (!bc.objet || bc.objet.trim() === '') {
    anomalies.push(
      createAnomaly('objet', 'reference_manquante', 'error', 'Objet manquant')
    );
  }
  
  checks.push({
    id: 'check_administrative',
    name: 'Complétude administrative',
    category: 'administrative',
    passed: !!(bc.fournisseur && bc.projet && bc.objet),
    message: bc.fournisseur && bc.projet && bc.objet ? 'Complet' : 'Champs manquants',
  });
  
  // Déterminer la sévérité globale
  const hasCritical = anomalies.some(a => a.severity === 'critical');
  const hasError = anomalies.some(a => a.severity === 'error');
  const hasWarning = anomalies.some(a => a.severity === 'warning');
  
  let severity: AnomalySeverity = 'info';
  if (hasCritical) severity = 'critical';
  else if (hasError) severity = 'error';
  else if (hasWarning) severity = 'warning';
  
  const isValid = anomalies.length === 0 || (!hasCritical && !hasError);
  
  return {
    isValid,
    severity,
    anomalies,
    checks,
    summary: isValid 
      ? 'Document valide et conforme'
      : `${anomalies.length} anomalie(s) détectée(s) - ${severity}`,
  };
}

// Vérifier une facture
export function verifyFacture(facture: EnrichedFacture): DocumentVerificationResult {
  const anomalies: DocumentAnomaly[] = [];
  const checks: VerificationCheck[] = [];
  
  // 1. Vérification des montants
  const amountCheck = verifyAmounts(facture.montantHT, facture.tva, facture.montantTTC);
  anomalies.push(...amountCheck.anomalies);
  checks.push({
    id: 'check_amounts',
    name: 'Cohérence des montants (HT/TVA/TTC)',
    category: 'amount',
    passed: amountCheck.isValid,
    message: amountCheck.isValid ? 'Montants cohérents' : 'Incohérence détectée',
    severity: amountCheck.isValid ? undefined : 'error',
  });
  
  // 2. Vérification des dates
  const dateCheck = verifyDates(facture.dateEmission, facture.dateLimite, 'facture');
  anomalies.push(...dateCheck.anomalies);
  checks.push({
    id: 'check_dates',
    name: 'Cohérence des dates',
    category: 'administrative',
    passed: dateCheck.isValid,
    message: dateCheck.isValid ? 'Dates cohérentes' : 'Incohérence de dates détectée',
    severity: dateCheck.isValid ? undefined : 'error',
  });
  
  // 3. Vérification du BC associé (si présent)
  if (!facture.bcAssocie || facture.bcAssocie.trim() === '') {
    anomalies.push(
      createAnomaly(
        'bc_associe',
        'bc_manquant',
        'warning',
        'Bon de commande associé manquant'
      )
    );
  }
  
  checks.push({
    id: 'check_bc',
    name: 'BC associé',
    category: 'contractual',
    passed: !!facture.bcAssocie,
    message: facture.bcAssocie ? `BC associé: ${facture.bcAssocie}` : 'BC associé manquant',
    severity: !facture.bcAssocie ? 'warning' : undefined,
  });
  
  // 4. Vérification budgétaire
  const budgetCheck = verifyBudget(facture.projet, facture.montantTTC);
  anomalies.push(...budgetCheck.anomalies);
  checks.push({
    id: 'check_budget',
    name: 'Vérification budgétaire',
    category: 'amount',
    passed: budgetCheck.isValid,
    message: budgetCheck.isValid 
      ? `Budget disponible: ${budgetCheck.budgetRestant?.toFixed(2)} FCFA`
      : 'Problème budgétaire détecté',
    severity: budgetCheck.isValid ? undefined : 'critical',
  });
  
  // Déterminer la sévérité globale
  const hasCritical = anomalies.some(a => a.severity === 'critical');
  const hasError = anomalies.some(a => a.severity === 'error');
  const hasWarning = anomalies.some(a => a.severity === 'warning');
  
  let severity: AnomalySeverity = 'info';
  if (hasCritical) severity = 'critical';
  else if (hasError) severity = 'error';
  else if (hasWarning) severity = 'warning';
  
  const isValid = anomalies.length === 0 || (!hasCritical && !hasError);
  
  return {
    isValid,
    severity,
    anomalies,
    checks,
    summary: isValid 
      ? 'Facture valide et conforme'
      : `${anomalies.length} anomalie(s) détectée(s) - ${severity}`,
  };
}

// Vérifier un avenant
export function verifyAvenant(avenant: EnrichedAvenant): DocumentVerificationResult {
  const anomalies: DocumentAnomaly[] = [];
  const checks: VerificationCheck[] = [];
  
  // 1. Vérification du motif
  if (!avenant.motif || avenant.motif.trim() === '') {
    anomalies.push(
      createAnomaly(
        'motif',
        'reference_manquante',
        'error',
        'Motif de l\'avenant manquant'
      )
    );
  }
  
  checks.push({
    id: 'check_motif',
    name: 'Motif de l\'avenant',
    category: 'administrative',
    passed: !!avenant.motif && avenant.motif.trim() !== '',
    message: avenant.motif ? 'Motif présent' : 'Motif manquant',
  });
  
  // 2. Vérification de l'impact financier
  if (avenant.impactFinancier > 0) {
    const budgetCheck = verifyBudget(avenant.projet, avenant.impactFinancier);
    anomalies.push(...budgetCheck.anomalies);
    checks.push({
      id: 'check_impact_financier',
      name: 'Impact financier',
      category: 'amount',
      passed: budgetCheck.isValid,
      message: budgetCheck.isValid 
        ? `Impact: +${avenant.impactFinancier.toFixed(2)} FCFA - Budget disponible: ${budgetCheck.budgetRestant?.toFixed(2)} FCFA`
        : 'Impact financier problématique',
      severity: budgetCheck.isValid ? undefined : 'critical',
    });
  } else {
    checks.push({
      id: 'check_impact_financier',
      name: 'Impact financier',
      category: 'amount',
      passed: true,
      message: 'Aucun impact financier',
    });
  }
  
  // 3. Vérification de l'impact délai
  if (avenant.impactDelai === 0) {
    anomalies.push(
      createAnomaly(
        'impact_delai',
        'reference_manquante',
        'warning',
        'Impact délai non spécifié'
      )
    );
  }
  
  checks.push({
    id: 'check_impact_delai',
    name: 'Impact délai',
    category: 'technical',
    passed: avenant.impactDelai !== 0,
    message: avenant.impactDelai > 0 
      ? `Délai supplémentaire: +${avenant.impactDelai} jours`
      : avenant.impactDelai < 0
      ? `Réduction de délai: ${avenant.impactDelai} jours`
      : 'Impact délai non spécifié',
    severity: avenant.impactDelai === 0 ? 'warning' : undefined,
  });
  
  // 4. Vérification administrative
  if (!avenant.projet || avenant.projet.trim() === '') {
    anomalies.push(
      createAnomaly('projet', 'reference_manquante', 'error', 'Projet manquant')
    );
  }
  
  if (!avenant.objet || avenant.objet.trim() === '') {
    anomalies.push(
      createAnomaly('objet', 'reference_manquante', 'error', 'Objet manquant')
    );
  }
  
  checks.push({
    id: 'check_administrative',
    name: 'Complétude administrative',
    category: 'administrative',
    passed: !!(avenant.projet && avenant.objet),
    message: avenant.projet && avenant.objet ? 'Complet' : 'Champs manquants',
  });
  
  // Déterminer la sévérité globale
  const hasCritical = anomalies.some(a => a.severity === 'critical');
  const hasError = anomalies.some(a => a.severity === 'error');
  const hasWarning = anomalies.some(a => a.severity === 'warning');
  
  let severity: AnomalySeverity = 'info';
  if (hasCritical) severity = 'critical';
  else if (hasError) severity = 'error';
  else if (hasWarning) severity = 'warning';
  
  const isValid = anomalies.length === 0 || (!hasCritical && !hasError);
  
  return {
    isValid,
    severity,
    anomalies,
    checks,
    summary: isValid 
      ? 'Avenant valide et conforme'
      : `${anomalies.length} anomalie(s) détectée(s) - ${severity}`,
  };
}

