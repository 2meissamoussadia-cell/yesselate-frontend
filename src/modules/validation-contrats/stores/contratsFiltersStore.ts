/**
 * Store Zustand pour les filtres et la période du module Validation-Contrats
 * Gère l'état des filtres, période, vue active, et statistiques
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PeriodeContrat,
  ContratsFilters,
  ContratsStats,
} from '../types/contratsTypes';

interface ContratsFiltersState {
  // Filtres
  periode: PeriodeContrat;
  dateDebut: string | null;
  dateFin: string | null;
  statuts: string[];
  types: string[];
  priorites: string[];
  montantMin: number | null;
  montantMax: number | null;
  dureeMin: number | null;
  dureeMax: number | null;
  projets: string[];
  entreprises: string[];
  services: string[];
  bureaux: string[];
  validateurs: string[];
  recherche: string;

  // Stats
  stats: ContratsStats | null;

  // Actions
  setPeriode: (periode: PeriodeContrat) => void;
  setDateRange: (dateDebut: string | null, dateFin: string | null) => void;
  setStatuts: (statuts: string[]) => void;
  setTypes: (types: string[]) => void;
  setPriorites: (priorites: string[]) => void;
  setMontantRange: (min: number | null, max: number | null) => void;
  setDureeRange: (min: number | null, max: number | null) => void;
  setProjets: (projets: string[]) => void;
  setEntreprises: (entreprises: string[]) => void;
  setServices: (services: string[]) => void;
  setBureaux: (bureaux: string[]) => void;
  setValidateurs: (validateurs: string[]) => void;
  setRecherche: (recherche: string) => void;
  resetFilters: () => void;
  getFilters: () => ContratsFilters;

  // Stats
  setStats: (stats: ContratsStats) => void;
}

const defaultStats: ContratsStats = {
  total: 0,
  enAttente: 0,
  urgents: 0,
  valides: 0,
  rejetes: 0,
  negociation: 0,
  tauxValidation: 0,
  montantTotal: 0,
  montantEnAttente: 0,
  montantValides: 0,
  delaiMoyenValidation: 0,
  parType: {
    FOURNITURE: 0,
    TRAVAUX: 0,
    PRESTATION: 0,
    SERVICE: 0,
    AUTRE: 0,
  },
  parStatut: {
    EN_ATTENTE: 0,
    URGENT: 0,
    VALIDE: 0,
    REJETE: 0,
    NEGOCIATION: 0,
  },
  parPriorite: {
    CRITICAL: 0,
    MEDIUM: 0,
    LOW: 0,
  },
};

export const useContratsFiltersStore = create<ContratsFiltersState>()(
  persist(
    (set, get) => ({
      // État initial
      periode: 'month',
      dateDebut: null,
      dateFin: null,
      statuts: [],
      types: [],
      priorites: [],
      montantMin: null,
      montantMax: null,
      dureeMin: null,
      dureeMax: null,
      projets: [],
      entreprises: [],
      services: [],
      bureaux: [],
      validateurs: [],
      recherche: '',
      stats: null,

      // Actions
      setPeriode: (periode) => set({ periode }),
      setDateRange: (dateDebut, dateFin) => set({ dateDebut, dateFin }),
      setStatuts: (statuts) => set({ statuts }),
      setTypes: (types) => set({ types }),
      setPriorites: (priorites) => set({ priorites }),
      setMontantRange: (montantMin, montantMax) => set({ montantMin, montantMax }),
      setDureeRange: (dureeMin, dureeMax) => set({ dureeMin, dureeMax }),
      setProjets: (projets) => set({ projets }),
      setEntreprises: (entreprises) => set({ entreprises }),
      setServices: (services) => set({ services }),
      setBureaux: (bureaux) => set({ bureaux }),
      setValidateurs: (validateurs) => set({ validateurs }),
      setRecherche: (recherche) => set({ recherche }),
      resetFilters: () =>
        set({
          periode: 'month',
          dateDebut: null,
          dateFin: null,
          statuts: [],
          types: [],
          priorites: [],
          montantMin: null,
          montantMax: null,
          dureeMin: null,
          dureeMax: null,
          projets: [],
          entreprises: [],
          services: [],
          bureaux: [],
          validateurs: [],
          recherche: '',
        }),
      getFilters: () => {
        const state = get();
        return {
          periode: state.periode,
          dateDebut: state.dateDebut,
          dateFin: state.dateFin,
          statuts: state.statuts as any[],
          types: state.types as any[],
          priorites: state.priorites as any[],
          montantMin: state.montantMin ?? undefined,
          montantMax: state.montantMax ?? undefined,
          dureeMin: state.dureeMin,
          dureeMax: state.dureeMax,
          projets: state.projets,
          entreprises: state.entreprises,
          services: state.services,
          bureaux: state.bureaux,
          validateurs: state.validateurs,
          recherche: state.recherche,
        };
      },
      setStats: (stats) => set({ stats }),
    }),
    {
      name: 'contrats-filters-storage',
      partialize: (state) => ({
        periode: state.periode,
        dateDebut: state.dateDebut,
        dateFin: state.dateFin,
        statuts: state.statuts,
        types: state.types,
        priorites: state.priorites,
        recherche: state.recherche,
      }),
    }
  )
);

