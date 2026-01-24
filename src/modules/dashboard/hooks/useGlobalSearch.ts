/**
 * Hook pour la recherche globale intelligente
 * Recherche dans KPIs, projets, bureaux, demandes, etc.
 */

'use client';

import { useMemo } from 'react';

export interface SearchResult {
  id: string;
  type: 'kpi' | 'project' | 'bureau' | 'demande' | 'navigation';
  label: string;
  value?: string | number;
  description?: string;
  keywords: string[];
  action: () => void;
  score: number; // Score de pertinence (0-100)
}

export function useGlobalSearch(query: string, kpis?: any[]): SearchResult[] {
  // Les KPIs sont passés en paramètre pour éviter les dépendances circulaires
  // Le composant appelant doit fournir les KPIs depuis son contexte

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const queryWords = q.split(/\s+/).filter(Boolean);
    const allResults: SearchResult[] = [];

    // Recherche dans les KPIs
    if (Array.isArray(kpis) && kpis.length > 0) {
      kpis.forEach((kpi) => {
        const label = String(kpi.label || '').toLowerCase();
        const value = String(kpi.value || '').toLowerCase();
        const description = String(kpi.description || '').toLowerCase();
        
        const searchText = `${label} ${value} ${description}`;
        const matchCount = queryWords.filter(word => searchText.includes(word)).length;
        const matchRatio = matchCount / queryWords.length;
        
        if (matchRatio > 0) {
          // Score basé sur la pertinence
          let score = matchRatio * 100;
          // Bonus si le label commence par la query
          if (label.startsWith(q)) score += 20;
          // Bonus si la query est dans le label
          if (label.includes(q)) score += 10;
          
          allResults.push({
            id: `kpi-${kpi.id || label}`,
            type: 'kpi',
            label: String(kpi.label),
            value: kpi.value,
            description: kpi.description,
            keywords: [label, value, description].filter(Boolean),
            score: Math.min(100, score),
            action: () => {
              // Ouvrir le modal de détail du KPI
              const { useDashboardCommandCenterStore } = require('@/lib/stores/dashboardCommandCenterStore');
              const store = useDashboardCommandCenterStore.getState();
              store.openModal('kpi-drilldown', { kpi });
            },
          });
        }
      });
    }

    // Trier par score décroissant
    return allResults.sort((a, b) => b.score - a.score);
  }, [query, kpis]);

  return results;
}
