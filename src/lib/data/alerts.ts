/**
 * Données Mock pour le Workspace Alertes & Risques
 * ================================================
 * 
 * Données réalistes pour développement/tests
 */

// ============================================
// TYPES
// ============================================

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';
export type AlertType = 'system' | 'blocked' | 'payment' | 'contract' | 'sla' | 'budget' | 'deadline';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated' | 'ignored';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AlertType;
  status: AlertStatus;
  bureau?: string;
  createdAt: string; // ISO date
  updatedAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  escalatedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  escalatedTo?: string;
  
  // Contexte métier
  relatedId?: string; // ID du dossier/paiement/contrat lié
  relatedType?: 'payment' | 'contract' | 'validation' | 'demand' | 'project';
  responsible?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  daysBlocked?: number;
  amount?: number;
  project?: string;
  
  // Actions disponibles
  actions?: AlertAction[];
  
  // Timeline
  timeline?: AlertTimelineEvent[];
  
  // Métriques
  responseTime?: number; // minutes
  resolutionTime?: number; // minutes
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

export interface AlertTimelineEvent {
  id: string;
  timestamp: string;
  type: 'created' | 'acknowledged' | 'commented' | 'escalated' | 'resolved';
  user: string;
  message: string;
}

export interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  success: number;
  acknowledged: number;
  resolved: number;
  escalated: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // minutes
  byBureau: Record<string, number>;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  timestamp: string;
}

// ============================================
// DONNÉES MOCK
// ============================================

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

export const alerts: Alert[] = [
  // CRITIQUES
  {
    id: 'ALT-2025-001',
    title: 'Paiement bloqué depuis 7 jours',
    description: 'Situation n°4 EIFFAGE - Responsable F. DIOP absent (congés). Blocage de la chaîne de validation.',
    severity: 'critical',
    type: 'blocked',
    status: 'active',
    bureau: 'BF',
    createdAt: daysAgo(7),
    updatedAt: hoursAgo(2),
    relatedId: 'PAY-2025-0041',
    relatedType: 'payment',
    responsible: 'F. DIOP',
    impact: 'critical',
    daysBlocked: 7,
    amount: 8750000,
    project: 'PRJ-0017',
    actions: [
      { id: 'substitute', label: 'Substituer', type: 'primary', icon: 'UserPlus' },
      { id: 'escalate', label: 'Escalader au BMO', type: 'danger', icon: 'AlertTriangle' },
      { id: 'details', label: 'Voir détails', type: 'secondary', icon: 'Eye' },
    ],
    timeline: [
      {
        id: 't1',
        timestamp: daysAgo(7),
        type: 'created',
        user: 'SYSTÈME',
        message: 'Dossier détecté comme bloqué (>5 jours sans mouvement)',
      },
      {
        id: 't2',
        timestamp: daysAgo(5),
        type: 'commented',
        user: 'A. NDIAYE',
        message: 'Responsable en congés jusqu\'au 30/01. Substitution nécessaire.',
      },
      {
        id: 't3',
        timestamp: hoursAgo(2),
        type: 'escalated',
        user: 'SYSTÈME',
        message: 'Escaladé automatiquement (>7 jours sans action)',
      },
    ],
  },
  {
    id: 'ALT-2025-002',
    title: 'Validation bloquée - Justificatifs manquants',
    description: 'Budget PRJ-INFRA-2025-0012 (15M XOF) - Documents manquants pour validation',
    severity: 'critical',
    type: 'blocked',
    status: 'active',
    bureau: 'BF',
    createdAt: daysAgo(6),
    updatedAt: hoursAgo(4),
    relatedId: 'VAL-2025-0089',
    relatedType: 'validation',
    responsible: 'F. DIOP',
    impact: 'critical',
    daysBlocked: 6,
    amount: 15000000,
    project: 'PRJ-INFRA',
    actions: [
      { id: 'request-docs', label: 'Demander justificatifs', type: 'primary', icon: 'FileText' },
      { id: 'escalate', label: 'Escalader', type: 'danger', icon: 'AlertTriangle' },
    ],
    timeline: [
      {
        id: 't1',
        timestamp: daysAgo(6),
        type: 'created',
        user: 'SYSTÈME',
        message: 'Validation bloquée - justificatifs manquants détectés',
      },
      {
        id: 't2',
        timestamp: daysAgo(4),
        type: 'commented',
        user: 'F. DIOP',
        message: 'Demande envoyée au bureau émetteur',
      },
    ],
  },
  {
    id: 'ALT-2025-003',
    title: 'Contrat cadre - Négociation bloquée',
    description: 'Contrat SOGEA SATOM (45M XOF) - Clauses litigieuses depuis 5 jours',
    severity: 'critical',
    type: 'contract',
    status: 'acknowledged',
    bureau: 'BM',
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(1),
    acknowledgedAt: daysAgo(4),
    acknowledgedBy: 'M. BA',
    relatedId: 'CTR-2025-0034',
    relatedType: 'contract',
    responsible: 'M. BA',
    impact: 'high',
    daysBlocked: 5,
    amount: 45000000,
    project: 'PRJ-0017',
    actions: [
      { id: 'resume-nego', label: 'Reprendre négociation', type: 'primary', icon: 'MessageSquare' },
      { id: 'legal', label: 'Consulter juridique', type: 'secondary', icon: 'Scale' },
    ],
    timeline: [
      {
        id: 't1',
        timestamp: daysAgo(5),
        type: 'created',
        user: 'SYSTÈME',
        message: 'Négociation bloquée détectée',
      },
      {
        id: 't2',
        timestamp: daysAgo(4),
        type: 'acknowledged',
        user: 'M. BA',
        message: 'Pris en charge - révision des clauses en cours',
      },
    ],
  },
  {
    id: 'ALT-2025-004',
    title: 'SLA dépassé - Validation BC urgente',
    description: 'BC-2025-0156 (3.2M XOF) - Délai de validation dépassé de 48h',
    severity: 'critical',
    type: 'sla',
    status: 'active',
    bureau: 'BJ',
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(1),
    relatedId: 'BC-2025-0156',
    relatedType: 'validation',
    responsible: 'N. FAYE',
    impact: 'high',
    amount: 3200000,
    project: 'PRJ-0018',
    actions: [
      { id: 'validate', label: 'Valider maintenant', type: 'primary', icon: 'CheckCircle' },
      { id: 'reject', label: 'Rejeter', type: 'danger', icon: 'XCircle' },
    ],
    timeline: [
      {
        id: 't1',
        timestamp: hoursAgo(48),
        type: 'created',
        user: 'SYSTÈME',
        message: 'SLA dépassé - action immédiate requise',
      },
    ],
  },
  {
    id: 'ALT-2025-005',
    title: '4 dossiers bloqués > 5 jours',
    description: 'Détection automatique de dossiers sans mouvement depuis plus de 5 jours',
    severity: 'critical',
    type: 'system',
    status: 'active',
    createdAt: hoursAgo(6),
    impact: 'high',
    actions: [
      { id: 'review', label: 'Voir les dossiers', type: 'primary', icon: 'List' },
      { id: 'bulk-substitute', label: 'Substitutions groupées', type: 'primary', icon: 'Users' },
    ],
  },

  // AVERTISSEMENTS
  {
    id: 'ALT-2025-006',
    title: 'Budget projet INFRA dépassé de 12%',
    description: 'PRJ-INFRA : Budget initial 125M XOF, réalisé 140M XOF (+15M)',
    severity: 'warning',
    type: 'budget',
    status: 'acknowledged',
    bureau: 'BF',
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(12),
    acknowledgedAt: daysAgo(2),
    acknowledgedBy: 'F. DIOP',
    relatedId: 'PRJ-INFRA',
    relatedType: 'project',
    responsible: 'F. DIOP',
    impact: 'medium',
    amount: 140000000,
    project: 'PRJ-INFRA',
    actions: [
      { id: 'adjust-budget', label: 'Ajuster budget', type: 'primary', icon: 'DollarSign' },
      { id: 'report', label: 'Générer rapport', type: 'secondary', icon: 'FileText' },
    ],
    timeline: [
      {
        id: 't1',
        timestamp: daysAgo(3),
        type: 'created',
        user: 'SYSTÈME',
        message: 'Dépassement budgétaire détecté (+10%)',
      },
      {
        id: 't2',
        timestamp: daysAgo(2),
        type: 'acknowledged',
        user: 'F. DIOP',
        message: 'Analyse en cours - travaux supplémentaires validés',
      },
    ],
  },
  {
    id: 'ALT-2025-007',
    title: '5 demandes urgentes en attente',
    description: 'Demandes avec priorité haute en attente depuis plus de 24h',
    severity: 'warning',
    type: 'deadline',
    status: 'active',
    createdAt: hoursAgo(28),
    impact: 'medium',
    actions: [
      { id: 'review-demands', label: 'Voir les demandes', type: 'primary', icon: 'List' },
      { id: 'bulk-assign', label: 'Assigner en lot', type: 'secondary', icon: 'UserPlus' },
    ],
  },
  {
    id: 'ALT-2025-008',
    title: '2 contrats expirent dans 7 jours',
    description: 'Contrats CTR-2024-0089 et CTR-2024-0112 nécessitent renouvellement',
    severity: 'warning',
    type: 'contract',
    status: 'active',
    bureau: 'BCT',
    createdAt: hoursAgo(24),
    impact: 'medium',
    actions: [
      { id: 'renew', label: 'Lancer renouvellement', type: 'primary', icon: 'RefreshCw' },
      { id: 'review', label: 'Voir contrats', type: 'secondary', icon: 'FileText' },
    ],
  },
  {
    id: 'ALT-2025-009',
    title: 'Autorisation travaux Zone C manquante',
    description: 'DEM-2025-0142 bloquée depuis 5j - Documents manquants (permis de construire)',
    severity: 'warning',
    type: 'blocked',
    status: 'active',
    bureau: 'BCT',
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(8),
    relatedId: 'DEM-2025-0142',
    relatedType: 'demand',
    responsible: 'C. GUEYE',
    impact: 'high',
    daysBlocked: 5,
    project: 'PRJ-0018',
    actions: [
      { id: 'request-docs', label: 'Relancer documents', type: 'primary', icon: 'FileText' },
      { id: 'call', label: 'Contacter responsable', type: 'secondary', icon: 'Phone' },
    ],
  },
  {
    id: 'ALT-2025-010',
    title: 'Taux d\'escalade élevé (Bureau BF)',
    description: 'Bureau BF : 8 escalades sur 15 alertes ce mois (53%)',
    severity: 'warning',
    type: 'system',
    status: 'active',
    bureau: 'BF',
    createdAt: hoursAgo(12),
    impact: 'medium',
    actions: [
      { id: 'analyze', label: 'Analyser causes', type: 'primary', icon: 'BarChart' },
      { id: 'training', label: 'Formation équipe', type: 'secondary', icon: 'GraduationCap' },
    ],
  },

  // INFO
  {
    id: 'ALT-2025-011',
    title: 'Nouveau workflow disponible',
    description: 'Workflow de validation accélérée pour BC < 1M XOF maintenant actif',
    severity: 'info',
    type: 'system',
    status: 'active',
    createdAt: hoursAgo(3),
    impact: 'low',
    actions: [
      { id: 'learn-more', label: 'En savoir plus', type: 'secondary', icon: 'Info' },
      { id: 'dismiss', label: 'Ignorer', type: 'secondary', icon: 'X' },
    ],
  },
  {
    id: 'ALT-2025-012',
    title: 'Mise à jour système planifiée',
    description: 'Maintenance système le 15/01/2026 de 02h à 04h (GMT)',
    severity: 'info',
    type: 'system',
    status: 'active',
    createdAt: hoursAgo(18),
    impact: 'low',
    actions: [
      { id: 'details', label: 'Voir détails', type: 'secondary', icon: 'Info' },
    ],
  },

  // SUCCESS / RÉSOLU
  {
    id: 'ALT-2025-013',
    title: 'Backup automatique réussi',
    description: 'Sauvegarde quotidienne effectuée avec succès à 06h00',
    severity: 'success',
    type: 'system',
    status: 'resolved',
    createdAt: hoursAgo(6),
    resolvedAt: hoursAgo(6),
    resolvedBy: 'SYSTÈME',
    impact: 'low',
  },
  {
    id: 'ALT-2025-014',
    title: 'Paiement PAY-2025-0038 validé',
    description: 'Situation n°3 ENTREPRISE CSE (6.5M XOF) validée et payée',
    severity: 'success',
    type: 'payment',
    status: 'resolved',
    bureau: 'BM',
    createdAt: hoursAgo(24),
    resolvedAt: hoursAgo(2),
    resolvedBy: 'M. BA',
    relatedId: 'PAY-2025-0038',
    relatedType: 'payment',
    impact: 'low',
    amount: 6500000,
    resolutionTime: 1320, // 22 heures
  },
  {
    id: 'ALT-2025-015',
    title: 'Contrat CTR-2025-0031 signé',
    description: 'Contrat de fourniture COMPTOIR CERAM finalisé',
    severity: 'success',
    type: 'contract',
    status: 'resolved',
    bureau: 'BJ',
    createdAt: daysAgo(2),
    resolvedAt: hoursAgo(4),
    resolvedBy: 'N. FAYE',
    relatedId: 'CTR-2025-0031',
    relatedType: 'contract',
    impact: 'low',
    amount: 8400000,
    resolutionTime: 2880, // 48 heures
  },
];

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Filtrer les alertes par queue
 */
export function filterAlertsByQueue(queue: string): Alert[] {
  switch (queue) {
    case 'critical':
      return alerts.filter(a => a.severity === 'critical' && a.status === 'active');
    case 'warning':
      return alerts.filter(a => a.severity === 'warning' && a.status === 'active');
    case 'info':
      return alerts.filter(a => a.severity === 'info' && a.status === 'active');
    case 'success':
      return alerts.filter(a => a.severity === 'success');
    case 'acknowledged':
      return alerts.filter(a => a.status === 'acknowledged');
    case 'resolved':
      return alerts.filter(a => a.status === 'resolved');
    case 'escalated':
      return alerts.filter(a => a.status === 'escalated');
    case 'blocked':
      return alerts.filter(a => a.type === 'blocked' && a.status !== 'resolved');
    case 'payment':
      return alerts.filter(a => a.type === 'payment');
    case 'contract':
      return alerts.filter(a => a.type === 'contract');
    case 'sla':
      return alerts.filter(a => a.type === 'sla');
    case 'budget':
      return alerts.filter(a => a.type === 'budget');
    case 'system':
      return alerts.filter(a => a.type === 'system');
    case 'all':
    default:
      return alerts;
  }
}

/**
 * Calculer les statistiques des alertes
 */
export function calculateAlertStats(): AlertStats {
  const now = new Date().toISOString();
  
  const byBureau: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  
  let totalResponseTime = 0;
  let totalResolutionTime = 0;
  let responseCount = 0;
  let resolutionCount = 0;
  
  alerts.forEach(alert => {
    // Par bureau
    if (alert.bureau) {
      byBureau[alert.bureau] = (byBureau[alert.bureau] || 0) + 1;
    }
    
    // Par type
    byType[alert.type] = (byType[alert.type] || 0) + 1;
    
    // Par statut
    byStatus[alert.status] = (byStatus[alert.status] || 0) + 1;
    
    // Temps de réponse
    if (alert.acknowledgedAt && alert.createdAt) {
      const responseTime = new Date(alert.acknowledgedAt).getTime() - new Date(alert.createdAt).getTime();
      totalResponseTime += responseTime / (1000 * 60); // minutes
      responseCount++;
    }
    
    // Temps de résolution
    if (alert.resolutionTime) {
      totalResolutionTime += alert.resolutionTime;
      resolutionCount++;
    } else if (alert.resolvedAt && alert.createdAt) {
      const resolutionTime = new Date(alert.resolvedAt).getTime() - new Date(alert.createdAt).getTime();
      totalResolutionTime += resolutionTime / (1000 * 60); // minutes
      resolutionCount++;
    }
  });
  
  return {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    success: alerts.filter(a => a.severity === 'success').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    escalated: alerts.filter(a => a.status === 'escalated').length,
    avgResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
    avgResolutionTime: resolutionCount > 0 ? Math.round(totalResolutionTime / resolutionCount) : 0,
    byBureau,
    byType,
    byStatus,
    timestamp: now,
  };
}

/**
 * Obtenir une alerte par ID
 */
export function getAlertById(id: string): Alert | undefined {
  return alerts.find(a => a.id === id);
}

/**
 * Rechercher des alertes
 */
export function searchAlerts(query: string): Alert[] {
  const q = query.toLowerCase();
  return alerts.filter(alert =>
    alert.title.toLowerCase().includes(q) ||
    alert.description.toLowerCase().includes(q) ||
    alert.id.toLowerCase().includes(q) ||
    alert.bureau?.toLowerCase().includes(q) ||
    alert.responsible?.toLowerCase().includes(q) ||
    alert.project?.toLowerCase().includes(q)
  );
}

/**
 * Générer des alertes mockées pour les APIs
 * Compatible avec la structure AlertItem de l'API
 */
/** Noms de chantiers/opérations pour les mocks — évite "Sans chantier" sur 100 % des alertes */
const MOCK_PROJECT_NAMES = [
  'Opération Nord', 'Chantier A - Lot 1', 'PRJ-INFRA-2025', 'PRJ-0017', 'PRJ-0018',
  'Contrat SOGEA SATOM', 'BC Validation Zone C', 'Budget INFRA', 'Demande Zone Sud',
  'Paiements Q1', 'Contrats cadre', 'SLA Validation BC', 'Autorisation travaux',
];

export function generateMockAlerts(count: number = 100) {
  const mockAlerts = [];
  const severities: ('critical' | 'warning' | 'info' | 'success')[] = ['critical', 'warning', 'info', 'success'];
  const statuses: ('open' | 'acknowledged' | 'resolved' | 'escalated')[] = ['open', 'acknowledged', 'resolved', 'escalated'];
  const queues: ('critical' | 'warning' | 'sla' | 'blocked' | 'acknowledged' | 'resolved' | 'info')[] =
    ['critical', 'warning', 'sla', 'blocked', 'acknowledged', 'resolved', 'info'];

  const sources = ['System', 'Validation BC', 'Paiements', 'Contrats', 'Budget', 'RH', 'Projets'];
  const tags = ['urgent', 'finance', 'contrat', 'validation', 'sla', 'blocage', 'rh', 'projet'];

  for (let i = 0; i < count; i++) {
    const type = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    // ~85 % avec chantier, ~15 % sans (pour tester le libellé "Sans chantier")
    const projectName = Math.random() < 0.85
      ? MOCK_PROJECT_NAMES[Math.floor(Math.random() * MOCK_PROJECT_NAMES.length)]
      : undefined;

    mockAlerts.push({
      id: `alert-${i + 1}`,
      type,
      title: generateAlertTitle(type),
      description: generateAlertDescription(type),
      source: sources[Math.floor(Math.random() * sources.length)],
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status,
      priority: Math.floor(Math.random() * 10) + 1,
      assignedTo: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 10) + 1}` : null,
      queue: type as (typeof queues)[number],
      tags: [tags[Math.floor(Math.random() * tags.length)], tags[Math.floor(Math.random() * tags.length)]],
      project: projectName ?? null,
      relatedId: projectName ? `PRJ-${String(i + 1).padStart(4, '0')}` : undefined,
      metadata: {
        blocked: Math.random() > 0.9,
        slaReason: Math.random() > 0.8 ? 'Délai de traitement dépassé' : undefined,
      },
    });
  }

  return mockAlerts;
}

function generateAlertTitle(severity: string): string {
  const titles: Record<string, string[]> = {
    critical: [
      'Dépassement budget lot 4',
      'Paiement bloqué - montant critique',
      'Contrat non signé - échéance dépassée',
      'Validation urgente requise',
      'Ressource critique non disponible',
    ],
    warning: [
      'Retard validation BC',
      'Seuil budget atteint à 80%',
      'Document manquant pour validation',
      'Délai de livraison serré',
      'Ressource bientôt indisponible',
    ],
    info: [
      'Jalon J5 atteint',
      'Nouveau document ajouté',
      'Mise à jour planning',
      'Nouvelle demande reçue',
      'Rapport disponible',
    ],
    success: [
      'Validation complétée',
      'Paiement effectué',
      'Contrat signé',
      'Jalon franchi',
      'Livraison confirmée',
    ],
  };
  
  const list = titles[severity] || titles.info;
  return list[Math.floor(Math.random() * list.length)];
}

function generateAlertDescription(severity: string): string {
  const descriptions: Record<string, string[]> = {
    critical: [
      'Action immédiate requise pour éviter un blocage opérationnel',
      'Impact financier significatif si non traité rapidement',
      'Risque de pénalités contractuelles',
      'Blocage de processus critique identifié',
      'Escalade nécessaire au niveau direction',
    ],
    warning: [
      'Attention requise dans les prochaines 48h',
      'Risque de dépassement si non surveillé',
      'Information manquante pour continuer',
      'Vérification supplémentaire nécessaire',
      'Suivi rapproché recommandé',
    ],
    info: [
      'Information à des fins de suivi',
      'Notification de mise à jour',
      'Progression normale du dossier',
      'Événement planifié réalisé',
      'Mise à jour de statut',
    ],
    success: [
      'Opération terminée avec succès',
      'Objectif atteint',
      'Validation obtenue',
      'Processus complété',
      'Résolution confirmée',
    ],
  };
  
  const list = descriptions[severity] || descriptions.info;
  return list[Math.floor(Math.random() * list.length)];
}

