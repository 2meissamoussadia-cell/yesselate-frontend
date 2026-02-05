/**
 * ====================================================================
 * SERVICE: Blocked Dossiers API
 * ====================================================================
 * 
 * Service complet pour la gestion des dossiers bloqués.
 * Inclut toutes les opérations CRUD, actions métier et analytics.
 */

import type { BlockedDossier } from '@/lib/types/bmo.types';
import type { BlockedActiveFilters } from '@/components/features/bmo/workspace/blocked/command-center';

// ================================
// Types
// ================================

export interface BlockedFilter {
  impact?: 'critical' | 'high' | 'medium' | 'low' | 'all';
  bureau?: string;
  type?: string;
  status?: 'pending' | 'escalated' | 'resolved' | 'substituted';
  minDelay?: number;
  maxDelay?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BlockedSort {
  field: 'priority' | 'delay' | 'amount' | 'date' | 'impact';
  direction: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BlockedStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgDelay: number;
  avgPriority: number;
  totalAmount: number;
  overdueSLA: number;
  resolvedToday: number;
  escalatedToday: number;
  byBureau: { bureau: string; count: number; critical: number }[];
  byType: { type: string; count: number }[];
  ts: string;
}

export interface Resolution {
  dossierId: string;
  resolution: string;
  notes: string;
  templateId?: string;
  documents?: File[];
}

export interface Escalation {
  dossierId: string;
  reason: string;
  urgency: 'high' | 'critical';
  targetRole: string;
  targetUser?: string;
  deadline?: string;
}

export interface Substitution {
  dossierId: string;
  action: string;
  justification: string;
  sha256Hash: string;
  overriddenBureau: string;
}

export interface Reassignment {
  dossierId: string;
  targetBureau: string;
  targetUser?: string;
  notes: string;
  deadline?: string;
}

export interface Comment {
  dossierId: string;
  content: string;
  visibility: 'internal' | 'shared';
  mentionedUsers?: string[];
}

export interface AuditEntry {
  id: string;
  at: string;
  action: 'created' | 'updated' | 'escalated' | 'substituted' | 'resolved' | 'reassigned' | 'commented';
  dossierId: string;
  dossierSubject: string;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  hash: string;
  metadata?: Record<string, unknown>;
}

export interface ResolutionTemplate {
  id: string;
  name: string;
  category: 'administrative' | 'technical' | 'financial' | 'legal';
  content: string;
  variables: string[];
  usageCount: number;
}

export interface SavedFilter {
  id: string;
  name: string;
  filter: BlockedFilter;
  sort?: BlockedSort;
  isDefault?: boolean;
  createdAt: string;
}

export interface Watchlist {
  dossierId: string;
  addedAt: string;
  notes?: string;
  alertOnChange?: boolean;
}

// ================================
// Resolution Templates (Mock)
// ================================

export const RESOLUTION_TEMPLATES: ResolutionTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Approbation budget supplémentaire',
    category: 'financial',
    content: 'Suite à l\'analyse du dossier, j\'autorise l\'allocation d\'un budget supplémentaire de {{montant}} FCFA pour {{objet}}. Cette décision prend effet immédiatement.',
    variables: ['montant', 'objet'],
    usageCount: 45,
  },
  {
    id: 'TPL-002',
    name: 'Validation fournisseur alternatif',
    category: 'administrative',
    content: 'En raison de l\'indisponibilité du fournisseur initial, j\'autorise le recours au fournisseur {{fournisseur}} aux conditions suivantes: {{conditions}}.',
    variables: ['fournisseur', 'conditions'],
    usageCount: 32,
  },
  {
    id: 'TPL-003',
    name: 'Dérogation délai contractuel',
    category: 'legal',
    content: 'J\'accorde une dérogation de {{duree}} jours au délai contractuel initial pour le lot {{lot}}. Motif: {{motif}}.',
    variables: ['duree', 'lot', 'motif'],
    usageCount: 28,
  },
  {
    id: 'TPL-004',
    name: 'Arbitrage technique',
    category: 'technical',
    content: 'Après analyse des options techniques présentées, je valide la solution {{solution}} proposée par {{bureau}}. Mise en œuvre attendue sous {{delai}} jours.',
    variables: ['solution', 'bureau', 'delai'],
    usageCount: 21,
  },
  {
    id: 'TPL-005',
    name: 'Levée de réserve',
    category: 'technical',
    content: 'Suite à la vérification des travaux correctifs, je lève la réserve n°{{numero}} concernant {{objet}}. Le PV de levée sera établi.',
    variables: ['numero', 'objet'],
    usageCount: 18,
  },
  {
    id: 'TPL-006',
    name: 'Avenant budget travaux',
    category: 'financial',
    content: 'J\'approuve l\'avenant n°{{numero}} d\'un montant de {{montant}} FCFA ({{pourcentage}}% du marché initial) pour {{travaux}}.',
    variables: ['numero', 'montant', 'pourcentage', 'travaux'],
    usageCount: 15,
  },
  {
    id: 'TPL-007',
    name: 'Substitution validation bureau',
    category: 'administrative',
    content: 'En vertu du pouvoir de substitution BMO, je procède à la validation que le bureau {{bureau}} n\'a pas effectuée dans les délais. Cette décision est tracée pour audit.',
    variables: ['bureau'],
    usageCount: 12,
  },
  {
    id: 'TPL-008',
    name: 'Ordre de service suspension',
    category: 'legal',
    content: 'Je notifie la suspension des travaux du lot {{lot}} à compter du {{date}} jusqu\'à résolution du différend concernant {{objet}}.',
    variables: ['lot', 'date', 'objet'],
    usageCount: 8,
  },
];

// ================================
// API Service Class
// ================================

class BlockedApiService {
  private baseUrl = '/api/bmo/blocked';
  private watchlist: Watchlist[] = [];
  private savedFilters: SavedFilter[] = [];

  // ================================
  // Dossiers CRUD
  // ================================

  async getAll(
    filter?: BlockedFilter,
    sort?: BlockedSort,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<BlockedDossier>> {
    // Simulation API call
    await this.delay(300);
    
    // En production: 
    // const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...filter });
    // const response = await fetch(`${this.baseUrl}?${params}`);
    // return response.json();

    // Mock data - Remplacer par API réelle en production
    const { mockBlockedDossiers } = await import('@/lib/data/blocked-mock-data');
    let data = [...(mockBlockedDossiers as unknown as BlockedDossier[])];

    // Apply filters
    if (filter) {
      if (filter.impact && filter.impact !== 'all') {
        data = data.filter(d => d.impact === filter.impact);
      }
      if (filter.bureau) {
        data = data.filter(d => d.bureau === filter.bureau);
      }
      if (filter.type) {
        data = data.filter(d => d.type === filter.type);
      }
      if (filter.minDelay !== undefined) {
        data = data.filter(d => (d.delay ?? 0) >= filter.minDelay!);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        data = data.filter(d => 
          d.subject.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.bureau?.toLowerCase().includes(q)
        );
      }
    }

    // Apply sort
    if (sort) {
      data.sort((a, b) => {
        let cmp = 0;
        switch (sort.field) {
          case 'delay':
            cmp = (a.delay ?? 0) - (b.delay ?? 0);
            break;
          case 'impact':
            const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            cmp = (impactOrder[a.impact] ?? 0) - (impactOrder[b.impact] ?? 0);
            break;
          default:
            cmp = 0;
        }
        return sort.direction === 'desc' ? -cmp : cmp;
      });
    }

    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginatedData = data.slice(start, start + pageSize);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Nouvelle méthode: Applique les filtres avancés (BlockedActiveFilters)
   */
  async getAllWithAdvancedFilters(
    filters: BlockedActiveFilters,
    sort?: BlockedSort,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<BlockedDossier>> {
    await this.delay(300);
    
    const { blockedDossiers } = await import('@/lib/data');
    let data = [...(blockedDossiers as unknown as BlockedDossier[])];

    // Impact (multi-sélection)
    if (filters.impact && filters.impact.length > 0) {
      data = data.filter(d => filters.impact.includes(d.impact as any));
    }

    // Bureaux (multi-sélection)
    if (filters.bureaux && filters.bureaux.length > 0) {
      data = data.filter(d => d.bureau && filters.bureaux.includes(d.bureau));
    }

    // Types (multi-sélection)
    if (filters.types && filters.types.length > 0) {
      data = data.filter(d => filters.types.includes(d.type));
    }

    // Status (multi-sélection)
    if (filters.status && filters.status.length > 0) {
      data = data.filter(d => filters.status.includes(d.status as any));
    }

    // Délai (range)
    if (filters.delayRange?.min !== undefined) {
      data = data.filter(d => (d.delay ?? 0) >= filters.delayRange.min!);
    }
    if (filters.delayRange?.max !== undefined) {
      data = data.filter(d => (d.delay ?? 0) <= filters.delayRange.max!);
    }

    // Montant (range)
    if (filters.amountRange?.min !== undefined) {
      const parseAmount = (amount: unknown): number => {
        const s = String(amount ?? '').replace(/[^\d]/g, '');
        return Number(s) || 0;
      };
      data = data.filter(d => parseAmount(d.amount) >= filters.amountRange!.min!);
    }
    if (filters.amountRange?.max !== undefined) {
      const parseAmount = (amount: unknown): number => {
        const s = String(amount ?? '').replace(/[^\d]/g, '');
        return Number(s) || 0;
      };
      data = data.filter(d => parseAmount(d.amount) <= filters.amountRange!.max!);
    }

    // Date range
    if (filters.dateRange?.start) {
      data = data.filter(d => new Date(d.blockedSince) >= new Date(filters.dateRange!.start));
    }
    if (filters.dateRange?.end) {
      data = data.filter(d => new Date(d.blockedSince) <= new Date(filters.dateRange!.end));
    }

    // SLA breached
    if (filters.slaBreached) {
      data = data.filter(d => (d.delay ?? 0) > (typeof d.sla === 'number' ? d.sla : 30));
    }

    // Recherche textuelle
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(d =>
        d.subject.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.bureau?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)
      );
    }

    // Apply sort
    if (sort) {
      data.sort((a, b) => {
        let cmp = 0;
        switch (sort.field) {
          case 'delay':
            cmp = (a.delay ?? 0) - (b.delay ?? 0);
            break;
          case 'impact':
            const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            cmp = impactOrder[a.impact as keyof typeof impactOrder] - impactOrder[b.impact as keyof typeof impactOrder];
            break;
          default:
            cmp = 0;
        }
        return sort.direction === 'desc' ? -cmp : cmp;
      });
    }

    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginatedData = data.slice(start, start + pageSize);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getById(id: string): Promise<BlockedDossier | null> {
    await this.delay(200);
    const { blockedDossiers } = await import('@/lib/data');
    return (blockedDossiers as unknown as BlockedDossier[]).find(d => d.id === id) ?? null;
  }

  async getStats(): Promise<BlockedStats> {
    await this.delay(200);
    
    // Utiliser les stats pré-calculées du mock data
    const { mockBlockedStats, mockBlockedDossiers } = await import('@/lib/data/blocked-mock-data');
    const data = mockBlockedDossiers as unknown as BlockedDossier[];

    const byBureau: Record<string, { count: number; critical: number }> = {};
    const byType: Record<string, number> = {};

    data.forEach(d => {
      // By bureau
      const bureau = d.bureau || 'Non assigné';
      if (!byBureau[bureau]) byBureau[bureau] = { count: 0, critical: 0 };
      byBureau[bureau].count++;
      if (d.impact === 'critical') byBureau[bureau].critical++;

      // By type
      const type = d.type || 'Autre';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: data.length,
      critical: data.filter(d => d.impact === 'critical').length,
      high: data.filter(d => d.impact === 'high').length,
      medium: data.filter(d => d.impact === 'medium').length,
      low: data.filter(d => d.impact === 'low').length,
      avgDelay: data.length ? Math.round(data.reduce((acc, d) => acc + (d.delay ?? 0), 0) / data.length) : 0,
      avgPriority: 0,
      totalAmount: data.reduce((acc, d) => acc + this.parseAmount(d.amount), 0),
      overdueSLA: data.filter(d => (d.delay ?? 0) > 14).length,
      resolvedToday: 0,
      escalatedToday: 0,
      byBureau: Object.entries(byBureau).map(([bureau, stats]) => ({ bureau, ...stats })),
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
      ts: new Date().toISOString(),
    };
  }

  // ================================
  // Actions métier
  // ================================

  async resolve(data: Resolution): Promise<{ success: boolean; auditId: string }> {
    await this.delay(500);
    const auditId = `AUD-RES-${Date.now()}`;
    console.log('[API] Resolve:', data, auditId);
    return { success: true, auditId };
  }

  async escalate(data: Escalation): Promise<{ success: boolean; auditId: string; notificationSent: boolean }> {
    await this.delay(500);
    const auditId = `AUD-ESC-${Date.now()}`;
    console.log('[API] Escalate:', data, auditId);
    return { success: true, auditId, notificationSent: true };
  }

  async substitute(data: Substitution): Promise<{ success: boolean; auditId: string; hash: string }> {
    await this.delay(500);
    const auditId = `AUD-SUB-${Date.now()}`;
    console.log('[API] Substitute:', data, auditId);
    return { success: true, auditId, hash: data.sha256Hash };
  }

  async reassign(data: Reassignment): Promise<{ success: boolean; auditId: string }> {
    await this.delay(400);
    const auditId = `AUD-REA-${Date.now()}`;
    console.log('[API] Reassign:', data, auditId);
    return { success: true, auditId };
  }

  async addComment(data: Comment): Promise<{ success: boolean; commentId: string }> {
    await this.delay(300);
    const commentId = `COM-${Date.now()}`;
    console.log('[API] Comment:', data, commentId);
    return { success: true, commentId };
  }

  async uploadDocuments(dossierId: string, files: File[]): Promise<{ success: boolean; documentIds: string[] }> {
    await this.delay(1000);
    const documentIds = files.map((_, i) => `DOC-${Date.now()}-${i}`);
    console.log('[API] Upload:', dossierId, files.length, 'files');
    return { success: true, documentIds };
  }

  // ================================
  // Bulk Actions
  // ================================

  async bulkEscalate(dossierIds: string[], reason: string): Promise<{ success: boolean; batchId: string; count: number }> {
    await this.delay(800);
    const batchId = `BATCH-ESC-${Date.now()}`;
    console.log('[API] Bulk escalate:', dossierIds.length, 'dossiers');
    return { success: true, batchId, count: dossierIds.length };
  }

  async bulkResolve(dossierIds: string[], resolution: string, templateId?: string): Promise<{ success: boolean; batchId: string; count: number }> {
    await this.delay(800);
    const batchId = `BATCH-RES-${Date.now()}`;
    console.log('[API] Bulk resolve:', dossierIds.length, 'dossiers');
    return { success: true, batchId, count: dossierIds.length };
  }

  async bulkReassign(dossierIds: string[], targetBureau: string): Promise<{ success: boolean; batchId: string; count: number }> {
    await this.delay(600);
    const batchId = `BATCH-REA-${Date.now()}`;
    console.log('[API] Bulk reassign:', dossierIds.length, 'dossiers to', targetBureau);
    return { success: true, batchId, count: dossierIds.length };
  }

  // ================================
  // Templates
  // ================================

  async getTemplates(category?: string): Promise<ResolutionTemplate[]> {
    await this.delay(100);
    if (category) {
      return RESOLUTION_TEMPLATES.filter(t => t.category === category);
    }
    return RESOLUTION_TEMPLATES;
  }

  async getTemplateById(id: string): Promise<ResolutionTemplate | null> {
    await this.delay(50);
    return RESOLUTION_TEMPLATES.find(t => t.id === id) ?? null;
  }

  applyTemplate(template: ResolutionTemplate, variables: Record<string, string>): string {
    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return content;
  }

  // ================================
  // Watchlist
  // ================================

  async getWatchlist(): Promise<Watchlist[]> {
    const stored = localStorage.getItem('blocked-watchlist');
    return stored ? JSON.parse(stored) : [];
  }

  async addToWatchlist(dossierId: string, notes?: string): Promise<void> {
    const watchlist = await this.getWatchlist();
    if (!watchlist.find(w => w.dossierId === dossierId)) {
      watchlist.push({
        dossierId,
        addedAt: new Date().toISOString(),
        notes,
        alertOnChange: true,
      });
      localStorage.setItem('blocked-watchlist', JSON.stringify(watchlist));
    }
  }

  async removeFromWatchlist(dossierId: string): Promise<void> {
    const watchlist = await this.getWatchlist();
    const filtered = watchlist.filter(w => w.dossierId !== dossierId);
    localStorage.setItem('blocked-watchlist', JSON.stringify(filtered));
  }

  async isInWatchlist(dossierId: string): Promise<boolean> {
    const watchlist = await this.getWatchlist();
    return watchlist.some(w => w.dossierId === dossierId);
  }

  // ================================
  // Saved Filters
  // ================================

  async getSavedFilters(): Promise<SavedFilter[]> {
    const stored = localStorage.getItem('blocked-saved-filters');
    return stored ? JSON.parse(stored) : [];
  }

  async saveFilter(name: string, filter: BlockedFilter, sort?: BlockedSort): Promise<SavedFilter> {
    const filters = await this.getSavedFilters();
    const newFilter: SavedFilter = {
      id: `FLT-${Date.now()}`,
      name,
      filter,
      sort,
      createdAt: new Date().toISOString(),
    };
    filters.push(newFilter);
    localStorage.setItem('blocked-saved-filters', JSON.stringify(filters));
    return newFilter;
  }

  async deleteFilter(id: string): Promise<void> {
    const filters = await this.getSavedFilters();
    const filtered = filters.filter(f => f.id !== id);
    localStorage.setItem('blocked-saved-filters', JSON.stringify(filtered));
  }

  async setDefaultFilter(id: string): Promise<void> {
    const filters = await this.getSavedFilters();
    filters.forEach(f => f.isDefault = f.id === id);
    localStorage.setItem('blocked-saved-filters', JSON.stringify(filters));
  }

  // ================================
  // Audit Trail
  // ================================

  async getAuditLog(dossierId?: string, limit = 50): Promise<AuditEntry[]> {
    await this.delay(300);
    
    // Utiliser le mock audit log centralisé
    const { mockAuditLog } = await import('@/lib/data/blocked-mock-data');
    const entries = mockAuditLog as unknown as AuditEntry[];
    
    if (dossierId) {
      return entries.filter(e => e.dossierId === dossierId);
    }
    return entries.slice(0, limit);
  }

  // ================================
  // Export
  // ================================

  async exportData(format: 'json' | 'csv' | 'xlsx' | 'pdf', filter?: BlockedFilter): Promise<Blob> {
    await this.delay(1000);
    const { data } = await this.getAll(filter, undefined, 1, 1000);
    
    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'Sujet', 'Bureau', 'Impact', 'Délai', 'Montant', 'Raison'];
      const rows = data.map(d => [
        d.id,
        d.subject,
        d.bureau,
        d.impact,
        d.delay,
        d.amount,
        d.reason,
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    }

    // Pour xlsx et pdf, en production utiliser une lib appropriée
    return new Blob(['Export format not yet implemented'], { type: 'text/plain' });
  }

  // ================================
  // SLA Alerts
  // ================================

  async getSLAAlerts(): Promise<{ dossierId: string; daysOverdue: number; impact: string }[]> {
    await this.delay(200);
    const { blockedDossiers } = await import('@/lib/data');
    const data = blockedDossiers as unknown as BlockedDossier[];
    
    return data
      .filter(d => (d.delay ?? 0) > 7)
      .map(d => ({
        dossierId: d.id,
        daysOverdue: (d.delay ?? 0) - 7,
        impact: d.impact,
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  // ================================
  // Helpers
  // ================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseAmount(amount: unknown): number {
    const s = String(amount ?? '').replace(/[^\d]/g, '');
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
}

// Export singleton
export const blockedApi = new BlockedApiService();

