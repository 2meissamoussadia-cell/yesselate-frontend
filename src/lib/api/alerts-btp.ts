/**
 * API client Centre d'Alertes BTP
 * S'appuie sur /api/alerts (pilotage) avec mapping vers AlerteBTP
 */

import type {
  AlerteBTP,
  AlerteFilters,
  AlerteSort,
  ChantierRef,
  ActeurRef,
} from '@/lib/types/alerts-btp.types';

const API_BASE = '/api/alerts';

function mapApiToAlerteBTP(raw: Record<string, unknown>): AlerteBTP {
  const createdAt = raw.createdAt ? new Date(String(raw.createdAt)) : new Date();
  const updatedAt = raw.updatedAt ? new Date(String(raw.updatedAt)) : createdAt;

  const severity = String((raw as { type?: string }).type ?? (raw as { severity?: string }).severity ?? 'info');
  const niveauMap: Record<string, AlerteBTP['niveau']> = {
    critical: 'critique',
    warning: 'important',
    info: 'normal',
    success: 'faible',
  };
  const statutMap: Record<string, AlerteBTP['statut']> = {
    open: 'non-traite',
    active: 'non-traite',
    acknowledged: 'en-cours',
    resolved: 'traite',
    escalated: 'en-cours',
    closed: 'cloture',
  };

  const chantier: ChantierRef = {
    id: String((raw as { project?: string }).project ?? raw.relatedId ?? ''),
    nom: String((raw as { project?: string }).project ?? '—'),
    code: String((raw as { project?: string }).project ?? ''),
  };

  const emetteur: ActeurRef = {
    id: 'system',
    nom: 'Système',
    role: 'Système',
  };

  // Générer numéro professionnel au lieu d'utiliser l'ID technique
  const idStr = String(raw.id);
  const numericPart = idStr.replace(/\D/g, '') || '0';
  const numeroProf = `ALT-${new Date().getFullYear()}-${numericPart.padStart(4, '0')}`;

  return {
    id: String(raw.id),
    numero: numeroProf,
    titre: String(raw.title ?? ''),
    description: String(raw.description ?? ''),

    niveau: niveauMap[severity] ?? 'normal',
    statut: statutMap[String(raw.status)] ?? 'non-traite',
    categorie: 'technique',
    priorite: 'moyenne',
    urgent: (raw as { priority?: number }).priority ? (raw as { priority?: number }).priority! > 7 : false,

    chantier,
    emetteur,
    assigneA: (raw as { assignedTo?: string }).assignedTo
      ? { id: String((raw as { assignedTo?: string }).assignedTo), nom: '—', role: '—' }
      : undefined,

    dateCreation: createdAt,
    dateModification: updatedAt,
    dateEcheance: (() => {
      const s = (raw as { slaDueAt?: string }).slaDueAt;
      return s ? new Date(s) : undefined;
    })(),

    pieceJointes: [],
    commentaires: [],
    historique: [],
    archived: false,
    deleted: false,
    version: 1,
  };
}

export const alertsBtpApi = {
  async getAlertes(params?: {
    filters?: AlerteFilters;
    sort?: AlerteSort;
    page?: number;
    limit?: number;
  }): Promise<{
    data: AlerteBTP[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit ?? 50));
    if (params?.sort) {
      qs.set('sortBy', params.sort.field === 'date' ? 'createdAt' : params.sort.field);
      qs.set('sortOrder', params.sort.order);
    }
    const f = params?.filters;
    if (f?.niveaux?.length) qs.set('niveau', f.niveaux.join(','));
    if (f?.statuts?.length) qs.set('status', f.statuts.join(','));
    if (f?.categories?.length) qs.set('category', f.categories.join(','));
    if (f?.dateDebut) qs.set('dateFrom', f.dateDebut.toISOString());
    if (f?.dateFin) qs.set('dateTo', f.dateFin.toISOString());
    if (f?.urgent === true) qs.set('urgent', 'true');

    const res = await fetch(`${API_BASE}?${qs}`);
    if (!res.ok) throw new Error('Erreur récupération alertes');

    const json = await res.json();
    const rawList = json.alerts ?? json.data ?? json;
    const arr = Array.isArray(rawList) ? rawList : [];
    const data = arr.map((r: Record<string, unknown>) => mapApiToAlerteBTP(r));
    const total = json.total ?? data.length;
    const limit = json.limit ?? params?.limit ?? 50;
    const page = json.page ?? 1;

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getAlerte(id: string): Promise<AlerteBTP> {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Alerte non trouvée');
    const json = await res.json();
    const raw = json.alert ?? json;
    return mapApiToAlerteBTP(raw as Record<string, unknown>);
  },

  async createAlerte(data: Partial<AlerteBTP>): Promise<AlerteBTP> {
    const body = {
      title: data.titre,
      description: data.description,
      type: data.niveau === 'critique' ? 'critical' : data.niveau === 'important' ? 'warning' : 'info',
      chantierId: data.chantier?.id,
    };

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Erreur création alerte");
    const json = await res.json();
    const raw = json.alert ?? json;
    return mapApiToAlerteBTP(raw as Record<string, unknown>);
  },

  async updateAlerte(id: string, data: Partial<AlerteBTP>): Promise<AlerteBTP> {
    const body: Record<string, unknown> = {};
    if (data.titre != null) body.title = data.titre;
    if (data.description != null) body.description = data.description;
    if (data.statut != null) {
      const s: Record<string, string> = {
        'non-traite': 'open',
        'en-cours': 'acknowledged',
        traite: 'resolved',
        cloture: 'closed',
        archive: 'closed',
      };
      body.status = s[data.statut] ?? 'open';
    }
    if (data.assigneA != null) body.assignedTo = data.assigneA.id;

    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Erreur mise à jour alerte");
    const json = await res.json();
    const raw = json.alert ?? json;
    return mapApiToAlerteBTP(raw as Record<string, unknown>);
  },

  async deleteAlerte(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Erreur suppression alerte");
  },

  async traiterAlerte(id: string, _comment?: string): Promise<AlerteBTP> {
    return this.updateAlerte(id, { statut: 'traite' });
  },

  async assignerAlerte(id: string, userId: string): Promise<AlerteBTP> {
    return this.updateAlerte(id, {
      assigneA: { id: userId, nom: '—', role: '—' },
    });
  },
};
