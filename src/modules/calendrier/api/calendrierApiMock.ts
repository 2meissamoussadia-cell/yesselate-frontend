/**
 * Données mockées pour le module Calendrier & Planification
 * Utilisées en développement quand les endpoints backend ne sont pas disponibles
 */

import type {
  CalendrierOverviewResponse,
  JalonsResponse,
  SyncStatusResponse,
  AffectationsResponse,
  CalendrierAlertesResponse,
  Jalon,
  EvenementCalendrier,
  Absence,
  Affectation,
  CalendrierAlerte,
  Chantier,
} from '../types/calendrierTypes';

// ================================
// Données mockées - Chantiers
// ================================

export const mockChantiers: Chantier[] = [
  {
    id: 1,
    code: 'CH-001',
    nom: 'Tours Horizon',
    description: 'Construction de deux tours résidentielles',
    date_debut: '2024-01-01',
    date_fin: '2024-12-31',
    budget: 12500000,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'CH-002',
    nom: 'Centre Commercial',
    description: 'Construction d\'un centre commercial',
    date_debut: '2024-02-01',
    date_fin: '2024-11-30',
    budget: 8200000,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 3,
    code: 'CH-003',
    nom: 'Résidence Verte',
    description: 'Construction d\'une résidence écologique',
    date_debut: '2024-03-01',
    date_fin: '2025-02-28',
    budget: 5800000,
    created_at: '2024-03-01T00:00:00Z',
  },
];

// ================================
// Données mockées - Jalons
// ================================

export const mockJalons: Jalon[] = [
  {
    id: 1,
    chantier_id: 1,
    libelle: 'Validation BC lot 3',
    type: 'CONTRAT',
    date_debut: '2024-01-10',
    date_fin: '2024-01-15',
    est_retard: true,
    est_sla_risque: true,
    statut: 'En cours',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    chantier_id: 1,
    libelle: 'Livraison matériaux site B',
    type: 'SLA',
    date_debut: '2024-01-15',
    date_fin: '2024-01-20',
    est_retard: false,
    est_sla_risque: false,
    statut: 'À venir',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    chantier_id: 2,
    libelle: 'Validation plans architecte',
    type: 'INTERNE',
    date_debut: '2024-01-10',
    date_fin: '2024-01-18',
    est_retard: false,
    est_sla_risque: false,
    statut: 'Terminé',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    chantier_id: 3,
    libelle: 'Autorisation travaux',
    type: 'CONTRAT',
    date_debut: '2024-01-05',
    date_fin: '2024-01-10',
    est_retard: true,
    est_sla_risque: true,
    statut: 'En cours',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 5,
    chantier_id: 1,
    libelle: 'Fondations lot 1',
    type: 'INTERNE',
    date_debut: '2024-01-20',
    date_fin: '2024-02-15',
    est_retard: false,
    est_sla_risque: false,
    statut: 'À venir',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// ================================
// Données mockées - Événements
// ================================

export const mockEvenements: EvenementCalendrier[] = [
  {
    id: 1,
    type: 'REUNION_PROJET',
    titre: 'Réunion de coordination Alpha',
    description: 'Réunion hebdomadaire de coordination',
    date_debut: '2024-01-15T14:00:00Z',
    date_fin: '2024-01-15T16:00:00Z',
    chantier_id: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    type: 'REUNION_DECISIONNELLE',
    titre: 'Comité de pilotage mensuel',
    description: 'Comité de pilotage pour revue des projets',
    date_debut: '2024-01-20T10:00:00Z',
    date_fin: '2024-01-20T12:00:00Z',
    chantier_id: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    type: 'EVENEMENT',
    titre: 'Visite chantier Beta',
    description: 'Visite du chantier avec le client',
    date_debut: '2024-01-18T09:00:00Z',
    date_fin: '2024-01-18T11:00:00Z',
    chantier_id: 2,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// ================================
// Données mockées - Absences
// ================================

export const mockAbsences: Absence[] = [
  {
    id: 1,
    user_id: 1,
    chantier_id: 1,
    type: 'CONGÉ',
    date_debut: '2024-01-22',
    date_fin: '2024-01-26',
    motif: 'Congés annuels',
    created_at: '2024-01-01T00:00:00Z',
    employe_nom: 'Jean Dupont',
    equipe_id: 1,
    statut: 'VALIDE',
  },
  {
    id: 2,
    user_id: 2,
    chantier_id: 2,
    type: 'MISSION',
    date_debut: '2024-01-16',
    date_fin: '2024-01-19',
    motif: 'Mission client',
    created_at: '2024-01-01T00:00:00Z',
    employe_nom: 'Marie Martin',
    equipe_id: 1,
    statut: 'VALIDE',
  },
];

// ================================
// Données mockées - Affectations
// ================================

export const mockAffectations: Affectation[] = [
  {
    id: 1,
    user_id: 1,
    chantier_id: 1,
    role: 'Chef de projet',
    date_debut: '2024-01-01',
    date_fin: '2024-12-31',
    est_suralloue: false,
    created_at: '2024-01-01T00:00:00Z',
    user_nom: 'Jean Dupont',
    chantier_nom: 'Tours Horizon',
  },
  {
    id: 2,
    user_id: 2,
    chantier_id: 2,
    role: 'Chef de projet',
    date_debut: '2024-02-01',
    date_fin: '2024-11-30',
    est_suralloue: false,
    created_at: '2024-02-01T00:00:00Z',
    user_nom: 'Marie Martin',
    chantier_nom: 'Centre Commercial',
  },
  {
    id: 3,
    user_id: 3,
    chantier_id: 1,
    role: 'Conducteur de travaux',
    date_debut: '2024-01-01',
    date_fin: '2024-12-31',
    est_suralloue: true,
    created_at: '2024-01-01T00:00:00Z',
    user_nom: 'Pierre Durand',
    chantier_nom: 'Tours Horizon',
  },
];

// ================================
// Données mockées - Alertes
// ================================

export const mockAlertes: CalendrierAlerte[] = [
  {
    id: 1,
    type: 'SLA_RISQUE',
    jalon_id: 1,
    chantier_id: 1,
    user_id: null,
    date_declenchement: '2024-01-10T00:00:00Z',
    est_resolue: false,
    resolue_at: null,
    created_at: '2024-01-10T00:00:00Z',
    jalon_libelle: 'Validation BC lot 3',
    chantier_nom: 'Tours Horizon',
  },
  {
    id: 2,
    type: 'RETARD',
    jalon_id: 4,
    chantier_id: 3,
    user_id: null,
    date_declenchement: '2024-01-10T00:00:00Z',
    est_resolue: false,
    resolue_at: null,
    created_at: '2024-01-10T00:00:00Z',
    jalon_libelle: 'Autorisation travaux',
    chantier_nom: 'Résidence Verte',
  },
];

// ================================
// Données mockées - Vue d'ensemble
// ================================

export const mockOverview: CalendrierOverviewResponse = {
  jalons: mockJalons,
  evenements: mockEvenements,
  absences: mockAbsences,
  chantiers: mockChantiers,
  stats: {
    jalons_at_risk_count: 2,
    jalons_retard_count: 2,
    jalons_total_count: 5,
    retards_detectes_count: 2,
    sur_allocation_ressources_count: 0,
  },
};

// ================================
// Données mockées - Réponses API
// ================================

export const mockJalonsResponse: JalonsResponse = {
  jalons: mockJalons,
  total: mockJalons.length,
};

export const mockSyncStatus: SyncStatusResponse = {
  statuts: [
    {
      id: 1,
      module: 'DEMANDES',
      statut: 'OK',
      derniere_sync: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      module: 'VALIDATIONS',
      statut: 'WARNING',
      derniere_sync: '2024-01-14T15:30:00Z',
      created_at: '2024-01-14T15:30:00Z',
    },
  ],
};

export const mockAffectationsResponse: AffectationsResponse = {
  affectations: mockAffectations,
  total: mockAffectations.length,
};

export const mockAlertesResponse: CalendrierAlertesResponse = {
  alertes: mockAlertes,
  total: mockAlertes.length,
};

