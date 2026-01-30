/**
 * Service API pour la gestion des Projets
 * =========================================
 */

// ============================================
// TYPES
// ============================================

export type ProjetStatus = 
  | 'actif'
  | 'en_pause'
  | 'bloque'
  | 'termine'
  | 'annule';

/** Types de projets BTP : ouvrage, rénovation, chantier, construction + route, bâtiment, aménagement */
export type ProjetType =
  | 'BTP_route'
  | 'BTP_ouvrage_art'
  | 'BTP_ouvrage'      // Ouvrage (générique)
  | 'BTP_batiment'
  | 'BTP_amenagement'
  | 'BTP_renovation'   // Rénovation
  | 'BTP_chantier'     // Chantier / travaux chantier
  | 'BTP_construction' // Construction (neuf)
  | 'autre';

/** Libellés des types BTP pour l’UI (ouvrage, rénovation, chantier, construction) */
export const PROJET_TYPE_LABELS: Record<ProjetType, string> = {
  BTP_route: 'Route / Voirie',
  BTP_ouvrage_art: 'Ouvrage d\'art',
  BTP_ouvrage: 'Ouvrage',
  BTP_batiment: 'Bâtiment',
  BTP_amenagement: 'Aménagement',
  BTP_renovation: 'Rénovation',
  BTP_chantier: 'Chantier',
  BTP_construction: 'Construction',
  autre: 'Autre',
};

export interface Projet {
  id: string;
  numero: string;
  titre: string;
  description: string;
  status: ProjetStatus;
  type: ProjetType;
  clientId: string;
  clientNom: string;
  budget: number;
  budgetConsomme: number;
  dateDebut: string;
  dateFinPrevue: string;
  dateFinReelle?: string;
  responsable: string;
  equipe: string[];
  avancement: number; // 0-100
  risque: 'faible' | 'moyen' | 'eleve' | 'critique';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjetsStats {
  total: number;
  active: number;
  paused: number;
  blocked: number;
  completed: number;
  cancelled: number;
  totalBudget: number;
  budgetConsomme: number;
  tauxRealisation: number;
  parType: Array<{ type: ProjetType; count: number }>;
  parRisque: Array<{ risque: string; count: number }>;
  ts: string;
}

export interface ProjetFilters {
  status?: ProjetStatus[];
  type?: ProjetType[];
  clientId?: string;
  responsable?: string;
  risque?: string[];
  budgetMin?: number;
  budgetMax?: number;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockProjets: Projet[] = [
  {
    id: 'PRJ-001',
    numero: 'PRJ-2026-001',
    titre: 'Route Nationale RN7 - Tronçon Est',
    description: 'Construction de 25km de route nationale',
    status: 'actif',
    type: 'BTP_route',
    clientId: 'CLT-001',
    clientNom: 'Ministère des Infrastructures',
    budget: 4500000000,
    budgetConsomme: 2750000000,
    dateDebut: '2026-01-15',
    dateFinPrevue: '2026-12-31',
    responsable: 'Ahmed Diallo',
    equipe: ['Mohamed Kane', 'Fatou Sall', 'Ousmane Sy'],
    avancement: 61,
    risque: 'moyen',
    tags: ['infrastructure', 'prioritaire'],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T14:30:00Z',
  },
  {
    id: 'PRJ-002',
    numero: 'PRJ-2026-002',
    titre: 'Pont de Kaolack',
    description: 'Construction pont suspendu 250m',
    status: 'bloque',
    type: 'BTP_ouvrage_art',
    clientId: 'CLT-002',
    clientNom: 'Région de Kaolack',
    budget: 850000000,
    budgetConsomme: 320000000,
    dateDebut: '2025-11-01',
    dateFinPrevue: '2026-08-31',
    responsable: 'Aminata Diop',
    equipe: ['Ibrahima Fall', 'Mariama Ndao'],
    avancement: 38,
    risque: 'critique',
    tags: ['bloqué', 'urgent'],
    createdAt: '2025-10-25T10:00:00Z',
    updatedAt: '2026-01-09T16:45:00Z',
  },
];

// ============================================
// SERVICE
// ============================================

class ProjetsApiService {
  private baseUrl = '/api/bmo/projets';

  /**
   * Récupère les statistiques globales
   */
  async getStats(): Promise<ProjetsStats> {
    // Mock implementation
    await this.delay(300);

    const stats: ProjetsStats = {
      total: 42,
      active: 28,
      paused: 5,
      blocked: 3,
      completed: 4,
      cancelled: 2,
      totalBudget: 15000000000,
      budgetConsomme: 8550000000,
      tauxRealisation: 57,
      parType: [
        { type: 'BTP_route', count: 18 },
        { type: 'BTP_ouvrage_art', count: 8 },
        { type: 'BTP_ouvrage', count: 3 },
        { type: 'BTP_batiment', count: 10 },
        { type: 'BTP_amenagement', count: 4 },
        { type: 'BTP_renovation', count: 12 },
        { type: 'BTP_chantier', count: 6 },
        { type: 'BTP_construction', count: 7 },
        { type: 'autre', count: 2 },
      ],
      parRisque: [
        { risque: 'faible', count: 15 },
        { risque: 'moyen', count: 18 },
        { risque: 'eleve', count: 6 },
        { risque: 'critique', count: 3 },
      ],
      ts: new Date().toISOString(),
    };

    return stats;
  }

  /**
   * Liste des projets avec filtres
   */
  async getList(filters?: ProjetFilters): Promise<Projet[]> {
    await this.delay(400);

    let results = [...mockProjets];

    if (filters?.status) {
      results = results.filter((p) => filters.status!.includes(p.status));
    }

    if (filters?.type) {
      results = results.filter((p) => filters.type!.includes(p.type));
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.titre.toLowerCase().includes(search) ||
          p.numero.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    return results;
  }

  /**
   * Détails d'un projet
   */
  async getById(id: string): Promise<Projet | null> {
    await this.delay(200);
    return mockProjets.find((p) => p.id === id) || null;
  }

  /**
   * Créer un projet
   */
  async create(data: Partial<Projet>): Promise<Projet> {
    await this.delay(500);

    const newProjet: Projet = {
      id: `PRJ-${Date.now()}`,
      numero: `PRJ-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      titre: data.titre || 'Nouveau projet',
      description: data.description || '',
      status: data.status || 'actif',
      type: data.type || 'autre',
      clientId: data.clientId || '',
      clientNom: data.clientNom || '',
      budget: data.budget || 0,
      budgetConsomme: 0,
      dateDebut: data.dateDebut || new Date().toISOString().split('T')[0],
      dateFinPrevue: data.dateFinPrevue || '',
      responsable: data.responsable || '',
      equipe: data.equipe || [],
      avancement: 0,
      risque: data.risque || 'faible',
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newProjet;
  }

  /**
   * Mettre à jour un projet
   */
  async update(id: string, data: Partial<Projet>): Promise<Projet> {
    await this.delay(400);

    const existing = await this.getById(id);
    if (!existing) throw new Error('Projet non trouvé');

    return {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Supprimer un projet
   */
  async delete(id: string): Promise<void> {
    await this.delay(300);
    // Mock: pas de véritable suppression
  }

  /**
   * Formater un montant en FCFA
   */
  formatMontant(montant: number): string {
    if (montant >= 1_000_000_000) {
      return `${(montant / 1_000_000_000).toFixed(2)} Md`;
    }
    if (montant >= 1_000_000) {
      return `${(montant / 1_000_000).toFixed(2)} M`;
    }
    if (montant >= 1_000) {
      return `${(montant / 1_000).toFixed(0)} K`;
    }
    return montant.toString();
  }

  /**
   * Délai artificiel pour simulation
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const projetsApiService = new ProjetsApiService();

