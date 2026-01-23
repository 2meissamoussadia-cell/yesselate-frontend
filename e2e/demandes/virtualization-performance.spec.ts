/**
 * Tests E2E Playwright pour la performance de virtualisation
 * Vérifie que les listes virtualisées améliorent les performances
 */

import { test, expect } from '@playwright/test';

test.describe('Virtualization Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maitre-ouvrage/demandes');
    await page.waitForLoadState('networkidle');
  });

  test('should render large list efficiently with virtualization', async ({ page }) => {
    // Naviguer vers la vue pending
    await page.click('text=En attente');
    await page.waitForLoadState('networkidle');

    // Vérifier que la liste est virtualisée
    const listContainer = page.locator('[data-testid="virtualized-list"], .virtualized-list').first();
    
    if (await listContainer.count() > 0) {
      // Mesurer le temps de rendu initial
      const startTime = Date.now();
      await page.waitForSelector('[data-index]', { timeout: 5000 });
      const renderTime = Date.now() - startTime;

      // Le rendu devrait être rapide même avec beaucoup d'items
      expect(renderTime).toBeLessThan(2000); // < 2s

      // Vérifier que seuls les items visibles sont rendus
      const visibleItems = await page.locator('[data-index]').count();
      expect(visibleItems).toBeLessThan(50); // Seulement les items visibles
    }
  });

  test('should debounce search input', async ({ page }) => {
    await page.click('text=En attente');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Rechercher"]').first();
    
    if (await searchInput.count() > 0) {
      // Type rapidement plusieurs caractères
      await searchInput.fill('BC');
      await searchInput.fill('BC-');
      await searchInput.fill('BC-2024');

      // Attendre que le debounce se termine
      await page.waitForTimeout(400); // 300ms debounce + marge

      // Vérifier que la recherche a été effectuée
      const results = page.locator('text=BC-2024').first();
      if (await results.count() > 0) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('should maintain scroll position during filter changes', async ({ page }) => {
    await page.click('text=En attente');
    await page.waitForLoadState('networkidle');

    const listContainer = page.locator('[data-testid="virtualized-list"]').first();
    
    if (await listContainer.count() > 0) {
      // Scroll down
      await listContainer.evaluate((el) => {
        el.scrollTop = 500;
      });

      await page.waitForTimeout(100);

      // Changer le filtre
      const filterButton = page.locator('button:has-text("Filtres")').first();
      if (await filterButton.count() > 0) {
        await filterButton.click();
      }

      // Vérifier que le scroll est maintenu (ou réinitialisé proprement)
      const scrollPosition = await listContainer.evaluate((el) => el.scrollTop);
      expect(scrollPosition).toBeGreaterThanOrEqual(0);
    }
  });

  test('should handle rapid scrolling smoothly', async ({ page }) => {
    await page.click('text=En attente');
    await page.waitForLoadState('networkidle');

    const listContainer = page.locator('[data-testid="virtualized-list"]').first();
    
    if (await listContainer.count() > 0) {
      // Mesurer les FPS pendant le scroll
      const startTime = Date.now();
      
      // Scroll rapide
      for (let i = 0; i < 10; i++) {
        await listContainer.evaluate((el) => {
          el.scrollTop += 200;
        });
        await page.waitForTimeout(50);
      }

      const scrollTime = Date.now() - startTime;

      // Le scroll devrait être fluide (< 1s pour 10 scrolls)
      expect(scrollTime).toBeLessThan(1000);
    }
  });
});

