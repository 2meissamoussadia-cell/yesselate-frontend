/**
 * Types pour le Dashboard Registry
 * Ré-export des types depuis dashboard.ts pour cohérence
 * 
 * @deprecated Utiliser directement les types de dashboard.ts
 * Ce fichier est conservé pour compatibilité ascendante
 */

import type { ViewEntry, Loader, LoaderResult, ViewRenderArgs } from './dashboard';
import type { DashboardViewData } from './dashboardDataTypes';

// Ré-exports pour compatibilité
export type { ViewEntry, Loader, LoaderResult, ViewRenderArgs };

/**
 * Type loader typé avec DashboardViewData
 * @deprecated Utiliser Loader<T> directement
 */
export type TypedLoaderFn<T extends DashboardViewData = DashboardViewData> = Loader<T>;

/**
 * Registry typé complet
 * Accepte des ViewEntry avec différents types de données pour flexibilité
 */
export type DashboardRegistry = Record<string, ViewEntry<any>>;
