# PR #02: Corriger DashboardViewRouter

**Branch**: `fix/dashboard-view-router`  
**Priorité**: 🔴 CRITIQUE  
**Estimation**: 12 J/H (1.5 jours)

---

## 🎯 Objectifs

1. Corriger l'erreur `navigationConfig is not defined`
2. Mémoriser `navigationConfig` avec `useMemo`
3. Améliorer le mapping main/sub/leaf
4. Ajouter fallback routes robustes
5. Valider les routes avant chargement

---

## 📝 Fichier Principal à Modifier

### `src/modules/dashboard/components/DashboardViewRouter.tsx`

**Corrections complètes**:

```typescript
/**
 * Routeur de vues du Dashboard avec chargement dynamique
 * Utilise la configuration JSON et charge les composants à la demande
 * ✅ OPTIMISÉ: navigationConfig mémorisé, validation des routes, fallbacks robustes
 * 
 * @example
 * // Utilisation simple (lit automatiquement le contexte de navigation)
 * <DashboardViewRouter />
 */

'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import config from '../navigation/navigation.config.json';
import { loadComponent } from '../utils/loadComponent';
import { useDashboardNavigation } from '../context/DashboardNavigationContext';
import type { ComponentType } from 'react';

interface NavigationConfig {
  [key: string]: {
    label: string;
    sub?: {
      [key: string]: {
        label: string;
        leaf?: {
          [key: string]: {
            label: string;
            component: string;
          };
        };
      };
    };
  };
}

// Cache des composants chargés pour éviter les rechargements inutiles
const componentCache = new Map<string, ComponentType>();

// ✅ NOUVEAU: Fonction de validation des routes
function validateRoute(
  config: NavigationConfig,
  main: string,
  sub: string | null,
  leaf: string | null
): boolean {
  if (!main || !config[main]) return false;
  if (sub && !config[main].sub?.[sub]) return false;
  if (leaf && sub && !config[main].sub?.[sub]?.leaf?.[leaf]) return false;
  return true;
}

// ✅ NOUVEAU: Fonction de résolution avec fallbacks
async function resolveRoute(
  config: NavigationConfig,
  main: string,
  sub: string | null,
  leaf: string | null,
  routeKey: string
): Promise<{ component: ComponentType; cacheKey: string } | null> {
  // 1. Essayer route exacte
  const exactComponent = config?.[main]?.sub?.[sub || '']?.leaf?.[leaf || '']?.component;
  if (exactComponent) {
    const cached = componentCache.get(routeKey);
    if (cached) return { component: cached, cacheKey: routeKey };
    
    const Loaded = await loadComponent(exactComponent);
    componentCache.set(routeKey, Loaded);
    return { component: Loaded, cacheKey: routeKey };
  }

  // 2. Fallback: main seul (pas de sub ni leaf) -> OverviewPage
  if (!sub && !leaf) {
    const cacheKey = `${main}|summary|dashboard`;
    const cached = componentCache.get(cacheKey);
    if (cached) return { component: cached, cacheKey };
    
    const Loaded = await loadComponent('OverviewPage');
    componentCache.set(cacheKey, Loaded);
    return { component: Loaded, cacheKey };
  }

  // 3. Fallback: main + leaf mais pas de sub -> essayer summary puis kpis
  if (!sub && leaf) {
    // Essayer summary
    const summaryComponent = config?.[main]?.sub?.summary?.leaf?.[leaf]?.component;
    if (summaryComponent) {
      const cacheKey = `${main}|summary|${leaf}`;
      const cached = componentCache.get(cacheKey);
      if (cached) return { component: cached, cacheKey };
      
      const Loaded = await loadComponent(summaryComponent);
      componentCache.set(cacheKey, Loaded);
      return { component: Loaded, cacheKey };
    }
    
    // Essayer kpis
    const kpisComponent = config?.[main]?.sub?.kpis?.leaf?.[leaf]?.component;
    if (kpisComponent) {
      const cacheKey = `${main}|kpis|${leaf}`;
      const cached = componentCache.get(cacheKey);
      if (cached) return { component: cached, cacheKey };
      
      const Loaded = await loadComponent(kpisComponent);
      componentCache.set(cacheKey, Loaded);
      return { component: Loaded, cacheKey };
    }
    
    // Si leaf est "dashboard", utiliser SummaryDashboardPage
    if (leaf === 'dashboard') {
      const cacheKey = `${main}|summary|dashboard`;
      const cached = componentCache.get(cacheKey);
      if (cached) return { component: cached, cacheKey };
      
      const Loaded = await loadComponent('SummaryDashboardPage');
      componentCache.set(cacheKey, Loaded);
      return { component: Loaded, cacheKey };
    }
  }

  // 4. Fallback: main + sub mais pas de leaf
  if (sub && !leaf) {
    let defaultComponent: string | null = null;
    
    if (sub === 'summary') {
      defaultComponent = 'SummaryPage';
    } else if (sub === 'kpis') {
      defaultComponent = 'KpiOverviewPage';
    }

    if (defaultComponent) {
      const cacheKey = `${main}|${sub}|${defaultComponent}`;
      const cached = componentCache.get(cacheKey);
      if (cached) return { component: cached, cacheKey };
      
      const Loaded = await loadComponent(defaultComponent);
      componentCache.set(cacheKey, Loaded);
      return { component: Loaded, cacheKey };
    }
  }

  // 5. Fallback final: OverviewPage
  const cacheKey = `${main}|summary|dashboard`;
  const cached = componentCache.get(cacheKey);
  if (cached) return { component: cached, cacheKey };
  
  const Loaded = await loadComponent('OverviewPage');
  componentCache.set(cacheKey, Loaded);
  return { component: Loaded, cacheKey };
}

// ✅ NOUVEAU: Composant d'erreur avec informations
function RouteErrorComponent({ 
  main, 
  sub, 
  leaf, 
  config 
}: { 
  main: string; 
  sub: string | null; 
  leaf: string | null; 
  config: NavigationConfig;
}) {
  const availableRoutes = useMemo(() => {
    if (!config[main]) return [];
    const subConfig = config[main].sub;
    if (!subConfig) return [];
    return Object.keys(subConfig);
  }, [config, main]);

  return (
    <div className="p-6 text-red-400 space-y-2">
      <p className="font-bold">Route non trouvée</p>
      <p className="text-sm text-red-300">
        Route demandée: <code className="bg-red-900/50 px-2 py-1 rounded">{main}/{sub || ''}/{leaf || ''}</code>
      </p>
      {availableRoutes.length > 0 && (
        <div>
          <p className="text-sm text-yellow-300">
            Routes disponibles pour <code className="bg-yellow-900/50 px-2 py-1 rounded">{main}</code>:
          </p>
          <ul className="text-sm text-yellow-200 list-disc list-inside ml-4">
            {availableRoutes.map(route => (
              <li key={route}>{route}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DashboardViewRouter() {
  // ✅ Utiliser le hook directement - le guard est dans le contexte
  const navigation = useDashboardNavigation();
  const { main, sub, leaf } = navigation;
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ CORRECTION CRITIQUE: Mémoriser navigationConfig une seule fois
  const navigationConfig = useMemo(() => config as NavigationConfig, []);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      // Créer une clé unique pour cette route
      const routeKey = `${main}|${sub || ''}|${leaf || ''}`;
      
      // ✅ Log pour debug (uniquement en développement)
      if (process.env.NODE_ENV === 'development') {
        console.log('[DashboardViewRouter] Résolution route:', { main, sub, leaf, routeKey });
      }
      
      // Vérifier le cache
      const cached = componentCache.get(routeKey);
      if (cached) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DashboardViewRouter] Composant trouvé dans le cache');
        }
        setComponent(() => cached);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // ✅ NOUVEAU: Valider la route avant de charger
        const isValid = validateRoute(navigationConfig, main, sub || null, leaf || null);
        
        if (!isValid && process.env.NODE_ENV === 'development') {
          console.warn('[DashboardViewRouter] Route non valide:', { main, sub, leaf });
        }

        // ✅ NOUVEAU: Utiliser la fonction de résolution avec fallbacks
        const result = await resolveRoute(
          navigationConfig,
          main,
          sub || null,
          leaf || null,
          routeKey
        );

        if (cancelled) return;

        if (result) {
          componentCache.set(result.cacheKey, result.component);
          if (process.env.NODE_ENV === 'development') {
            console.log('[DashboardViewRouter] Composant chargé avec succès:', result.cacheKey);
          }
          setComponent(() => result.component);
          setIsLoading(false);
        } else {
          // Route non trouvée - afficher composant d'erreur
          setComponent(() => (props: any) => (
            <RouteErrorComponent 
              main={main} 
              sub={sub || null} 
              leaf={leaf || null} 
              config={navigationConfig}
            />
          ));
          setIsLoading(false);
        }
      } catch (e) {
        if (cancelled) return;
        
        const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
        if (process.env.NODE_ENV === 'development') {
          console.error('[DashboardViewRouter] Router error:', e);
        }
        setError(errorMessage);
        setComponent(() => () => (
          <div className="p-6 text-red-400">
            Erreur de chargement du module: {errorMessage}
          </div>
        ));
        setIsLoading(false);
      }
    }

    resolve();
    
    // ✅ Cleanup pour annuler la résolution si les dépendances changent
    return () => {
      cancelled = true;
    };
  }, [main, sub, leaf, navigationConfig]); // ✅ navigationConfig maintenant dans les dépendances (mais mémorisé)

  if (isLoading) {
    return (
      <div className="p-6 text-gray-400 flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse">Chargement…</div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="p-6 text-yellow-400">
        Aucun composant disponible pour cette route.
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="p-6 text-gray-400 flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse">Chargement…</div>
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}
```

---

## 🧪 Tests à Ajouter

### 1. Tests unitaires pour `validateRoute`

**Fichier**: `src/modules/dashboard/components/__tests__/DashboardViewRouter.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { validateRoute } from '../DashboardViewRouter';

const mockConfig = {
  overview: {
    label: 'Overview',
    sub: {
      summary: {
        label: 'Summary',
        leaf: {
          dashboard: {
            label: 'Dashboard',
            component: 'OverviewPage',
          },
        },
      },
    },
  },
};

describe('validateRoute', () => {
  it('should validate a valid route', () => {
    expect(validateRoute(mockConfig, 'overview', 'summary', 'dashboard')).toBe(true);
  });

  it('should reject invalid main', () => {
    expect(validateRoute(mockConfig, 'invalid', null, null)).toBe(false);
  });

  it('should reject invalid sub', () => {
    expect(validateRoute(mockConfig, 'overview', 'invalid', null)).toBe(false);
  });

  it('should reject invalid leaf', () => {
    expect(validateRoute(mockConfig, 'overview', 'summary', 'invalid')).toBe(false);
  });
});
```

### 2. Tests E2E pour navigation

**Fichier**: `e2e/dashboard/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should navigate between routes without errors', async ({ page }) => {
  await page.goto('/maitre-ouvrage/dashboard');
  
  // Attendre que la page soit chargée
  await page.waitForSelector('[data-testid="dashboard-content"]');
  
  // Vérifier qu'il n'y a pas d'erreur "navigationConfig is not defined"
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Naviguer vers différentes routes
  await page.click('[data-testid="nav-overview"]');
  await page.waitForTimeout(500);
  
  await page.click('[data-testid="nav-performance"]');
  await page.waitForTimeout(500);
  
  // Vérifier qu'il n'y a pas d'erreurs
  const navigationErrors = errors.filter(e => 
    e.includes('navigationConfig') || e.includes('ReferenceError')
  );
  expect(navigationErrors).toHaveLength(0);
});
```

---

## ✅ Checklist Validation

- [ ] `navigationConfig` est mémorisé avec `useMemo`
- [ ] Validation des routes avant chargement
- [ ] Fallbacks robustes pour toutes les routes
- [ ] Aucune erreur "navigationConfig is not defined"
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Vérifier que les routes existantes fonctionnent toujours

---

## 📝 Notes

1. **useMemo**: `navigationConfig` est mémorisé une seule fois au montage du composant
2. **Validation**: Vérifie que la route existe avant de tenter de charger le composant
3. **Fallbacks**: Plusieurs niveaux de fallback pour garantir qu'une route est toujours trouvée
4. **Cache**: Les composants sont mis en cache pour éviter les rechargements inutiles

---

## 🚀 Commandes pour Tester

```bash
# Tests unitaires
npm run test -- src/modules/dashboard/components/__tests__/DashboardViewRouter.test.ts

# Tests E2E
npm run test:e2e -- e2e/dashboard/navigation.spec.ts

# Build pour vérifier les erreurs TypeScript
npm run build
```
