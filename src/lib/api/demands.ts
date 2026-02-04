import type { Demand } from '@/lib/types/bmo.types';

/** Utiliser la nouvelle API /api/demandes (format { success, data }) */
const API_BASE = '/api/demandes';

export type Queue = 'pending' | 'urgent' | 'overdue' | 'validated' | 'rejected' | 'all';

export type TransitionPayload = {
  action: 'validate' | 'reject' | 'assign' | 'request_complement';
  actorId?: string;
  actorName?: string;
  details?: string;
  message?: string;
  employeeId?: string;
  employeeName?: string;
};

export type BatchTransitionResult = {
  updated: string[];
  skipped: Array<{ id: string; reason: string }>;
};

function unwrapError(res: Response, json: { error?: string }): never {
  throw new Error(json?.error ?? `Erreur ${res.status}`);
}

export async function listDemands(queue: Queue, q = ''): Promise<Demand[]> {
  const params = new URLSearchParams();
  if (queue !== 'all') params.set('queue', queue);
  if (q.trim()) params.set('q', q.trim());

  const res = await fetch(`${API_BASE}?${params.toString()}`, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) unwrapError(res, json);
  const data = json.success && json.data ? json.data : json;
  return (data.items ?? data.rows ?? data ?? []) as Demand[];
}

export async function getDemand(id: string): Promise<{ demand: Demand; item?: Demand }> {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) unwrapError(res, json);
  const raw = json.success && json.data ? json.data : (json.demand ?? json.item ?? json);
  return { demand: raw, item: raw };
}

export async function transitionDemand(id: string, payload: TransitionPayload): Promise<Demand> {
  const endpoint =
    payload.action === 'validate'
      ? `${API_BASE}/${encodeURIComponent(id)}/validate`
      : payload.action === 'reject'
        ? `${API_BASE}/${encodeURIComponent(id)}/reject`
        : `/api/demands/${encodeURIComponent(id)}/actions`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) unwrapError(res, json);
  const data = json.success && json.data ? json.data : (json.demand ?? json);
  return data as Demand;
}

export async function batchTransition(ids: string[], payload: TransitionPayload): Promise<BatchTransitionResult> {
  const base =
    payload.action === 'validate'
      ? `${API_BASE}/batch/validate`
      : payload.action === 'reject'
        ? `${API_BASE}/batch/reject`
        : '/api/demands/bulk';
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, ...payload }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) unwrapError(res, json);
  return json.success && json.data ? json.data : json;
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) unwrapError(res, json);
  return json.success && json.data ? json.data : json;
}

export async function exportDemands(queue: Queue, format: 'csv' | 'json'): Promise<Blob> {
  const params = new URLSearchParams();
  if (queue !== 'all') params.set('queue', queue);
  params.set('format', format);

  const res = await fetch(`${API_BASE}/export?${params.toString()}`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    unwrapError(res, json);
  }
  return res.blob();
}

