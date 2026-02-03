/**
 * API client module Foncier
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const foncierApi = {
  async getFonciers(params) {
    const qs = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/Fonciers?${qs}`);
    if (!res.ok) throw new Error('Erreur récupération');
    return res.json();
  },

  async getFoncier(id) {
    const res = await fetch(`${API_BASE}/Fonciers/${id}`);
    if (!res.ok) throw new Error('Non trouvé');
    return res.json();
  },

  async createFoncier(data) {
    const res = await fetch(`${API_BASE}/Fonciers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création');
    return res.json();
  },

  async updateFoncier(id, data) {
    const res = await fetch(`${API_BASE}/Fonciers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
  },

  async deleteFoncier(id) {
    const res = await fetch(`${API_BASE}/Fonciers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression');
  },
};
