// ============================================
// Données mockées BMO - Partie 3
// Calendrier, Navigation, Performance, RACI, Audit
// + NOUVEAUX: Stats Clients, Paramètres, Détails Bureaux
// ============================================

import type {
  CalendarEvent,
  PerformanceData,
  RACIRow,
  AuditItem,
  Consigne,
  NavSection,
  Organigramme,
  ClientStats,
  ClientsGlobalStats,
  UserSettings,
  BureauDetails,
  ActionLog,
  BudgetAlert,
  ProjectBudget,
} from '@/lib/types/bmo.types';

// --- Événements calendrier ---
export const agendaEvents: CalendarEvent[] = [
  { id: 'e1', title: 'Réunion coordination bureaux', time: '10:00', type: 'meeting', location: 'Salle A', date: '2025-12-24', priority: 'high' },
  { id: 'e2', title: 'Visio client Diallo', time: '14:30', type: 'visio', location: 'Zoom', date: '2025-12-24', priority: 'high', client: 'CLI-001' },
  { id: 'e3', title: 'Échéance rapport mensuel', time: '09:00', type: 'deadline', date: '2025-12-25', priority: 'urgent' },
  { id: 'e4', title: 'Visite chantier Diamniadio', time: '08:00', type: 'site', date: '2025-12-26', priority: 'high', project: 'PRJ-0018' },
  { id: 'e5', title: 'Livraison ciment SOCOCIM', time: '07:00', type: 'delivery', date: '2025-12-24', priority: 'urgent', project: 'PRJ-0018', supplier: 'SOCOCIM' },
  { id: 'e6', title: 'Audience TGI Dakar - SUNEOR', time: '10:00', type: 'legal', date: '2026-01-03', priority: 'critical', project: 'PRJ-0014' },
  { id: 'e7', title: 'RDV Notaire - Acte terrain', time: '15:00', type: 'legal', date: '2025-12-27', priority: 'high' },
  { id: 'e8', title: 'Réunion Mairie Rufisque', time: '10:00', type: 'meeting', date: '2025-12-30', priority: 'high', client: 'CLI-002', project: 'PRJ-0017' },
  { id: 'e9', title: 'Livraison fer à béton', time: '08:00', type: 'delivery', date: '2025-12-24', priority: 'normal', project: 'PRJ-0018' },
  { id: 'e10', title: 'Contrôle qualité béton', time: '09:00', type: 'inspection', date: '2025-12-26', priority: 'high', project: 'PRJ-0018' },
  { id: 'e11', title: 'Formation OHADA', time: '09:00', type: 'training', date: '2026-01-15', endDate: '2026-01-17', priority: 'normal' },
  { id: 'e12', title: 'Entretien annuel I. FALL', time: '14:00', type: 'hr', date: '2025-12-24', priority: 'normal', employee: 'EMP-001' },
];

// --- Absences planifiées (NOUVEAU - pour heatmap risques) ---
export const plannedAbsences = [
  { id: 'ABS-001', employeeId: 'EMP-004', employeeName: 'F. DIOP', bureau: 'BF', startDate: '2025-12-23', endDate: '2026-01-02', type: 'congé', impact: 'high' },
  { id: 'ABS-002', employeeId: 'EMP-007', employeeName: 'C. GUEYE', bureau: 'BCT', startDate: '2025-12-26', endDate: '2025-12-28', type: 'mission', impact: 'medium' },
  { id: 'ABS-003', employeeId: 'EMP-008', employeeName: 'N. FAYE', bureau: 'BJ', startDate: '2026-01-02', endDate: '2026-01-04', type: 'mission', impact: 'high' },
];

// --- Données de performance ---
export const performanceData: PerformanceData[] = [
  { month: 'Jan', validations: 45, demandes: 50, budget: 2.1, rejets: 5 },
  { month: 'Fév', validations: 52, demandes: 58, budget: 2.4, rejets: 6 },
  { month: 'Mar', validations: 48, demandes: 54, budget: 2.2, rejets: 6 },
  { month: 'Avr', validations: 61, demandes: 68, budget: 3.1, rejets: 7 },
  { month: 'Mai', validations: 55, demandes: 60, budget: 2.8, rejets: 5 },
  { month: 'Jun', validations: 67, demandes: 72, budget: 3.5, rejets: 5 },
  { month: 'Jul', validations: 72, demandes: 78, budget: 3.8, rejets: 6 },
  { month: 'Aoû', validations: 68, demandes: 74, budget: 3.2, rejets: 6 },
  { month: 'Sep', validations: 75, demandes: 80, budget: 4.1, rejets: 5 },
  { month: 'Oct', validations: 82, demandes: 88, budget: 4.5, rejets: 6 },
  { month: 'Nov', validations: 78, demandes: 84, budget: 4.2, rejets: 6 },
  { month: 'Déc', validations: 92, demandes: 100, budget: 5.2, rejets: 8 },
];

// --- Matrice RACI ---
export const raciMatrix: RACIRow[] = [
  { activity: 'Validation BC', BMO: 'A', BF: 'C', BM: 'R', BA: 'R', BCT: 'I', BQC: 'I', BJ: 'C' },
  { activity: 'Signature contrats', BMO: 'A', BF: 'C', BM: 'R', BA: 'I', BCT: 'I', BQC: 'I', BJ: 'R' },
  { activity: 'Paiements', BMO: 'A', BF: 'R', BM: 'C', BA: 'C', BCT: 'I', BQC: 'I', BJ: 'I' },
  { activity: 'Contrôle terrain', BMO: 'I', BF: 'I', BM: 'C', BA: 'I', BCT: 'R', BQC: 'C', BJ: 'I' },
  { activity: "Appels d'offres", BMO: 'A', BF: 'C', BM: 'R', BA: 'R', BCT: 'I', BQC: 'C', BJ: 'C' },
];

// --- Audit ---
export const auditItems: AuditItem[] = [
  { id: 'AUD-001', type: 'Conformité OHADA', status: 'conforme', score: 98, lastCheck: '20/12/2025', nextCheck: '20/03/2026' },
  { id: 'AUD-002', type: 'Procédures internes', status: 'conforme', score: 95, lastCheck: '15/12/2025', nextCheck: '15/01/2026' },
  { id: 'AUD-003', type: 'Sécurité données', status: 'attention', score: 87, lastCheck: '10/12/2025', nextCheck: '10/01/2026' },
  { id: 'AUD-004', type: 'Traçabilité décisions', status: 'conforme', score: 100, lastCheck: '22/12/2025', nextCheck: '22/01/2026' },
];

// --- Consignes bureaux ---
export const consignesBureaux: Consigne[] = [
  { id: 'CONS-2025-0089', bureau: 'BCT', from: 'DG', title: 'Priorité chantier Diamniadio', content: 'Concentrer toutes les ressources sur PRJ-0018 jusqu\'au 31/12. Report autres chantiers autorisé.', date: '22/12/2025', priority: 'urgent', status: 'active', acknowledgement: ['C. GUEYE', 'M. DIOP'] },
  { id: 'CONS-2025-0088', bureau: 'BF', from: 'DG', title: 'Gel des dépenses non essentielles', content: 'Suspendre tout achat supérieur à 500,000 FCFA non lié aux projets en cours. Validation DG requise.', date: '20/12/2025', priority: 'high', status: 'active', acknowledgement: ['F. DIOP'] },
  { id: 'CONS-2025-0087', bureau: 'ALL', from: 'DG', title: 'Fermeture fin d\'année', content: 'Bureaux fermés du 25/12 au 02/01. Astreinte BCT maintenue. Contact urgence: DG.', date: '18/12/2025', priority: 'normal', status: 'active', acknowledgement: ['I. FALL', 'F. DIOP', 'M. BA', 'C. GUEYE'] },
  { id: 'CONS-2025-0086', bureau: 'BA', from: 'DG', title: 'Négociation tarifs 2026', content: 'Engager négociations avec tous fournisseurs récurrents. Objectif: -5% minimum.', date: '15/12/2025', priority: 'normal', status: 'active', acknowledgement: ['A. SECK'] },
];

// --- Organigramme ---
export const organigramme: Organigramme = {
  dg: { name: 'Abdoulaye DIALLO', role: 'Directeur Général', initials: 'AD' },
  bureaux: [
    {
      code: 'BMO',
      head: { name: 'Ibrahim FALL', role: 'Assistant DG', initials: 'IF' },
      members: [
        { name: 'Mariama SARR', role: 'Resp. Validation', initials: 'MS' },
        { name: 'Ousmane NDIAYE', role: 'Chargé RH', initials: 'ON' },
      ],
    },
    {
      code: 'BF',
      head: { name: 'Fatou DIOP', role: 'Chef Bureau', initials: 'FD' },
      members: [
        { name: 'Abdou KANE', role: 'Comptable', initials: 'AK' },
        { name: 'Rama SY', role: 'Trésorière', initials: 'RS' },
      ],
    },
    {
      code: 'BM',
      head: { name: 'Moussa BA', role: 'Chef Bureau', initials: 'MB' },
      members: [{ name: 'Ibra DIALLO', role: 'Chargé Marchés', initials: 'ID' }],
    },
    {
      code: 'BA',
      head: { name: 'Aïssatou SECK', role: 'Chef Bureau', initials: 'AS' },
      members: [
        { name: 'Pape NDIAYE', role: 'Acheteur', initials: 'PN' },
        { name: 'Coumba FALL', role: 'Logisticienne', initials: 'CF' },
      ],
    },
    {
      code: 'BCT',
      head: { name: 'Cheikh GUEYE', role: 'Chef Bureau', initials: 'CG' },
      members: [
        { name: 'Modou DIOP', role: 'Conducteur Travaux', initials: 'MD' },
        { name: 'Samba NIANG', role: 'Superviseur', initials: 'SN' },
      ],
    },
    {
      code: 'BJ',
      head: { name: 'Ndèye FAYE', role: 'Chef Bureau', initials: 'NF' },
      members: [{ name: 'Amadou DIENG', role: 'Juriste', initials: 'AD' }],
    },
  ],
};

// --- Navigation sidebar (RÉORGANISÉE selon chaîne de valeur DG) ---
// Ordre logique : Pilotage → Exécution → Projets & Clients → Finance & Contentieux → RH & Ressources → Communication → Gouvernance
// OPTIMISÉE le 10/01/2026 : Suppression redondances, réorganisation arbitrages, ajout alerts
export const navSections: NavSection[] = [
  {
    title: 'Pilotage',
    items: [
      { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
      { id: 'governance', icon: '🏛️', label: 'Gouvernance', badge: 7, badgeType: 'warning' },
      { id: 'calendrier', icon: '📅', label: 'Calendrier' },
      { id: 'analytics', icon: '📈', label: 'Analytics & Rapports' },
      { id: 'alerts', icon: '🔔', label: 'Centre d\'alertes', badge: 5, badgeType: 'urgent' },
    ],
  },
  {
    title: 'Exécution',
    items: [
      { id: 'demandes', icon: '📋', label: 'Demandes', badge: 14, badgeType: 'urgent' },
      { id: 'validation-bc', icon: '✅', label: 'Validation BC/Factu...', badge: 13, badgeType: 'gray' },
      { id: 'validation-contrats', icon: '📜', label: 'Validation Contrats', badge: 3, badgeType: 'gray' },
      { id: 'validation-paiements', icon: '💳', label: 'Validation Paiements...', badge: 5, badgeType: 'gray' },
      { id: 'blocked', icon: '🚨', label: 'Dossiers bloqués', badge: 4, badgeType: 'urgent' },
      { id: 'substitution', icon: '🔄', label: 'Substitution', badge: 4, badgeType: 'warning' },
      { id: 'arbitrages-vivants', icon: '⚖️', label: 'Arbitrages & Goulots', badge: 3, badgeType: 'warning' },
    ],
  },
  {
    title: 'Projets & Clients',
    items: [
      { id: 'projets-en-cours', icon: '🏗️', label: 'Projets en cours', badge: 8, badgeType: 'gray' },
      { id: 'clients', icon: '👥', label: 'Clients' },
      { id: 'tickets-clients', icon: '🎫', label: 'Tickets clients' },
    ],
  },
  {
    title: 'Finance & Contentieux',
    items: [
      { id: 'finances', icon: '💰', label: 'Gains et Pertes' },
      { id: 'recouvrements', icon: '📜', label: 'Recouvrements', badge: 4, badgeType: 'gray' },
      { id: 'litiges', icon: '⚖️', label: 'Litiges', badge: 3, badgeType: 'gray' },
    ],
  },
  {
    title: 'RH & Ressources',
    items: [
      { id: 'employes', icon: '👤', label: 'Employés & Agents', badge: 8, badgeType: 'gray' },
      { id: 'missions', icon: '🎯', label: 'Missions', badge: 2, badgeType: 'warning' },
      { id: 'evaluations', icon: '📊', label: 'Évaluations', badge: 2, badgeType: 'info' },
      { id: 'demandes-rh', icon: '📝', label: 'Demandes RH', badge: 14, badgeType: 'warning' },
      { id: 'delegations', icon: '🔑', label: 'Délégations' },
      { id: 'organigramme', icon: '📐', label: 'Organigramme' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { id: 'echanges-structures', icon: '🏛️', label: 'Échanges Structures' },
      { id: 'conferences', icon: '📹', label: 'Conférences Décisionnelles' },
      { id: 'messages-externes', icon: '📨', label: 'Messages Externes' },
    ],
  },
  {
    title: 'Système',
    items: [
      { id: 'decisions', icon: '📋', label: 'Registre Décisions' },
      { id: 'audit', icon: '🔍', label: 'Audit & Conformité' },
      { id: 'logs', icon: '📜', label: 'Journal des Actions' },
      { id: 'system-logs', icon: '🔧', label: 'Logs Système' },
      { id: 'ia', icon: '🤖', label: 'Intelligence Artificielle' },
      { id: 'api', icon: '🔌', label: 'API & Intégrations' },
      { id: 'parametres', icon: '⚙️', label: 'Paramètres' },
    ],
  },
];

// --- Données financières (enrichies avec gains, pertes, trésorerie) ---
import type {
  Financials,
  FinancialGain,
  FinancialLoss,
  TreasuryEntry,
  Facture,
} from '@/lib/types/bmo.types';

// Gains détaillés
export const financialGains: FinancialGain[] = [
  {
    id: 'GAIN-2025-0045',
    date: '20/12/2025',
    category: 'paiement_client',
    categoryLabel: 'Paiement client',
    description: 'Paiement situation n°3 - Villa Diamniadio',
    montant: 8500000,
    projet: 'PRJ-0018',
    projetName: 'Villa Diamniadio',
    client: 'CLI-001',
    clientName: 'M. Ibrahima DIALLO',
    reference: 'FAC-2025-0187',
    validatedBy: 'F. DIOP',
    validatedAt: '20/12/2025 14:30',
    hash: 'SHA3-256:8f4a2b3c...',
    decisionBMO: {
      decisionId: 'DEC-20251220-001',
      origin: 'validation-bc',
      validatorRole: 'A',
      hash: 'SHA3-256:8f4a2b3c5e6d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
      comment: 'Conforme – budget chantier OK',
    },
  },
  {
    id: 'GAIN-2025-0044',
    date: '18/12/2025',
    category: 'paiement_client',
    categoryLabel: 'Paiement client',
    description: 'Acompte travaux Route Zone B',
    montant: 25000000,
    projet: 'PRJ-0017',
    projetName: 'Route Zone B',
    client: 'CLI-002',
    clientName: 'Mairie de Rufisque',
    reference: 'FAC-2025-0182',
    validatedBy: 'F. DIOP',
    validatedAt: '18/12/2025 10:15',
    hash: 'SHA3-256:9c7e1d4a...',
    decisionBMO: {
      decisionId: 'DEC-20251218-002',
      origin: 'validation-bc',
      validatorRole: 'A',
      hash: 'SHA3-256:9c7e1d4a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
      comment: 'Validation conforme – budget validé',
    },
  },
  {
    id: 'GAIN-2025-0043',
    date: '15/12/2025',
    category: 'retenue_garantie',
    categoryLabel: 'Libération retenue garantie',
    description: 'Libération RG - École Pikine (réception définitive)',
    montant: 1800000,
    projet: 'PRJ-0015',
    projetName: 'Rénovation École Pikine',
    client: 'CLI-005',
    clientName: 'IEF Pikine',
    reference: 'RG-PRJ0015',
    validatedBy: 'F. DIOP',
    validatedAt: '15/12/2025 16:00',
    hash: 'SHA3-256:3b2f5c8d...',
    decisionBMO: {
      decisionId: 'DEC-20251215-003',
      origin: 'validation-bc',
      validatorRole: 'R',
      hash: 'SHA3-256:3b2f5c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
      comment: 'Réception définitive validée',
    },
  },
  {
    id: 'GAIN-2025-0042',
    date: '10/12/2025',
    category: 'penalite_recue',
    categoryLabel: 'Pénalité fournisseur',
    description: 'Pénalité retard livraison MATFORCE',
    montant: 450000,
    projet: 'PRJ-0017',
    projetName: 'Route Zone B',
    reference: 'PEN-2025-0012',
    validatedBy: 'M. BA',
    validatedAt: '10/12/2025 11:30',
    hash: 'SHA3-256:7a9f3e2b...',
    decisionBMO: {
      decisionId: 'DEC-20251210-004',
      origin: 'validation-bc',
      validatorRole: 'R',
      hash: 'SHA3-256:7a9f3e2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      comment: 'Pénalité validée selon contrat',
    },
  },
  {
    id: 'GAIN-2025-0041',
    date: '05/12/2025',
    category: 'paiement_client',
    categoryLabel: 'Paiement client',
    description: 'Solde final Immeuble R+4 Almadies',
    montant: 12000000,
    projet: 'PRJ-0016',
    projetName: 'Immeuble R+4 Almadies',
    client: 'CLI-004',
    clientName: 'SCI Teranga',
    reference: 'FAC-2025-0175',
    validatedBy: 'F. DIOP',
    validatedAt: '05/12/2025 09:45',
    hash: 'SHA3-256:5c4d8e1f...',
    decisionBMO: {
      decisionId: 'DEC-20251205-005',
      origin: 'validation-bc',
      validatorRole: 'A',
      hash: 'SHA3-256:5c4d8e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
      comment: 'Solde final validé – projet terminé',
    },
  },
];

// Pertes détaillées
export const financialLosses: FinancialLoss[] = [
  {
    id: 'LOSS-2025-0018',
    date: '22/12/2025',
    category: 'frais_contentieux',
    categoryLabel: 'Frais contentieux',
    description: 'Honoraires Me SALL - Dossier SUNEOR',
    montant: 2500000,
    projet: 'PRJ-0014',
    projetName: 'Extension usine SUNEOR',
    incident: 'LIT-2025-0012',
    reference: 'FAC-AVO-2025-089',
    validatedBy: 'A. DIALLO',
    validatedAt: '22/12/2025 15:00',
    hash: 'SHA3-256:2e7c9a4b...',
    decisionBMO: {
      decisionId: 'ARB-20251222-001',
      origin: 'arbitrages',
      validatorRole: 'A',
      hash: 'SHA3-256:2e7c9a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a',
      comment: 'Arbitrage DG – frais contentieux validés',
    },
  },
  {
    id: 'LOSS-2025-0017',
    date: '18/12/2025',
    category: 'penalite_retard',
    categoryLabel: 'Pénalité retard',
    description: 'Pénalité retard livraison client - Route Zone B',
    montant: 1250000,
    projet: 'PRJ-0017',
    projetName: 'Route Zone B',
    reference: 'PEN-CLI-2025-003',
    decision: 'DEC-2025-0082',
    decisionDate: '15/12/2025',
    validatedBy: 'A. DIALLO',
    validatedAt: '18/12/2025 11:00',
    hash: 'SHA3-256:8f3a2d5c...',
    decisionBMO: {
      decisionId: 'ARB-20251218-002',
      origin: 'arbitrages',
      validatorRole: 'A',
      hash: 'SHA3-256:8f3a2d5c1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b',
      comment: 'Pénalité contractuelle – validée',
    },
  },
  {
    id: 'LOSS-2025-0016',
    date: '15/12/2025',
    category: 'provision_litige',
    categoryLabel: 'Provision litige',
    description: 'Provision litige DIENG (prud\'hommes)',
    montant: 3500000,
    incident: 'LIT-2025-0011',
    reference: 'PROV-2025-0005',
    validatedBy: 'F. DIOP',
    validatedAt: '15/12/2025 14:00',
    hash: 'SHA3-256:1d9e4f2a...',
    decisionBMO: {
      decisionId: 'ARB-20251215-003',
      origin: 'arbitrages',
      validatorRole: 'A',
      hash: 'SHA3-256:1d9e4f2a5b8c1e4f7a0b3c6d9e2f5a8b1c4d7e0f',
      comment: 'Provision prudente validée',
    },
  },
  {
    id: 'LOSS-2025-0015',
    date: '10/12/2025',
    category: 'malfacon',
    categoryLabel: 'Reprise malfaçon',
    description: 'Coût reprise étanchéité terrasse',
    montant: 850000,
    projet: 'PRJ-0018',
    projetName: 'Villa Diamniadio',
    fournisseur: 'SENFER',
    reference: 'REP-2025-0008',
    validatedBy: 'C. GUEYE',
    validatedAt: '10/12/2025 16:30',
    hash: 'SHA3-256:6b8c3e7d...',
    decisionBMO: {
      decisionId: 'ARB-20251210-004',
      origin: 'arbitrages',
      validatorRole: 'A',
      hash: 'SHA3-256:6b8c3e7d0f3a6b9c2e5f8a1b4c7d0e3f6a9b2c5d',
      comment: 'Arbitrage DG – charge rejetée',
    },
  },
];

// Entrées de trésorerie
export const treasuryEntries: TreasuryEntry[] = [
  { 
    id: 'TRS-001', 
    date: '22/12/2025', 
    type: 'encaissement', 
    source: 'paiement', 
    sourceRef: 'PAY-2025-0095', 
    description: 'Encaissement SENELEC', 
    montant: 850000, 
    soldeApres: 45250000, 
    validatedBy: 'F. DIOP',
    decisionBMO: {
      decisionId: 'PAY-20251222-001',
      origin: 'validation-paiements',
      validatorRole: 'R',
      hash: 'SHA3-256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      comment: 'Validation standard',
    },
  },
  { 
    id: 'TRS-002', 
    date: '20/12/2025', 
    type: 'encaissement', 
    source: 'paiement', 
    sourceRef: 'GAIN-2025-0045', 
    description: 'Paiement client DIALLO', 
    montant: 8500000, 
    soldeApres: 44400000, 
    projet: 'PRJ-0018', 
    projetName: 'Villa Diamniadio', 
    tiers: 'M. Ibrahima DIALLO', 
    validatedBy: 'F. DIOP',
    decisionBMO: {
      decisionId: 'PAY-20251220-002',
      origin: 'validation-paiements',
      validatorRole: 'A',
      hash: 'SHA3-256:b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
      comment: 'Paiement validé – BC conforme',
    },
  },
  { 
    id: 'TRS-003', 
    date: '18/12/2025', 
    type: 'encaissement', 
    source: 'paiement', 
    sourceRef: 'GAIN-2025-0044', 
    description: 'Acompte Mairie Rufisque', 
    montant: 25000000, 
    soldeApres: 35900000, 
    projet: 'PRJ-0017', 
    projetName: 'Route Zone B', 
    tiers: 'Mairie de Rufisque', 
    validatedBy: 'F. DIOP',
    decisionBMO: {
      decisionId: 'PAY-20251218-003',
      origin: 'validation-paiements',
      validatorRole: 'A',
      hash: 'SHA3-256:c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
      comment: 'Acompte validé – budget OK',
    },
  },
  { 
    id: 'TRS-004', 
    date: '18/12/2025', 
    type: 'decaissement', 
    source: 'exploitation', 
    description: 'Règlement fournisseur SOCOCIM', 
    montant: -4250000, 
    soldeApres: 10900000, 
    tiers: 'SOCOCIM Industries', 
    validatedBy: 'F. DIOP',
    decisionBMO: {
      decisionId: 'PAY-20251218-004',
      origin: 'validation-paiements',
      validatorRole: 'R',
      hash: 'SHA3-256:d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
      comment: 'Double validation BF + BMO',
    },
  },
  { 
    id: 'TRS-005', 
    date: '15/12/2025', 
    type: 'encaissement', 
    source: 'recouvrement', 
    sourceRef: 'REC-2025-0031', 
    description: 'Paiement partiel Mme DIOP', 
    montant: 350000, 
    soldeApres: 15150000, 
    tiers: 'Mme Aïda DIOP', 
    validatedBy: 'F. DIOP',
    decisionBMO: {
      decisionId: 'PAY-20251215-005',
      origin: 'validation-paiements',
      validatorRole: 'R',
      hash: 'SHA3-256:e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
      comment: 'Recouvrement partiel validé',
    },
  },
  { 
    id: 'TRS-006', 
    date: '15/12/2025', 
    type: 'provision', 
    source: 'litige', 
    sourceRef: 'LIT-2025-0011', 
    description: 'Provision litige DIENG', 
    montant: -3500000, 
    soldeApres: 14800000, 
    validatedBy: 'F. DIOP',
    decisionBMO: {
      decisionId: 'PAY-20251215-006',
      origin: 'validation-paiements',
      validatorRole: 'A',
      hash: 'SHA3-256:f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
      comment: 'Provision validée – arbitrage DG',
    },
  },
];

// Structure Financials enrichie
export const financials: Financials = {
  // Résumé global
  totalGains: 2_850_000_000,
  totalPertes: 420_000_000,
  resultatNet: 2_430_000_000,
  tauxMarge: 18.4,
  
  // Détails
  gains: financialGains,
  pertes: financialLosses,
  
  // Trésorerie
  tresorerieActuelle: 1_120_000_000,
  tresoreriePrevisionnelle: 1_340_000_000, // +paiements attendus -échéances
  treasury: treasuryEntries,
  
  // Évolution mensuelle
  evolution: [
    { month: 'Jan', gains: 18000000, pertes: 15000000, solde: 3000000 },
    { month: 'Fév', gains: 22000000, pertes: 18000000, solde: 4000000 },
    { month: 'Mar', gains: 19000000, pertes: 16000000, solde: 3000000 },
    { month: 'Avr', gains: 25000000, pertes: 20000000, solde: 5000000 },
    { month: 'Mai', gains: 21000000, pertes: 17000000, solde: 4000000 },
    { month: 'Jun', gains: 28000000, pertes: 22000000, solde: 6000000 },
    { month: 'Jul', gains: 32000000, pertes: 25000000, solde: 7000000 },
    { month: 'Aoû', gains: 24000000, pertes: 20000000, solde: 4000000 },
    { month: 'Sep', gains: 30000000, pertes: 24000000, solde: 6000000 },
    { month: 'Oct', gains: 35000000, pertes: 28000000, solde: 7000000 },
    { month: 'Nov', gains: 29000000, pertes: 23000000, solde: 6000000 },
    { month: 'Déc', gains: 47750000, pertes: 8100000, solde: 39650000 },
  ],
  
  // Répartition par catégorie
  gainsParCategorie: [
    { category: 'paiement_client', label: 'Paiements clients', montant: 2_200_000_000, percentage: 77 },
    { category: 'subvention', label: 'Subventions publiques', montant: 650_000_000, percentage: 23 },
  ],
  pertesParCategorie: [
    { category: 'malfacon', label: 'Malfaçons', montant: 280_000_000, percentage: 67 },
    { category: 'frais_contentieux', label: 'Frais contentieux', montant: 140_000_000, percentage: 33 },
  ],
  
  // Indicateurs
  kpis: {
    margeNette: 18.4,
    ratioRecouvrement: 92.3, // % des créances recouvrées
    expositionLitiges: 65400000, // Total exposure des 3 litiges
    provisionContentieux: 85_000_000,
  },
};

// --- Données PieChart bureaux ---
// Couleurs neutres (bleus) pour différencier les bureaux visuellement
export const bureauPieData = [
  { name: 'BMO', value: 15, color: '#3B82F6' }, // Bleu principal
  { name: 'BF', value: 12, color: '#2563EB' }, // Bleu foncé
  { name: 'BM', value: 10, color: '#6366F1' }, // Indigo
  { name: 'BA', value: 18, color: '#06B6D4' }, // Cyan
  { name: 'BCT', value: 8, color: '#64748B' }, // Slate (neutre gris-bleu)
  { name: 'BQC', value: 6, color: '#06B6D4' }, // Cyan (neutre)
  { name: 'BJ', value: 6, color: '#0891B2' }, // Cyan foncé
];

// --- Données PieChart statut projets ---
// Logique métier : Vert = positif (en cours), Rouge = problème (bloqués), Bleu = neutre (terminés)
export const projectStatusData = [
  { name: 'En cours', value: 5, fill: '#10B981' }, // Vert = positif
  { name: 'Bloqués', value: 1, fill: '#EF4444' }, // Rouge = problème
  { name: 'Terminés', value: 2, fill: '#3B82F6' }, // Bleu = neutre
];

// --- Statistiques clients (NOUVEAU) ---
export const clientsStats: ClientStats[] = [
  {
    id: 'CS-001',
    clientId: 'CLI-001',
    clientName: 'M. Ibrahima DIALLO',
    clientType: 'particulier',
    projectsTotal: 2,
    projectsActive: 1,
    projectsCompleted: 1,
    projectsCancelled: 0,
    chiffreAffairesTotal: 54400000,
    chiffreAffairesAnnee: 36400000,
    paiementsEnCours: 12000000,
    paiementsEnRetard: 0,
    montantImpaye: 0,
    scoreQualite: 92,
    nbReclamations: 1,
    nbLitiges: 0,
    anciennete: 18,
    dernierContact: '22/12/2025',
    projects: [
      { projectId: 'PRJ-0018', projectName: 'Villa Diamniadio', startDate: '01/06/2025', status: 'active', budget: 36400000, paid: 24400000, remaining: 12000000 },
      { projectId: 'PRJ-0012', projectName: 'Rénovation appartement', startDate: '01/01/2024', endDate: '15/06/2024', status: 'completed', budget: 18000000, paid: 18000000, remaining: 0 },
    ],
  },
  {
    id: 'CS-002',
    clientId: 'CLI-002',
    clientName: 'Mairie de Rufisque',
    clientType: 'institution',
    projectsTotal: 3,
    projectsActive: 1,
    projectsCompleted: 2,
    projectsCancelled: 0,
    chiffreAffairesTotal: 185000000,
    chiffreAffairesAnnee: 125000000,
    paiementsEnCours: 68800000,
    paiementsEnRetard: 12500000,
    montantImpaye: 12500000,
    scoreQualite: 78,
    nbReclamations: 3,
    nbLitiges: 0,
    anciennete: 36,
    dernierContact: '20/12/2025',
    projects: [
      { projectId: 'PRJ-0017', projectName: 'Route Zone B', startDate: '01/03/2025', status: 'active', budget: 125000000, paid: 56200000, remaining: 68800000 },
    ],
  },
  {
    id: 'CS-003',
    clientId: 'CLI-003',
    clientName: 'SUNEOR SA',
    clientType: 'entreprise',
    projectsTotal: 1,
    projectsActive: 0,
    projectsCompleted: 0,
    projectsCancelled: 0,
    chiffreAffairesTotal: 245000000,
    chiffreAffairesAnnee: 0,
    paiementsEnCours: 0,
    paiementsEnRetard: 45000000,
    montantImpaye: 45000000,
    scoreQualite: 35,
    nbReclamations: 0,
    nbLitiges: 1,
    anciennete: 24,
    dernierContact: '15/12/2025',
    projects: [
      { projectId: 'PRJ-0014', projectName: 'Extension usine SUNEOR', startDate: '01/01/2025', status: 'blocked', budget: 245000000, paid: 56400000, remaining: 188600000 },
    ],
  },
];

// --- Stats globales clients (NOUVEAU) ---
export const clientsGlobalStats: ClientsGlobalStats = {
  totalClients: 42,
  clientsActifs: 28,
  clientsParticuliers: 24,
  clientsEntreprises: 12,
  clientsInstitutions: 6,
  nouveauxClientsMois: 3,
  chiffreAffairesTotalAnnee: 513400000,
  tauxFidelisation: 76,
  scoreSatisfactionMoyen: 82,
  topClients: [
    { clientId: 'CLI-003', clientName: 'SUNEOR SA', chiffreAffaires: 245000000 },
    { clientId: 'CLI-002', clientName: 'Mairie de Rufisque', chiffreAffaires: 125000000 },
    { clientId: 'CLI-004', clientName: 'SCI Teranga', chiffreAffaires: 89000000 },
  ],
  repartitionParType: [
    { type: 'Particuliers', count: 24, percentage: 57 },
    { type: 'Entreprises', count: 12, percentage: 29 },
    { type: 'Institutions', count: 6, percentage: 14 },
  ],
  evolutionMensuelle: [
    { month: 'Jan', nouveaux: 2, chiffreAffaires: 35000000 },
    { month: 'Fév', nouveaux: 1, chiffreAffaires: 42000000 },
    { month: 'Mar', nouveaux: 3, chiffreAffaires: 38000000 },
    { month: 'Avr', nouveaux: 2, chiffreAffaires: 55000000 },
    { month: 'Mai', nouveaux: 1, chiffreAffaires: 41000000 },
    { month: 'Jun', nouveaux: 4, chiffreAffaires: 62000000 },
    { month: 'Jul', nouveaux: 2, chiffreAffaires: 48000000 },
    { month: 'Aoû', nouveaux: 1, chiffreAffaires: 35000000 },
    { month: 'Sep', nouveaux: 2, chiffreAffaires: 48000000 },
    { month: 'Oct', nouveaux: 2, chiffreAffaires: 52000000 },
    { month: 'Nov', nouveaux: 1, chiffreAffaires: 45000000 },
    { month: 'Déc', nouveaux: 3, chiffreAffaires: 58000000 },
  ],
};

// --- Paramètres utilisateur par défaut (NOUVEAU) ---
export const defaultUserSettings: UserSettings = {
  userId: 'USR-001',
  profile: {
    firstName: 'Abdoulaye',
    lastName: 'DIALLO',
    email: 'a.diallo@yessalate.sn',
    phone: '+221 77 123 45 67',
    role: 'Directeur Général',
    bureau: 'BMO',
  },
  preferences: {
    language: 'fr',
    timezone: 'Africa/Dakar',
    dateFormat: 'DD/MM/YYYY',
    currency: 'FCFA',
    theme: 'dark',
    sidebarCollapsed: false,
    compactMode: false,
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    urgentOnly: false,
    digest: 'realtime',
    categories: {
      validations: true,
      blocages: true,
      budgets: true,
      rh: true,
      litiges: true,
    },
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '01/10/2025',
    sessionTimeout: 30,
    trustedDevices: ['Chrome - Windows', 'Safari - iPhone'],
  },
};

// --- Détails des bureaux (NOUVEAU) ---
export const bureauxDetails: Record<string, BureauDetails> = {
  BMO: {
    code: 'BMO',
    platforms: [
      { id: 'plt-1', name: 'Portail Validation', url: '/maitre-ouvrage/validation-bc', icon: '✅', description: 'Gestion des validations BC, factures et avenants', status: 'active' },
      { id: 'plt-2', name: 'Tableau de bord', url: '/maitre-ouvrage/dashboard', icon: '📊', description: 'Vue globale et KPIs', status: 'active' },
      { id: 'plt-3', name: 'Gestion RH', url: '/maitre-ouvrage/employes', icon: '👥', description: 'Suivi des employés et demandes RH', status: 'active' },
    ],
    organigramme: [
      { id: 'EMP-001', name: 'Ibrahim FALL', initials: 'IF', role: 'Assistant DG - Coordination', email: 'i.fall@yessalate.sn', phone: '+221 77 123 45 67', status: 'active', isHead: true },
      { id: 'EMP-002', name: 'Mariama SARR', initials: 'MS', role: 'Responsable Validation', email: 'm.sarr@yessalate.sn', phone: '+221 77 234 56 78', status: 'active', isHead: false },
      { id: 'EMP-003', name: 'Ousmane NDIAYE', initials: 'ON', role: 'Chargé RH & Administration', email: 'o.ndiaye@yessalate.sn', phone: '+221 77 345 67 89', status: 'active', isHead: false },
    ],
    stats: {
      projectsActive: 5,
      projectsCompleted: 12,
      budgetTotal: '15M',
      budgetUsed: '12.8M',
      validationsMonth: 47,
      avgResponseTime: '2.4h',
    },
    recentActivities: [
      { id: 'act-1', action: 'Validation BC-2025-0048', date: '22/12/2025 14:23', agent: 'M. SARR' },
      { id: 'act-2', action: 'Substitution PAY-2025-0039', date: '22/12/2025 13:15', agent: 'A. DIALLO' },
      { id: 'act-3', action: 'Création délégation DEL-003', date: '22/12/2025 11:30', agent: 'I. FALL' },
    ],
  },
  BF: {
    code: 'BF',
    platforms: [
      { id: 'plt-1', name: 'Comptabilité', url: '/comptable', icon: '🧮', description: 'Gestion comptable et financière', status: 'active' },
      { id: 'plt-2', name: 'Paiements', url: '/maitre-ouvrage/validation-paiements', icon: '💳', description: 'Suivi des paiements', status: 'active' },
      { id: 'plt-3', name: 'Trésorerie', url: '#', icon: '🏦', description: 'Gestion de trésorerie', status: 'maintenance' },
    ],
    organigramme: [
      { id: 'EMP-004', name: 'Fatou DIOP', initials: 'FD', role: 'Chef Bureau Finance', email: 'f.diop@yessalate.sn', phone: '+221 77 456 78 90', status: 'active', isHead: true },
      { id: 'EMP-009', name: 'Abdou KANE', initials: 'AK', role: 'Comptable', email: 'a.kane@yessalate.sn', phone: '+221 77 567 89 01', status: 'active', isHead: false },
      { id: 'EMP-010', name: 'Rama SY', initials: 'RS', role: 'Trésorière', email: 'r.sy@yessalate.sn', phone: '+221 77 678 90 12', status: 'conge', isHead: false },
    ],
    stats: {
      projectsActive: 5,
      projectsCompleted: 15,
      budgetTotal: '8M',
      budgetUsed: '6.4M',
      validationsMonth: 32,
      avgResponseTime: '3.1h',
    },
    recentActivities: [
      { id: 'act-1', action: 'Validation paiement EIFFAGE', date: '22/12/2025 15:00', agent: 'F. DIOP' },
      { id: 'act-2', action: 'Rapport budget mensuel', date: '21/12/2025 17:00', agent: 'A. KANE' },
    ],
  },
};

// --- Alertes de dépassement budgétaire (NOUVEAU) ---
export const budgetAlerts: BudgetAlert[] = [
  {
    id: 'BA-001',
    projectId: 'PRJ-INFRA',
    projectName: 'Projet Infrastructure 2025',
    bureau: 'BCT',
    budgetPrevisionnel: 50000000,
    budgetActuel: 56000000,
    depassement: 6000000,
    depassementPourcent: 12,
    date: '22/12/2025',
    status: 'pending',
    requestedBy: 'C. GUEYE',
    motif: 'Hausse des prix des matériaux + travaux supplémentaires imprévus',
  },
  {
    id: 'BA-002',
    projectId: 'PRJ-0017',
    projectName: 'Route Zone B',
    bureau: 'BM',
    budgetPrevisionnel: 125000000,
    budgetActuel: 128500000,
    depassement: 3500000,
    depassementPourcent: 2.8,
    date: '20/12/2025',
    status: 'approved',
    requestedBy: 'M. BA',
    approvedBy: 'A. DIALLO',
    motif: 'Extension du périmètre suite demande Mairie',
  },
];

// --- Budgets projets détaillés (NOUVEAU) ---
export const projectBudgets: ProjectBudget[] = [
  {
    projectId: 'PRJ-0018',
    budgetEstimatif: 34700000,
    budgetPrevisionnel: 36435000,
    budgetReel: 24700000,
    seuilAlerte: 34700000,
    depassementAutorise: false,
    historique: [
      { date: '01/06/2025', type: 'depense', montant: 5000000, description: 'Fondations', validatedBy: 'F. DIOP' },
      { date: '15/06/2025', type: 'depense', montant: 8000000, description: 'Gros œuvre RDC', validatedBy: 'F. DIOP' },
      { date: '01/07/2025', type: 'depense', montant: 6500000, description: 'Gros œuvre R+1', validatedBy: 'F. DIOP' },
      { date: '15/08/2025', type: 'depense', montant: 5200000, description: 'Toiture + étanchéité', validatedBy: 'F. DIOP' },
    ],
  },
  {
    projectId: 'PRJ-INFRA',
    budgetEstimatif: 47600000,
    budgetPrevisionnel: 49980000,
    budgetReel: 56000000,
    seuilAlerte: 47600000,
    depassementAutorise: false,
    historique: [
      { date: '01/03/2025', type: 'depense', montant: 15000000, description: 'Travaux préparatoires', validatedBy: 'F. DIOP' },
      { date: '01/05/2025', type: 'depense', montant: 20000000, description: 'Infrastructure principale', validatedBy: 'F. DIOP' },
      { date: '01/08/2025', type: 'depense', montant: 15000000, description: 'Équipements', validatedBy: 'F. DIOP' },
      { date: '15/12/2025', type: 'depense', montant: 6000000, description: 'Travaux supplémentaires (dépassement)', validatedBy: null },
    ],
  },
];

// ============================================
// NOUVELLES DONNÉES RH PROACTIF
// ============================================

import type { 
  Mission, 
  Evaluation, 
  CriticalSkill 
} from '@/lib/types/bmo.types';

// --- Missions ---
export const missions: Mission[] = [
  {
    id: 'MIS-2025-0012',
    title: 'Supervision finale Villa Diamniadio',
    description: 'Contrôle qualité final et réception des travaux gros œuvre avant finitions',
    bureaux: ['BCT', 'BQC'],
    participants: [
      { employeeId: 'EMP-007', employeeName: 'Cheikh GUEYE', role: 'responsable' },
      { employeeId: 'EMP-011', employeeName: 'Pape NDIAYE', role: 'participant' },
    ],
    startDate: '23/12/2025',
    endDate: '28/12/2025',
    progress: 45,
    status: 'in_progress',
    priority: 'urgent',
    objectives: [
      { id: 'OBJ-001', title: 'Contrôle fondations', status: 'completed', completedAt: '23/12/2025', completedBy: 'C. GUEYE' },
      { id: 'OBJ-002', title: 'Vérification structure béton', status: 'in_progress' },
      { id: 'OBJ-003', title: 'Test étanchéité toiture', status: 'pending' },
      { id: 'OBJ-004', title: 'Rapport final réception', status: 'pending' },
    ],
    proofs: [
      { id: 'PRF-001', type: 'photo', title: 'Photos fondations', date: '23/12/2025', uploadedBy: 'C. GUEYE' },
      { id: 'PRF-002', type: 'document', title: 'PV contrôle béton', date: '24/12/2025', uploadedBy: 'P. NDIAYE' },
    ],
    linkedProject: 'PRJ-0018',
    budget: '150,000',
    budgetUsed: '85,000',
    createdBy: 'I. FALL',
    createdAt: '20/12/2025',
  },
  {
    id: 'MIS-2025-0011',
    title: 'Négociation contrat SOGEA SATOM',
    description: 'Renégociation des clauses litigieuses du contrat cadre',
    bureaux: ['BJ', 'BM'],
    participants: [
      { employeeId: 'EMP-008', employeeName: 'Ndèye FAYE', role: 'responsable' },
      { employeeId: 'EMP-005', employeeName: 'Moussa BA', role: 'participant' },
    ],
    startDate: '15/12/2025',
    endDate: '30/12/2025',
    progress: 70,
    status: 'in_progress',
    priority: 'high',
    objectives: [
      { id: 'OBJ-005', title: 'Analyse clauses actuelles', status: 'completed', completedAt: '16/12/2025', completedBy: 'N. FAYE' },
      { id: 'OBJ-006', title: 'Rédaction contre-propositions', status: 'completed', completedAt: '18/12/2025', completedBy: 'N. FAYE' },
      { id: 'OBJ-007', title: 'Réunion négociation', status: 'in_progress' },
      { id: 'OBJ-008', title: 'Validation juridique finale', status: 'pending' },
    ],
    proofs: [
      { id: 'PRF-003', type: 'document', title: 'Analyse juridique', date: '16/12/2025', uploadedBy: 'N. FAYE' },
      { id: 'PRF-004', type: 'compte_rendu', title: 'CR réunion 18/12', date: '18/12/2025', uploadedBy: 'M. BA' },
    ],
    impactFinancier: 'Économie potentielle de 2.5M FCFA sur pénalités',
    impactJuridique: 'Réduction du risque contentieux',
    createdBy: 'I. FALL',
    createdAt: '14/12/2025',
  },
  {
    id: 'MIS-2025-0010',
    title: 'Audit fournisseurs Q4',
    description: 'Évaluation annuelle des fournisseurs récurrents',
    bureaux: ['BA', 'BQC'],
    participants: [
      { employeeId: 'EMP-006', employeeName: 'Aïssatou SECK', role: 'responsable' },
    ],
    startDate: '01/12/2025',
    endDate: '31/12/2025',
    progress: 100,
    status: 'completed',
    priority: 'normal',
    objectives: [
      { id: 'OBJ-009', title: 'Collecte données fournisseurs', status: 'completed', completedAt: '10/12/2025', completedBy: 'A. SECK' },
      { id: 'OBJ-010', title: 'Analyse qualité/prix', status: 'completed', completedAt: '15/12/2025', completedBy: 'A. SECK' },
      { id: 'OBJ-011', title: 'Rapport recommandations', status: 'completed', completedAt: '20/12/2025', completedBy: 'A. SECK' },
    ],
    proofs: [
      { id: 'PRF-005', type: 'compte_rendu', title: 'Rapport audit fournisseurs', date: '20/12/2025', uploadedBy: 'A. SECK' },
    ],
    createdBy: 'I. FALL',
    createdAt: '28/11/2025',
  },
  {
    id: 'MIS-2025-0009',
    title: 'Audience TGI Ziguinchor - SUNEOR',
    description: 'Représentation juridique pour le litige commercial',
    bureaux: ['BJ'],
    participants: [
      { employeeId: 'EMP-008', employeeName: 'Ndèye FAYE', role: 'responsable' },
    ],
    startDate: '02/01/2026',
    endDate: '04/01/2026',
    progress: 0,
    status: 'planned',
    priority: 'urgent',
    objectives: [
      { id: 'OBJ-012', title: 'Préparation dossier plaidoirie', status: 'in_progress' },
      { id: 'OBJ-013', title: 'Audience TGI', status: 'pending' },
      { id: 'OBJ-014', title: 'CR audience et suivi', status: 'pending' },
    ],
    proofs: [],
    linkedProject: 'PRJ-0014',
    linkedLitigation: 'LIT-2025-0012',
    impactFinancier: 'Enjeu: 45M FCFA',
    impactJuridique: 'Issue déterminante pour recouvrement',
    decisions: ['DEC-2025-0086'],
    createdBy: 'I. FALL',
    createdAt: '21/12/2025',
  },
  {
    id: 'MIS-2025-0008',
    title: 'Formation OHADA équipe juridique',
    description: 'Mise à niveau sur les évolutions réglementaires',
    bureaux: ['BJ', 'BMO'],
    participants: [
      { employeeId: 'EMP-008', employeeName: 'Ndèye FAYE', role: 'participant' },
      { employeeId: 'EMP-002', employeeName: 'Mariama SARR', role: 'participant' },
    ],
    startDate: '15/01/2026',
    endDate: '17/01/2026',
    progress: 0,
    status: 'planned',
    priority: 'normal',
    objectives: [
      { id: 'OBJ-015', title: 'Module droit des sociétés', status: 'pending' },
      { id: 'OBJ-016', title: 'Module comptabilité SYSCOHADA', status: 'pending' },
      { id: 'OBJ-017', title: 'Certification', status: 'pending' },
    ],
    proofs: [],
    budget: '500,000',
    budgetUsed: '0',
    createdBy: 'O. NDIAYE',
    createdAt: '10/12/2025',
  },
];

// --- Évaluations ---
export const evaluations: Evaluation[] = [
  {
    id: 'EVAL-2025-0015',
    employeeId: 'EMP-001',
    employeeName: 'Ibrahim FALL',
    employeeRole: 'Assistant DG - Coordination',
    bureau: 'BMO',
    evaluatorId: 'DG',
    evaluatorName: 'Abdoulaye DIALLO',
    date: '15/01/2025',
    period: '2024-Annuel',
    status: 'completed',
    scoreGlobal: 92,
    criteria: [
      { id: 'CRI-001', name: 'Performance', score: 5, weight: 30, comment: 'Excellent pilotage des bureaux' },
      { id: 'CRI-002', name: 'Leadership', score: 4, weight: 25, comment: 'Bonne gestion d\'équipe' },
      { id: 'CRI-003', name: 'Communication', score: 5, weight: 20, comment: 'Communication fluide' },
      { id: 'CRI-004', name: 'Initiative', score: 4, weight: 15, comment: 'Proactif' },
      { id: 'CRI-005', name: 'Ponctualité', score: 5, weight: 10, comment: 'Irréprochable' },
    ],
    strengths: ['Coordination inter-bureaux', 'Gestion de crise', 'Diplomatie'],
    improvements: ['Délégation plus importante', 'Formation management'],
    recommendations: [
      { id: 'REC-001', type: 'formation', title: 'Formation Management Agile', description: 'Stage de 3 jours', status: 'implemented', implementedAt: '15/06/2025' },
      { id: 'REC-002', type: 'augmentation', title: 'Révision salariale +8%', description: 'Mérite performance', status: 'approved', approvedBy: 'A. DIALLO', approvedAt: '01/02/2025' },
    ],
    nextEvaluation: '15/01/2026',
    documents: [
      { id: 'DOC-EV-001', type: 'compte_rendu', name: 'CR Entretien annuel 2024', date: '15/01/2025' },
    ],
    hash: 'SHA3-256:eval001a2b3c4d...',
  },
  {
    id: 'EVAL-2025-0014',
    employeeId: 'EMP-004',
    employeeName: 'Fatou DIOP',
    employeeRole: 'Chef Bureau Finance',
    bureau: 'BF',
    evaluatorId: 'DG',
    evaluatorName: 'Abdoulaye DIALLO',
    date: '01/03/2025',
    period: '2024-Annuel',
    status: 'completed',
    scoreGlobal: 95,
    criteria: [
      { id: 'CRI-006', name: 'Expertise technique', score: 5, weight: 35, comment: 'Maîtrise parfaite SYSCOHADA' },
      { id: 'CRI-007', name: 'Rigueur', score: 5, weight: 30, comment: 'Aucune erreur comptable' },
      { id: 'CRI-008', name: 'Proactivité', score: 4, weight: 20, comment: 'Anticipation des risques' },
      { id: 'CRI-009', name: 'Collaboration', score: 5, weight: 15, comment: 'Excellente avec tous bureaux' },
    ],
    strengths: ['Comptabilité SYSCOHADA', 'Gestion trésorerie', 'Audit interne'],
    improvements: ['Digitalisation processus'],
    recommendations: [
      { id: 'REC-003', type: 'promotion', title: 'Confirmation poste Chef Bureau', description: 'Suite période probatoire', status: 'implemented', implementedAt: '01/01/2024' },
    ],
    nextEvaluation: '01/03/2026',
    hash: 'SHA3-256:eval002e5f6g7h...',
  },
  {
    id: 'EVAL-2025-0013',
    employeeId: 'EMP-003',
    employeeName: 'Ousmane NDIAYE',
    employeeRole: 'Chargé RH & Administration',
    bureau: 'BMO',
    evaluatorId: 'EMP-001',
    evaluatorName: 'Ibrahim FALL',
    date: '10/01/2025',
    period: '2024-Annuel',
    status: 'completed',
    scoreGlobal: 78,
    criteria: [
      { id: 'CRI-010', name: 'Gestion administrative', score: 4, weight: 30, comment: 'Bonne organisation' },
      { id: 'CRI-011', name: 'Gestion paie', score: 4, weight: 30, comment: 'Paie toujours à temps' },
      { id: 'CRI-012', name: 'Ponctualité', score: 3, weight: 20, comment: 'Quelques retards notés' },
      { id: 'CRI-013', name: 'Réactivité', score: 3, weight: 20, comment: 'Peut être améliorée' },
    ],
    strengths: ['Connaissance droit du travail', 'Gestion paie'],
    improvements: ['Ponctualité', 'Réactivité aux demandes', 'Digitalisation RH'],
    recommendations: [
      { id: 'REC-004', type: 'recadrage', title: 'Entretien recadrage ponctualité', description: 'Suite retards répétés', status: 'implemented', implementedAt: '15/01/2025' },
      { id: 'REC-005', type: 'formation', title: 'Formation logiciel SIRH', description: 'Digitalisation processus RH', status: 'pending' },
    ],
    nextEvaluation: '10/01/2026',
    hash: 'SHA3-256:eval003i8j9k0l...',
  },
  {
    id: 'EVAL-2025-0012',
    employeeId: 'EMP-006',
    employeeName: 'Aïssatou SECK',
    employeeRole: 'Responsable Achats',
    bureau: 'BA',
    evaluatorId: 'EMP-001',
    evaluatorName: 'Ibrahim FALL',
    date: '01/07/2025',
    period: '2025-S1',
    status: 'completed',
    scoreGlobal: 72,
    criteria: [
      { id: 'CRI-014', name: 'Négociation', score: 4, weight: 30 },
      { id: 'CRI-015', name: 'Suivi fournisseurs', score: 3, weight: 25 },
      { id: 'CRI-016', name: 'Respect procédures', score: 3, weight: 25 },
      { id: 'CRI-017', name: 'Assiduité', score: 3, weight: 20, comment: 'Absences et retards' },
    ],
    strengths: ['Négociation prix'],
    improvements: ['Assiduité', 'Respect des procédures', 'Documentation achats'],
    recommendations: [
      { id: 'REC-006', type: 'recadrage', title: 'Avertissement formel', description: 'Absences non justifiées répétées', status: 'implemented', implementedAt: '01/10/2025' },
    ],
    employeeComment: 'Je m\'engage à améliorer mon assiduité',
    nextEvaluation: '01/01/2026',
    hash: 'SHA3-256:eval004m1n2o3p...',
  },
  // Évaluations à venir
  {
    id: 'EVAL-2026-0001',
    employeeId: 'EMP-003',
    employeeName: 'Ousmane NDIAYE',
    employeeRole: 'Chargé RH & Administration',
    bureau: 'BMO',
    evaluatorId: 'EMP-001',
    evaluatorName: 'Ibrahim FALL',
    date: '10/01/2026',
    period: '2025-Annuel',
    status: 'scheduled',
    scoreGlobal: 0,
    criteria: [],
    strengths: [],
    improvements: [],
    recommendations: [],
  },
  {
    id: 'EVAL-2026-0002',
    employeeId: 'EMP-006',
    employeeName: 'Aïssatou SECK',
    employeeRole: 'Responsable Achats',
    bureau: 'BA',
    evaluatorId: 'EMP-001',
    evaluatorName: 'Ibrahim FALL',
    date: '01/01/2026',
    period: '2025-S2',
    status: 'scheduled',
    scoreGlobal: 0,
    criteria: [],
    strengths: [],
    improvements: [],
    recommendations: [],
  },
];

// --- Compétences critiques (analyse mono-compétence) ---
export const criticalSkills: CriticalSkill[] = [
  {
    id: 'SKILL-001',
    name: 'Coordination inter-bureaux',
    description: 'Capacité à coordonner les actions entre tous les bureaux et assurer le lien avec la DG',
    holders: ['EMP-001'],
    isAtRisk: true,
    bureau: 'BMO',
    importance: 'critical',
  },
  {
    id: 'SKILL-002',
    name: 'Validation BC/Contrats OHADA',
    description: 'Connaissance approfondie des normes OHADA pour validation des documents',
    holders: ['EMP-002'],
    isAtRisk: true,
    bureau: 'BMO',
    importance: 'critical',
  },
  {
    id: 'SKILL-003',
    name: 'Gestion Paie',
    description: 'Maîtrise du processus de paie, déclarations sociales et fiscales',
    holders: ['EMP-003'],
    isAtRisk: true,
    bureau: 'BMO',
    importance: 'critical',
  },
  {
    id: 'SKILL-004',
    name: 'Comptabilité SYSCOHADA',
    description: 'Expertise comptable selon le référentiel SYSCOHADA révisé',
    holders: ['EMP-004'],
    isAtRisk: true,
    bureau: 'BF',
    importance: 'critical',
  },
  {
    id: 'SKILL-005',
    name: 'Marchés publics',
    description: 'Connaissance de la réglementation des marchés publics au Sénégal',
    holders: ['EMP-005'],
    isAtRisk: true,
    bureau: 'BM',
    importance: 'critical',
  },
  {
    id: 'SKILL-006',
    name: 'Supervision chantiers BTP',
    description: 'Contrôle qualité et supervision technique des chantiers',
    holders: ['EMP-007'],
    isAtRisk: true,
    bureau: 'BCT',
    importance: 'critical',
  },
  {
    id: 'SKILL-007',
    name: 'Droit OHADA & Contentieux',
    description: 'Expertise juridique en droit des affaires OHADA et gestion des litiges',
    holders: ['EMP-008'],
    isAtRisk: true,
    bureau: 'BJ',
    importance: 'critical',
  },
  {
    id: 'SKILL-008',
    name: 'Négociation fournisseurs',
    description: 'Capacité de négociation pour optimiser les achats',
    holders: ['EMP-005', 'EMP-006'],
    isAtRisk: false,
    bureau: 'BA',
    importance: 'high',
  },
];

// Factures reçues avec décision BMO
export const facturesRecues: Facture[] = [
  {
    id: 'F-2026-0012',
    dateEmission: '10/12/2025',
    dateReception: '12/12/2025',
    fournisseur: 'SENFER',
    chantier: 'Chantier Dakar Nord',
    chantierId: 'CH-2025-DKN',
    referenceBC: 'BC-2025-0154',
    montantHT: 38_000_000,
    montantTTC: 45_600_000,
    description: 'Fourniture béton C30/37 – lot 2',
    statut: 'payée',
    commentaire: 'Conforme – livraison validée',
    decisionBMO: {
      decisionId: 'PAY-20251215-001',
      origin: 'validation-paiements',
      validatorRole: 'R', // Responsable (BM)
      hash: 'SHA3-256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      comment: 'Double validation BF + BMO – conformité BC OK',
    },
  },
  {
    id: 'F-2026-0013',
    dateEmission: '18/12/2025',
    dateReception: '20/12/2025',
    fournisseur: 'EIFFAGE SENEGAL',
    chantier: 'Chantier Ziguinchor Port',
    chantierId: 'CH-2025-ZGP',
    referenceBC: 'BC-2025-0188',
    montantHT: 125_000_000,
    montantTTC: 150_000_000,
    description: 'Travaux de fondation – pieux profonds',
    statut: 'conforme',
    decisionBMO: {
      decisionId: 'PAY-20260105-003',
      origin: 'validation-paiements',
      validatorRole: 'A', // Accountable (BMO)
      hash: 'SHA3-256:f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8',
      comment: 'Validé – contrôle géotechnique OK',
    },
  },
  {
    id: 'F-2026-0014',
    dateEmission: '05/01/2026',
    dateReception: '07/01/2026',
    fournisseur: 'MATBTP SA',
    chantier: 'Chantier Thiès Est',
    chantierId: 'CH-2025-THE',
    referenceBC: 'BC-2025-0201',
    montantHT: 8_500_000,
    montantTTC: 10_200_000,
    description: 'Livraison parpaings – conforme bon de livraison',
    statut: 'à_vérifier',
    // ❌ Pas de decisionBMO → facture en attente de validation BMO
  },
  {
    id: 'F-2026-0015',
    dateEmission: '02/01/2026',
    dateReception: '04/01/2026',
    fournisseur: 'CONSTRUCTION RAPIDE',
    chantier: 'Chantier Touba Centre',
    chantierId: 'CH-2025-TBC',
    referenceBC: 'BC-2025-0199',
    montantHT: 22_000_000,
    montantTTC: 26_400_000,
    description: 'Maçonnerie intérieure – hors nomenclature',
    statut: 'rejetée',
    commentaire: 'Poste non prévu au BC – rejeté',
    decisionBMO: {
      decisionId: 'PAY-20260110-007',
      origin: 'validation-paiements',
      validatorRole: 'A',
      hash: 'SHA3-256:0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
      comment: 'Rejeté – hors périmètre BC',
    },
  },
];
