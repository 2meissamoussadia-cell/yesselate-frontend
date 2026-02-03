'use client';

import { useQuery } from '@tanstack/react-query';

export interface DashboardKpis {
  chantiersActifs: number;
  alertesCritiques: number;
  budgetTotal: number;
  budgetRealise: number;
  budgetPourcentage: number;
  avancementMoyen: number;
}

export interface DashboardPerformance {
  planning: number;
  budget: number;
  qualite: number;
  securite: number;
}

export interface DashboardAlerte {
  id: string;
  numero?: string;
  titre: string;
  niveau: 'critique' | 'important' | 'normal';
  chantier?: { nom: string } | string;
  date: string;
  dateCreation?: Date | string;
}

export interface DashboardTache {
  id: string;
  titre: string;
  chantier?: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

export interface DashboardActivite {
  id: string;
  type: string;
  description: string;
  date: string;
  auteur?: string;
}

export interface DashboardBudgetPoint {
  mois: string;
  prevu?: number;
  previsionnel?: number;
  realise: number;
  engage?: number;
}

export interface DashboardChantier {
  id: string;
  nom: string;
  lat?: number;
  lng?: number;
  avancement?: number;
  statut?: string;
}

export interface NonConformite {
  id: string;
  reference: string;
  criticite: string;
  chantier: string;
  statut: string;
}

export interface ValidationEnAttente {
  id: string;
  type: string;
  reference: string;
  montant?: number;
  demandeur: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  performance: DashboardPerformance;
  alertes: DashboardAlerte[];
  planning: DashboardTache[];
  activites: DashboardActivite[];
  budgetEvolution: DashboardBudgetPoint[];
  chantiers: DashboardChantier[];
  mesTaches: DashboardTache[];
  ncQualite: NonConformite[];
  validations: ValidationEnAttente[];
}

const MOCK_DATA: DashboardData = {
  kpis: {
    chantiersActifs: 12,
    alertesCritiques: 3,
    budgetTotal: 450_000_000,
    budgetRealise: 312_500_000,
    budgetPourcentage: 69,
    avancementMoyen: 72,
  },
  performance: {
    planning: 78,
    budget: 82,
    qualite: 88,
    securite: 94,
  },
  alertes: [
    { id: '1', numero: 'ALT-001', titre: 'Retard gros œuvre', niveau: 'critique', chantier: { nom: 'Villa Dakar Phase 2' }, date: '2024-02-01', dateCreation: '2024-02-01' },
    { id: '2', numero: 'ALT-002', titre: 'Dépassement budget lot électrique', niveau: 'important', chantier: { nom: 'Immeuble Diamniadio' }, date: '2024-02-02', dateCreation: '2024-02-02' },
    { id: '3', numero: 'ALT-003', titre: 'NC qualité béton', niveau: 'important', chantier: { nom: 'Villa Dakar Phase 2' }, date: '2024-02-03', dateCreation: '2024-02-03' },
  ],
  planning: [
    { id: '1', titre: 'Réception matériaux', chantier: 'VDP2', dateDebut: '2024-02-05', dateFin: '2024-02-05', statut: 'planifié' },
    { id: '2', titre: 'Jalon gros œuvre', chantier: 'IMD', dateDebut: '2024-02-08', dateFin: '2024-02-08', statut: 'en-cours' },
    { id: '3', titre: 'Comité de pilotage', chantier: '-', dateDebut: '2024-02-10', dateFin: '2024-02-10', statut: 'planifié' },
  ],
  activites: [
    { id: '1', type: 'validation', description: 'BC-2024-042 validé', date: '2024-02-03 14:30', auteur: 'J. Dupont' },
    { id: '2', type: 'alerte', description: 'Nouvelle alerte retard', date: '2024-02-03 11:00', auteur: 'Système' },
    { id: '3', type: 'commentaire', description: 'Commentaire sur devis lot 3', date: '2024-02-03 09:15', auteur: 'M. Martin' },
  ],
  budgetEvolution: [
    { mois: 'Oct', previsionnel: 35_000_000, realise: 32_100_000, engage: 30_000_000 },
    { mois: 'Nov', previsionnel: 38_000_000, realise: 36_500_000, engage: 35_000_000 },
    { mois: 'Déc', previsionnel: 42_000_000, realise: 39_800_000, engage: 38_500_000 },
    { mois: 'Jan', previsionnel: 40_000_000, realise: 38_200_000, engage: 37_000_000 },
  ],
  chantiers: [
    { id: '1', nom: 'Villa Dakar Phase 2', lat: 14.7, lng: -17.45, avancement: 65, statut: 'en-cours' },
    { id: '2', nom: 'Immeuble Diamniadio', lat: 14.72, lng: -17.42, avancement: 42, statut: 'en-cours' },
  ],
  mesTaches: [
    { id: '1', titre: 'Valider BC lot électrique', chantier: 'VDP2', dateDebut: '2024-02-04', dateFin: '2024-02-06', statut: 'en-cours' },
    { id: '2', titre: 'Rapport mensuel janvier', chantier: '-', dateDebut: '2024-02-07', dateFin: '2024-02-10', statut: 'planifié' },
  ],
  ncQualite: [
    { id: '1', reference: 'NC-2024-015', criticite: 'majeure', chantier: 'Villa Dakar Phase 2', statut: 'ouverte' },
    { id: '2', reference: 'NC-2024-014', criticite: 'mineure', chantier: 'Immeuble Diamniadio', statut: 'en-traitement' },
  ],
  validations: [
    { id: '1', type: 'BC', reference: 'BC-2024-048', montant: 2_500_000, demandeur: 'J. Dupont' },
    { id: '2', type: 'Demande', reference: 'DEM-2024-089', demandeur: 'M. Martin' },
  ],
};

async function fetchDashboardData(): Promise<DashboardData> {
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_DATA;
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-general'],
    queryFn: fetchDashboardData,
    staleTime: 60_000,
  });
}
