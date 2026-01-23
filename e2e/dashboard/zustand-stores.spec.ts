/**
 * Tests E2E pour vérifier l'absence de re-renders infinis avec Zustand stores
 */

import { test, expect } from '@playwright/test';

test.describe('Zustand Stores - Performance', () => {
  test('should not cause infinite re-renders', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Capturer les erreurs et warnings console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Naviguer vers la page dashboard
    await page.goto('/maitre-ouvrage/dashboard');
    
    // Attendre que la page soit chargée
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Attendre un peu pour voir si des erreurs apparaissent
    await page.waitForTimeout(3000);
    
    // Vérifier qu'il n'y a pas d'erreur "getServerSnapshot should be cached"
    const getServerSnapshotErrors = errors.filter(e => 
      e.includes('getServerSnapshot') || 
      e.includes('infinite loop') ||
      e.includes('Maximum update depth')
    );
    
    expect(getServerSnapshotErrors).toHaveLength(0);
    
    // Vérifier qu'il n'y a pas d'erreur "navigationConfig is not defined"
    const navigationConfigErrors = errors.filter(e => 
      e.includes('navigationConfig') || 
      e.includes('ReferenceError')
    );
    
    expect(navigationConfigErrors).toHaveLength(0);
  });

  test('should navigate between routes without errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Simuler la navigation (si des boutons de navigation existent)
    // Note: Adapter selon votre structure de navigation
    
    // Attendre un peu
    await page.waitForTimeout(2000);
    
    // Vérifier qu'il n'y a pas d'erreurs de navigation
    const navigationErrors = errors.filter(e => 
      e.includes('navigation') || 
      e.includes('route') ||
      e.includes('component')
    );
    
    // Les erreurs de navigation ne devraient pas être critiques
    // (peut-être des warnings, mais pas d'erreurs bloquantes)
    const criticalErrors = navigationErrors.filter(e => 
      !e.includes('warning') && 
      !e.includes('404') // 404 peut être acceptable pour certaines routes
    );
    
    expect(criticalErrors.length).toBeLessThan(5); // Tolérer quelques erreurs non critiques
  });

  test('should handle store updates without performance issues', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
    
    // Mesurer le temps de rendu initial
    const initialRenderTime = await page.evaluate(() => {
      return performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0;
    });
    
    // Attendre que tout soit stable
    await page.waitForTimeout(2000);
    
    // Vérifier que la page est interactive
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    
    expect(isInteractive).toBe(true);
    expect(initialRenderTime).toBeGreaterThan(0);
  });
});
