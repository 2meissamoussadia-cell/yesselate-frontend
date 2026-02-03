/**
 * API client module Programmation
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const programmationApi = {
  async getProgrammations(params) {
    const qs = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/Programmations?${qs}`);
    if (!res.ok) throw new Error('Erreur récupération');
    return res.json();
  },

  async getProgrammation(id) {
    const res = await fetch(`${API_BASE}/Programmations/${id}`);
    if (!res.ok) throw new Error('Non trouvé');
    return res.json();
  },

  async createProgrammation(data) {
    const res = await fetch(`${API_BASE}/Programmations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création');
    return res.json();
  },

  async updateProgrammation(id, data) {
    const res = await fetch(`${API_BASE}/Programmations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
  },

  async deleteProgrammation(id) {
    const res = await fetch(`${API_BASE}/Programmations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression');
  },
};
