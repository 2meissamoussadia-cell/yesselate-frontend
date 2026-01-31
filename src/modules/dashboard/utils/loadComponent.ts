/**
 * Utilitaire pour charger dynamiquement les composants de pages
 * Utilise l'import dynamique pour le code splitting
 * ✅ Amélioré avec cache et retry logic
 */

import type { ComponentType } from 'react';
import { logger } from '@/lib/utils/logger';
import { CockpitDGPage } from '../components/views/CockpitDGPage';
import { SummaryDashboardPage } from '../components/views/SummaryDashboardPage';
import { DelaysCritiquesPage } from '../components/views/DelaysCritiquesPage';
import { DashboardDGLayout } from '../components/views/DashboardDGLayout';

/** Composant valide : fonction ou objet React (memo, forwardRef, etc.) */
function isValidReactComponent(value: unknown): value is ComponentType {
  if (typeof value === 'function') return true;
  if (typeof value === 'object' && value !== null) {
    const v = value as { $$typeof?: unknown; type?: unknown };
    if (typeof v.$$typeof === 'symbol' || typeof v.$$typeof === 'number') return true;
    if (typeof v.type === 'function') return true;
  }
  return false;
}

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
const componentMap: Record<string, () => Promise<{ default?: ComponentType; [key: string]: ComponentType | undefined }>> = {
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
  CockpitDGPage: () => import('../components/views/CockpitDGPage'),
  CockpitDG_V2Page: () => import('../components/views/CockpitDG_V2Page'),
  DashboardDGLayout: () => import('../components/views/DashboardDGLayout'),
  RapportDGPage: () => import('../components/views/RapportDGPage'),
  FinancesOverviewPage: () => import('../components/views/FinancesOverviewPage'),
  ConversationsHistoryPage: () => import('../components/views/ConversationsHistoryPage'),

  // Pages Performance
  ValidationsGlobalPage: () => import('../components/views/ValidationsGlobalPage'),
  PerformanceSynthesePage: () => import('../components/views/PerformanceSynthesePage'),
  PerformanceProjetsPage: () => import('../components/views/PerformanceProjetsPage'),
  PerformanceDemandesPage: () => import('../components/views/PerformanceDemandesPage'),
  PerformanceBudgetPage: () => import('../components/views/PerformanceBudgetPage'),
  ValidationPaiementsPage: () => import('../components/views/ValidationPaiementsPage'),
  
  // Alerts & Activity
  AlertsActivesPage: () => import('../components/views/AlertsActivesPage'),
  AlertsUrgentesPage: () => import('../components/views/AlertsUrgentesPage'),
  ActivityTimelinePage: () => import('../components/views/ActivityTimelinePage'),
  ActivityNotificationsPage: () => import('../components/views/ActivityNotificationsPage'),
  // Performance > Retards (delays)
  DelaysCritiquesPage: () => import('../components/views/DelaysCritiquesPage'),
  DelaysMoyensPage: () => import('../components/views/DelaysMoyensPage'),
  DelaysAnalyseCausesPage: () => import('../components/views/DelaysAnalyseCausesPage'),
  
  // Achats, Stocks, Matériel
  AchatsOverviewPage: () => import('../components/views/AchatsOverviewPage'),
  AchatsFournisseursPage: () => import('../components/views/AchatsFournisseursPage'),
  AchatsOpenOrdersPage: () => import('../components/views/AchatsOpenOrdersPage'),
  StocksOverviewPage: () => import('../components/views/StocksOverviewPage'),
  StocksTrendsPage: () => import('../components/views/StocksTrendsPage'),
  MaterielOverviewPage: () => import('../components/views/MaterielOverviewPage'),
  
  // Conformité & HSE
  HSEConformiteView: () => import('../components/views/HSEConformiteView'),
  ComplianceOverviewPage: () => import('../components/compliance/ComplianceOverviewPage'),
  ComplianceDocumentsPage: () => import('../components/views/ComplianceDocumentsPage'),
  ComplianceWorkflowsPage: () => import('../components/compliance/ComplianceWorkflowsPage'),
  ComplianceLotsPage: () => import('../components/views/ComplianceLotsPage'),
  
  // Reporting
  ReportingOverviewPage: () => import('../components/reporting/ReportingOverviewPage'),
  ReportingTrendsPage: () => import('../components/reporting/ReportingTrendsPage'),
  ReportingByBureauPage: () => import('../components/reporting/ReportingByBureauPage'),
  ReportingByChantierPage: () => import('../components/reporting/ReportingByChantierPage'),
  
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

  // ✅ Résolution statique pour éviter erreur Turbopack sur import dynamique
  if (name === 'CockpitDGPage') {
    componentCache.set(name, CockpitDGPage);
    return Promise.resolve(CockpitDGPage);
  }
  if (name === 'SummaryDashboardPage') {
    componentCache.set(name, SummaryDashboardPage);
    return Promise.resolve(SummaryDashboardPage);
  }
  if (name === 'DelaysCritiquesPage') {
    componentCache.set(name, DelaysCritiquesPage);
    return Promise.resolve(DelaysCritiquesPage);
  }
  if (name === 'DashboardDGLayout') {
    componentCache.set(name, DashboardDGLayout);
    return Promise.resolve(DashboardDGLayout);
  }

  // ✅ Vérifier si un chargement est déjà en cours
  if (loadingPromises.has(name)) {
    return loadingPromises.get(name)!;
  }

  // ✅ Obtenir le loader
  const loader = componentMap[name];
  
  if (!loader) {
    const available = Object.keys(componentMap).join(', ');
    const error = new Error(
      `Component "${name}" not found in component map. Available: ${available}`
    );
    log.error(`Composant non trouvé: "${name}"`, error, { name, available: Object.keys(componentMap) });
    throw error;
  }

  // ✅ Créer la promesse de chargement avec retry
  const loadPromise = retryWithBackoff(async () => {
    try {
      const loadedModule = await loader();
      
      if (!loadedModule) {
        throw new Error(`Component "${name}" module is empty or undefined`);
      }

      // ✅ Gérer à la fois default export et named export
      // Certains composants utilisent named export (SummaryPage, OverviewPage, etc.)
      // Accepter aussi React.memo() / forwardRef (typeof === 'object')
      let component: ComponentType | undefined;
      const defaultExport = loadedModule.default;
      const namedExport = loadedModule[name as keyof typeof loadedModule];

      if (defaultExport && isValidReactComponent(defaultExport)) {
        component = defaultExport as ComponentType;
      } else if (namedExport && isValidReactComponent(namedExport)) {
        component = namedExport as ComponentType;
      } else {
        // Fallback: prendre le premier export qui est un composant valide
        const exports = Object.keys(loadedModule).filter(
          (k) => k !== '__esModule' && k !== 'default'
        );
        for (const key of exports) {
          const exp = loadedModule[key as keyof typeof loadedModule];
          if (isValidReactComponent(exp)) {
            component = exp as ComponentType;
            break;
          }
        }
      }

      if (!component || !isValidReactComponent(component)) {
        throw new Error(`Component "${name}" did not export a valid component (no default, no named export matching "${name}")`);
      }
      
      // ✅ Mettre en cache le composant chargé
      componentCache.set(name, component);
      
      return component;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      log.error(`Erreur lors du chargement du composant "${name}"`, err, {
        name,
        message: err.message,
        cause: error instanceof Error && (error as Error & { cause?: unknown }).cause,
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

