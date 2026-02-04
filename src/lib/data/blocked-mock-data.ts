/**
 * ====================================================================
 * MOCK DATA: Dossiers Bloqués - Données Réalistes
 * ====================================================================
 * 
 * Fichier de mock data complet pour les dossiers bloqués.
 * Remplacez ces mocks par des appels API réels en production.
 * 
 * Contenu:
 * - Dossiers bloqués (25+ entrées réalistes)
 * - Statistiques agrégées
 * - Historique d'audit
 * - Templates de résolution
 * - Analytics data
 */

import type { BlockedDossier } from '@/lib/types/bmo.types';

// ================================
// TYPES SPÉCIFIQUES AUX MOCKS
// ================================

export interface MockBlockedDossier extends BlockedDossier {
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  slaTarget: number; // en heures
  priority: number;
  reference: string;
  status?: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  tags?: string[];
  documents?: { id: string; name: string; type: string; uploadedAt: string }[];
  comments?: { id: string; author: string; content: string; createdAt: string }[];
}

export interface MockAuditEntry {
  id: string;
  at: string;
  action: 'created' | 'escalated' | 'substituted' | 'resolved' | 'commented' | 'reassigned' | 'updated';
  dossierId: string;
  dossierSubject: string;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  hash: string;
  previousState?: string;
  newState?: string;
}

export interface MockResolutionTemplate {
  id: string;
  name: string;
  category: 'resolution' | 'escalation' | 'substitution';
  content: string;
  variables: string[];
  usageCount: number;
  lastUsed?: string;
}

export interface MockAnalyticsData {
  trendData: { week: string; critical: number; high: number; medium: number; low: number }[];
  resolutionTimeData: { range: string; count: number }[];
  bureauPerformance: { bureau: string; resolved: number; pending: number; rate: number }[];
  typeDistribution: { type: string; count: number; amount: number }[];
  financialImpact: { week: string; amount: number }[];
  slaCompliance: { bureau: string; compliant: number; breached: number }[];
}

// ================================
// DOSSIERS BLOQUÉS RÉALISTES (25+)
// ================================

const today = new Date();
const formatDate = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

export const mockBlockedDossiers: MockBlockedDossier[] = [
  // === CRITIQUES (5) ===
  {
    id: 'BLK-2026-0001',
    reference: 'PAY-2026-0847',
    type: 'Paiement',
    subject: 'Situation n°4 - Travaux VRD Phase 2',
    reason: 'Validation DG requise - Montant supérieur au seuil de délégation',
    amount: '125,500,000 FCFA',
    bureau: 'BF',
    responsible: 'Fatou DIOP',
    blockedSince: formatDate(18),
    delay: 18,
    impact: 'critical',
    status: 'pending',
    project: 'PRJ-INFRA-2026-001',
    createdAt: formatDate(18),
    updatedAt: formatDate(1),
    assignedTo: 'USR-001',
    assignedToName: 'Amadou DIALLO',
    slaTarget: 72,
    priority: 98,
    tags: ['urgent', 'vrd', 'infrastructure'],
    documents: [
      { id: 'DOC-001', name: 'Situation_n4_VRD.pdf', type: 'situation', uploadedAt: formatDate(18) },
      { id: 'DOC-002', name: 'PV_Reception_Phase2.pdf', type: 'pv', uploadedAt: formatDate(17) },
    ],
    comments: [
      { id: 'COM-001', author: 'Fatou DIOP', content: 'En attente validation DG depuis 15 jours', createdAt: formatDate(3) },
    ],
  },
  {
    id: 'BLK-2026-0002',
    reference: 'CTR-2026-0156',
    type: 'Contrat',
    subject: 'Contrat cadre fournitures électriques 2026',
    reason: 'Litige sur clauses de pénalités - Négociation bloquée',
    amount: '85,000,000 FCFA',
    bureau: 'BJ',
    responsible: 'Ndèye FAYE',
    blockedSince: formatDate(21),
    delay: 21,
    impact: 'critical',
    status: 'escalated',
    project: 'PRJ-ELEC-2026-002',
    createdAt: formatDate(21),
    updatedAt: formatDate(0),
    assignedTo: 'USR-002',
    assignedToName: 'Marie SALL',
    slaTarget: 120,
    priority: 95,
    tags: ['juridique', 'negociation', 'contrat-cadre'],
  },
  {
    id: 'BLK-2026-0003',
    reference: 'VAL-2026-0089',
    type: 'Validation',
    subject: 'Budget rectificatif PRJ-INFRA-2026-003',
    reason: 'Dépassement budgétaire 23% - Arbitrage CODIR requis',
    amount: '45,000,000 FCFA',
    bureau: 'BCT',
    responsible: 'Cheikh GUEYE',
    blockedSince: formatDate(14),
    delay: 14,
    impact: 'critical',
    status: 'pending',
    project: 'PRJ-INFRA-2026-003',
    createdAt: formatDate(14),
    updatedAt: formatDate(2),
    slaTarget: 48,
    priority: 92,
    tags: ['budget', 'codir', 'depassement'],
  },
  {
    id: 'BLK-2026-0004',
    reference: 'PAY-2026-0921',
    type: 'Paiement',
    subject: 'Facture fournisseur SOCOCIM - Ciment Phase 3',
    reason: 'Écart quantité réceptionnée vs facturée - Vérification en cours',
    amount: '18,750,000 FCFA',
    bureau: 'BA',
    responsible: 'Abdou SECK',
    blockedSince: formatDate(16),
    delay: 16,
    impact: 'critical',
    status: 'pending',
    project: 'PRJ-BATIMENT-2026-001',
    createdAt: formatDate(16),
    updatedAt: formatDate(1),
    slaTarget: 72,
    priority: 90,
  },
  {
    id: 'BLK-2026-0005',
    reference: 'DEM-2026-0234',
    type: 'Demande',
    subject: 'Autorisation démarrage travaux Zone D',
    reason: 'Permis de construire en attente - Mairie de Diamniadio',
    amount: '—',
    bureau: 'BCT',
    responsible: 'Cheikh GUEYE',
    blockedSince: formatDate(25),
    delay: 25,
    impact: 'critical',
    status: 'pending',
    project: 'PRJ-BATIMENT-2026-002',
    createdAt: formatDate(25),
    updatedAt: formatDate(3),
    slaTarget: 168,
    priority: 88,
    tags: ['administratif', 'permis', 'mairie'],
  },

  // === HAUTE PRIORITÉ (8) ===
  {
    id: 'BLK-2026-0006',
    reference: 'PAY-2026-0756',
    type: 'Paiement',
    subject: 'Acompte entreprise MATFORCE - Location engins',
    reason: 'Pièces justificatives incomplètes - Attestation fiscale expirée',
    amount: '12,500,000 FCFA',
    bureau: 'BF',
    responsible: 'Fatou DIOP',
    blockedSince: formatDate(10),
    delay: 10,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-INFRA-2026-001',
    createdAt: formatDate(10),
    updatedAt: formatDate(1),
    slaTarget: 72,
    priority: 75,
  },
  {
    id: 'BLK-2026-0007',
    reference: 'CTR-2026-0178',
    type: 'Contrat',
    subject: 'Avenant n°2 - Extension délais EIFFAGE',
    reason: 'Validation technique en attente - Impact planning global',
    amount: '—',
    bureau: 'BM',
    responsible: 'Moussa BA',
    blockedSince: formatDate(8),
    delay: 8,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-ROUTE-2026-001',
    createdAt: formatDate(8),
    updatedAt: formatDate(0),
    slaTarget: 96,
    priority: 72,
  },
  {
    id: 'BLK-2026-0008',
    reference: 'VAL-2026-0112',
    type: 'Validation',
    subject: 'Devis travaux supplémentaires Villa Diamniadio',
    reason: 'Modification client - Attente validation technique et financière',
    amount: '8,900,000 FCFA',
    bureau: 'BA',
    responsible: 'Abdou SECK',
    blockedSince: formatDate(7),
    delay: 7,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-VILLA-2026-001',
    createdAt: formatDate(7),
    updatedAt: formatDate(1),
    slaTarget: 48,
    priority: 70,
  },
  {
    id: 'BLK-2026-0009',
    reference: 'PAY-2026-0834',
    type: 'Paiement',
    subject: 'Retenue de garantie - PRJ-BATIMENT-2025-012',
    reason: 'Levée des réserves en cours - PV non signé',
    amount: '3,250,000 FCFA',
    bureau: 'BF',
    responsible: 'Fatou DIOP',
    blockedSince: formatDate(12),
    delay: 12,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-BATIMENT-2025-012',
    createdAt: formatDate(12),
    updatedAt: formatDate(2),
    slaTarget: 120,
    priority: 68,
  },
  {
    id: 'BLK-2026-0010',
    reference: 'DEM-2026-0298',
    type: 'Demande',
    subject: 'Recrutement chef de chantier Phase 3',
    reason: 'Arbitrage RH - Trois candidatures équivalentes',
    amount: '—',
    bureau: 'RH',
    responsible: 'Rama SY',
    blockedSince: formatDate(9),
    delay: 9,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-INFRA-2026-003',
    createdAt: formatDate(9),
    updatedAt: formatDate(0),
    slaTarget: 72,
    priority: 65,
  },
  {
    id: 'BLK-2026-0011',
    reference: 'CTR-2026-0189',
    type: 'Contrat',
    subject: 'Contrat sous-traitance plomberie',
    reason: 'Vérification références entreprise - Contrôle qualité',
    amount: '4,500,000 FCFA',
    bureau: 'BM',
    responsible: 'Moussa BA',
    blockedSince: formatDate(6),
    delay: 6,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-VILLA-2026-001',
    createdAt: formatDate(6),
    updatedAt: formatDate(0),
    slaTarget: 72,
    priority: 62,
  },
  {
    id: 'BLK-2026-0012',
    reference: 'VAL-2026-0134',
    type: 'Validation',
    subject: 'Ordre de service démarrage Lot 4',
    reason: 'Coordination inter-bureaux - Planification ressources',
    amount: '—',
    bureau: 'BCT',
    responsible: 'Cheikh GUEYE',
    blockedSince: formatDate(5),
    delay: 5,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-INFRA-2026-001',
    createdAt: formatDate(5),
    updatedAt: formatDate(0),
    slaTarget: 48,
    priority: 60,
  },
  {
    id: 'BLK-2026-0013',
    reference: 'PAY-2026-0867',
    type: 'Paiement',
    subject: 'Facture SENFER - Fer à béton HA12',
    reason: 'Contrôle qualité matériaux - Certificat de conformité attendu',
    amount: '6,450,000 FCFA',
    bureau: 'BA',
    responsible: 'Abdou SECK',
    blockedSince: formatDate(8),
    delay: 8,
    impact: 'high',
    status: 'pending',
    project: 'PRJ-BATIMENT-2026-001',
    createdAt: formatDate(8),
    updatedAt: formatDate(1),
    slaTarget: 72,
    priority: 58,
  },

  // === PRIORITÉ MOYENNE (8) ===
  {
    id: 'BLK-2026-0014',
    reference: 'CTR-2026-0201',
    type: 'Contrat',
    subject: 'Renouvellement contrat maintenance ascenseurs',
    reason: 'Comparaison devis en cours - 3 prestataires consultés',
    amount: '2,800,000 FCFA/an',
    bureau: 'BM',
    responsible: 'Moussa BA',
    blockedSince: formatDate(4),
    delay: 4,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-MAINTENANCE-2026',
    createdAt: formatDate(4),
    updatedAt: formatDate(0),
    slaTarget: 120,
    priority: 45,
  },
  {
    id: 'BLK-2026-0015',
    reference: 'VAL-2026-0156',
    type: 'Validation',
    subject: 'Budget formation 2026 - Équipe technique',
    reason: 'Arbitrage priorités formation - Capacité financière',
    amount: '5,200,000 FCFA',
    bureau: 'RH',
    responsible: 'Rama SY',
    blockedSince: formatDate(3),
    delay: 3,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-RH-2026',
    createdAt: formatDate(3),
    updatedAt: formatDate(0),
    slaTarget: 168,
    priority: 42,
  },
  {
    id: 'BLK-2026-0016',
    reference: 'DEM-2026-0345',
    type: 'Demande',
    subject: 'Achat véhicule de chantier',
    reason: 'Validation budget investissement - Comité achats',
    amount: '18,000,000 FCFA',
    bureau: 'BA',
    responsible: 'Abdou SECK',
    blockedSince: formatDate(6),
    delay: 6,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-EQUIPEMENT-2026',
    createdAt: formatDate(6),
    updatedAt: formatDate(1),
    slaTarget: 168,
    priority: 40,
  },
  {
    id: 'BLK-2026-0017',
    reference: 'PAY-2026-0901',
    type: 'Paiement',
    subject: 'Note de frais mission Ziguinchor',
    reason: 'Justificatifs partiels - Récépissés manquants',
    amount: '485,000 FCFA',
    bureau: 'BF',
    responsible: 'Fatou DIOP',
    blockedSince: formatDate(4),
    delay: 4,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-MISSION-2026',
    createdAt: formatDate(4),
    updatedAt: formatDate(0),
    slaTarget: 48,
    priority: 38,
  },
  {
    id: 'BLK-2026-0018',
    reference: 'CTR-2026-0212',
    type: 'Contrat',
    subject: 'Contrat gardiennage sites Phase 3',
    reason: 'Vérification agréments sécurité - Conformité réglementaire',
    amount: '1,200,000 FCFA/mois',
    bureau: 'BJ',
    responsible: 'Ndèye FAYE',
    blockedSince: formatDate(5),
    delay: 5,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-SECURITE-2026',
    createdAt: formatDate(5),
    updatedAt: formatDate(0),
    slaTarget: 96,
    priority: 35,
  },
  {
    id: 'BLK-2026-0019',
    reference: 'VAL-2026-0178',
    type: 'Validation',
    subject: 'Plan de communication projet inaugurations',
    reason: 'Validation message institutionnel - Cabinet DG',
    amount: '3,500,000 FCFA',
    bureau: 'COM',
    responsible: 'Awa NDIAYE',
    blockedSince: formatDate(2),
    delay: 2,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-COMMUNICATION-2026',
    createdAt: formatDate(2),
    updatedAt: formatDate(0),
    slaTarget: 72,
    priority: 32,
  },
  {
    id: 'BLK-2026-0020',
    reference: 'DEM-2026-0367',
    type: 'Demande',
    subject: 'Mise à jour logiciel comptabilité',
    reason: 'Validation DSI - Test environnement préproduction',
    amount: '850,000 FCFA',
    bureau: 'DSI',
    responsible: 'Ibrahima FALL',
    blockedSince: formatDate(3),
    delay: 3,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-IT-2026',
    createdAt: formatDate(3),
    updatedAt: formatDate(0),
    slaTarget: 120,
    priority: 30,
  },
  {
    id: 'BLK-2026-0021',
    reference: 'PAY-2026-0923',
    type: 'Paiement',
    subject: 'Facture SENELEC - Consommation chantiers T4',
    reason: 'Vérification compteurs - Répartition multi-sites',
    amount: '2,340,000 FCFA',
    bureau: 'BF',
    responsible: 'Fatou DIOP',
    blockedSince: formatDate(4),
    delay: 4,
    impact: 'medium',
    status: 'pending',
    project: 'PRJ-ENERGIE-2026',
    createdAt: formatDate(4),
    updatedAt: formatDate(0),
    slaTarget: 72,
    priority: 28,
  },

  // === BASSE PRIORITÉ (4) ===
  {
    id: 'BLK-2026-0022',
    reference: 'DEM-2026-0389',
    type: 'Demande',
    subject: 'Abonnement revue technique BTP 2026',
    reason: 'Validation budget documentation - Priorité basse',
    amount: '180,000 FCFA',
    bureau: 'BCT',
    responsible: 'Cheikh GUEYE',
    blockedSince: formatDate(2),
    delay: 2,
    impact: 'low',
    status: 'pending',
    project: 'PRJ-DOCUMENTATION-2026',
    createdAt: formatDate(2),
    updatedAt: formatDate(0),
    slaTarget: 240,
    priority: 15,
  },
  {
    id: 'BLK-2026-0023',
    reference: 'VAL-2026-0201',
    type: 'Validation',
    subject: 'Mise à jour organigramme équipe projet',
    reason: 'Validation RH - Clarification rôles',
    amount: '—',
    bureau: 'RH',
    responsible: 'Rama SY',
    blockedSince: formatDate(1),
    delay: 1,
    impact: 'low',
    status: 'pending',
    project: 'PRJ-RH-2026',
    createdAt: formatDate(1),
    updatedAt: formatDate(0),
    slaTarget: 168,
    priority: 12,
  },
  {
    id: 'BLK-2026-0024',
    reference: 'CTR-2026-0234',
    type: 'Contrat',
    subject: 'Renouvellement abonnement Cloud backup',
    reason: 'Comparaison offres concurrentes - Optimisation coûts',
    amount: '420,000 FCFA/an',
    bureau: 'DSI',
    responsible: 'Ibrahima FALL',
    blockedSince: formatDate(3),
    delay: 3,
    impact: 'low',
    status: 'pending',
    project: 'PRJ-IT-2026',
    createdAt: formatDate(3),
    updatedAt: formatDate(0),
    slaTarget: 240,
    priority: 10,
  },
  {
    id: 'BLK-2026-0025',
    reference: 'DEM-2026-0401',
    type: 'Demande',
    subject: 'Fournitures bureau Q1 2026',
    reason: 'Consolidation commandes - Optimisation groupée',
    amount: '350,000 FCFA',
    bureau: 'BA',
    responsible: 'Abdou SECK',
    blockedSince: formatDate(1),
    delay: 1,
    impact: 'low',
    status: 'pending',
    project: 'PRJ-ADMIN-2026',
    createdAt: formatDate(1),
    updatedAt: formatDate(0),
    slaTarget: 240,
    priority: 8,
  },
];

// ================================
// STATISTIQUES AGRÉGÉES
// ================================

export const mockBlockedStats = {
  total: mockBlockedDossiers.length,
  critical: mockBlockedDossiers.filter(d => d.impact === 'critical').length,
  high: mockBlockedDossiers.filter(d => d.impact === 'high').length,
  medium: mockBlockedDossiers.filter(d => d.impact === 'medium').length,
  low: mockBlockedDossiers.filter(d => d.impact === 'low').length,
  avgDelay: Math.round(mockBlockedDossiers.reduce((sum, d) => sum + d.delay, 0) / mockBlockedDossiers.length),
  avgPriority: Math.round(mockBlockedDossiers.reduce((sum, d) => sum + d.priority, 0) / mockBlockedDossiers.length),
  totalAmount: mockBlockedDossiers.reduce((sum, d) => {
    const match = d.amount?.match(/[\d,]+/);
    return sum + (match ? parseInt(match[0].replace(/,/g, '')) : 0);
  }, 0),
  overdueSLA: mockBlockedDossiers.filter(d => d.delay * 24 > d.slaTarget).length,
  resolvedToday: 3,
  escalatedToday: 2,
  byBureau: [
    { bureau: 'BF', count: 5, critical: 1 },
    { bureau: 'BCT', count: 4, critical: 2 },
    { bureau: 'BA', count: 4, critical: 1 },
    { bureau: 'BM', count: 3, critical: 0 },
    { bureau: 'BJ', count: 3, critical: 1 },
    { bureau: 'RH', count: 3, critical: 0 },
    { bureau: 'DSI', count: 2, critical: 0 },
    { bureau: 'COM', count: 1, critical: 0 },
  ],
  byType: [
    { type: 'Paiement', count: 8 },
    { type: 'Validation', count: 6 },
    { type: 'Contrat', count: 6 },
    { type: 'Demande', count: 5 },
  ],
  ts: new Date().toISOString(),
};

// ================================
// HISTORIQUE D'AUDIT
// ================================

export const mockAuditLog: MockAuditEntry[] = [
  {
    id: 'AUD-2026-0001',
    at: formatDate(0),
    action: 'escalated',
    dossierId: 'BLK-2026-0002',
    dossierSubject: 'Contrat cadre fournitures électriques 2026',
    userId: 'USR-DG-001',
    userName: 'Amadou DIALLO',
    userRole: 'Directeur Général',
    details: 'Escalade au CODIR - Litige contractuel majeur nécessitant arbitrage',
    hash: 'SHA256:a8f5e7c1b2d4e6f8a0c3e5b7d9f1a3c5...',
  },
  {
    id: 'AUD-2026-0002',
    at: formatDate(1),
    action: 'substituted',
    dossierId: 'BLK-2026-0008',
    dossierSubject: 'Devis travaux supplémentaires Villa',
    userId: 'USR-DG-001',
    userName: 'Amadou DIALLO',
    userRole: 'Directeur Général',
    details: 'Substitution BMO - Bureau BA indisponible depuis 7 jours',
    hash: 'SHA256:b9e6f8a0c2d4f6a8b0d2e4c6a8f0b2d4...',
  },
  {
    id: 'AUD-2026-0003',
    at: formatDate(2),
    action: 'resolved',
    dossierId: 'BLK-2026-0045',
    dossierSubject: 'Facture maintenance Q4 2025',
    userId: 'USR-BF-001',
    userName: 'Fatou DIOP',
    userRole: 'Responsable Finance',
    details: 'Résolution directe - Paiement effectué après réception justificatifs',
    hash: 'SHA256:c0f7a9b1d3e5g7i9k1m3o5q7s9u1w3y5...',
  },
  {
    id: 'AUD-2026-0004',
    at: formatDate(3),
    action: 'commented',
    dossierId: 'BLK-2026-0001',
    dossierSubject: 'Situation n°4 - Travaux VRD Phase 2',
    userId: 'USR-BF-001',
    userName: 'Fatou DIOP',
    userRole: 'Responsable Finance',
    details: 'Commentaire ajouté: Relance DG effectuée par email',
    hash: 'SHA256:d1g8b0c2e4f6h8j0l2n4p6r8t0v2x4z6...',
  },
  {
    id: 'AUD-2026-0005',
    at: formatDate(4),
    action: 'reassigned',
    dossierId: 'BLK-2026-0012',
    dossierSubject: 'Ordre de service démarrage Lot 4',
    userId: 'USR-BCT-001',
    userName: 'Cheikh GUEYE',
    userRole: 'Responsable Contrôle Technique',
    details: 'Réassignation vers Bureau Marchés pour coordination planning',
    hash: 'SHA256:e2h9c1d3f5g7i9k1m3o5q7s9u1w3y5a7...',
  },
  {
    id: 'AUD-2026-0006',
    at: formatDate(5),
    action: 'escalated',
    dossierId: 'BLK-2026-0003',
    dossierSubject: 'Budget rectificatif PRJ-INFRA-2026-003',
    userId: 'USR-BF-001',
    userName: 'Fatou DIOP',
    userRole: 'Responsable Finance',
    details: 'Escalade direction - Dépassement budgétaire >20% requiert validation CODIR',
    hash: 'SHA256:f3i0d2e4g6h8j0l2n4p6r8t0v2x4z6b8...',
  },
  {
    id: 'AUD-2026-0007',
    at: formatDate(6),
    action: 'created',
    dossierId: 'BLK-2026-0011',
    dossierSubject: 'Contrat sous-traitance plomberie',
    userId: 'USR-BM-001',
    userName: 'Moussa BA',
    userRole: 'Responsable Marchés',
    details: 'Dossier créé - Contrôle qualité requis avant signature',
    hash: 'SHA256:g4j1e3f5h7i9k1m3o5q7s9u1w3y5a7c9...',
  },
  {
    id: 'AUD-2026-0008',
    at: formatDate(7),
    action: 'updated',
    dossierId: 'BLK-2026-0006',
    dossierSubject: 'Acompte entreprise MATFORCE',
    userId: 'USR-BA-001',
    userName: 'Abdou SECK',
    userRole: 'Responsable Achats',
    details: 'Mise à jour statut - Attestation fiscale demandée au fournisseur',
    hash: 'SHA256:h5k2f4g6i8j0l2n4p6r8t0v2x4z6b8d0...',
  },
];

// ================================
// TEMPLATES DE RÉSOLUTION
// ================================

export const mockResolutionTemplates: MockResolutionTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Résolution standard - Paiement validé',
    category: 'resolution',
    content: 'Le dossier {{dossierId}} concernant {{subject}} a été résolu. Le paiement de {{amount}} a été validé et transmis au service comptable pour exécution. Délai de traitement estimé: {{processingTime}} jours ouvrés.',
    variables: ['dossierId', 'subject', 'amount', 'processingTime'],
    usageCount: 45,
    lastUsed: formatDate(1),
  },
  {
    id: 'TPL-002',
    name: 'Résolution - Documents reçus',
    category: 'resolution',
    content: 'Suite à la réception des documents manquants ({{documentsList}}), le dossier {{dossierId}} est désormais complet. Validation effectuée par {{validatorName}} le {{validationDate}}.',
    variables: ['documentsList', 'dossierId', 'validatorName', 'validationDate'],
    usageCount: 32,
    lastUsed: formatDate(2),
  },
  {
    id: 'TPL-003',
    name: 'Escalade CODIR - Dépassement seuil',
    category: 'escalation',
    content: 'Le dossier {{dossierId}} est escaladé au CODIR conformément à la procédure de délégation. Motif: {{reason}}. Montant concerné: {{amount}}. Date limite de décision recommandée: {{deadline}}.',
    variables: ['dossierId', 'reason', 'amount', 'deadline'],
    usageCount: 18,
    lastUsed: formatDate(0),
  },
  {
    id: 'TPL-004',
    name: 'Escalade urgente - Impact critique',
    category: 'escalation',
    content: 'URGENT: Escalade immédiate du dossier {{dossierId}}. Impact: {{impactDescription}}. Conséquences si non-traité: {{consequences}}. Action requise: {{requiredAction}}.',
    variables: ['dossierId', 'impactDescription', 'consequences', 'requiredAction'],
    usageCount: 8,
    lastUsed: formatDate(3),
  },
  {
    id: 'TPL-005',
    name: 'Substitution BMO - Absence prolongée',
    category: 'substitution',
    content: 'En application de l\'article {{articleRef}} du règlement intérieur, le BMO exerce son pouvoir de substitution sur le dossier {{dossierId}}. Le bureau {{originalBureau}} est absent depuis {{absenceDays}} jours. Décision prise: {{decision}}.',
    variables: ['articleRef', 'dossierId', 'originalBureau', 'absenceDays', 'decision'],
    usageCount: 12,
    lastUsed: formatDate(1),
  },
  {
    id: 'TPL-006',
    name: 'Substitution urgente - Blocage critique',
    category: 'substitution',
    content: 'SUBSTITUTION D\'URGENCE: Le dossier {{dossierId}} présente un risque {{riskLevel}} pour les opérations. Le BMO prend la responsabilité de la décision suivante: {{decision}}. Cette action est tracée et auditable (Hash: {{auditHash}}).',
    variables: ['dossierId', 'riskLevel', 'decision', 'auditHash'],
    usageCount: 5,
    lastUsed: formatDate(4),
  },
];

// ================================
// DONNÉES ANALYTICS
// ================================

export const mockAnalyticsData: MockAnalyticsData = {
  trendData: [
    { week: 'S48', critical: 8, high: 18, medium: 12, low: 5 },
    { week: 'S49', critical: 12, high: 22, medium: 15, low: 6 },
    { week: 'S50', critical: 15, high: 20, medium: 18, low: 4 },
    { week: 'S51', critical: 10, high: 25, medium: 14, low: 8 },
    { week: 'S52', critical: 14, high: 21, medium: 16, low: 5 },
    { week: 'S01', critical: 5, high: 8, medium: 8, low: 4 },
  ],
  resolutionTimeData: [
    { range: '< 24h', count: 12 },
    { range: '1-3j', count: 28 },
    { range: '3-7j', count: 22 },
    { range: '7-14j', count: 15 },
    { range: '> 14j', count: 8 },
  ],
  bureauPerformance: [
    { bureau: 'BF', resolved: 42, pending: 5, rate: 89 },
    { bureau: 'BCT', resolved: 35, pending: 4, rate: 90 },
    { bureau: 'BA', resolved: 38, pending: 4, rate: 90 },
    { bureau: 'BM', resolved: 28, pending: 3, rate: 90 },
    { bureau: 'BJ', resolved: 22, pending: 3, rate: 88 },
    { bureau: 'RH', resolved: 18, pending: 3, rate: 86 },
    { bureau: 'DSI', resolved: 15, pending: 2, rate: 88 },
    { bureau: 'COM', resolved: 8, pending: 1, rate: 89 },
  ],
  typeDistribution: [
    { type: 'Paiement', count: 45, amount: 285000000 },
    { type: 'Validation', count: 32, amount: 125000000 },
    { type: 'Contrat', count: 28, amount: 180000000 },
    { type: 'Demande', count: 22, amount: 45000000 },
  ],
  financialImpact: [
    { week: 'S48', amount: 85 },
    { week: 'S49', amount: 112 },
    { week: 'S50', amount: 98 },
    { week: 'S51', amount: 145 },
    { week: 'S52', amount: 132 },
    { week: 'S01', amount: 78 },
  ],
  slaCompliance: [
    { bureau: 'BF', compliant: 38, breached: 4 },
    { bureau: 'BCT', compliant: 32, breached: 3 },
    { bureau: 'BA', compliant: 35, breached: 3 },
    { bureau: 'BM', compliant: 26, breached: 2 },
    { bureau: 'BJ', compliant: 20, breached: 2 },
    { bureau: 'RH', compliant: 16, breached: 2 },
  ],
};

// ================================
// BUREAUX ET RESPONSABLES
// ================================

export const mockBureaux = [
  { code: 'BF', name: 'Bureau Finance', responsable: 'Fatou DIOP', email: 'f.diop@yesselate.sn' },
  { code: 'BCT', name: 'Bureau Contrôle Technique', responsable: 'Cheikh GUEYE', email: 'c.gueye@yesselate.sn' },
  { code: 'BA', name: 'Bureau Achats', responsable: 'Abdou SECK', email: 'a.seck@yesselate.sn' },
  { code: 'BM', name: 'Bureau Marchés', responsable: 'Moussa BA', email: 'm.ba@yesselate.sn' },
  { code: 'BJ', name: 'Bureau Juridique', responsable: 'Ndèye FAYE', email: 'n.faye@yesselate.sn' },
  { code: 'RH', name: 'Ressources Humaines', responsable: 'Rama SY', email: 'r.sy@yesselate.sn' },
  { code: 'DSI', name: 'Direction Systèmes Information', responsable: 'Ibrahima FALL', email: 'i.fall@yesselate.sn' },
  { code: 'COM', name: 'Communication', responsable: 'Awa NDIAYE', email: 'a.ndiaye@yesselate.sn' },
];

// ================================
// TYPES DE BLOCAGE
// ================================

export const mockBlockageTypes = [
  { code: 'PAY', name: 'Paiement', color: '#ef4444', icon: 'wallet' },
  { code: 'VAL', name: 'Validation', color: '#f59e0b', icon: 'check-circle' },
  { code: 'CTR', name: 'Contrat', color: '#3b82f6', icon: 'file-text' },
  { code: 'DEM', name: 'Demande', color: '#8b5cf6', icon: 'inbox' },
];

// ================================
// EXPORT HELPER FUNCTIONS
// ================================

export function getBlockedById(id: string): MockBlockedDossier | undefined {
  return mockBlockedDossiers.find(d => d.id === id);
}

export function getBlockedByImpact(impact: string): MockBlockedDossier[] {
  return mockBlockedDossiers.filter(d => d.impact === impact);
}

export function getBlockedByBureau(bureau: string): MockBlockedDossier[] {
  return mockBlockedDossiers.filter(d => d.bureau === bureau);
}

export function getOverdueSLA(): MockBlockedDossier[] {
  return mockBlockedDossiers.filter(d => d.delay * 24 > d.slaTarget);
}

export function searchBlocked(query: string): MockBlockedDossier[] {
  const q = query.toLowerCase();
  return mockBlockedDossiers.filter(d =>
    d.id.toLowerCase().includes(q) ||
    d.subject.toLowerCase().includes(q) ||
    d.reason.toLowerCase().includes(q) ||
    d.bureau.toLowerCase().includes(q)
  );
}

