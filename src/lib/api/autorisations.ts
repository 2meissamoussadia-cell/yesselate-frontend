/**
 * API client module Autorisations
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const autorisationsApi = {
  async getAutorisations(params?: Record<string, unknown>) {
    const qs = new URLSearchParams((params ?? {}) as Record<string, string>);
    const res = await fetch(`${API_BASE}/Autorisations?${qs}`);
    if (!res.ok) throw new Error('Erreur récupération');
    return res.json();
  },

  async getAutorisation(id: string) {
    const res = await fetch(`${API_BASE}/Autorisations/${id}`);
    if (!res.ok) throw new Error('Non trouvé');
    return res.json();
  },

  async createAutorisations(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/Autorisations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création');
    return res.json();
  },

  async updateAutorisations(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE}/Autorisations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
  },

  async deleteAutorisations(id: string) {
    const res = await fetch(`${API_BASE}/Autorisations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression');
  },
};
