/**
 * Types partagés pour les composants ERP (filtres, vues sauvegardées, tableaux).
 * Utilisés par FilterBar, ErpDataTable, et les vues listes (chantiers, demandes, alertes).
 */

import type { ReactNode } from 'react';

export type ErpFilterValue = string | number | boolean | string[] | [number, number] | null;

/** Filtres génériques pour les vues listes ERP */
export interface ErpFilters {
  programme?: string;
  chantier?: string;
  entreprise?: string;
  statut?: string | string[];
  priorite?: string | string[];
  gravite?: string | string[];
  periode?: string;
  dateDebut?: string;
  dateFin?: string;
  avancement?: string;
  retard?: 'oui' | 'non' | 'tous';
  ecartBudget?: 'oui' | 'non' | 'tous';
  delais?: string;
  risques?: string | string[];
  [key: string]: ErpFilterValue | undefined;
}

/** Vue sauvegardée (filtres prédéfinis ou personnalisés) */
export interface ErpSavedView {
  id: string;
  name: string;
  filters: ErpFilters;
  isDefault?: boolean;
}

/** Configuration d'une colonne pour ErpDataTable */
export interface ErpColumnDef<T = unknown> {
  id: string;
  header: string;
  accessorKey?: keyof T | string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  minWidth?: number;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
}

/** Props de ligne pour tableaux ERP (sélection, expansion) */
export interface ErpRowState {
  selected?: boolean;
  expanded?: boolean;
}
