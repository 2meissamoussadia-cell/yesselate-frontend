/**
 * Utilitaire pour charger dynamiquement les composants de pages
 * Utilise l'import dynamique pour le code splitting
 */

import type { ComponentType } from 'react';

/**
 * Mapping des noms de composants vers leurs chemins d'import
 * Permet de charger dynamiquement les composants sans hardcoder les chemins
 */
const componentMap: Record<string, () => Promise<{ default: ComponentType }>> = {
  // Pages Overview
  OverviewPage: () => import('../components/views/OverviewPage'),
  SummaryPage: () => import('../components/views/SummaryPage'),
  SummaryDashboardPage: () => import('../components/views/SummaryDashboardPage'),
  SummaryPointsPage: () => import('../components/views/SummaryPointsPage'),
  KpiOverviewPage: () => import('../components/views/KpiOverviewPage'),
  HighlightsKpiPage: () => import('../components/views/HighlightsKpiPage'),
  ProjetKpiPage: () => import('../components/views/ProjetKpiPage'),
  DemandesKpiPage: () => import('../components/views/DemandesKpiPage'),
  BudgetKpiPage: () => import('../components/views/BudgetKpiPage'),
  BureauxPage: () => import('../components/views/BureauxPage'),
  TendancesPage: () => import('../components/views/TendancesPage'),
  
  // Pages Performance
  ValidationsGlobalPage: () => import('../components/views/ValidationsGlobalPage'),
  
  // Pages par défaut
  DashboardHome: () => import('../components/views/DashboardHome'),
  EmptyState: () => import('../components/views/EmptyState'),
};

/**
 * Charge un composant de manière asynchrone
 * @param name - Nom du composant à charger
 * @returns Promise qui résout vers le composant par défaut
 * @throws Error si le composant n'existe pas dans le mapping
 */
export async function loadComponent(name: string): Promise<ComponentType> {
  const loader = componentMap[name];
  
  if (!loader) {
    throw new Error(`Component "${name}" not found in component map. Available components: ${Object.keys(componentMap).join(', ')}`);
  }
  
  const module = await loader();
  return module.default;
}

/**
 * Vérifie si un composant existe dans le mapping
 * @param name - Nom du composant à vérifier
 * @returns true si le composant existe, false sinon
 */
export function hasComponent(name: string): boolean {
  return name in componentMap;
}

/**
 * Obtient la liste de tous les composants disponibles
 * @returns Tableau des noms de composants disponibles
 */
export function getAvailableComponents(): string[] {
  return Object.keys(componentMap);
}

