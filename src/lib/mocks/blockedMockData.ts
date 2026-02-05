/**
 * ====================================================================
 * MOCK DATA - Dossiers Bloqués
 * Données réalistes et complètes pour développement et tests
 * ====================================================================
 */

import type { BlockedDossier } from '@/lib/types/bmo.types';

// ================================
// UTILISATEURS
// ================================

export const mockUsers = {
  // BMO
  bmo1: {
    id: 'user-bmo-001',
    name: 'Amadou SECK',
    role: 'BMO',
    fonction: 'Bureau Maître d\'Ouvrage',
    email: 'amadou.seck@bmo.sn',
    bureau: 'Dakar',
    permissions: ['substitution', 'arbitrage', 'all'],
  },
  // DAF
  daf1: {
    id: 'user-daf-001',
    name: 'Marie FALL',
    role: 'DAF',
    fonction: 'Direction Administrative et Financière',
    email: 'marie.fall@daf.sn',
    bureau: 'Dakar',
    permissions: ['validation', 'escalation'],
  },
  // Chefs Service
  chef1: {
    id: 'user-chef-001',
    name: 'Jean DIOP',
    role: 'Chef Service',
    fonction: 'Chef Service Validation',
    email: 'jean.diop@service.sn',
    bureau: 'Dakar',
    permissions: ['validation', 'comment'],
  },
  chef2: {
    id: 'user-chef-002',
    name: 'Fatou NDIAYE',
    role: 'Chef Service',
    fonction: 'Chef Service Comptabilité',
    email: 'fatou.ndiaye@service.sn',
    bureau: 'Thiès',
    permissions: ['validation', 'comment'],
  },
  // Validateurs
  val1: {
    id: 'user-val-001',
    name: 'Ibrahima BA',
    role: 'Validateur',
    fonction: 'Contrôleur Senior',
    email: 'ibrahima.ba@control.sn',
    bureau: 'Dakar',
    permissions: ['validation'],
  },
  val2: {
    id: 'user-val-002',
    name: 'Aissatou SOW',
    role: 'Validateur',
    fonction: 'Validateur Finance',
    email: 'aissatou.sow@finance.sn',
    bureau: 'Saint-Louis',
    permissions: ['validation'],
  },
  // DG
  dg1: {
    id: 'user-dg-001',
    name: 'Ousmane DIALLO',
    role: 'DG',
    fonction: 'Direction Générale',
    email: 'ousmane.diallo@dg.sn',
    bureau: 'Dakar',
    permissions: ['all'],
  },
};

// ================================
// TYPES DE BLOCAGE
// ================================

export const blockageTypes = [
  {
    id: 'signature-manquante',
    label: 'Signature manquante',
    description: 'Validateur absent ou indisponible',
    frequency: 'high',
    avgResolutionDays: 2,
  },
  {
    id: 'document-invalide',
    label: 'Document invalide',
    description: 'Pièce justificative manquante ou incorrecte',
    frequency: 'medium',
    avgResolutionDays: 3,
  },
  {
    id: 'budget-insuffisant',
    label: 'Budget insuffisant',
    description: 'Enveloppe budgétaire dépassée',
    frequency: 'medium',
    avgResolutionDays: 5,
  },
  {
    id: 'conflit-autorite',
    label: 'Conflit d\'autorité',
    description: 'Désaccord entre services',
    frequency: 'low',
    avgResolutionDays: 7,
  },
  {
    id: 'delai-depassement',
    label: 'Dépassement délai',
    description: 'SLA expiré sans action',
    frequency: 'high',
    avgResolutionDays: 1,
  },
];

// ================================
// DOCUMENTS TYPES
// ================================

export const mockDocuments = [
  {
    id: 'doc-001',
    name: 'BC_2024_12345.pdf',
    type: 'application/pdf',
    category: 'bc',
    size: 2456789,
    uploadedBy: mockUsers.chef1.name,
    uploadedAt: '2026-01-08T10:15:00.000Z',
    url: '/documents/bc_2024_12345.pdf',
  },
  {
    id: 'doc-002',
    name: 'Facture_SENELEC_DEC2025.pdf',
    type: 'application/pdf',
    category: 'facture',
    size: 1234567,
    uploadedBy: mockUsers.val1.name,
    uploadedAt: '2026-01-08T11:30:00.000Z',
    url: '/documents/facture_senelec.pdf',
  },
  {
    id: 'doc-003',
    name: 'Contrat_Cadre_2025.pdf',
    type: 'application/pdf',
    category: 'contrat',
    size: 5678901,
    uploadedBy: 'Système',
    uploadedAt: '2026-01-08T10:00:00.000Z',
    url: '/documents/contrat_cadre.pdf',
  },
  {
    id: 'doc-004',
    name: 'Justificatif_Absence_DAF.pdf',
    type: 'application/pdf',
    category: 'justificatif',
    size: 456789,
    uploadedBy: mockUsers.daf1.name,
    uploadedAt: '2026-01-09T09:15:00.000Z',
    url: '/documents/justificatif_absence.pdf',
  },
  {
    id: 'doc-005',
    name: 'RIB_SENELEC.pdf',
    type: 'application/pdf',
    category: 'rib',
    size: 234567,
    uploadedBy: 'Système',
    uploadedAt: '2026-01-08T10:00:00.000Z',
    url: '/documents/rib_senelec.pdf',
  },
];

// ================================
// COMMENTAIRES
// ================================

export const mockComments = [
  {
    id: 'comment-001',
    author: mockUsers.chef1.name,
    authorId: mockUsers.chef1.id,
    role: mockUsers.chef1.role,
    content: 'Blocage identifié : signature manquante du validateur @MarieFALL. Fournisseur SENELEC exige règlement urgent sous 48h pour éviter coupure électricité.',
    createdAt: '2026-01-08T14:30:00.000Z',
    mentions: [mockUsers.daf1.name],
    attachments: [],
  },
  {
    id: 'comment-002',
    author: mockUsers.daf1.name,
    authorId: mockUsers.daf1.id,
    role: mockUsers.daf1.role,
    content: 'Validateur principal absent (congé maladie 5 jours). Demande substitution ou escalade BMO pour déblocage urgent. Impact critique sur trésorerie.',
    createdAt: '2026-01-09T09:15:00.000Z',
    mentions: [mockUsers.bmo1.name],
    attachments: [
      {
        id: 'att-001',
        name: 'justificatif_absence.pdf',
        url: '/docs/justificatif_absence.pdf',
        size: 456789,
      },
    ],
  },
  {
    id: 'comment-003',
    author: mockUsers.bmo1.name,
    authorId: mockUsers.bmo1.id,
    role: mockUsers.bmo1.role,
    content: 'Substitution approuvée. @IbrahimaBA désigné comme validateur temporaire (7 jours). Procédure d\'urgence activée compte tenu de l\'impact critique.',
    createdAt: '2026-01-09T10:30:00.000Z',
    mentions: [mockUsers.val1.name],
    attachments: [],
  },
];

// ================================
// TIMELINE EVENTS
// ================================

export const mockTimelineEvents = [
  {
    id: 'timeline-001',
    type: 'status' as const,
    title: 'Dossier détecté comme bloqué',
    description: 'Détection automatique via système SLA - Délai validation dépassé',
    actor: 'Système',
    actorId: 'system',
    timestamp: '2026-01-08T10:00:00.000Z',
    metadata: { trigger: 'sla_expired', delayDays: 5 },
  },
  {
    id: 'timeline-002',
    type: 'assignment' as const,
    title: 'Assigné à Jean DIOP',
    description: 'Responsable: Chef Service Validation - Bureau Dakar',
    actor: 'Système',
    actorId: 'system',
    timestamp: '2026-01-08T10:05:00.000Z',
    metadata: { assignedTo: mockUsers.chef1.id },
  },
  {
    id: 'timeline-003',
    type: 'comment' as const,
    title: 'Commentaire ajouté',
    description: 'Blocage identifié : signature manquante',
    actor: mockUsers.chef1.name,
    actorId: mockUsers.chef1.id,
    timestamp: '2026-01-08T14:30:00.000Z',
    metadata: { commentId: 'comment-001' },
  },
  {
    id: 'timeline-004',
    type: 'document' as const,
    title: 'Document ajouté',
    description: 'Justificatif d\'absence du validateur',
    actor: mockUsers.daf1.name,
    actorId: mockUsers.daf1.id,
    timestamp: '2026-01-09T09:15:00.000Z',
    metadata: { documentId: 'doc-004' },
  },
  {
    id: 'timeline-005',
    type: 'escalation' as const,
    title: 'Escaladé vers BMO',
    description: 'Demande substitution validateur pour déblocage urgent',
    actor: mockUsers.chef1.name,
    actorId: mockUsers.chef1.id,
    timestamp: '2026-01-09T08:00:00.000Z',
    metadata: { escalatedTo: 'bmo', reason: 'validateur_absent' },
  },
  {
    id: 'timeline-006',
    type: 'resolution' as const,
    title: 'Substitution BMO approuvée',
    description: 'Ibrahima BA désigné comme validateur temporaire (7 jours)',
    actor: mockUsers.bmo1.name,
    actorId: mockUsers.bmo1.id,
    timestamp: '2026-01-09T10:30:00.000Z',
    metadata: {
      resolutionType: 'substitution',
      remplacant: mockUsers.val1.id,
      duree: 7,
    },
  },
];

// ================================
// ACTIONS SUGGÉRÉES (IA)
// ================================

export const mockSuggestedActions = [
  {
    id: 'action-001',
    type: 'substitution' as const,
    title: 'Substitution validateur',
    description: 'Remplacer validateur absent par suppléant disponible (Ibrahima BA)',
    confidence: 0.92,
    impact: 'high' as const,
    effort: 'low' as const,
    reasoning: 'Validateur suppléant disponible et autorisé. Procédure standard déjà testée 15 fois.',
    estimatedTime: '2h',
    successRate: 0.95,
  },
  {
    id: 'action-002',
    type: 'escalation' as const,
    title: 'Escalade DG',
    description: 'Escalader vers Direction Générale pour décision rapide',
    confidence: 0.78,
    impact: 'high' as const,
    effort: 'medium' as const,
    reasoning: 'Impact financier critique (15M FCFA). DG peut débloquer en urgence.',
    estimatedTime: '4-6h',
    successRate: 0.82,
  },
  {
    id: 'action-003',
    type: 'arbitration' as const,
    title: 'Arbitrage BMO',
    description: 'Décision BMO pour déblocage immédiat (pouvoir suprême)',
    confidence: 0.85,
    impact: 'high' as const,
    effort: 'low' as const,
    reasoning: 'Contexte d\'urgence établi. BMO peut trancher définitivement.',
    estimatedTime: '1-2h',
    successRate: 0.98,
  },
];

// ================================
// WORKFLOW STEPS
// ================================

export const mockWorkflowSteps = [
  {
    id: 'step-001',
    name: 'Détection',
    status: 'completed' as const,
    responsable: 'Système',
    responsableId: 'system',
    date: '2026-01-08T10:00:00.000Z',
    duration: 0,
    description: 'Détection automatique du blocage via SLA',
  },
  {
    id: 'step-002',
    name: 'Analyse',
    status: 'current' as const,
    responsable: mockUsers.chef1.name,
    responsableId: mockUsers.chef1.id,
    date: '2026-01-08T14:00:00.000Z',
    duration: 48,
    description: 'Identification cause racine et parties prenantes',
  },
  {
    id: 'step-003',
    name: 'Résolution',
    status: 'pending' as const,
    responsable: 'À assigner',
    responsableId: null,
    date: null,
    duration: null,
    description: 'Application solution (substitution, escalade, déblocage)',
  },
  {
    id: 'step-004',
    name: 'Validation',
    status: 'pending' as const,
    responsable: 'DAF / BMO',
    responsableId: null,
    date: null,
    duration: null,
    description: 'Validation finale et fermeture dossier',
  },
];

// ================================
// IMPACT ANALYSIS
// ================================

export const mockImpactAnalysis = {
  financial: {
    amount: 15000000,
    currency: 'FCFA',
    description: 'Retard paiement fournisseur SENELEC + pénalités contractuelles (2% par jour)',
    breakdown: [
      { item: 'Montant facture', amount: 15000000 },
      { item: 'Pénalités retard (5 jours)', amount: 1500000 },
      { item: 'Risque contentieux', amount: 5000000 },
    ],
    totalRisk: 21500000,
  },
  operational: {
    score: 85,
    description: 'Blocage workflow validation BC, 12 dossiers en attente aval',
    affected: [
      'Validation BC',
      'Gestion Fournisseurs',
      'Comptabilité',
      'Paiements',
    ],
    blockedProcesses: 12,
    estimatedDelay: '3-5 jours',
  },
  reputational: {
    score: 70,
    description: 'Risque contentieux fournisseur SENELEC (fournisseur stratégique)',
    stakeholders: [
      'SENELEC (fournisseur stratégique)',
      'DAF',
      'Direction Générale',
      'Contrôle de Gestion',
    ],
    riskLevel: 'high',
    publicExposure: 'medium',
  },
};

// ================================
// SLA CONFIGURATION
// ================================

export const mockSLAConfig = {
  default: {
    detectionToAnalysis: 4, // heures
    analysisToResolution: 48, // heures
    resolutionToValidation: 24, // heures
    totalMaxDuration: 7, // jours
  },
  byImpact: {
    critical: {
      detectionToAnalysis: 2,
      analysisToResolution: 24,
      resolutionToValidation: 12,
      totalMaxDuration: 3,
    },
    high: {
      detectionToAnalysis: 4,
      analysisToResolution: 48,
      resolutionToValidation: 24,
      totalMaxDuration: 5,
    },
    medium: {
      detectionToAnalysis: 8,
      analysisToResolution: 72,
      resolutionToValidation: 48,
      totalMaxDuration: 7,
    },
    low: {
      detectionToAnalysis: 24,
      analysisToResolution: 120,
      resolutionToValidation: 72,
      totalMaxDuration: 14,
    },
  },
};

// ================================
// DOSSIERS BLOQUÉS COMPLETS
// ================================

export const mockBlockedDossiers: BlockedDossier[] = [
  {
    id: 'blocked-001',
    reference: 'BLOCK-2026-001',
    type: 'signature-manquante',
    subject: 'BC SENELEC bloqué - Validateur principal absent (congé maladie)',
    amount: '15000000',
    bureau: 'Dakar',
    responsible: '',
    blockedSince: '2026-01-08T10:00:00.000Z',
    delay: 2,
    reason: 'BC SENELEC bloqué - Validateur principal absent (congé maladie)',
    project: '',
    impact: 'high',
    status: 'escalated',
    impactLevel: 'high',
    delayDays: 2,
    description: 'BC SENELEC bloqué - Validateur principal absent (congé maladie)',
    relatedDocument: {
      type: 'bc',
      id: 'BC-2024-12345',
      reference: 'BC-2024-12345',
      amount: 15000000,
    },
  },
  {
    id: 'blocked-002',
    reference: 'BLOCK-2026-002',
    type: 'document-invalide',
    subject: 'Facture SDE - RIB invalide',
    amount: '5000000',
    bureau: 'Thiès',
    responsible: '',
    blockedSince: '2026-01-09T14:00:00.000Z',
    delay: 1,
    reason: 'Facture SDE - RIB invalide',
    project: '',
    impact: 'medium',
    status: 'pending',
    impactLevel: 'medium',
    delayDays: 1,
    description: 'Facture SDE - RIB invalide',
    relatedDocument: {
      type: 'facture',
      id: 'FACT-2024-456',
      reference: 'FACT-2024-456',
      amount: 5000000,
    },
  },
  {
    id: 'blocked-003',
    reference: 'BLOCK-2026-003',
    type: 'budget-insuffisant',
    subject: 'BC Travaux - Enveloppe budgétaire projet dépassée',
    amount: '25000000',
    bureau: 'Saint-Louis',
    responsible: '',
    blockedSince: '2026-01-07T09:00:00.000Z',
    delay: 3,
    reason: 'BC Travaux - Enveloppe budgétaire projet dépassée',
    project: '',
    impact: 'critical',
    status: 'pending',
    impactLevel: 'critical',
    delayDays: 3,
    description: 'BC Travaux - Enveloppe budgétaire projet dépassée',
    relatedDocument: {
      type: 'bc',
      id: 'BC-2024-789',
      reference: 'BC-2024-789',
      amount: 25000000,
    },
  },
];

// ================================
// DOSSIER ENRICHI TYPE (pour modal détails)
// ================================

export const createEnrichedDossier = (baseDossier: BlockedDossier) => {
  return {
    ...baseDossier,
    workflow: {
      currentStep: 2,
      totalSteps: 4,
      steps: mockWorkflowSteps,
    },
    impact: mockImpactAnalysis,
    documents: mockDocuments,
    comments: mockComments,
    timeline: mockTimelineEvents,
    actions: {
      suggested: mockSuggestedActions,
    },
    parties: {
      responsable: {
        id: mockUsers.chef1.id,
        name: mockUsers.chef1.name,
        role: mockUsers.chef1.role,
        bureau: mockUsers.chef1.bureau,
      },
      validateurs: [
        {
          id: mockUsers.daf1.id,
          name: mockUsers.daf1.name,
          role: mockUsers.daf1.role,
        },
        {
          id: mockUsers.bmo1.id,
          name: mockUsers.bmo1.name,
          role: mockUsers.bmo1.role,
        },
      ],
      observateurs: [
        {
          id: mockUsers.val1.id,
          name: mockUsers.val1.name,
          role: mockUsers.val1.role,
        },
        {
          id: mockUsers.chef2.id,
          name: mockUsers.chef2.name,
          role: mockUsers.chef2.role,
        },
      ],
    },
    sla: {
      deadline: new Date(
        new Date(baseDossier.blockedSince).getTime() +
          mockSLAConfig.byImpact[baseDossier.impactLevel as keyof typeof mockSLAConfig.byImpact].totalMaxDuration *
            24 *
            60 *
            60 *
            1000
      ).toISOString(),
      remaining: Math.max(
        0,
        Math.floor(
          (new Date(
            new Date(baseDossier.blockedSince).getTime() +
              mockSLAConfig.byImpact[baseDossier.impactLevel as keyof typeof mockSLAConfig.byImpact]
                .totalMaxDuration *
                24 *
                60 *
                60 *
                1000
          ).getTime() -
            Date.now()) /
            (1000 * 60 * 60)
        )
      ),
      status: ((baseDossier.delayDays ?? 0) >= 5
        ? 'expired'
        : (baseDossier.delayDays ?? 0) >= 3
        ? 'critical'
        : (baseDossier.delayDays ?? 0) >= 2
        ? 'warning'
        : 'ok') as 'ok' | 'warning' | 'critical' | 'expired',
      alerts: [
        ...((baseDossier.delayDays ?? 0) >= 2
          ? [
              {
                level: (baseDossier.delayDays ?? 0) >= 5 ? 'critical' : 'warning',
                message: `SLA ${
                  (baseDossier.delayDays ?? 0) >= 5 ? 'expiré' : 'critique'
                } : ${Math.max(
                  0,
                  Math.floor(
                    (new Date(
                      new Date(baseDossier.blockedSince).getTime() +
                        mockSLAConfig.byImpact[
                          baseDossier.impactLevel as keyof typeof mockSLAConfig.byImpact
                        ].totalMaxDuration *
                          24 *
                          60 *
                          60 *
                          1000
                    ).getTime() -
                      Date.now()) /
                      (1000 * 60 * 60)
                  )
                )}h restantes avant échéance`,
              },
            ]
          : []),
        ...(baseDossier.impactLevel === 'high' || baseDossier.impactLevel === 'critical'
          ? [
              {
                level: 'warning',
                message: `Impact ${baseDossier.impactLevel} : ${
                  typeof baseDossier.relatedDocument === 'object' && baseDossier.relatedDocument?.amount
                    ? `${(baseDossier.relatedDocument.amount / 1000000).toFixed(1)}M FCFA`
                    : 'montant significatif'
                }`,
              },
            ]
          : []),
      ],
    },
  };
};

// ================================
// STATISTIQUES
// ================================

export const mockBlockedStats = {
  total: 23,
  pending: 15,
  escalated: 5,
  resolved: 2,
  substituted: 1,
  byImpact: {
    critical: 4,
    high: 8,
    medium: 7,
    low: 4,
  },
  byBureau: {
    Dakar: 12,
    Thiès: 6,
    'Saint-Louis': 3,
    Ziguinchor: 2,
  },
  byType: {
    'signature-manquante': 10,
    'document-invalide': 5,
    'budget-insuffisant': 4,
    'conflit-autorite': 2,
    'delai-depassement': 2,
  },
  avgResolutionTime: 3.5, // jours
  slaCompliance: 0.72, // 72%
  totalFinancialImpact: 125000000, // FCFA
};

// ================================
// EXPORTS
// ================================

export const blockedMockData = {
  users: mockUsers,
  blockageTypes,
  documents: mockDocuments,
  comments: mockComments,
  timelineEvents: mockTimelineEvents,
  suggestedActions: mockSuggestedActions,
  workflowSteps: mockWorkflowSteps,
  impactAnalysis: mockImpactAnalysis,
  slaConfig: mockSLAConfig,
  dossiers: mockBlockedDossiers,
  stats: mockBlockedStats,
  createEnrichedDossier,
};

export default blockedMockData;

