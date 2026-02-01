/**
 * Loaders API pour le Dashboard Registry v20
 * 
 * Remplace les loaders mockés par des appels API réels
 * Compatible avec le contrat Loader<TData> du registry
 * Utilise le système de logging unifié
 */

import { navToKey, type NavKey } from '../types/dashboard';
import type { Loader, LoaderResult } from '../types/dashboard';
import type {
  OverviewSummaryDashboardData,
  OverviewSummaryPointsData,
  OverviewKpisHighlightsData,
  KpisProjetsData,
  KpisDemandesData,
  KpisBudgetData,
  AlertsActivesData,
  AlertsUrgentesData,
  ActionsInboxUrgentesData,
  ActionsInboxAujourdhuiData,
  ActionsInboxSemaineData,
  ActionsInboxPersonnaliseesData,
  ValidationsEnAttenteData,
  ValidationsValideesData,
  ValidationsRejeteesData,
  ValidationsCircuitData,
  BudgetConsommationData,
  BudgetRestantData,
  BudgetPrevisionsData,
  BudgetAnalyseData,
  DelaysCritiquesData,
  DelaysMoyensData,
  DelaysAnalyseCausesData,
  PerformanceSyntheseData,
  PerformanceProjetsData,
  PerformanceDemandesData,
  PerformanceBudgetData,
  TrendsMensuellesData,
  TrendsTrimestriellesData,
  TrendsAnnuellesData,
  ComparisonBureauxData,
  ComparisonProjetsData,
  ComparisonPeriodeData,
  ComparisonBenchmarkingData,
  StocksOverviewData,
  StocksTrendsData,
  ComplianceDashboardData,
  ComplianceDocumentsData,
  ComplianceBacklogData,
  ComplianceLotsData,
  RisksViewData,
  DecisionsViewData,
  RealtimeViewData,
  OverviewActivityViewData,
  ActionsViewData,
  DashboardViewData,
} from '../types/dashboardDataTypes';
import { fetchDashboardView } from './client';
import { createLogger } from '../utils/logger.server';

const logger = createLogger('DashboardLoaders');

// ============================================================================
// Helper pour créer un loader API standardisé
// ============================================================================

/**
 * Récupère les headers d'authentification de manière synchrone si possible
 * Utilise localStorage ou un mécanisme global pour récupérer les infos utilisateur
 * Exporté pour utilisation dans d'autres fichiers
 */
export function getAuthHeadersSync(): Record<string, string> {
  try {
    // Essayer de récupérer depuis localStorage (si disponible côté client)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('yesselate_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const headers: Record<string, string> = {
          'x-tenant-id': user.bureauId || 'default',
          'x-user-id': user.id || 'anonymous',
        };
        if (user.role) {
          headers['x-roles'] = Array.isArray(user.role) ? user.role.join(',') : user.role;
        }
        return headers;
      }
    }
  } catch (e) {
    // Ignorer les erreurs de parsing
  }
  
  // Fallback par défaut
  return {
    'x-tenant-id': 'default',
    'x-user-id': 'anonymous',
  };
}

/**
 * Crée un loader API qui appelle fetchDashboardView
 * 
 * @template TData - Type de données attendu
 * @param nav - Clé de navigation
 * @returns LoaderResult avec les données et métadonnées
 */
function createApiLoader<TData extends DashboardViewData>(
  nav: NavKey
): Loader<TData> {
  return async (currentNav: NavKey): Promise<LoaderResult<TData>> => {
    // Utiliser la navigation passée en paramètre (plus précise)
    const targetNav = currentNav || nav;
    const cacheKey = navToKey(targetNav);
    
    try {
      // Récupérer les headers d'authentification
      const authHeaders = getAuthHeadersSync();
      
      // Appel API avec typage strict et headers d'auth
      const data = await fetchDashboardView<TData>(
        targetNav as NavKey & { main: typeof targetNav.main; sub: typeof targetNav.sub; leaf: typeof targetNav.leaf },
        { headers: authHeaders }
      );
      
      return {
        key: cacheKey,
        fetchedAt: Date.now(),
        data: data as TData,
      };
    } catch (error) {
      // En cas d'erreur, logger et retourner un résultat vide plutôt que de faire échouer le rendu
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error loading data for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
      
      return {
        key: cacheKey,
        fetchedAt: Date.now(),
        data: {} as TData,
      };
    }
  };
}

// ============================================================================
// Loaders API par vue
// ============================================================================

/**
 * Loader API pour overview/summary/dashboard
 */
export const loadOverviewSummaryDashboardApi: Loader<OverviewSummaryDashboardData> =
  createApiLoader<OverviewSummaryDashboardData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'dashboard',
  });

/**
 * Loader API pour overview/summary/points
 */
export const loadOverviewSummaryPointsApi: Loader<OverviewSummaryPointsData> =
  createApiLoader<OverviewSummaryPointsData>({
    main: 'overview',
    sub: 'summary',
    leaf: 'points',
  });

/**
 * Loader API pour overview/kpis/highlights
 */
export const loadOverviewKpisHighlightsApi: Loader<OverviewKpisHighlightsData> =
  createApiLoader<OverviewKpisHighlightsData>({
    main: 'overview',
    sub: 'kpis',
    leaf: 'highlights',
  });

/**
 * Loader API pour performance/kpis/projets
 */
export const loadKpisProjetsApi: Loader<KpisProjetsData> =
  createApiLoader<KpisProjetsData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'projets',
  });

/**
 * Loader API pour performance/kpis/demandes
 */
export const loadKpisDemandesApi: Loader<KpisDemandesData> =
  createApiLoader<KpisDemandesData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'demandes',
  });

/**
 * Loader API pour performance/kpis/budget
 */
export const loadKpisBudgetApi: Loader<KpisBudgetData> =
  createApiLoader<KpisBudgetData>({
    main: 'performance',
    sub: 'kpis',
    leaf: 'budget',
  });

/**
 * Loader API pour overview/alerts/actives
 * Utilise l'API /api/alerts/events avec status=open
 */
export const loadAlertsActivesApi: Loader<AlertsActivesData> = async (
  nav: NavKey
): Promise<LoaderResult<AlertsActivesData>> => {
  const cacheKey = navToKey(nav);
  
  try {
    // Récupérer les alertes ouvertes
    const eventsRes = await fetch('/api/alerts/events?status=open&limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    // Récupérer les stats
    const statsRes = await fetch('/api/alerts/stats', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    if (!eventsRes.ok || !statsRes.ok) {
      throw new Error('Failed to load alerts data');
    }
    
    const eventsData = await eventsRes.json();
    const statsData = await statsRes.json();
    
    // Transformer les données
    const alerts = (eventsData.events || []).map((event: any) => ({
      id: event.id,
      ruleId: event.ruleId,
      ruleName: event.ruleName,
      severity: event.severity,
      status: event.status,
      firstSeen: event.firstSeen,
      lastSeen: event.lastSeen,
      count: event.count,
      payload: event.payload,
      labels: event.labels,
      bureau: event.labels?.bureau,
      domain: event.labels?.domain,
    }));
    
    const stats = statsData.stats || {
      open_count: 0,
      critical_open: 0,
      warning_open: 0,
      info_open: 0,
    };
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        alerts,
        stats: {
          total: stats.open_count || 0,
          critiques: stats.critical_open || 0,
          urgentes: stats.warning_open || 0,
          normales: stats.info_open || 0,
        },
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading alerts actives for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
    
    // Retourner structure vide en cas d'erreur
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        alerts: [],
        stats: {
          total: 0,
          critiques: 0,
          urgentes: 0,
          normales: 0,
        },
      },
    };
  }
};

/**
 * Loader API pour overview/alerts/urgentes
 * Utilise l'API /api/alerts/events avec status=open et severity=warning|critical
 */
export const loadAlertsUrgentesApi: Loader<AlertsUrgentesData> = async (
  nav: NavKey
): Promise<LoaderResult<AlertsUrgentesData>> => {
  const cacheKey = navToKey(nav);
  
  try {
    // Récupérer les alertes ouvertes avec sévérité warning ou critical
    const eventsRes = await fetch('/api/alerts/events?status=open&severity=warning&limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    // Récupérer aussi les critical
    const criticalRes = await fetch('/api/alerts/events?status=open&severity=critical&limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    if (!eventsRes.ok || !criticalRes.ok) {
      throw new Error('Failed to load urgent alerts data');
    }
    
    const eventsData = await eventsRes.json();
    const criticalData = await criticalRes.json();
    
    // Combiner et filtrer (warning + critical uniquement)
    const allAlerts = [
      ...(eventsData.events || []),
      ...(criticalData.events || []),
    ].filter((event: any) => 
      event.severity === 'warning' || event.severity === 'critical'
    );
    
    // Transformer les données
    const alerts = allAlerts.map((event: any) => ({
      id: event.id,
      ruleId: event.ruleId,
      ruleName: event.ruleName,
      severity: event.severity as 'warning' | 'critical',
      status: event.status,
      firstSeen: event.firstSeen,
      lastSeen: event.lastSeen,
      count: event.count,
      payload: event.payload,
      labels: event.labels,
      bureau: event.labels?.bureau,
      domain: event.labels?.domain,
    }));
    
    // Calculer les stats
    const critiques = alerts.filter(a => a.severity === 'critical').length;
    const urgentes = alerts.filter(a => a.severity === 'warning').length;
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        alerts,
        stats: {
          total: alerts.length,
          critiques,
          urgentes,
        },
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading alerts urgentes for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
    
    // Retourner structure vide en cas d'erreur
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        alerts: [],
        stats: {
          total: 0,
          critiques: 0,
          urgentes: 0,
        },
      },
    };
  }
};

/**
 * Loader API pour actions/inbox/urgentes
 * Utilise l'API /api/dashboard/actions avec urgency=critical|warning
 */
export const loadActionsInboxUrgentesApi: Loader<ActionsInboxUrgentesData> = async (
  nav: NavKey
): Promise<LoaderResult<ActionsInboxUrgentesData>> => {
  const cacheKey = navToKey(nav);
  
  try {
    // Récupérer les actions urgentes (critical et warning)
    const criticalRes = await fetch('/api/dashboard/actions?urgency=critical&limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    const warningRes = await fetch('/api/dashboard/actions?urgency=warning&limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    if (!criticalRes.ok || !warningRes.ok) {
      throw new Error('Failed to load urgent actions data');
    }
    
    const criticalData = await criticalRes.json();
    const warningData = await warningRes.json();
    
    // Combiner les actions
    const allActions = [
      ...(criticalData.actions || []),
      ...(warningData.actions || []),
    ];
    
    // Calculer les stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const enRetard = allActions.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate < today;
    }).length;
    
    const aujourdhui = allActions.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length;
    
    const cetteSemaine = allActions.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= today && dueDate < weekFromNow;
    }).length;
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions: allActions,
        stats: {
          total: allActions.length,
          enRetard,
          aujourdhui,
          cetteSemaine,
        },
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading actions inbox urgentes for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
    
    // Retourner structure vide en cas d'erreur
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions: [],
        stats: {
          total: 0,
          enRetard: 0,
          aujourdhui: 0,
          cetteSemaine: 0,
        },
      },
    };
  }
};

/**
 * Loader API pour actions/inbox/aujourdhui
 * Utilise l'API /api/dashboard/actions et filtre pour échéance aujourd'hui
 */
export const loadActionsInboxAujourdhuiApi: Loader<ActionsInboxAujourdhuiData> = async (
  nav: NavKey
): Promise<LoaderResult<ActionsInboxAujourdhuiData>> => {
  const cacheKey = navToKey(nav);
  
  try {
    // Récupérer toutes les actions
    const res = await fetch('/api/dashboard/actions?limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    if (!res.ok) {
      throw new Error('Failed to load actions data');
    }
    
    const data = await res.json();
    const allActions = data.actions || [];
    
    // Filtrer pour échéance aujourd'hui
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const actions = allActions.filter((action: any) => {
      const dueDate = new Date(action.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
    
    // Calculer les stats
    const enRetard = actions.filter((a: any) => {
      const dueDate = new Date(a.dueDate);
      return dueDate < today;
    }).length;
    
    const aujourdhui = actions.length;
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions,
        stats: {
          total: actions.length,
          enRetard,
          aujourdhui,
        },
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading actions inbox aujourdhui for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions: [],
        stats: {
          total: 0,
          enRetard: 0,
          aujourdhui: 0,
        },
      },
    };
  }
};

/**
 * Loader API pour actions/inbox/semaine
 * Utilise l'API /api/dashboard/actions et filtre pour échéance cette semaine
 */
export const loadActionsInboxSemaineApi: Loader<ActionsInboxSemaineData> = async (
  nav: NavKey
): Promise<LoaderResult<ActionsInboxSemaineData>> => {
  const cacheKey = navToKey(nav);
  
  try {
    // Récupérer toutes les actions
    const res = await fetch('/api/dashboard/actions?limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    if (!res.ok) {
      throw new Error('Failed to load actions data');
    }
    
    const data = await res.json();
    const allActions = data.actions || [];
    
    // Filtrer pour échéance cette semaine
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const actions = allActions.filter((action: any) => {
      const dueDate = new Date(action.dueDate);
      return dueDate >= today && dueDate < weekFromNow;
    });
    
    const prochaineSemaine = allActions.filter((action: any) => {
      const dueDate = new Date(action.dueDate);
      return dueDate >= weekFromNow && dueDate < twoWeeksFromNow;
    }).length;
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions,
        stats: {
          total: actions.length,
          cetteSemaine: actions.length,
          prochaineSemaine,
        },
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading actions inbox semaine for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions: [],
        stats: {
          total: 0,
          cetteSemaine: 0,
          prochaineSemaine: 0,
        },
      },
    };
  }
};

/**
 * Loader API pour actions/inbox/personnalisees
 * Utilise l'API /api/dashboard/actions avec filtres personnalisés
 */
export const loadActionsInboxPersonnaliseesApi: Loader<ActionsInboxPersonnaliseesData> = async (
  nav: NavKey
): Promise<LoaderResult<ActionsInboxPersonnaliseesData>> => {
  const cacheKey = navToKey(nav);
  
  try {
    // Récupérer toutes les actions (on peut ajouter des filtres personnalisés plus tard)
    const res = await fetch('/api/dashboard/actions?limit=1000', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    if (!res.ok) {
      throw new Error('Failed to load personalized actions data');
    }
    
    const data = await res.json();
    const allActions = data.actions || [];
    
    // Simuler des favoris et tags (dans un vrai système, cela viendrait de l'API)
    const actions = allActions.map((action: any) => ({
      ...action,
      isFavorite: Math.random() > 0.7, // Simulé
      tags: action.urgency === 'critical' ? ['urgent'] : action.type === 'bc' ? ['achat'] : [],
    }));
    
    // Calculer les stats
    const favoris = actions.filter((a: any) => a.isFavorite).length;
    const avecTags = actions.filter((a: any) => a.tags && a.tags.length > 0).length;
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions,
        stats: {
          total: actions.length,
          favoris,
          avecTags,
          filtrees: actions.length,
        },
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading actions inbox personnalisees for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        actions: [],
        stats: {
          total: 0,
          favoris: 0,
          avecTags: 0,
          filtrees: 0,
        },
      },
    };
  }
};

/**
 * Loader API pour performance/validation/en-attente
 * Utilise l'API /api/dashboard/performance/validation/en-attente
 */
export const loadValidationsEnAttenteApi: Loader<ValidationsEnAttenteData> = 
  createApiLoader<ValidationsEnAttenteData>({
    main: 'performance',
    sub: 'validation',
    leaf: 'en-attente',
  });

/**
 * Loader API pour performance/validation/validees
 * Utilise l'API /api/dashboard/performance/validation/validees
 */
export const loadValidationsValideesApi: Loader<ValidationsValideesData> = 
  createApiLoader<ValidationsValideesData>({
    main: 'performance',
    sub: 'validation',
    leaf: 'validees',
  });

/**
 * Loader API pour performance/validation/rejetees
 * Utilise l'API /api/dashboard/performance/validation/rejetees
 */
export const loadValidationsRejeteesApi: Loader<ValidationsRejeteesData> = 
  createApiLoader<ValidationsRejeteesData>({
    main: 'performance',
    sub: 'validation',
    leaf: 'rejetees',
  });

/**
 * Loader API pour performance/validation/circuit
 * Utilise l'API /api/validation-bc/workflow pour récupérer les circuits
 */
export const loadValidationsCircuitApi: Loader<ValidationsCircuitData> = async (
  nav: NavKey
): Promise<LoaderResult<ValidationsCircuitData>> => {
  const cacheKey = navToKey(nav);
  
  try {
    // Récupérer les workflows pour chaque type de document
    const bcRes = await fetch('/api/validation-bc/workflow?type=bc', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    const factureRes = await fetch('/api/validation-bc/workflow?type=facture', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    const avenantRes = await fetch('/api/validation-bc/workflow?type=avenant', {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeadersSync(),
      },
    });
    
    if (!bcRes.ok || !factureRes.ok || !avenantRes.ok) {
      throw new Error('Failed to load validation circuits data');
    }
    
    const bcData = await bcRes.json();
    const factureData = await factureRes.json();
    const avenantData = await avenantRes.json();
    
    // Transformer les données
    const circuits = [
      {
        id: 'circuit-bc',
        name: bcData.data.name,
        description: bcData.data.description,
        documentType: 'bc' as const,
        steps: bcData.data.steps,
        thresholds: bcData.data.thresholds,
        isActive: true,
        inUse: true,
        hasDelegation: false,
      },
      {
        id: 'circuit-facture',
        name: factureData.data.name,
        description: factureData.data.description,
        documentType: 'facture' as const,
        steps: factureData.data.steps,
        thresholds: factureData.data.thresholds || [],
        isActive: true,
        inUse: true,
        hasDelegation: false,
      },
      {
        id: 'circuit-avenant',
        name: avenantData.data.name,
        description: avenantData.data.description,
        documentType: 'avenant' as const,
        steps: avenantData.data.steps,
        thresholds: avenantData.data.thresholds || [],
        isActive: true,
        inUse: true,
        hasDelegation: false,
      },
    ];
    
    // Calculer les stats
    const actifs = circuits.filter(c => c.isActive).length;
    const enUtilisation = circuits.filter(c => c.inUse).length;
    const avecDelegation = circuits.filter(c => c.hasDelegation).length;
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        circuits,
        stats: {
          totalCircuits: circuits.length,
          actifs,
          enUtilisation,
          avecDelegation,
        },
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Error loading validations circuit for ${cacheKey}`, { key: cacheKey, action: 'loadData' }, err);
    
    return {
      key: cacheKey,
      fetchedAt: Date.now(),
      data: {
        circuits: [],
        stats: {
          totalCircuits: 0,
          actifs: 0,
          enUtilisation: 0,
          avecDelegation: 0,
        },
      },
    };
  }
};

/**
 * Loader API pour performance/budget/consommation
 * Utilise l'API /api/dashboard/performance/budget/consommation
 */
export const loadBudgetConsommationApi: Loader<BudgetConsommationData> = 
  createApiLoader<BudgetConsommationData>({
    main: 'performance',
    sub: 'budget',
    leaf: 'consommation',
  });

/**
 * Loader API pour performance/budget/restant
 * Utilise l'API /api/dashboard/performance/budget/restant
 */
export const loadBudgetRestantApi: Loader<BudgetRestantData> = 
  createApiLoader<BudgetRestantData>({
    main: 'performance',
    sub: 'budget',
    leaf: 'restant',
  });

/**
 * Loader API pour performance/budget/previsions
 * Utilise l'API /api/dashboard/performance/budget/previsions
 */
export const loadBudgetPrevisionsApi: Loader<BudgetPrevisionsData> = 
  createApiLoader<BudgetPrevisionsData>({
    main: 'performance',
    sub: 'budget',
    leaf: 'previsions',
  });

/**
 * Loader API pour performance/budget/analyse
 * Utilise l'API /api/dashboard/performance/budget/analyse
 */
export const loadBudgetAnalyseApi: Loader<BudgetAnalyseData> = 
  createApiLoader<BudgetAnalyseData>({
    main: 'performance',
    sub: 'budget',
    leaf: 'analyse',
  });

/**
 * Loader API pour performance/delays/critiques
 * Utilise l'API /api/dashboard/performance/delays/critiques
 */
export const loadDelaysCritiquesApi: Loader<DelaysCritiquesData> = 
  createApiLoader<DelaysCritiquesData>({
    main: 'performance',
    sub: 'delays',
    leaf: 'critiques',
  });

/**
 * Loader API pour performance/delays/moyens
 * Utilise l'API /api/dashboard/performance/delays/moyens
 */
export const loadDelaysMoyensApi: Loader<DelaysMoyensData> = 
  createApiLoader<DelaysMoyensData>({
    main: 'performance',
    sub: 'delays',
    leaf: 'moyens',
  });

/**
 * Loader API pour performance/delays/analyse-causes
 * Utilise l'API /api/dashboard/performance/delays/analyse-causes
 */
export const loadDelaysAnalyseCausesApi: Loader<DelaysAnalyseCausesData> = 
  createApiLoader<DelaysAnalyseCausesData>({
    main: 'performance',
    sub: 'delays',
    leaf: 'analyse-causes',
  });

/**
 * Loader API pour performance/indicators/synthese
 * Utilise l'API /api/dashboard/performance/indicators/synthese
 */
export const loadPerformanceSyntheseApi: Loader<PerformanceSyntheseData> = 
  createApiLoader<PerformanceSyntheseData>({
    main: 'performance',
    sub: 'indicators',
    leaf: 'synthese',
  });

/**
 * Loader API pour performance/indicators/projets
 * Utilise l'API /api/dashboard/performance/indicators/projets
 */
export const loadPerformanceProjetsApi: Loader<PerformanceProjetsData> = 
  createApiLoader<PerformanceProjetsData>({
    main: 'performance',
    sub: 'indicators',
    leaf: 'projets',
  });

/**
 * Loader API pour performance/indicators/demandes
 * Utilise l'API /api/dashboard/performance/indicators/demandes
 */
export const loadPerformanceDemandesApi: Loader<PerformanceDemandesData> = 
  createApiLoader<PerformanceDemandesData>({
    main: 'performance',
    sub: 'indicators',
    leaf: 'demandes',
  });

/**
 * Loader API pour performance/indicators/budget
 * Utilise l'API /api/dashboard/performance/indicators/budget
 */
export const loadPerformanceBudgetApi: Loader<PerformanceBudgetData> = 
  createApiLoader<PerformanceBudgetData>({
    main: 'performance',
    sub: 'indicators',
    leaf: 'budget',
  });

/**
 * Loader API pour performance/trends/mensuelles
 * Utilise l'API /api/dashboard/performance/trends/mensuelles
 */
export const loadTrendsMensuellesApi: Loader<TrendsMensuellesData> = 
  createApiLoader<TrendsMensuellesData>({
    main: 'performance',
    sub: 'trends',
    leaf: 'mensuelles',
  });

/**
 * Loader API pour performance/trends/trimestrielles
 * Utilise l'API /api/dashboard/performance/trends/trimestrielles
 */
export const loadTrendsTrimestriellesApi: Loader<TrendsTrimestriellesData> = 
  createApiLoader<TrendsTrimestriellesData>({
    main: 'performance',
    sub: 'trends',
    leaf: 'trimestrielles',
  });

/**
 * Loader API pour performance/trends/annuelles
 * Utilise l'API /api/dashboard/performance/trends/annuelles
 */
export const loadTrendsAnnuellesApi: Loader<TrendsAnnuellesData> = 
  createApiLoader<TrendsAnnuellesData>({
    main: 'performance',
    sub: 'trends',
    leaf: 'annuelles',
  });

/**
 * Loader API pour performance/comparison/bureaux
 * Utilise l'API /api/dashboard/performance/comparison/bureaux
 */
export const loadComparisonBureauxApi: Loader<ComparisonBureauxData> = 
  createApiLoader<ComparisonBureauxData>({
    main: 'performance',
    sub: 'comparison',
    leaf: 'bureaux',
  });

/**
 * Loader API pour performance/comparison/projets
 * Utilise l'API /api/dashboard/performance/comparison/projets
 */
export const loadComparisonProjetsApi: Loader<ComparisonProjetsData> = 
  createApiLoader<ComparisonProjetsData>({
    main: 'performance',
    sub: 'comparison',
    leaf: 'projets',
  });

/**
 * Loader API pour performance/comparison/periode
 * Utilise l'API /api/dashboard/performance/comparison/periode
 */
export const loadComparisonPeriodeApi: Loader<ComparisonPeriodeData> = 
  createApiLoader<ComparisonPeriodeData>({
    main: 'performance',
    sub: 'comparison',
    leaf: 'periode',
  });

/**
 * Loader API pour performance/comparison/benchmarking
 * Utilise l'API /api/dashboard/performance/comparison/benchmarking
 */
export const loadComparisonBenchmarkingApi: Loader<ComparisonBenchmarkingData> = 
  createApiLoader<ComparisonBenchmarkingData>({
    main: 'performance',
    sub: 'comparison',
    leaf: 'benchmarking',
  });

/**
 * Loader API pour performance/stocks/overview
 * Utilise l'API /api/dashboard/performance/stocks/overview
 */
export const loadStocksOverviewApi: Loader<StocksOverviewData> = 
  createApiLoader<StocksOverviewData>({
    main: 'performance',
    sub: 'stocks',
    leaf: 'overview',
  });

/**
 * Loader API pour performance/stocks/trends
 * Utilise l'API /api/dashboard/performance/stocks/trends
 */
export const loadStocksTrendsApi: Loader<StocksTrendsData> = 
  createApiLoader<StocksTrendsData>({
    main: 'performance',
    sub: 'stocks',
    leaf: 'trends',
  });

export const loadComplianceDashboardApi: Loader<ComplianceDashboardData> = 
  createApiLoader<ComplianceDashboardData>({ main: 'performance', sub: 'compliance', leaf: 'dashboard' });

export const loadComplianceDocumentsApi: Loader<ComplianceDocumentsData> = 
  createApiLoader<ComplianceDocumentsData>({ main: 'performance', sub: 'compliance', leaf: 'documents' });

export const loadComplianceBacklogApi: Loader<ComplianceBacklogData> = 
  createApiLoader<ComplianceBacklogData>({ main: 'performance', sub: 'compliance', leaf: 'backlog' });

export const loadComplianceLotsApi: Loader<ComplianceLotsData> = 
  createApiLoader<ComplianceLotsData>({ main: 'performance', sub: 'compliance', leaf: 'lots' });

// ============================================================================
// Loaders Risks (risques, alertes, type, analyse, actions-correctives)
// ============================================================================

export const loadRisksCriticalRisquesApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'critical', leaf: 'risques' });
export const loadRisksCriticalAlertesApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'critical', leaf: 'alertes' });
export const loadRisksWarningsMoyensApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'warnings', leaf: 'moyens' });
export const loadRisksWarningsFaiblesApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'warnings', leaf: 'faibles' });
export const loadRisksTypePaiementsRetardApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'type', leaf: 'paiements-retard' });
export const loadRisksTypeContratsExpiresApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'type', leaf: 'contrats-expires' });
export const loadRisksTypeBlocagesApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'type', leaf: 'blocages' });
export const loadRisksTypeAlertesSystemeApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'type', leaf: 'alertes-systeme' });
export const loadRisksAnalyseTendancesApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'analyse', leaf: 'tendances' });
export const loadRisksAnalyseCausesRacinesApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'analyse', leaf: 'causes-racines' });
export const loadRisksAnalysePrevisionsApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'analyse', leaf: 'previsions' });
export const loadRisksActionsCorrectivesEnCoursApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'actions-correctives', leaf: 'en-cours' });
export const loadRisksActionsCorrectivesPlanifieesApi: Loader<RisksViewData> =
  createApiLoader<RisksViewData>({ main: 'risks', sub: 'actions-correctives', leaf: 'planifiees' });

// ============================================================================
// Loaders Decisions (pending, executed, timeline, audit, modeles)
// ============================================================================

export const loadDecisionsPendingUrgentesApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'pending', leaf: 'urgentes' });
export const loadDecisionsPendingNormalesApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'pending', leaf: 'normales' });
export const loadDecisionsPendingPlanifieesApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'pending', leaf: 'planifiees' });
export const loadDecisionsExecutedRecentesApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'executed', leaf: 'recentes' });
export const loadDecisionsExecutedAnciennesApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'executed', leaf: 'anciennes' });
export const loadDecisionsExecutedParTypeApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'executed', leaf: 'par-type' });
export const loadDecisionsTimelineChronologiqueApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'timeline', leaf: 'chronologique' });
export const loadDecisionsTimelineParTypeApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'timeline', leaf: 'par-type' });
export const loadDecisionsTimelineParAuteurApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'timeline', leaf: 'par-auteur' });
export const loadDecisionsAuditTracesApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'audit', leaf: 'traces' });
export const loadDecisionsAuditRapportsApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'audit', leaf: 'rapports' });
export const loadDecisionsAuditConformiteApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'audit', leaf: 'conformite' });
export const loadDecisionsModelesSubstitutionApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'modeles', leaf: 'substitution' });
export const loadDecisionsModelesDelegationApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'modeles', leaf: 'delegation' });
export const loadDecisionsModelesArbitrageApi: Loader<DecisionsViewData> =
  createApiLoader<DecisionsViewData>({ main: 'decisions', sub: 'modeles', leaf: 'arbitrage' });

// ============================================================================
// Loaders Realtime (monitoring, alerts, notifications, sync)
// ============================================================================

export const loadRealtimeMonitoringVueGlobaleApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'monitoring', leaf: 'vue-globale' });
export const loadRealtimeMonitoringMetriquesApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'monitoring', leaf: 'metriques' });
export const loadRealtimeMonitoringPerformanceApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'monitoring', leaf: 'performance' });
export const loadRealtimeAlertsActivesApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'alerts', leaf: 'actives' });
export const loadRealtimeAlertsResoluesApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'alerts', leaf: 'resolues' });
export const loadRealtimeAlertsHistoriqueApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'alerts', leaf: 'historique' });
export const loadRealtimeNotificationsNonLuesApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'notifications', leaf: 'non-lues' });
export const loadRealtimeNotificationsToutesApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'notifications', leaf: 'toutes' });
export const loadRealtimeNotificationsPreferencesApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'notifications', leaf: 'preferences' });
export const loadRealtimeSyncEtatApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'sync', leaf: 'etat' });
export const loadRealtimeSyncHistoriqueApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'sync', leaf: 'historique' });
export const loadRealtimeSyncConfigurationApi: Loader<RealtimeViewData> =
  createApiLoader<RealtimeViewData>({ main: 'realtime', sub: 'sync', leaf: 'configuration' });

// ============================================================================
// Loaders Overview Activity (timeline, notifications)
// ============================================================================

export const loadOverviewActivityTimelineApi: Loader<OverviewActivityViewData> =
  createApiLoader<OverviewActivityViewData>({ main: 'overview', sub: 'activity', leaf: 'timeline' });
export const loadOverviewActivityNotificationsApi: Loader<OverviewActivityViewData> =
  createApiLoader<OverviewActivityViewData>({ main: 'overview', sub: 'activity', leaf: 'notifications' });

// ============================================================================
// Loaders Actions (type, priority, blocked, assigned, history)
// ============================================================================

export const loadActionsTypeContratsApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'type', leaf: 'contrats' });
export const loadActionsTypeArbitragesApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'type', leaf: 'arbitrages' });
export const loadActionsTypePaiementsApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'type', leaf: 'paiements' });
export const loadActionsTypeBcApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'type', leaf: 'bc' });
export const loadActionsTypeAutresApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'type', leaf: 'autres' });
export const loadActionsPriorityCritiqueApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'priority', leaf: 'critique' });
export const loadActionsPriorityHauteApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'priority', leaf: 'haute' });
export const loadActionsPriorityMoyenneApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'priority', leaf: 'moyenne' });
export const loadActionsBlockedBlocagesApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'blocked', leaf: 'blocages' });
export const loadActionsBlockedEscaladesApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'blocked', leaf: 'escalades' });
export const loadActionsBlockedAnalyseApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'blocked', leaf: 'analyse' });
export const loadActionsAssignedMoiApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'assigned', leaf: 'moi' });
export const loadActionsAssignedEquipeApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'assigned', leaf: 'equipe' });
export const loadActionsAssignedNonAssigneesApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'assigned', leaf: 'non-assignees' });
export const loadActionsHistoryRecentesApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'history', leaf: 'recentes' });
export const loadActionsHistoryAnciennesApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'history', leaf: 'anciennes' });
export const loadActionsHistoryArchiveesApi: Loader<ActionsViewData> =
  createApiLoader<ActionsViewData>({ main: 'actions', sub: 'history', leaf: 'archivees' });

// ============================================================================
// Helper pour créer un loader dynamique depuis une NavKey
// ============================================================================

/**
 * Crée un loader API dynamique depuis une clé de navigation
 * Utile pour les routes non encore définies explicitement
 */
export function createDynamicApiLoader<TData extends DashboardViewData = DashboardViewData>(
  nav: NavKey
): Loader<TData> {
  return createApiLoader<TData>(nav);
}
