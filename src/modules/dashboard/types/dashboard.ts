/**
 * Types de navigation & registry pour le Dashboard
 * Structure cohérente pour la navigation à 3 niveaux (main, sub, leaf)
 * 
 * SOURCE DE VÉRITÉ UNIQUE pour tous les types de navigation du dashboard
 */

import React from 'react';

// ============================================================================
// Types de navigation
// ============================================================================

/**
 * Catégories principales de navigation (6 blocs métier DG + catégories étendues registry/loaders)
 */
export type Main =
  | 'pilotage'
  | 'chantiers'
  | 'finance'
  | 'clients'
  | 'rh'
  | 'systeme'
  | 'overview'
  | 'performance'
  | 'actions'
  | 'risks'
  | 'decisions'
  | 'realtime'
  | 'administration';

/**
 * Sous-catégories de navigation (peuvent être n'importe quelle chaîne ou null)
 */
export type Sub = string | null;

/**
 * Catégories feuilles de navigation (peuvent être n'importe quelle chaîne ou null)
 */
export type Leaf = string | null;

/**
 * Clé de navigation complète
 * 
 * Format unifié utilisé dans tout le dashboard pour identifier une vue
 */
export interface NavKey {
  main: Main;
  sub: Sub;
  leaf: Leaf;
}

/**
 * Convertit une clé de navigation en chaîne unique pour le registry
 * Format: "main::sub::leaf" (les valeurs null sont remplacées par des chaînes vides)
 * 
 * @example
 * navToKey({ main: 'overview', sub: 'summary', leaf: 'dashboard' })
 * // => "overview::summary::dashboard"
 * 
 * @example
 * navToKey({ main: 'overview', sub: null, leaf: null })
 * // => "overview::::"
 */
export const navToKey = ({ main, sub, leaf }: NavKey): string =>
  `${main}::${sub ?? ''}::${leaf ?? ''}`;

/**
 * Convertit une chaîne de clé en NavKey
 * Format inverse de navToKey
 * 
 * @example
 * keyToNav("overview::summary::dashboard")
 * // => { main: 'overview', sub: 'summary', leaf: 'dashboard' }
 */
export const keyToNav = (key: string): NavKey => {
  const parts = key.split('::');
  return {
    main: parts[0] as Main,
    sub: parts[1] || null,
    leaf: parts[2] || null,
  };
};

// ============================================================================
// Types du registry
// ============================================================================

/**
 * Résultat d'un loader de données avec métadonnées de cache
 */
export interface LoaderResult<TData> {
  key: string;
  fetchedAt: number;
  data: TData;
}

/**
 * Fonction de chargement de données optionnelle pour une vue
 * 
 * @param nav - Clé de navigation actuelle
 * @returns Promise résolue avec les données et métadonnées
 */
export type Loader<TData = unknown> = (nav: NavKey) => Promise<LoaderResult<TData>>;

/**
 * Arguments passés à la fonction de rendu d'une vue
 */
export interface ViewRenderArgs<TData = unknown> {
  nav: NavKey;
  data: TData;
}

/**
 * Entrée dans le registry des vues du Dashboard
 * 
 * @template TData - Type des données chargées par le loader (si présent)
 * 
 * @property id - Identifiant unique de la vue
 * @property title - Titre affiché de la vue (optionnel, pour compatibilité)
 * @property ttl - Durée de vie du cache en millisecondes (optionnel)
 * @property loader - Fonction de chargement des données (optionnel, pour les vues pures)
 * @property render - Fonction de rendu qui reçoit la navigation et les données
 * @property requiredRole - Rôle requis pour accéder à cette vue (optionnel, pour sécurité)
 * @property requiredTenant - Tenant requis pour accéder à cette vue (optionnel, pour multi-tenant)
 */
export interface ViewEntry<TData = unknown> {
  id: string;
  title?: string; // Pour compatibilité avec l'ancien format
  ttl?: number; // ms
  loader?: Loader<TData>;
  render: (args: ViewRenderArgs<TData>) => React.ReactElement;
  requiredRole?: string | string[]; // Pour les guards de sécurité
  requiredTenant?: string | string[]; // Pour le multi-tenant
}
