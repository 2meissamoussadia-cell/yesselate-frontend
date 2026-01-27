// app/api/internal/metrics/budgets.ts
// Phase P11: Budgets de performance & SLO par route
// Définit les objectifs P95/P99 pour chaque endpoint

/**
 * Budget de performance pour une route
 */
export interface PerformanceBudget {
  /**
   * Budget P95 en millisecondes (95% des requêtes doivent être < ce seuil)
   */
  p95_ms: number;
  
  /**
   * Budget P99 en millisecondes (99% des requêtes doivent être < ce seuil)
   */
  p99_ms: number;
}

/**
 * Budgets de performance par route
 * 
 * Si le P95 dépasse le budget, une alerte est déclenchée
 */
export const BUDGETS: Record<string, PerformanceBudget> = {
  // Dashboard principal - Budget serré (navigation normale)
  '/api/dashboard/[main]/[sub]/[leaf]': {
    p95_ms: 400,  // 95% des requêtes < 400ms
    p99_ms: 900,  // 99% des requêtes < 900ms
  },
  
  // Export dashboard - Budget plus large (opération lourde)
  '/api/export/dashboard': {
    p95_ms: 800,   // 95% des exports < 800ms
    p99_ms: 1500,  // 99% des exports < 1500ms
  },
  
  // Export autres formats
  '/api/export/dashboard/csv': {
    p95_ms: 1000,
    p99_ms: 2000,
  },
  
  '/api/export/dashboard/json': {
    p95_ms: 600,
    p99_ms: 1200,
  },
  
  '/api/export/dashboard/pdf': {
    p95_ms: 2000,
    p99_ms: 4000,
  },
  
  '/api/export/dashboard/excel': {
    p95_ms: 1500,
    p99_ms: 3000,
  },
  
  // API RBAC
  '/api/rbac/permissions': {
    p95_ms: 200,
    p99_ms: 500,
  },
  
  '/api/me/policy': {
    p95_ms: 150,
    p99_ms: 400,
  },

  // P19: Alertes test (dry-run coûteux)
  '/api/alerts/test': {
    p95_ms: 1000,  // ≤ 1 s
    p99_ms: 2000,  // ≤ 2 s
  },
};

/**
 * Normalise une route pour la correspondance avec les budgets
 * 
 * @param route - Route à normaliser (ex: "/api/dashboard/overview/summary/dashboard")
 * @returns Route normalisée pour la correspondance (ex: "/api/dashboard/[main]/[sub]/[leaf]")
 */
export function normalizeRouteForBudget(route: string): string {
  // Normaliser les routes dynamiques
  if (route.startsWith('/api/dashboard/')) {
    const parts = route.split('/');
    if (parts.length >= 4) {
      // /api/dashboard/[main]/[sub]/[leaf] -> /api/dashboard/[main]/[sub]/[leaf]
      return '/api/dashboard/[main]/[sub]/[leaf]';
    }
  }
  
  // Normaliser les routes d'export
  if (route.startsWith('/api/export/dashboard/')) {
    const format = route.split('/').pop();
    if (format && ['csv', 'json', 'pdf', 'excel'].includes(format)) {
      return `/api/export/dashboard/${format}`;
    }
    return '/api/export/dashboard';
  }
  
  // Retourner la route telle quelle si pas de normalisation
  return route;
}

/**
 * Récupère le budget pour une route
 * 
 * @param route - Route à vérifier
 * @returns Budget de performance ou null si non défini
 */
export function getBudgetForRoute(route: string): PerformanceBudget | null {
  const normalized = normalizeRouteForBudget(route);
  return BUDGETS[normalized] || null;
}

/**
 * Vérifie si une durée dépasse le budget
 * 
 * @param route - Route à vérifier
 * @param durationMs - Durée en millisecondes
 * @returns true si le budget est dépassé
 */
export function exceedsBudget(route: string, durationMs: number): boolean {
  const budget = getBudgetForRoute(route);
  if (!budget) return false;
  
  // Alerter si P95 ou P99 est dépassé
  return durationMs > budget.p95_ms;
}
