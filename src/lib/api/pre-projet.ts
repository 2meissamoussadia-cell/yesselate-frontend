/**
 * API client module Pre projet
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const pre-projetApi = {
  async getPreProjets(params) {
    const qs = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/Pre projets?${qs}`);
    if (!res.ok) throw new Error('Erreur récupération');
    return res.json();
  },

  async getPreProjet(id) {
    const res = await fetch(`${API_BASE}/Pre projets/${id}`);
    if (!res.ok) throw new Error('Non trouvé');
    return res.json();
  },

  async createPreProjet(data) {
    const res = await fetch(`${API_BASE}/Pre projets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur création');
    return res.json();
  },

  async updatePreProjet(id, data) {
    const res = await fetch(`${API_BASE}/Pre projets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erreur mise à jour');
    return res.json();
  },

  async deletePreProjet(id) {
    const res = await fetch(`${API_BASE}/Pre projets/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur suppression');
  },
};
