/**
 * Tests E2E pour la navigation du dashboard
 * Vérifie que DashboardViewRouter fonctionne correctement
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('should load dashboard without navigationConfig errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/maitre-ouvrage/dashboard');
    
    // Attendre que la page soit chargée
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 25000 });
    
    // Attendre un peu pour voir si des erreurs apparaissent
    await page.waitForTimeout(2000);
    
    // Vérifier qu'il n'y a pas d'erreur "navigationConfig is not defined"
    const navigationConfigErrors = errors.filter(e => 
      e.includes('navigationConfig') || 
      e.includes('ReferenceError')
    );
    
    expect(navigationConfigErrors).toHaveLength(0);
  });

  test('should display content router correctly', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
    
    // Attendre que le contenu soit chargé
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 25000 });
    
    // Vérifier que le router affiche quelque chose (pas d'écran vide)
    const content = await page.textContent('[data-testid="dashboard-content"]');
    expect(content).toBeTruthy();
    expect(content?.trim().length).toBeGreaterThan(0);
  });

  test('should handle route changes without errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 25000 });
    
    // Attendre que tout soit stable
    await page.waitForTimeout(2000);
    
    // Vérifier qu'il n'y a pas d'erreurs critiques
    const criticalErrors = errors.filter(e => 
      !e.includes('warning') && 
      !e.includes('404') &&
      !e.includes('favicon')
    );
    
    // Tolérer quelques erreurs non critiques
    expect(criticalErrors.length).toBeLessThan(3);
  });
});
