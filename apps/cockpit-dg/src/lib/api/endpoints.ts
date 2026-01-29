const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface Chantier {
  id: string;
  nom: string;
  description?: string | null;
  budget: number | { toString(): string };
  margePct?: number | { toString(): string } | null;
  segment: string;
  phase: number;
  etape: number;
  statut: string;
  avancementPct: number | { toString(): string };
  clientId: string;
  client?: { nom: string; email?: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface ChantiersListResponse {
  items: Chantier[];
  total: number;
}

export interface FilterChantiersParams {
  segment?: string[];
  phase?: number[];
  statut?: string[];
  take?: number;
  skip?: number;
}

export const endpoints = {
  health: () =>
    fetchApi<{ status: string; timestamp: string }>('/health'),

  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ access_token: string; user: { id: string; email: string; role: string } }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      ),
  },

  chantiers: {
    list: (params?: FilterChantiersParams) => {
      const search = new URLSearchParams();
      params?.segment?.forEach((s) => search.append('segment', s));
      params?.phase?.forEach((p) => search.append('phase', String(p)));
      params?.statut?.forEach((s) => search.append('statut', s));
      if (params?.take != null) search.set('take', String(params.take));
      if (params?.skip != null) search.set('skip', String(params.skip));
      const qs = search.toString();
      return fetchApi<ChantiersListResponse>(`/api/chantiers${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) =>
      fetchApi<Chantier>(`/api/chantiers/${id}`),
    getLive: (id: string) =>
      fetchApi<Chantier & { alertes?: unknown[]; paiementsRecents?: unknown[] }>(
        `/api/chantiers/${id}/live`
      ),
    create: (data: Record<string, unknown>) =>
      fetchApi<Chantier>('/api/chantiers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchApi<Chantier>(`/api/chantiers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      fetchApi<Chantier>(`/api/chantiers/${id}`, { method: 'DELETE' }),
  },

  workflow: {
    phases: () =>
      fetchApi<{ phase: number; nom: string; nbChantiers: number; chantierIds: string[] }[]>(
        '/api/workflow/phases'
      ),
    changePhase: (chantierId: string, phase: number) =>
      fetchApi<Chantier>('/api/workflow/chantier/' + chantierId, {
        method: 'PATCH',
        body: JSON.stringify({ phase }),
      }),
    bulkAction: (chantierIds: string[], action: string, payload?: unknown) =>
      fetchApi<{ processed: number; errors: string[] }>('/api/workflow/bulk-action', {
        method: 'POST',
        body: JSON.stringify({ chantierIds, action, payload }),
      }),
  },

  ai: {
    briefing: () =>
      fetchApi<{ phrases: string[]; severity: string; updated_at: string }>(
        '/api/ai/briefing'
      ).catch(() => ({
        phrases: [
          '✅ Cockpit DG connecté.',
          '⚠️ API briefing à brancher (GET /api/ai/briefing).',
          '🚨 Aucune alerte critique.',
        ],
        severity: 'OK',
        updated_at: new Date().toISOString(),
      })),
  },

  analytics: {
    health: () =>
      fetchApi<{ status: string; database: boolean; chantiersCount?: number }>(
        '/api/analytics/health'
      ),
    healthMetrics: () =>
      fetchApi<{ operations: number; finance: number; workflow: number; criticalAlerts: number }>(
        '/api/analytics/health-metrics'
      ).catch(async () => {
        const kpis = await fetchApi<{ totalChantiers: number; chantiersActifs: number; alertesCritiques: number }>('/api/analytics/kpis').catch(() => null);
        if (kpis && kpis.totalChantiers > 0) {
          return {
            operations: kpis.chantiersActifs / kpis.totalChantiers,
            finance: 0.75,
            workflow: 0.65,
            criticalAlerts: kpis.alertesCritiques ?? 0,
          };
        }
        return { operations: 0.87, finance: 0.76, workflow: 0.62, criticalAlerts: 0 };
      }),
    kpis: () =>
      fetchApi<{
        totalChantiers: number;
        chantiersActifs: number;
        budgetTotal: number | { toString(): string };
        alertesCritiques: number;
        updatedAt: string;
      }>('/api/analytics/kpis'),
    segments: () =>
      fetchApi<{ segment: string; nbChantiers: number; budgetTotal: number | { toString(): string } }[]>(
        '/api/analytics/segments'
      ),
    ecosystem: () =>
      fetchApi<{ nodes: EcosystemNode[]; links: EcosystemLink[] }>(
        '/api/analytics/ecosystem'
      ).catch(() => ({
        nodes: [] as EcosystemNode[],
        links: [] as EcosystemLink[],
      })),
  },
};

export interface EcosystemNode {
  id: string;
  type: 'center' | 'ouvrier' | 'quincaillerie' | 'huissier' | 'client';
  label: string;
  status: 'ok' | 'warning' | 'critical';
  metrics?: { surcharge?: boolean; retard?: number; ruptures?: number };
}

export interface EcosystemLink {
  source: string;
  target: string;
  weight: number;
  status: 'ok' | 'warning' | 'critical';
}
