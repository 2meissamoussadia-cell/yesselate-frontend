// ============================================
// Service d'audit complet des BC (type CIRIL)
// ============================================

import type {
  EnrichedBC,
  BCLigne,
  DocumentAnomaly,
  AnomalySeverity,
} from '@/lib/types/document-validation.types';

import type {
  BCAuditReport,
  BCAuditCheck,
  BCAuditRecommendation,
  BCAuditContext,
  BCWorkflowStatus,
} from '@/lib/types/bc-workflow.types';

import {
  BC_TRANSITIONS,
} from '@/lib/types/bc-workflow.types';
import {
  detectFamilyFromLine,
  isCompatibleFamily,
  type FamilyCode,
  getFamily,
} from '@/domain/nomenclature';
import {
  runBCAuditDeep,
  type AuditReport as DomainAuditReport,
  type AuditContext as DomainAuditContext,
} from '@/domain/bcAudit';
import { convertEnrichedBCToBonCommande } from '@/lib/utils/bc-converter';

// ============================================
// Génération d'IDs
// ============================================

function generateAuditId(): string {
  return `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateCheckId(): string {
  return `CHECK-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateRecommendationId(): string {
  return `REC-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateAnomalyId(): string {
  return `ANOM-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================
// Création d'anomalies
// ============================================

function createAnomaly(
  field: string,
  type: string,
  severity: AnomalySeverity,
  message: string
): DocumentAnomaly {
  return {
    id: generateAnomalyId(),
    field,
    type: type as any,
    severity,
    message,
    detectedAt: new Date().toISOString(),
    detectedBy: 'BMO-AUDIT-SYSTEM',
    resolved: false,
  };
}

// ============================================
// Vérification de Nomenclature
// ============================================

function checkNomenclature(bc: EnrichedBC): {
  checks: BCAuditCheck[];
  anomalies: DocumentAnomaly[];
  recommendations: BCAuditRecommendation[];
} {
  const checks: BCAuditCheck[] = [];
  const anomalies: DocumentAnomaly[] = [];
  const recommendations: BCAuditRecommendation[] = [];
  
  if (!bc.lignes || bc.lignes.length === 0) {
    checks.push({
      id: generateCheckId(),
      category: 'nomenclature',
      name: 'Présence de lignes',
      passed: false,
      severity: 'error',
      message: 'Aucune ligne détectée dans le BC',
    });
    
    anomalies.push(createAnomaly(
      'lignes',
      'reference_manquante',
      'error',
      'Le bon de commande ne contient aucune ligne de détail'
    ));
    
    return { checks, anomalies, recommendations };
  }
  
  // Récupérer le familyCode du BC s'il existe (nouveau format BonCommande)
  const bcFamilyCode = (bc as any).familyCode as FamilyCode | undefined;
  
  // Détecter les familles pour chaque ligne
  // Priorité : familyCode explicite > détection automatique
  const lineFamilies = bc.lignes.map(line => {
    const explicitFamily = line.familyCode;
    const detectedFamily = detectFamilyFromLine(line);
    return {
      line,
      family: (explicitFamily && getFamily(explicitFamily as FamilyCode)) ? explicitFamily as FamilyCode : detectedFamily,
      source: explicitFamily ? 'explicit' : (detectedFamily ? 'detected' : 'none'),
    };
  });
  
  // Familles détectées (avec codes FamilyCode)
  const detectedFamilies = lineFamilies
    .filter(lf => lf.family !== null)
    .map(lf => lf.family as FamilyCode);
  
  // Familles uniques
  const uniqueFamilies = [...new Set(detectedFamilies)];
  
  // Vérification principale : si le BC a un familyCode explicite, toutes les lignes doivent être compatibles
  if (bcFamilyCode) {
    const bcFamily = getFamily(bcFamilyCode);
    if (!bcFamily) {
      checks.push({
        id: generateCheckId(),
        category: 'nomenclature',
        name: 'Code famille BC invalide',
        passed: false,
        severity: 'error',
        message: `Le code famille du BC (${bcFamilyCode}) n'existe pas dans la nomenclature`,
      });
      
      anomalies.push(createAnomaly(
        'familyCode',
        'reference_manquante',
        'error',
        `Code famille invalide : ${bcFamilyCode}`
      ));
    } else {
      // Vérifier que toutes les lignes sont compatibles avec le familyCode du BC
      const incompatibleLines: number[] = [];
      
      lineFamilies.forEach((lf, idx) => {
        if (lf.family && !isCompatibleFamily(bcFamilyCode, lf.family)) {
          incompatibleLines.push(idx + 1);
        }
      });
      
      if (incompatibleLines.length > 0) {
        checks.push({
          id: generateCheckId(),
          category: 'nomenclature',
          name: 'Cohérence famille BC / lignes',
          passed: false,
          severity: 'error',
          message: `${incompatibleLines.length} ligne(s) incompatible(s) avec la famille du BC (${bcFamily.label})`,
          details: {
            bcFamilyCode,
            bcFamilyLabel: bcFamily.label,
            incompatibleLines,
          },
        });
        
        anomalies.push(createAnomaly(
          'lignes',
          'autre',
          'error',
          `Les lignes ${incompatibleLines.join(', ')} ne sont pas compatibles avec la famille du BC (${bcFamily.label} - ${bcFamilyCode}). Un BC ne doit contenir qu'une seule famille homogène (hors exceptions autorisées comme la logistique).`
        ));
      } else {
        checks.push({
          id: generateCheckId(),
          category: 'nomenclature',
          name: 'Cohérence famille BC / lignes',
          passed: true,
          severity: 'info',
          message: `Toutes les lignes sont compatibles avec la famille du BC : ${bcFamily.label} (${bcFamilyCode})`,
          details: {
            bcFamilyCode,
            bcFamilyLabel: bcFamily.label,
            linesCount: bc.lignes.length,
          },
        });
      }
    }
  } else {
    // Pas de familyCode explicite au niveau BC : vérifier la cohérence des lignes
    if (uniqueFamilies.length === 0) {
      checks.push({
        id: generateCheckId(),
        category: 'nomenclature',
        name: 'Cohérence nomenclature (1 BC = 1 famille)',
        passed: false,
        severity: 'warning',
        message: 'Aucune famille détectée dans les lignes du BC. Le BC devrait avoir un familyCode explicite.',
        details: {
          families: [],
          linesCount: bc.lignes.length,
        },
      });
      
      anomalies.push(createAnomaly(
        'familyCode',
        'reference_manquante',
        'warning',
        'Le BC n\'a pas de code famille explicite et aucune famille n\'a pu être détectée automatiquement. Ajout d\'un familyCode recommandé.'
      ));
    } else if (uniqueFamilies.length === 1) {
      // OK : une seule famille détectée
      const family = getFamily(uniqueFamilies[0]);
      checks.push({
        id: generateCheckId(),
        category: 'nomenclature',
        name: 'Cohérence nomenclature (1 BC = 1 famille)',
        passed: true,
        severity: 'info',
        message: `Famille unique détectée : ${family?.label || uniqueFamilies[0]} (${uniqueFamilies[0]})`,
        details: {
          families: uniqueFamilies,
          familyLabel: family?.label,
          recommendation: 'Ajouter ce familyCode au niveau du BC pour plus de clarté',
        },
      });
    } else {
      // Plusieurs familles : vérifier si elles sont compatibles
      const mainFamily = uniqueFamilies[0];
      const incompatibleFamilies: FamilyCode[] = [];
      
      for (let i = 1; i < uniqueFamilies.length; i++) {
        if (!isCompatibleFamily(mainFamily, uniqueFamilies[i])) {
          incompatibleFamilies.push(uniqueFamilies[i]);
        }
      }
      
      if (incompatibleFamilies.length > 0) {
        // Anomalie : familles incompatibles
        const familyLabels = incompatibleFamilies.map(f => getFamily(f)?.label || f).join(', ');
        const mainFamilyLabel = getFamily(mainFamily)?.label || mainFamily;
        
        checks.push({
          id: generateCheckId(),
          category: 'nomenclature',
          name: 'Cohérence nomenclature (1 BC = 1 famille)',
          passed: false,
          severity: 'error',
          message: `Plusieurs familles incompatibles détectées : ${mainFamilyLabel} + ${familyLabels}`,
          details: {
            families: uniqueFamilies,
            mainFamily,
            incompatibleFamilies,
          },
        });
        
        anomalies.push(createAnomaly(
          'lignes',
          'autre',
          'error',
          `Le BC contient des lignes de familles incompatibles : ${uniqueFamilies.map(f => getFamily(f)?.label || f).join(', ')}. Un BC ne doit contenir qu'une seule famille homogène (hors exceptions autorisées comme la logistique).`
        ));
        
        // Recommandation : Split BC
        recommendations.push({
          id: generateRecommendationId(),
          type: 'split_bc',
          priority: 'high',
          title: 'Scinder le bon de commande',
          description: `Ce BC doit être scindé en ${uniqueFamilies.length} BC distincts, un par famille : ${uniqueFamilies.map(f => getFamily(f)?.label || f).join(', ')}. Les familles compatibles (ex: Transport & livraison) peuvent être ajoutées au BC principal.`,
          action: `Créer ${uniqueFamilies.length} nouveaux BC depuis ce BC, chacun avec une seule famille principale.`,
        });
      } else {
        // OK : plusieurs familles mais compatibles (ex: matériaux + transport)
        const familyLabels = uniqueFamilies.map(f => getFamily(f)?.label || f).join(', ');
        checks.push({
          id: generateCheckId(),
          category: 'nomenclature',
          name: 'Cohérence nomenclature (1 BC = 1 famille)',
          passed: true,
          severity: 'info',
          message: `Familles compatibles détectées : ${familyLabels}. Recommandation : définir la famille principale au niveau du BC.`,
          details: {
            families: uniqueFamilies,
            compatible: true,
            recommendedMainFamily: mainFamily,
          },
        });
      }
    }
  }
  
  return { checks, anomalies, recommendations };
}

// ============================================
// Vérification des montants
// ============================================

function checkAmounts(bc: EnrichedBC): {
  checks: BCAuditCheck[];
  anomalies: DocumentAnomaly[];
} {
  const checks: BCAuditCheck[] = [];
  const anomalies: DocumentAnomaly[] = [];
  
  // Vérifier cohérence HT/TVA/TTC
  const tvaRate = (bc.tva || 20) / 100;
  const expectedTTC = bc.montantHT * (1 + tvaRate);
  const diff = Math.abs(expectedTTC - bc.montantTTC);
  const tolerance = 1; // 1 FCFA de tolérance
  
  if (diff > tolerance) {
    const checkId = generateCheckId();
    checks.push({
      id: checkId,
      category: 'amount',
      name: 'Cohérence HT/TVA/TTC',
      passed: false,
      severity: 'error',
      message: `Incohérence détectée : TTC attendu ${expectedTTC.toFixed(2)} FCFA, trouvé ${bc.montantTTC.toFixed(2)} FCFA`,
      details: {
        montantHT: bc.montantHT,
        tva: bc.tva,
        montantTTC: bc.montantTTC,
        expectedTTC,
        difference: diff,
      },
    });
    
    anomalies.push(createAnomaly(
      'montantTTC',
      'montant_incoherent',
      'error',
      `Montant TTC incohérent avec HT + TVA. Attendu : ${expectedTTC.toFixed(2)} FCFA, trouvé : ${bc.montantTTC.toFixed(2)} FCFA`
    ));
  } else {
    checks.push({
      id: generateCheckId(),
      category: 'amount',
      name: 'Cohérence HT/TVA/TTC',
      passed: true,
      severity: 'info',
      message: 'Les montants HT, TVA et TTC sont cohérents',
    });
  }
  
  // Vérifier cohérence avec les lignes
  if (bc.lignes && bc.lignes.length > 0) {
    const totalHTLignes = bc.lignes.reduce((sum, line) => sum + (line.totalHT || 0), 0);
    const diffLignes = Math.abs(totalHTLignes - bc.montantHT);
    
    if (diffLignes > tolerance) {
      checks.push({
        id: generateCheckId(),
        category: 'amount',
        name: 'Cohérence avec lignes détaillées',
        passed: false,
        severity: 'warning',
        message: `Le montant HT du BC (${bc.montantHT.toFixed(2)} FCFA) ne correspond pas à la somme des lignes (${totalHTLignes.toFixed(2)} FCFA)`,
        details: {
          montantHT: bc.montantHT,
          totalHTLignes,
          difference: diffLignes,
        },
      });
      
      anomalies.push(createAnomaly(
        'montantHT',
        'montant_ht_incorrect',
        'warning',
        `Le montant HT ne correspond pas à la somme des lignes. Différence : ${diffLignes.toFixed(2)} FCFA`
      ));
    } else {
      checks.push({
        id: generateCheckId(),
        category: 'amount',
        name: 'Cohérence avec lignes détaillées',
        passed: true,
        severity: 'info',
        message: 'Le montant HT correspond à la somme des lignes',
      });
    }
  }
  
  return { checks, anomalies };
}

// ============================================
// Vérification du fournisseur
// ============================================

function checkSupplier(bc: EnrichedBC, context?: BCAuditContext): {
  checks: BCAuditCheck[];
  anomalies: DocumentAnomaly[];
} {
  const checks: BCAuditCheck[] = [];
  const anomalies: DocumentAnomaly[] = [];
  
  // Vérifier présence du fournisseur
  if (!bc.fournisseur || bc.fournisseur.trim() === '') {
    checks.push({
      id: generateCheckId(),
      category: 'supplier',
      name: 'Fournisseur renseigné',
      passed: false,
      severity: 'error',
      message: 'Le fournisseur n\'est pas renseigné',
    });
    
    anomalies.push(createAnomaly(
      'fournisseur',
      'reference_manquante',
      'error',
      'Le fournisseur est obligatoire'
    ));
  } else {
    checks.push({
      id: generateCheckId(),
      category: 'supplier',
      name: 'Fournisseur renseigné',
      passed: true,
      severity: 'info',
      message: `Fournisseur : ${bc.fournisseur}`,
    });
    
    // Vérifier historique du fournisseur si disponible
    if (context?.supplierHistory) {
      const history = context.supplierHistory;
      
      if (history.reliability === 'faible') {
        checks.push({
          id: generateCheckId(),
          category: 'supplier',
          name: 'Fiabilité du fournisseur',
          passed: false,
          severity: 'warning',
          message: `Fournisseur peu fiable (${history.reliability})`,
          details: {
            reliability: history.reliability,
            totalOrders: history.totalOrders,
          },
        });
      } else {
        checks.push({
          id: generateCheckId(),
          category: 'supplier',
          name: 'Fiabilité du fournisseur',
          passed: true,
          severity: 'info',
          message: `Fournisseur ${history.reliability} (${history.totalOrders} commandes précédentes)`,
        });
      }
    }
  }
  
  return { checks, anomalies };
}

// ============================================
// Vérification du projet et budget
// ============================================

function checkProject(bc: EnrichedBC, context?: BCAuditContext): {
  checks: BCAuditCheck[];
  anomalies: DocumentAnomaly[];
  recommendations: BCAuditRecommendation[];
} {
  const checks: BCAuditCheck[] = [];
  const anomalies: DocumentAnomaly[] = [];
  const recommendations: BCAuditRecommendation[] = [];
  
  // Vérifier présence du projet
  if (!bc.projet || bc.projet.trim() === '') {
    checks.push({
      id: generateCheckId(),
      category: 'project',
      name: 'Projet renseigné',
      passed: false,
      severity: 'error',
      message: 'Le projet n\'est pas renseigné',
    });
    
    anomalies.push(createAnomaly(
      'projet',
      'reference_manquante',
      'error',
      'Le projet est obligatoire'
    ));
  } else {
    checks.push({
      id: generateCheckId(),
      category: 'project',
      name: 'Projet renseigné',
      passed: true,
      severity: 'info',
      message: `Projet : ${bc.projet}`,
    });
    
    // Vérifier budget si disponible
    if (context?.projectBudget && context.checkBudget) {
      const { total, used, remaining } = context.projectBudget;
      
      if (bc.montantTTC > remaining) {
        checks.push({
          id: generateCheckId(),
          category: 'project',
          name: 'Vérification budget projet',
          passed: false,
          severity: 'error',
          message: `Dépassement budgétaire : ${(bc.montantTTC - remaining).toFixed(2)} FCFA`,
          details: {
            budgetTotal: total,
            budgetUsed: used,
            budgetRemaining: remaining,
            bcAmount: bc.montantTTC,
            overrun: bc.montantTTC - remaining,
          },
        });
        
        anomalies.push(createAnomaly(
          'montantTTC',
          'depassement_budget',
          'error',
          `Dépassement budgétaire du projet. Budget restant : ${remaining.toFixed(2)} FCFA, Montant BC : ${bc.montantTTC.toFixed(2)} FCFA`
        ));
      } else {
        const percentage = (bc.montantTTC / remaining) * 100;
        const severity: AnomalySeverity = percentage > 80 ? 'warning' : 'info';
        
        checks.push({
          id: generateCheckId(),
          category: 'project',
          name: 'Vérification budget projet',
          passed: true,
          severity,
          message: `Budget disponible : ${remaining.toFixed(2)} FCFA (${percentage.toFixed(1)}% du budget restant)`,
          details: {
            budgetTotal: total,
            budgetUsed: used,
            budgetRemaining: remaining,
            bcAmount: bc.montantTTC,
            percentage,
          },
        });
      }
    }
  }
  
  return { checks, anomalies, recommendations };
}

// ============================================
// Fonction principale d'audit
// ============================================

export async function runBCAudit(
  bc: EnrichedBC,
  context?: BCAuditContext
): Promise<BCAuditReport> {
  const auditId = generateAuditId();
  const executedAt = new Date().toISOString();
  const executedBy = context?.executedBy || 'BMO-SYSTEM';
  
  // Convertir en BonCommande pour utiliser le nouveau système d'audit
  const bonCommande = convertEnrichedBCToBonCommande(bc);
  
  // Préparer le contexte pour le nouveau système d'audit
  const domainContext: DomainAuditContext = {
    seuilBmo: 5_000_000, // Seuil par défaut, peut être configuré
    seuilDg: 20_000_000,
    supplierBlackList: [], // Peut être enrichi depuis context
    budgetRemainingByChantier: context?.projectBudget ? {
      [bc.projet]: context.projectBudget.remaining,
    } : undefined,
    lastPricesBySupplierItem: undefined, // Peut être enrichi depuis context
  };
  
  // Exécuter l'audit deep (nouveau système)
  const domainReport = await runBCAuditDeep(bonCommande, domainContext);
  
  // Convertir le rapport du domaine vers BCAuditReport (format legacy)
  const legacyAnomalies: DocumentAnomaly[] = domainReport.anomalies.map(anomaly => ({
    id: anomaly.id,
    field: 'lignes', // Par défaut, peut être enrichi
    type: anomaly.severity === 'critical' ? 'autre' : 
          anomaly.severity === 'error' ? 'autre' : 
          anomaly.severity === 'warning' ? 'autre' : 'autre',
    severity: anomaly.severity === 'critical' ? 'critical' :
              anomaly.severity === 'error' ? 'error' :
              anomaly.severity === 'warning' ? 'warning' : 'info',
    message: `${anomaly.title}: ${anomaly.details}`,
    detectedAt: domainReport.generatedAt,
    detectedBy: executedBy,
    resolved: false,
  }));
  
  const legacyChecks: BCAuditCheck[] = domainReport.checks.map(check => ({
    id: check.id,
    category: check.type === 'nomenclature' ? 'nomenclature' :
              check.type === 'budget' ? 'project' :
              check.type === 'risk' ? 'supplier' :
              check.type === 'conformity' ? 'amount' : 'administrative',
    name: check.label,
    passed: check.status === 'passed',
    severity: check.status === 'failed' ? 'error' :
              check.status === 'warning' ? 'warning' : 'info',
    message: check.details || check.label,
    details: check,
  }));
  
  // Convertir la recommandation
  const recommendations: BCAuditRecommendation[] = [];
  if (domainReport.recommendation === 'request_complement') {
    recommendations.push({
      id: generateRecommendationId(),
      type: 'request_clarification',
      priority: 'high',
      title: 'Demander complément',
      description: domainReport.summary,
      action: 'Demander des clarifications ou documents complémentaires',
    });
  } else if (domainReport.recommendation === 'reject') {
    recommendations.push({
      id: generateRecommendationId(),
      type: 'split_bc',
      priority: 'high',
      title: 'Rejet recommandé',
      description: domainReport.summary,
      action: 'Rejeter le BC',
    });
  }
  
  // Calculer le score et le blocking
  const totalChecks = legacyChecks.length;
  const passedChecks = legacyChecks.filter(c => c.passed).length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
  
  const blocking = domainReport.recommendation === 'reject' || domainReport.risk === 'critical';
  const blockingReasons = domainReport.anomalies
    .filter(a => a.severity === 'error' || a.severity === 'critical')
    .map(a => a.title);
  
  return {
    auditId,
    bcId: bc.id,
    executedAt,
    executedBy,
    isValid: !blocking && score >= 80 && domainReport.recommendation === 'approve',
    riskLevel: domainReport.risk,
    anomalies: legacyAnomalies,
    checks: legacyChecks,
    recommendations,
    score,
    blocking,
    blockingReasons,
  };
}

// ============================================
// Validation des transitions d'état
// ============================================

export function canTransitionBC(
  currentStatus: BCWorkflowStatus,
  targetStatus: BCWorkflowStatus
): boolean {
  const allowedTransitions = BC_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(targetStatus);
}

// ============================================
// Vérifier si l'audit est requis pour valider
// ============================================

export function isAuditRequiredForValidation(
  bc: EnrichedBC,
  auditReport?: BCAuditReport | null
): boolean {
  // WHY: Validation BMO impossible sans audit complet (loupe) pour les BCs en attente
  // Si le BC est en état draft_ba, pending_bmo, audit_required ou in_audit, l'audit est OBLIGATOIRE
  if (bc.status === 'draft_ba' || bc.status === 'pending_bmo' || bc.status === 'audit_required' || bc.status === 'in_audit') {
    // Si pas d'audit OU audit bloquant OU audit non valide, la validation est impossible
    if (!auditReport) {
      return true; // Pas d'audit = validation bloquée
    }
    // Même si audit existe, si bloquant ou non valide, on bloque
    if (auditReport.blocking || !auditReport.isValid) {
      return true;
    }
    // Audit OK mais recommandation non-approve = bloquant
    if (auditReport.domainReport?.recommendation !== 'approve') {
      return true;
    }
  }
  
  return false;
}

