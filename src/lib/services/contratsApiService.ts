/**
 * ====================================================================
 * SERVICE: API Validation Contrats
 * ====================================================================
 * 
 * APIs nécessaires pour le module de validation des contrats.
 * Mock actuellement, prêt pour intégration backend.
 * 
 * ENDPOINTS BACKEND REQUIS:
 * - GET    /api/bmo/contrats                    → Liste des contrats
 * - GET    /api/bmo/contrats/:id                → Détail d'un contrat
 * - GET    /api/bmo/contrats/stats              → Statistiques
 * - POST   /api/bmo/contrats/:id/validate       → Valider un contrat
 * - POST   /api/bmo/contrats/:id/reject         → Rejeter un contrat
 * - POST   /api/bmo/contrats/:id/negotiate      → Demander négociation
 * - POST   /api/bmo/contrats/:id/escalate       → Escalader
 * - POST   /api/bmo/contrats/bulk/validate      → Validation massive
 * - POST   /api/bmo/contrats/bulk/reject        → Rejet massif
 * - GET    /api/bmo/contrats/export             → Export
 * - GET    /api/bmo/contrats/audit              → Journal d'audit
 */

import type { ContratFilter, ContratDecisionEntry } from '@/lib/stores/contratsWorkspaceStore';

// ================================
// Types
// ================================

/** Décision de validation (notes) pour le hook useContratActions */
export type ContratDecision = { notes: string };

export interface Contrat {
  id: string;
  reference: string;
  title: string;
  description: string;
  fournisseur: {
    id: string;
    name: string;
    contact: string;
    email: string;
  };
  type: 'service' | 'fourniture' | 'travaux' | 'prestation' | 'maintenance' | 'location';
  montant: number;
  devise: string;
  duree: number; // en mois
  dateDebut: string;
  dateFin: string;
  dateReception: string;
  dateEcheance: string;
  status: 'pending' | 'validated' | 'rejected' | 'negotiation' | 'expired' | 'signed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  bureau: string;
  responsible: string;
  projet?: string;
  clauses: {
    id: string;
    title: string;
    content: string;
    status: 'ok' | 'warning' | 'ko';
    comment?: string;
  }[];
  documents: {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  }[];
  historique: {
    at: string;
    action: string;
    by: string;
    details: string;
  }[];
  commentaires: {
    id: string;
    content: string;
    by: string;
    at: string;
    visibility: 'internal' | 'shared';
  }[];
  risques: {
    niveau: 'low' | 'medium' | 'high';
    description: string;
    mitigation?: string;
  }[];
  conditions: {
    paiement: string;
    livraison: string;
    garantie: string;
    penalites: string;
  };
  validations: {
    juridique: boolean;
    technique: boolean;
    financier: boolean;
    direction: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContratsStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  negotiation: number;
  expired: number;
  byType: Record<string, number>;
  byUrgency: Record<string, number>;
  totalMontant: number;
  avgMontant: number;
  avgDelaiValidation: number;
  tauxValidation: number;
  expiringThisMonth: number;
  ts: string;
}

// ================================
// Mock Data
// ================================

const MOCK_FOURNISSEURS = [
  { id: 'FRN-001', name: 'SOGEA SATOM', contact: 'M. Diop', email: 'contact@sogea.sn' },
  { id: 'FRN-002', name: 'EIFFAGE SENEGAL', contact: 'M. Ndiaye', email: 'commercial@eiffage.sn' },
  { id: 'FRN-003', name: 'CSE BTP', contact: 'M. Fall', email: 'direction@cse-btp.sn' },
  { id: 'FRN-004', name: 'MATFORCE', contact: 'Mme Sarr', email: 'ventes@matforce.sn' },
  { id: 'FRN-005', name: 'SENELEC', contact: 'M. Ba', email: 'entreprises@senelec.sn' },
];

const MOCK_CONTRATS: Contrat[] = [
  {
    id: 'CTR-2024-001',
    reference: 'CTR-2024-001',
    title: 'Contrat de fourniture béton prêt à l\'emploi - Projet Dakar Arena',
    description: 'Fourniture de 15 000 m³ de béton B25/B30 pour la construction du Dakar Arena',
    fournisseur: MOCK_FOURNISSEURS[0],
    type: 'fourniture',
    montant: 450000000,
    devise: 'FCFA',
    duree: 18,
    dateDebut: '2024-03-01',
    dateFin: '2025-08-31',
    dateReception: '2024-01-15',
    dateEcheance: '2024-01-25',
    status: 'pending',
    urgency: 'critical',
    bureau: 'DT',
    responsible: 'M. SECK',
    projet: 'PRJ-2024-001',
    clauses: [
      { id: 'CL-1', title: 'Délai de livraison', content: 'Livraison sous 48h après commande', status: 'ok' },
      { id: 'CL-2', title: 'Qualité', content: 'Certification NF EN 206', status: 'ok' },
      { id: 'CL-3', title: 'Pénalités de retard', content: '0.5% par jour de retard', status: 'warning', comment: 'À négocier à 0.3%' },
      { id: 'CL-4', title: 'Conditions de paiement', content: 'Paiement à 90 jours', status: 'ko', comment: 'Demander 60 jours' },
    ],
    documents: [
      { id: 'DOC-1', name: 'Contrat_fourniture_beton.pdf', type: 'application/pdf', size: 2500000, uploadedAt: '2024-01-15T10:00:00Z' },
      { id: 'DOC-2', name: 'Annexe_technique.pdf', type: 'application/pdf', size: 1200000, uploadedAt: '2024-01-15T10:05:00Z' },
    ],
    historique: [
      { at: '2024-01-15T10:00:00Z', action: 'reception', by: 'M. SECK', details: 'Réception du contrat' },
      { at: '2024-01-16T14:30:00Z', action: 'analyse', by: 'Service Juridique', details: 'Analyse juridique en cours' },
    ],
    commentaires: [
      { id: 'COM-1', content: 'Négocier les conditions de paiement', by: 'M. SECK', at: '2024-01-16T15:00:00Z', visibility: 'internal' },
    ],
    risques: [
      { niveau: 'medium', description: 'Dépendance unique fournisseur', mitigation: 'Identifier fournisseur backup' },
    ],
    conditions: {
      paiement: '90 jours fin de mois',
      livraison: 'Franco chantier',
      garantie: '12 mois pièces et main d\'oeuvre',
      penalites: '0.5% par jour de retard, plafonné à 10%',
    },
    validations: {
      juridique: true,
      technique: true,
      financier: false,
      direction: false,
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T15:00:00Z',
  },
  {
    id: 'CTR-2024-002',
    reference: 'CTR-2024-002',
    title: 'Contrat de maintenance préventive - Parc engins',
    description: 'Maintenance préventive et curative du parc d\'engins de chantier (35 machines)',
    fournisseur: MOCK_FOURNISSEURS[3],
    type: 'maintenance',
    montant: 180000000,
    devise: 'FCFA',
    duree: 24,
    dateDebut: '2024-02-01',
    dateFin: '2026-01-31',
    dateReception: '2024-01-10',
    dateEcheance: '2024-01-20',
    status: 'negotiation',
    urgency: 'high',
    bureau: 'DT',
    responsible: 'M. DIALLO',
    clauses: [
      { id: 'CL-1', title: 'SLA intervention', content: 'Intervention sous 4h', status: 'ok' },
      { id: 'CL-2', title: 'Pièces détachées', content: 'Pièces d\'origine constructeur', status: 'warning', comment: 'Accepter équivalent qualité' },
    ],
    documents: [
      { id: 'DOC-1', name: 'Contrat_maintenance.pdf', type: 'application/pdf', size: 1800000, uploadedAt: '2024-01-10T09:00:00Z' },
    ],
    historique: [
      { at: '2024-01-10T09:00:00Z', action: 'reception', by: 'M. DIALLO', details: 'Réception du contrat' },
      { at: '2024-01-12T11:00:00Z', action: 'negociation', by: 'M. DIALLO', details: 'Négociation conditions lancée' },
    ],
    commentaires: [],
    risques: [
      { niveau: 'low', description: 'Augmentation tarifs pièces', mitigation: 'Clause de révision prix plafonnée' },
    ],
    conditions: {
      paiement: 'Mensuel à terme échu',
      livraison: 'N/A',
      garantie: '6 mois sur interventions',
      penalites: '1% par heure de retard sur SLA',
    },
    validations: {
      juridique: true,
      technique: false,
      financier: false,
      direction: false,
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z',
  },
  {
    id: 'CTR-2024-003',
    reference: 'CTR-2024-003',
    title: 'Contrat de prestation - Études géotechniques',
    description: 'Études géotechniques pour 3 nouveaux chantiers (Thiès, Mbour, Kaolack)',
    fournisseur: { id: 'FRN-006', name: 'LABO SENEGAL', contact: 'Dr. Faye', email: 'direction@labosenegal.sn' },
    type: 'prestation',
    montant: 85000000,
    devise: 'FCFA',
    duree: 6,
    dateDebut: '2024-02-15',
    dateFin: '2024-08-15',
    dateReception: '2024-01-18',
    dateEcheance: '2024-01-28',
    status: 'pending',
    urgency: 'medium',
    bureau: 'DT',
    responsible: 'Mme DIOP',
    clauses: [
      { id: 'CL-1', title: 'Méthodologie', content: 'Selon normes NF EN 1997', status: 'ok' },
      { id: 'CL-2', title: 'Délai rendu rapports', content: '15 jours après prélèvements', status: 'ok' },
    ],
    documents: [
      { id: 'DOC-1', name: 'Proposition_technique.pdf', type: 'application/pdf', size: 3500000, uploadedAt: '2024-01-18T14:00:00Z' },
    ],
    historique: [
      { at: '2024-01-18T14:00:00Z', action: 'reception', by: 'Mme DIOP', details: 'Réception de la proposition' },
    ],
    commentaires: [],
    risques: [],
    conditions: {
      paiement: '30% à la commande, 70% à la livraison',
      livraison: 'Rapports PDF + données brutes',
      garantie: 'Responsabilité décennale',
      penalites: 'N/A',
    },
    validations: {
      juridique: false,
      technique: false,
      financier: false,
      direction: false,
    },
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: 'CTR-2024-004',
    reference: 'CTR-2024-004',
    title: 'Contrat cadre fourniture électricité - Sites industriels',
    description: 'Fourniture électricité haute tension pour 5 sites industriels',
    fournisseur: MOCK_FOURNISSEURS[4],
    type: 'service',
    montant: 320000000,
    devise: 'FCFA',
    duree: 36,
    dateDebut: '2024-01-01',
    dateFin: '2026-12-31',
    dateReception: '2023-12-01',
    dateEcheance: '2023-12-15',
    status: 'validated',
    urgency: 'low',
    bureau: 'DAF',
    responsible: 'M. FALL',
    clauses: [
      { id: 'CL-1', title: 'Tarification', content: 'Tarif B préférentiel', status: 'ok' },
    ],
    documents: [],
    historique: [
      { at: '2023-12-01T10:00:00Z', action: 'reception', by: 'M. FALL', details: 'Réception du contrat' },
      { at: '2023-12-10T16:00:00Z', action: 'validation', by: 'DG', details: 'Validation définitive' },
    ],
    commentaires: [],
    risques: [],
    conditions: {
      paiement: 'Mensuel sur relevé',
      livraison: 'Continue',
      garantie: 'N/A',
      penalites: 'Selon convention SENELEC',
    },
    validations: {
      juridique: true,
      technique: true,
      financier: true,
      direction: true,
    },
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2023-12-10T16:00:00Z',
  },
  {
    id: 'CTR-2024-005',
    reference: 'CTR-2024-005',
    title: 'Contrat de sous-traitance - Lot électricité Dakar Arena',
    description: 'Sous-traitance complète du lot électricité courant fort/faible',
    fournisseur: { id: 'FRN-007', name: 'ELEC AFRIQUE', contact: 'M. Mbaye', email: 'commercial@elecafrique.sn' },
    type: 'travaux',
    montant: 890000000,
    devise: 'FCFA',
    duree: 14,
    dateDebut: '2024-03-01',
    dateFin: '2025-04-30',
    dateReception: '2024-01-20',
    dateEcheance: '2024-01-30',
    status: 'pending',
    urgency: 'critical',
    bureau: 'DT',
    responsible: 'M. SECK',
    projet: 'PRJ-2024-001',
    clauses: [
      { id: 'CL-1', title: 'Conformité normes', content: 'NF C 15-100 / NF C 14-100', status: 'ok' },
      { id: 'CL-2', title: 'Garantie', content: 'Garantie décennale', status: 'ok' },
      { id: 'CL-3', title: 'Retenue de garantie', content: '5% pendant 1 an', status: 'warning', comment: 'Standard mais à surveiller' },
    ],
    documents: [
      { id: 'DOC-1', name: 'Contrat_sous_traitance.pdf', type: 'application/pdf', size: 4200000, uploadedAt: '2024-01-20T09:00:00Z' },
      { id: 'DOC-2', name: 'CCTP_electricite.pdf', type: 'application/pdf', size: 8500000, uploadedAt: '2024-01-20T09:05:00Z' },
    ],
    historique: [
      { at: '2024-01-20T09:00:00Z', action: 'reception', by: 'M. SECK', details: 'Réception du contrat' },
    ],
    commentaires: [],
    risques: [
      { niveau: 'high', description: 'Montant élevé - validation DG requise', mitigation: 'Échelonnement paiements' },
    ],
    conditions: {
      paiement: 'Situations mensuelles, paiement à 45 jours',
      livraison: 'Selon planning travaux',
      garantie: 'Parfait achèvement 1 an, décennale 10 ans',
      penalites: '0.1% par jour calendaire de retard',
    },
    validations: {
      juridique: false,
      technique: true,
      financier: false,
      direction: false,
    },
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
];

// ================================
// Helper functions
// ================================

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function formatMontant(montant: number): string {
  if (montant >= 1_000_000_000) return `${(montant / 1_000_000_000).toFixed(1)} Md`;
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(0)} M`;
  if (montant >= 1_000) return `${(montant / 1_000).toFixed(0)} K`;
  return montant.toLocaleString('fr-FR');
}

// ================================
// API Service
// ================================

export const contratsApiService = {
  // ============================================
  // CORE DATA OPERATIONS
  // ============================================

  async getAll(filter?: ContratFilter, sortBy?: string, page = 1, limit = 20): Promise<{
    data: Contrat[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await delay(300);
    
    let data = [...MOCK_CONTRATS];

    // Apply filters
    if (filter?.status) {
      data = data.filter(c => c.status === filter.status);
    }
    if (filter?.type) {
      data = data.filter(c => c.type === filter.type);
    }
    if (filter?.urgency) {
      data = data.filter(c => c.urgency === filter.urgency);
    }
    if (filter?.fournisseur) {
      data = data.filter(c => 
        c.fournisseur.name.toLowerCase().includes(filter.fournisseur!.toLowerCase())
      );
    }
    if (filter?.minMontant) {
      data = data.filter(c => c.montant >= filter.minMontant!);
    }
    if (filter?.maxMontant) {
      data = data.filter(c => c.montant <= filter.maxMontant!);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      data = data.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.fournisseur.name.toLowerCase().includes(q) ||
        c.reference.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'montant') {
      data.sort((a, b) => b.montant - a.montant);
    } else if (sortBy === 'urgency') {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      data.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
    } else if (sortBy === 'date') {
      data.sort((a, b) => new Date(b.dateReception).getTime() - new Date(a.dateReception).getTime());
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedData = data.slice(start, start + limit);

    return { data: paginatedData, total, page, totalPages };
  },

  async getById(id: string): Promise<Contrat | undefined> {
    await delay(200);
    return MOCK_CONTRATS.find(c => c.id === id);
  },

  async getStats(): Promise<ContratsStats> {
    await delay(250);
    
    const pending = MOCK_CONTRATS.filter(c => c.status === 'pending').length;
    const validated = MOCK_CONTRATS.filter(c => c.status === 'validated').length;
    const rejected = MOCK_CONTRATS.filter(c => c.status === 'rejected').length;
    const negotiation = MOCK_CONTRATS.filter(c => c.status === 'negotiation').length;
    const expired = MOCK_CONTRATS.filter(c => c.status === 'expired').length;

    const byType: Record<string, number> = {};
    const byUrgency: Record<string, number> = {};
    
    MOCK_CONTRATS.forEach(c => {
      byType[c.type] = (byType[c.type] || 0) + 1;
      byUrgency[c.urgency] = (byUrgency[c.urgency] || 0) + 1;
    });

    const totalMontant = MOCK_CONTRATS.reduce((acc, c) => acc + c.montant, 0);
    const avgMontant = totalMontant / MOCK_CONTRATS.length;

    return {
      total: MOCK_CONTRATS.length,
      pending,
      validated,
      rejected,
      negotiation,
      expired,
      byType,
      byUrgency,
      totalMontant,
      avgMontant,
      avgDelaiValidation: 5,
      tauxValidation: validated / (validated + rejected) * 100 || 0,
      expiringThisMonth: 2,
      ts: new Date().toISOString(),
    };
  },

  // ============================================
  // BUSINESS ACTIONS
  // ============================================

  async validateContrat(
    contratId: string,
    notes: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContratDecisionEntry> {
    await delay(500);
    
    const contrat = await this.getById(contratId);
    if (!contrat) throw new Error('Contrat not found');

    const payload = { contratId, action: 'validation', notes, userId, userName, userRole, at: new Date().toISOString() };
    const hash = await sha256Hex(JSON.stringify(payload));

    return {
      id: `DEC-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'validation',
      contratId,
      contratTitle: contrat.title,
      fournisseur: contrat.fournisseur.name,
      montant: contrat.montant,
      userId,
      userName,
      userRole,
      details: `Validation du contrat: ${notes}`,
      hash: `SHA-256:${hash}`,
    };
  },

  async rejectContrat(
    contratId: string,
    reason: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContratDecisionEntry> {
    await delay(500);
    
    const contrat = await this.getById(contratId);
    if (!contrat) throw new Error('Contrat not found');

    const payload = { contratId, action: 'rejet', reason, userId, userName, userRole, at: new Date().toISOString() };
    const hash = await sha256Hex(JSON.stringify(payload));

    return {
      id: `DEC-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'rejet',
      contratId,
      contratTitle: contrat.title,
      fournisseur: contrat.fournisseur.name,
      montant: contrat.montant,
      userId,
      userName,
      userRole,
      details: `Rejet du contrat: ${reason}`,
      hash: `SHA-256:${hash}`,
    };
  },

  /** Alias pour le hook: négociation avec termes en string (sera splitté en points) */
  async negotiateContrat(
    contratId: string,
    terms: string,
    userId?: string,
    userName?: string,
    userRole?: string
  ): Promise<ContratDecisionEntry> {
    return this.requestNegotiation(
      contratId,
      terms.trim() ? terms.split(',').map((s) => s.trim()).filter(Boolean) : [terms],
      userId ?? 'me',
      userName ?? 'User',
      userRole ?? 'manager'
    );
  },

  async requestNegotiation(
    contratId: string,
    points: string[],
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContratDecisionEntry> {
    await delay(500);
    
    const contrat = await this.getById(contratId);
    if (!contrat) throw new Error('Contrat not found');

    const payload = { contratId, action: 'negociation', points, userId, userName, userRole, at: new Date().toISOString() };
    const hash = await sha256Hex(JSON.stringify(payload));

    return {
      id: `DEC-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'negociation',
      contratId,
      contratTitle: contrat.title,
      fournisseur: contrat.fournisseur.name,
      montant: contrat.montant,
      userId,
      userName,
      userRole,
      details: `Demande de négociation: ${points.join(', ')}`,
      hash: `SHA-256:${hash}`,
    };
  },

  async escalateContrat(
    contratId: string,
    reason: string,
    targetRole: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContratDecisionEntry> {
    await delay(500);
    
    const contrat = await this.getById(contratId);
    if (!contrat) throw new Error('Contrat not found');

    const payload = { contratId, action: 'escalation', reason, targetRole, userId, userName, userRole, at: new Date().toISOString() };
    const hash = await sha256Hex(JSON.stringify(payload));

    return {
      id: `DEC-${Date.now()}`,
      at: new Date().toISOString(),
      action: 'escalation',
      contratId,
      contratTitle: contrat.title,
      fournisseur: contrat.fournisseur.name,
      montant: contrat.montant,
      userId,
      userName,
      userRole,
      details: `Escalade vers ${targetRole}: ${reason}`,
      hash: `SHA-256:${hash}`,
    };
  },

  // ============================================
  // BULK ACTIONS
  // ============================================

  async bulkValidate(
    contratIds: string[],
    notes: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContratDecisionEntry[]> {
    await delay(1000);
    
    const decisions: ContratDecisionEntry[] = [];
    const batchId = `BATCH-VAL-${Date.now()}`;

    for (const contratId of contratIds) {
      const contrat = await this.getById(contratId);
      if (contrat) {
        const payload = { batchId, contratId, action: 'validation', notes, userId, userName, userRole, at: new Date().toISOString() };
        const hash = await sha256Hex(JSON.stringify(payload));

        decisions.push({
          id: `DEC-${Date.now()}-${contratId}`,
          at: new Date().toISOString(),
          action: 'validation',
          contratId,
          contratTitle: contrat.title,
          fournisseur: contrat.fournisseur.name,
          montant: contrat.montant,
          userId,
          userName,
          userRole,
          details: `Validation en lot (${batchId}): ${notes}`,
          hash: `SHA-256:${hash}`,
          batchId,
        });
      }
    }

    return decisions;
  },

  async bulkReject(
    contratIds: string[],
    reason: string,
    userId: string,
    userName: string,
    userRole: string
  ): Promise<ContratDecisionEntry[]> {
    await delay(1000);
    
    const decisions: ContratDecisionEntry[] = [];
    const batchId = `BATCH-REJ-${Date.now()}`;

    for (const contratId of contratIds) {
      const contrat = await this.getById(contratId);
      if (contrat) {
        const payload = { batchId, contratId, action: 'rejet', reason, userId, userName, userRole, at: new Date().toISOString() };
        const hash = await sha256Hex(JSON.stringify(payload));

        decisions.push({
          id: `DEC-${Date.now()}-${contratId}`,
          at: new Date().toISOString(),
          action: 'rejet',
          contratId,
          contratTitle: contrat.title,
          fournisseur: contrat.fournisseur.name,
          montant: contrat.montant,
          userId,
          userName,
          userRole,
          details: `Rejet en lot (${batchId}): ${reason}`,
          hash: `SHA-256:${hash}`,
          batchId,
        });
      }
    }

    return decisions;
  },

  // ============================================
  // EXPORT
  // ============================================

  async exportData(format: 'json' | 'csv' | 'xlsx' | 'pdf', filter?: ContratFilter): Promise<Blob> {
    await delay(1000);
    
    const { data } = await this.getAll(filter, undefined, 1, 1000);
    let content: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        break;
      case 'csv':
        const headers = ['ID', 'Référence', 'Titre', 'Fournisseur', 'Type', 'Montant', 'Statut', 'Urgence', 'Bureau', 'Date réception', 'Date échéance'];
        const rows = data.map(c => [
          c.id,
          c.reference,
          `"${c.title}"`,
          c.fournisseur.name,
          c.type,
          c.montant,
          c.status,
          c.urgency,
          c.bureau,
          c.dateReception,
          c.dateEcheance,
        ].join(','));
        content = [headers.join(','), ...rows].join('\n');
        mimeType = 'text/csv';
        break;
      default:
        content = 'Export format not fully implemented';
        mimeType = 'text/plain';
    }

    return new Blob([content], { type: mimeType });
  },

  // ============================================
  // TEMPLATES
  // ============================================

  getValidationTemplates(): { id: string; name: string; content: string }[] {
    return [
      { id: 'tpl-1', name: 'Validation standard', content: 'Contrat conforme aux exigences. Validation accordée.' },
      { id: 'tpl-2', name: 'Validation avec réserves', content: 'Contrat validé sous réserve des points suivants à surveiller:' },
      { id: 'tpl-3', name: 'Validation urgente', content: 'Validation urgente accordée pour raisons opérationnelles.' },
    ];
  },

  getRejectionTemplates(): { id: string; name: string; content: string }[] {
    return [
      { id: 'tpl-1', name: 'Non-conformité technique', content: 'Contrat rejeté pour non-conformité aux spécifications techniques.' },
      { id: 'tpl-2', name: 'Conditions financières', content: 'Conditions financières non acceptables. Négociation requise.' },
      { id: 'tpl-3', name: 'Risques juridiques', content: 'Clauses contractuelles présentant des risques juridiques inacceptables.' },
    ];
  },

  getNegotiationTemplates(): { id: string; name: string; points: string[] }[] {
    return [
      { id: 'tpl-1', name: 'Conditions de paiement', points: ['Réduire le délai de paiement de 90 à 60 jours', 'Ajouter escompte pour paiement anticipé'] },
      { id: 'tpl-2', name: 'Pénalités', points: ['Réduire le taux de pénalités de 0.5% à 0.3%', 'Augmenter le plafond des pénalités'] },
      { id: 'tpl-3', name: 'Garanties', points: ['Étendre la garantie de 12 à 24 mois', 'Ajouter clause de garantie de performance'] },
    ];
  },

  // ============================================
  // UTILITIES
  // ============================================

  formatMontant,

  getUrgencyColor(urgency: string): string {
    switch (urgency) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'blue';
      default: return 'slate';
    }
  },

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'rejected': return 'Rejeté';
      case 'negotiation': return 'En négociation';
      case 'expired': return 'Expiré';
      case 'signed': return 'Signé';
      default: return status;
    }
  },

  getTypeLabel(type: string): string {
    switch (type) {
      case 'service': return 'Service';
      case 'fourniture': return 'Fourniture';
      case 'travaux': return 'Travaux';
      case 'prestation': return 'Prestation';
      case 'maintenance': return 'Maintenance';
      case 'location': return 'Location';
      default: return type;
    }
  },
};

