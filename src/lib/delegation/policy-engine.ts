/**
 * Moteur de règles pour les délégations de pouvoirs
 * ==================================================
 * 
 * Ce module évalue si une action est autorisée selon :
 * - Le périmètre de la délégation
 * - Les limites (montants, quotas)
 * - Les politiques spécifiques
 * - Les contrôles requis
 * 
 * Il produit un verdict clair : AUTORISÉ / REFUSÉ / EN ATTENTE DE CONTRÔLE
 * avec les motifs et les recommandations.
 */

import type {
  DelegationFull,
  DelegationPolicy,
  ActionContext,
  PolicyEvaluationResult,
  DelegationRisk,
  DelegationRiskType,
  EvaluationResult,
  ScopeMode,
  WeekDay,
} from './types';

// ============================================
// HELPERS
// ============================================

/** Vérifie si une valeur est dans le périmètre */
function isInScope(
  value: string | undefined,
  mode: ScopeMode,
  list: string[] | undefined
): boolean {
  if (!value) return true; // Pas de valeur = pas de restriction
  if ((mode as string) === 'ALL') return true;
  if (!list || list.length === 0) return (mode as string) === 'ALL';
  
  const inList = list.includes(value);
  return mode === 'INCLUDE' ? inList : !inList;
}

/** Vérifie si l'heure courante est dans la fenêtre autorisée */
function isWithinAllowedHours(
  allowedStart: number | undefined,
  allowedEnd: number | undefined,
  now: Date = new Date()
): { allowed: boolean; reason?: string } {
  if (allowedStart == null || allowedEnd == null) {
    return { allowed: true };
  }
  
  const hour = now.getHours();
  
  // Gestion des fenêtres qui passent minuit (ex: 22h - 6h)
  if (allowedStart <= allowedEnd) {
    // Fenêtre normale (ex: 8h - 18h)
    const allowed = hour >= allowedStart && hour < allowedEnd;
    return {
      allowed,
      reason: allowed ? undefined : `Heure non autorisée (${hour}h ∉ [${allowedStart}h-${allowedEnd}h]).`,
    };
  } else {
    // Fenêtre qui passe minuit (ex: 22h - 6h)
    const allowed = hour >= allowedStart || hour < allowedEnd;
    return {
      allowed,
      reason: allowed ? undefined : `Heure non autorisée (${hour}h ∉ [${allowedStart}h-${allowedEnd}h]).`,
    };
  }
}

/** Vérifie si le jour est autorisé */
function isAllowedDay(
  allowedDays: WeekDay[] | undefined,
  now: Date = new Date()
): { allowed: boolean; reason?: string } {
  if (!allowedDays || allowedDays.length === 0) {
    return { allowed: true };
  }
  
  const dayMap: WeekDay[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const todayCode = dayMap[now.getDay()];
  const allowed = allowedDays.includes(todayCode);
  
  return {
    allowed,
    reason: allowed ? undefined : `Jour non autorisé (${todayCode} ∉ [${allowedDays.join(', ')}]).`,
  };
}

/** Formatte un montant */
function formatAmount(amount: number, currency: string = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// ÉVALUATION DU PÉRIMÈTRE
// ============================================

interface ScopeEvaluationResult {
  inScope: boolean;
  reasons: string[];
}

function evaluateScope(
  delegation: DelegationFull,
  ctx: ActionContext
): ScopeEvaluationResult {
  const reasons: string[] = [];
  
  // Vérifier le projet
  if (ctx.projectId) {
    if (!isInScope(ctx.projectId, delegation.projectScopeMode, delegation.projectScopeList)) {
      reasons.push(`Projet "${ctx.projectName || ctx.projectId}" hors périmètre.`);
    }
  }
  
  // Vérifier le bureau
  if (!isInScope(ctx.bureau, delegation.bureauScopeMode, delegation.bureauScopeList)) {
    reasons.push(`Bureau "${ctx.bureau}" hors périmètre.`);
  }
  
  // Vérifier le fournisseur
  if (ctx.supplierId) {
    if (!isInScope(ctx.supplierId, delegation.supplierScopeMode, delegation.supplierScopeList)) {
      reasons.push(`Fournisseur "${ctx.supplierName || ctx.supplierId}" hors périmètre.`);
    }
  }
  
  // Vérifier la catégorie
  if (ctx.category && delegation.categoryScopeList?.length) {
    if (!delegation.categoryScopeList.includes(ctx.category)) {
      reasons.push(`Catégorie "${ctx.category}" non autorisée.`);
    }
  }
  
  return {
    inScope: reasons.length === 0,
    reasons,
  };
}

// ============================================
// ÉVALUATION DES LIMITES
// ============================================

interface LimitsEvaluationResult {
  withinLimits: boolean;
  reasons: string[];
  warnings: string[];
}

function evaluateLimits(
  delegation: DelegationFull,
  ctx: ActionContext,
  now: Date = new Date()
): LimitsEvaluationResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  
  // Vérifier la devise
  if (ctx.currency !== delegation.currency) {
    reasons.push(`Devise non autorisée (${ctx.currency} ≠ ${delegation.currency}).`);
  }
  
  // Vérifier le montant par opération
  if (delegation.maxAmount != null && ctx.amount > delegation.maxAmount) {
    reasons.push(
      `Montant ${formatAmount(ctx.amount, ctx.currency)} > plafond par opération ${formatAmount(delegation.maxAmount, delegation.currency)}.`
    );
  }
  
  // Vérifier le plafond cumulé
  if (delegation.maxTotalAmount != null) {
    const newTotal = delegation.usageTotalAmount + ctx.amount;
    if (newTotal > delegation.maxTotalAmount) {
      reasons.push(
        `Cumul après opération ${formatAmount(newTotal, delegation.currency)} > plafond total ${formatAmount(delegation.maxTotalAmount, delegation.currency)}.`
      );
    }
    
    // Alerte si proche du plafond (> 80%)
    const ratio = newTotal / delegation.maxTotalAmount;
    if (ratio > 0.8 && ratio <= 1) {
      warnings.push(
        `Attention : ${Math.round(ratio * 100)}% du plafond cumulé atteint après cette opération.`
      );
    }
  }
  
  // Vérifier les quotas d'opérations
  // Note: dans une vraie implémentation, il faudrait requêter la BDD pour les compteurs du jour/mois
  
  // Vérifier les fenêtres horaires
  const hourCheck = isWithinAllowedHours(delegation.allowedHoursStart, delegation.allowedHoursEnd, now);
  if (!hourCheck.allowed && hourCheck.reason) {
    reasons.push(hourCheck.reason);
  }
  
  // Vérifier le jour
  const dayCheck = isAllowedDay(delegation.allowedDays, now);
  if (!dayCheck.allowed && dayCheck.reason) {
    reasons.push(dayCheck.reason);
  }
  
  return {
    withinLimits: reasons.length === 0,
    reasons,
    warnings,
  };
}

// ============================================
// ÉVALUATION D'UNE POLICY
// ============================================

function evaluatePolicy(
  policy: DelegationPolicy,
  ctx: ActionContext,
  delegation: DelegationFull
): {
  matches: boolean;
  allowed: boolean;
  reasons: string[];
  controls: { dual: boolean; legal: boolean; finance: boolean; stepUp: boolean };
} {
  // Vérifier si cette policy correspond à l'action demandée
  if (policy.action !== ctx.action) {
    return {
      matches: false,
      allowed: false,
      reasons: [],
      controls: { dual: false, legal: false, finance: false, stepUp: false },
    };
  }
  
  if (!policy.enabled) {
    return {
      matches: true,
      allowed: false,
      reasons: ['Politique désactivée.'],
      controls: { dual: false, legal: false, finance: false, stepUp: false },
    };
  }
  
  const reasons: string[] = [];
  
  // Vérifier la devise
  if (policy.currency && ctx.currency !== policy.currency) {
    reasons.push(`Devise ${ctx.currency} non autorisée par cette politique.`);
  }
  
  // Vérifier le montant
  if (policy.maxAmount != null && ctx.amount > policy.maxAmount) {
    reasons.push(
      `Montant ${formatAmount(ctx.amount, ctx.currency)} > plafond politique ${formatAmount(policy.maxAmount, policy.currency)}.`
    );
  }
  
  // Vérifier les projets (si la policy a une liste spécifique)
  if (policy.allowedProjects?.length && ctx.projectId) {
    if (!policy.allowedProjects.includes(ctx.projectId)) {
      reasons.push(`Projet non couvert par cette politique.`);
    }
  }
  
  // Vérifier les bureaux
  if (policy.allowedBureaux?.length) {
    if (!policy.allowedBureaux.includes(ctx.bureau)) {
      reasons.push(`Bureau non couvert par cette politique.`);
    }
  }
  
  // Vérifier les fournisseurs
  if (ctx.supplierId) {
    if (policy.excludedSuppliers?.includes(ctx.supplierId)) {
      reasons.push(`Fournisseur exclu par cette politique.`);
    }
    if (policy.allowedSuppliers?.length && !policy.allowedSuppliers.includes(ctx.supplierId)) {
      reasons.push(`Fournisseur hors liste autorisée par cette politique.`);
    }
  }
  
  // Vérifier les catégories
  if (ctx.category && policy.allowedCategories?.length) {
    if (!policy.allowedCategories.includes(ctx.category)) {
      reasons.push(`Catégorie non autorisée par cette politique.`);
    }
  }
  
  // Déterminer les contrôles requis
  let stepUp = policy.requiresStepUpAuth;
  if (policy.stepUpThreshold != null && ctx.amount >= policy.stepUpThreshold) {
    stepUp = true;
  }
  
  return {
    matches: true,
    allowed: reasons.length === 0,
    reasons,
    controls: {
      dual: policy.requiresDualControl,
      legal: policy.requiresLegalReview,
      finance: policy.requiresFinanceCheck,
      stepUp,
    },
  };
}

// ============================================
// DÉTECTION DES RISQUES
// ============================================

function detectRisks(
  delegation: DelegationFull,
  ctx: ActionContext,
  scopeResult: ScopeEvaluationResult,
  limitsResult: LimitsEvaluationResult
): DelegationRisk[] {
  const risks: DelegationRisk[] = [];
  const now = new Date();
  
  // Risque de dépassement budget
  if (delegation.maxTotalAmount) {
    const ratio = (delegation.usageTotalAmount + ctx.amount) / delegation.maxTotalAmount;
    if (ratio > 0.9) {
      risks.push({
        type: 'BUDGET_OVERRUN',
        level: ratio > 1 ? 'CRITICAL' : 'HIGH',
        description: `Plafond cumulé atteint à ${Math.round(ratio * 100)}%.`,
        mitigation: 'Demander une extension de plafond ou une nouvelle délégation.',
        detectedAt: now,
      });
    }
  }
  
  // Risque de conflit d'intérêts
  if (ctx.requesterId === delegation.delegate.id) {
    risks.push({
      type: 'CONFLICT_OF_INTEREST',
      level: 'HIGH',
      description: 'Le délégataire valide sa propre demande.',
      mitigation: 'Activer le dual control obligatoire.',
      detectedAt: now,
    });
  }
  
  // Risque de rupture de continuité (délégation proche expiration)
  const daysToExpiry = Math.ceil((delegation.endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysToExpiry <= 7 && daysToExpiry > 0) {
    risks.push({
      type: 'CONTINUITY',
      level: daysToExpiry <= 2 ? 'HIGH' : 'MEDIUM',
      description: `Délégation expire dans ${daysToExpiry} jour(s).`,
      mitigation: 'Prolonger la délégation ou préparer une relève.',
      detectedAt: now,
    });
  }
  
  // Risque de non-conformité (usage hors périmètre tenté)
  if (!scopeResult.inScope) {
    risks.push({
      type: 'COMPLIANCE',
      level: 'HIGH',
      description: 'Tentative d\'usage hors périmètre autorisé.',
      mitigation: 'Élargir le périmètre ou utiliser une autre délégation.',
      detectedAt: now,
    });
  }
  
  // Risque de contestation (montant élevé sans dual control)
  if (ctx.amount > 10_000_000 && !delegation.requiresDualControl) {
    risks.push({
      type: 'CONTESTATION',
      level: 'MEDIUM',
      description: 'Montant élevé sans double validation.',
      mitigation: 'Activer le dual control pour les montants > 10M XOF.',
      detectedAt: now,
    });
  }
  
  // Risque de fraude (usage atypique)
  // Ex: usage hors heures normales
  const hour = now.getHours();
  if (hour < 7 || hour > 20) {
    risks.push({
      type: 'FRAUD',
      level: 'LOW',
      description: 'Usage en dehors des heures de bureau habituelles.',
      mitigation: 'Vérifier le contexte de l\'opération.',
      detectedAt: now,
    });
  }
  
  return risks;
}

// ============================================
// ÉVALUATION PRINCIPALE
// ============================================

export interface EvaluateOptions {
  now?: Date;
  skipTimeChecks?: boolean;
}

/**
 * Évalue si une action est autorisée selon la délégation
 */
export function evaluate(
  delegation: DelegationFull,
  ctx: ActionContext,
  options: EvaluateOptions = {}
): PolicyEvaluationResult {
  const now = options.now ?? new Date();
  const reasons: string[] = [];
  const recommendations: string[] = [];
  
  // ================================
  // 1. Vérifications de base
  // ================================
  
  // Statut de la délégation
  if (delegation.status !== 'active') {
    return {
      allowed: false,
      result: 'DENIED',
      reasons: [`Délégation non active (statut: ${delegation.status}).`],
      controls: { dual: false, legal: false, finance: false, stepUp: false },
      riskLevel: 'CRITICAL',
      recommendations: ['Utiliser une délégation active ou réactiver celle-ci.'],
    };
  }
  
  // Période de validité
  if (now < delegation.startsAt) {
    return {
      allowed: false,
      result: 'DENIED',
      reasons: [`Délégation pas encore active (début: ${delegation.startsAt.toLocaleDateString('fr-FR')}).`],
      controls: { dual: false, legal: false, finance: false, stepUp: false },
      riskLevel: 'HIGH',
      recommendations: ['Attendre la date de début ou utiliser une autre délégation.'],
    };
  }
  
  if (now > delegation.endsAt) {
    return {
      allowed: false,
      result: 'DENIED',
      reasons: [`Délégation expirée (fin: ${delegation.endsAt.toLocaleDateString('fr-FR')}).`],
      controls: { dual: false, legal: false, finance: false, stepUp: false },
      riskLevel: 'CRITICAL',
      recommendations: ['Prolonger la délégation ou en créer une nouvelle.'],
    };
  }
  
  // ================================
  // 2. Évaluation du périmètre
  // ================================
  const scopeResult = evaluateScope(delegation, ctx);
  if (!scopeResult.inScope) {
    reasons.push(...scopeResult.reasons);
  }
  
  // ================================
  // 3. Évaluation des limites
  // ================================
  const limitsResult = options.skipTimeChecks
    ? { withinLimits: true, reasons: [], warnings: [] }
    : evaluateLimits(delegation, ctx, now);
  
  if (!limitsResult.withinLimits) {
    reasons.push(...limitsResult.reasons);
  }
  recommendations.push(...limitsResult.warnings);
  
  // ================================
  // 4. Évaluation des policies
  // ================================
  let matchedPolicy: DelegationPolicy | undefined;
  let policyControls = { dual: false, legal: false, finance: false, stepUp: false };
  let policyAllowed = true;
  
  // Chercher une policy qui correspond à l'action
  for (const policy of delegation.policies) {
    const policyResult = evaluatePolicy(policy, ctx, delegation);
    
    if (policyResult.matches) {
      matchedPolicy = policy;
      policyAllowed = policyResult.allowed;
      
      if (!policyResult.allowed) {
        reasons.push(...policyResult.reasons);
      }
      
      // Fusionner les contrôles (OR logique)
      policyControls = {
        dual: policyControls.dual || policyResult.controls.dual,
        legal: policyControls.legal || policyResult.controls.legal,
        finance: policyControls.finance || policyResult.controls.finance,
        stepUp: policyControls.stepUp || policyResult.controls.stepUp,
      };
      
      break; // On prend la première policy qui match
    }
  }
  
  // Si aucune policy ne correspond à l'action
  if (!matchedPolicy) {
    reasons.push(`Aucune politique ne couvre l'action "${ctx.action}".`);
    recommendations.push('Ajouter une politique pour cette action ou utiliser une autre délégation.');
  }
  
  // ================================
  // 5. Fusionner les contrôles généraux
  // ================================
  const finalControls = {
    dual: policyControls.dual || delegation.requiresDualControl,
    legal: policyControls.legal || delegation.requiresLegalReview,
    finance: policyControls.finance || delegation.requiresFinanceCheck,
    stepUp: policyControls.stepUp || delegation.requiresStepUpAuth,
  };
  
  // ================================
  // 6. Déterminer le résultat
  // ================================
  const allowed = reasons.length === 0;
  
  let result: EvaluationResult;
  if (!allowed) {
    result = 'DENIED';
  } else if (finalControls.dual || finalControls.legal || finalControls.finance) {
    result = 'PENDING_CONTROL';
  } else {
    result = 'ALLOWED';
  }
  
  // ================================
  // 7. Détecter les risques
  // ================================
  const risks = detectRisks(delegation, ctx, scopeResult, limitsResult);
  
  // Calculer le niveau de risque global
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (risks.some(r => r.level === 'CRITICAL')) riskLevel = 'CRITICAL';
  else if (risks.some(r => r.level === 'HIGH')) riskLevel = 'HIGH';
  else if (risks.some(r => r.level === 'MEDIUM')) riskLevel = 'MEDIUM';
  
  // ================================
  // 8. Générer les recommandations
  // ================================
  if (result === 'PENDING_CONTROL') {
    if (finalControls.dual) {
      recommendations.push('Double validation requise avant exécution.');
    }
    if (finalControls.legal) {
      recommendations.push('Visa juridique requis.');
    }
    if (finalControls.finance) {
      recommendations.push('Visa finance/DAF requis.');
    }
    if (finalControls.stepUp) {
      recommendations.push('Confirmation renforcée (2FA) requise.');
    }
  }
  
  for (const risk of risks) {
    if (risk.mitigation) {
      recommendations.push(risk.mitigation);
    }
  }
  
  return {
    allowed,
    result,
    reasons,
    controls: finalControls,
    matchedPolicy,
    riskLevel,
    recommendations: [...new Set(recommendations)], // Dédupliquer
  };
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Vérifie rapidement si une délégation peut potentiellement autoriser une action
 * (sans évaluation complète)
 */
export function canPotentiallyAuthorize(
  delegation: DelegationFull,
  action: ActionContext['action']
): boolean {
  if (delegation.status !== 'active') return false;
  
  const now = new Date();
  if (now < delegation.startsAt || now > delegation.endsAt) return false;
  
  return delegation.policies.some(p => p.action === action && p.enabled);
}

/**
 * Trouve toutes les délégations qui pourraient autoriser une action
 */
export function findMatchingDelegations(
  delegations: DelegationFull[],
  ctx: ActionContext
): Array<{ delegation: DelegationFull; evaluation: PolicyEvaluationResult }> {
  return delegations
    .filter(d => canPotentiallyAuthorize(d, ctx.action))
    .map(delegation => ({
      delegation,
      evaluation: evaluate(delegation, ctx),
    }))
    .sort((a, b) => {
      // Trier par: autorisé > en attente > refusé, puis par niveau de risque
      const resultOrder = { ALLOWED: 0, PENDING_CONTROL: 1, DENIED: 2 };
      const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
      
      const resultDiff = resultOrder[a.evaluation.result] - resultOrder[b.evaluation.result];
      if (resultDiff !== 0) return resultDiff;
      
      return riskOrder[a.evaluation.riskLevel] - riskOrder[b.evaluation.riskLevel];
    });
}

/**
 * Génère un résumé lisible de l'évaluation
 */
export function formatEvaluationSummary(result: PolicyEvaluationResult): string {
  const lines: string[] = [];
  
  switch (result.result) {
    case 'ALLOWED':
      lines.push('✅ AUTORISÉ');
      break;
    case 'PENDING_CONTROL':
      lines.push('⏳ EN ATTENTE DE CONTRÔLE');
      break;
    case 'DENIED':
      lines.push('❌ REFUSÉ');
      break;
  }
  
  if (result.reasons.length > 0) {
    lines.push('');
    lines.push('Motifs :');
    result.reasons.forEach(r => lines.push(`  • ${r}`));
  }
  
  if (result.result === 'PENDING_CONTROL') {
    lines.push('');
    lines.push('Contrôles requis :');
    if (result.controls.dual) lines.push('  • Double validation');
    if (result.controls.legal) lines.push('  • Visa juridique');
    if (result.controls.finance) lines.push('  • Visa finance');
    if (result.controls.stepUp) lines.push('  • Confirmation renforcée (2FA)');
  }
  
  if (result.recommendations.length > 0) {
    lines.push('');
    lines.push('Recommandations :');
    result.recommendations.forEach(r => lines.push(`  💡 ${r}`));
  }
  
  lines.push('');
  lines.push(`Niveau de risque : ${result.riskLevel}`);
  
  return lines.join('\n');
}

