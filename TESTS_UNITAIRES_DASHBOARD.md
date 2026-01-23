# Tests Unitaires - Dashboard

## Tests pour PR #01: DashboardViewRouter

### Fichier: `src/modules/dashboard/components/__tests__/DashboardViewRouter.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardViewRouter } from '../DashboardViewRouter';
import { DashboardNavigationProvider } from '../../context/DashboardNavigationContext';

describe('DashboardViewRouter', () => {
  it('should handle missing config gracefully', async () => {
    // Mock config undefined
    const originalConfig = require('../../navigation/navigation.config.json');
    jest.mock('../../navigation/navigation.config.json', () => ({}));
    
    render(
      <DashboardNavigationProvider>
        <DashboardViewRouter />
      </DashboardNavigationProvider>
    );
    
    // Vérifier que fallback est utilisé
    await waitFor(() => {
      expect(screen.getByText(/Dashboard principal/i)).toBeInTheDocument();
    });
  });
  
  it('should resolve routes correctly', async () => {
    render(
      <DashboardNavigationProvider>
        <DashboardViewRouter />
      </DashboardNavigationProvider>
    );
    
    // Vérifier que la route par défaut se charge
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });
  
  it('should cleanup on unmount', () => {
    const { unmount } = render(
      <DashboardNavigationProvider>
        <DashboardViewRouter />
      </DashboardNavigationProvider>
    );
    
    // Vérifier qu'il n'y a pas d'erreurs de cleanup
    expect(() => unmount()).not.toThrow();
  });
});
```

## Tests pour PR #02: Zustand Store

### Fichier: `src/lib/stores/__tests__/dashboardNavigationStore.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDashboardNavigationStore, useDashboardNavigationState } from '../dashboardNavigationStore';

describe('dashboardNavigationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useDashboardNavigationStore.setState({
      main: 'overview',
      sub: null,
      leaf: null,
    });
  });
  
  it('should not update if value is the same', () => {
    const store = useDashboardNavigationStore.getState();
    const initialMain = store.main;
    
    act(() => {
      store.setMain('overview'); // Même valeur
    });
    
    expect(useDashboardNavigationStore.getState().main).toBe(initialMain);
  });
  
  it('should update if value is different', () => {
    act(() => {
      useDashboardNavigationStore.getState().setMain('performance');
    });
    
    expect(useDashboardNavigationStore.getState().main).toBe('performance');
  });
  
  it('should use shallow comparison in useDashboardNavigationState', () => {
    const { result, rerender } = renderHook(() => useDashboardNavigationState());
    
    const firstRender = result.current;
    
    // Changer une valeur
    act(() => {
      useDashboardNavigationStore.getState().setSub('kpis');
    });
    
    rerender();
    
    // Vérifier que l'objet a changé
    expect(result.current.sub).toBe('kpis');
    expect(result.current).not.toBe(firstRender);
  });
});
```

## Tests E2E Playwright

### Fichier: `tests/e2e/dashboard-navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
  });
  
  test('should navigate to KPIs highlights', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=highlights');
    await expect(page.locator('h1')).toContainText('Synthèse stratégique');
  });
  
  test('should navigate to KPIs projets', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=projets');
    await expect(page.locator('h1')).toContainText('KPIs Chantiers');
  });
  
  test('should navigate to KPIs demandes', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=demandes');
    await expect(page.locator('h1')).toContainText('KPIs Flux & Demandes');
  });
  
  test('should navigate to KPIs budget', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard?main=overview&sub=kpis&leaf=budget');
    await expect(page.locator('h1')).toContainText('KPIs Budget');
  });
  
  test('should handle invalid route gracefully', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard?main=invalid&sub=invalid&leaf=invalid');
    // Vérifier qu'une page d'erreur ou fallback s'affiche
    await expect(page.locator('body')).toBeVisible();
  });
});
```
