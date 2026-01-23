/**
 * Utilitaire pour charger dynamiquement les composants de pages
 * Utilise l'import dynamique pour le code splitting
 * ✅ Amélioré avec cache et retry logic
 */

import type { ComponentType } from 'react';
import { logger } from '@/lib/utils/logger';

// Logger pour ce module utilitaire
const log = {
  error: (message: string, error?: Error, context?: Record<string, unknown>) => 
    logger.error(message, error, { component: 'loadComponent', ...context }),
  warn: (message: string, context?: Record<string, unknown>) => 
    logger.warn(message, { component: 'loadComponent', ...context }),
};

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

// ✅ Cache pour les composants chargés (améliore les performances)
const componentCache = new Map<string, ComponentType>();

// ✅ Cache pour les promesses en cours (évite les chargements multiples simultanés)
const loadingPromises = new Map<string, Promise<ComponentType>>();

// ✅ Configuration du retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

/**
 * Retry avec exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    // Attendre avant de réessayer
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    // Exponential backoff
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Charge un composant de manière asynchrone
 * ✅ Utilise un cache et une logique de retry
 * @param name - Nom du composant à charger
 * @returns Promise qui résout vers le composant par défaut
 * @throws Error si le composant n'existe pas dans le mapping ou si le chargement échoue après retries
 */
export async function loadComponent(name: string): Promise<ComponentType> {
  // ✅ Validation du nom du composant
  if (!name || typeof name !== 'string') {
    const error = new Error(`Invalid component name: ${name}`);
    log.error('Nom de composant invalide', error, { name });
    throw error;
  }

  // ✅ Vérifier le cache
  if (componentCache.has(name)) {
    return componentCache.get(name)!;
  }

  // ✅ Vérifier si un chargement est déjà en cours
  if (loadingPromises.has(name)) {
    return loadingPromises.get(name)!;
  }

  // ✅ Obtenir le loader
  const loader = componentMap[name];
  
  if (!loader) {
    const error = new Error(
      `Component "${name}" not found in component map. Available components: ${Object.keys(componentMap).join(', ')}`
    );
    log.error('Composant non trouvé', error, { name, available: Object.keys(componentMap) });
    throw error;
  }

  // ✅ Créer la promesse de chargement avec retry
  const loadPromise = retryWithBackoff(async () => {
    try {
      const module = await loader();
      
      if (!module) {
        throw new Error(`Component "${name}" module is empty or undefined`);
      }

      // ✅ Gérer à la fois default export et named export
      // Certains composants utilisent named export (SummaryPage, OverviewPage, etc.)
      let component: ComponentType;
      
      if (module.default) {
        // Default export (cas le plus courant)
        component = module.default;
      } else {
        // Named export - chercher le composant avec le même nom
        const namedExport = module[name as keyof typeof module];
        if (namedExport && typeof namedExport === 'function') {
          component = namedExport as ComponentType;
        } else {
          // Fallback: prendre le premier export nommé disponible
          const exports = Object.keys(module);
          if (exports.length > 0) {
            const firstExport = module[exports[0] as keyof typeof module];
            if (typeof firstExport === 'function') {
              component = firstExport as ComponentType;
            } else {
              throw new Error(`Component "${name}" did not export a valid component (no default, no named export matching "${name}")`);
            }
          } else {
            throw new Error(`Component "${name}" did not export any component`);
          }
        }
      }
      
      // ✅ Mettre en cache le composant chargé
      componentCache.set(name, component);
      
      return component;
    } catch (error) {
      log.error(`Erreur lors du chargement du composant "${name}"`, error instanceof Error ? error : new Error(String(error)), {
        name,
      });
      throw error;
    } finally {
      // ✅ Nettoyer la promesse en cours
      loadingPromises.delete(name);
    }
  });

  // ✅ Stocker la promesse en cours
  loadingPromises.set(name, loadPromise);

  return loadPromise;
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

/**
 * Vide le cache des composants chargés
 * Utile pour forcer le rechargement des composants (ex: hot reload en développement)
 */
export function clearComponentCache(): void {
  componentCache.clear();
  loadingPromises.clear();
  if (process.env.NODE_ENV === 'development') {
    log.warn('Cache des composants vidé');
  }
}

/**
 * Obtient le nombre de composants en cache
 * @returns Nombre de composants actuellement en cache
 */
export function getCachedComponentCount(): number {
  return componentCache.size;
}

