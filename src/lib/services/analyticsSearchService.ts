/**
 * Service de Recherche Analytics
 * Gère la recherche dans tous les éléments analytics avec scoring
 */

import {
  analyticsBTPArchitecture,
  type AnalyticsDomain,
  type AnalyticsModule,
  type AnalyticsSubModule,
} from '@/lib/config/analyticsBTPArchitecture';
import { searchWithScoring } from '@/application/utils/searchUtils';

export interface SearchableItem {
  id: string;
  type: 'domain' | 'module' | 'submodule' | 'element' | 'kpi' | 'alert';
  label: string;
  description?: string;
  path: string[];
  domainId?: string;
  moduleId?: string;
  subModuleId?: string;
}

export interface SearchResult extends SearchableItem {
  score: number;
  matches: Array<{ field: string; positions: number[] }>;
}

/**
 * Construit l'index de recherche à partir de l'architecture BTP
 */
function buildSearchIndex(): SearchableItem[] {
  const items: SearchableItem[] = [];

  // Parcourir tous les domaines (analyticsBTPArchitecture est AnalyticsDomain[])
  analyticsBTPArchitecture.forEach((domain: AnalyticsDomain) => {
    items.push({
      id: domain.id,
      type: 'domain',
      label: domain.label,
      description: domain.description,
      path: [domain.label],
      domainId: domain.id,
    });

    domain.modules.forEach((mod: AnalyticsModule) => {
      items.push({
        id: mod.id,
        type: 'module',
        label: mod.label,
        description: mod.description,
        path: [domain.label, mod.label],
        domainId: domain.id,
        moduleId: mod.id,
      });

      mod.subModules?.forEach((subMod: AnalyticsSubModule) => {
        items.push({
          id: subMod.id,
          type: 'submodule',
          label: subMod.label,
          description: subMod.description,
          path: [domain.label, mod.label, subMod.label],
          domainId: domain.id,
          moduleId: mod.id,
          subModuleId: subMod.id,
        });
      });
    });
  });

  return items;
}

// Cache de l'index de recherche
let searchIndexCache: SearchableItem[] | null = null;

/**
 * Récupère l'index de recherche (avec cache)
 */
function getSearchIndex(): SearchableItem[] {
  if (!searchIndexCache) {
    searchIndexCache = buildSearchIndex();
  }
  return searchIndexCache;
}

/**
 * Recherche dans l'index analytics
 */
export function searchAnalytics(
  query: string,
  options: {
    limit?: number;
    types?: SearchableItem['type'][];
    domainId?: string;
  } = {}
): SearchResult[] {
  const { limit = 10, types, domainId } = options;

  let items = getSearchIndex();

  // Filtrer par type si spécifié
  if (types && types.length > 0) {
    items = items.filter((item) => types.includes(item.type));
  }

  // Filtrer par domaine si spécifié
  if (domainId) {
    items = items.filter((item) => item.domainId === domainId);
  }

  // Effectuer la recherche avec scoring
  const results = searchWithScoring(
    items,
    query,
    ['label', 'description', 'path']
  ) as unknown as SearchResult[];

  // Trier par score et limiter
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Recherche rapide (pour autocomplétion)
 */
export function quickSearch(query: string, limit: number = 5): SearchResult[] {
  return searchAnalytics(query, { limit });
}

/**
 * Recherche complète (pour résultats détaillés)
 */
export function fullSearch(
  query: string,
  options: {
    limit?: number;
    types?: SearchableItem['type'][];
    domainId?: string;
  } = {}
): SearchResult[] {
  return searchAnalytics(query, { limit: options.limit || 20, ...options });
}

/**
 * Invalide le cache de l'index
 */
export function invalidateSearchIndex(): void {
  searchIndexCache = null;
}

