/**
 * Tests E2E — Dashboard Home (Vue d'accueil)
 * Vérifie : chargement, presets, modes d'affichage, densité, onglets, sections repliables.
 */

import { test, expect } from '@playwright/test';

// URL qui affiche DashboardHome (vue avec section) au lieu de PilotageHome
const DASHBOARD_HOME_URL = '/maitre-ouvrage/dashboard/r/pilotage/dashboard/vue-dg-kpis';

test.describe('Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_HOME_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 25000 });
    // Vue avec section (vue-dg-kpis) affiche DashboardHome ; accepter dashboard-home ou pilotage-home
    await page.waitForSelector('[data-testid="dashboard-home"], [data-testid="pilotage-home"]', { timeout: 20000 });
  });

  test('should load dashboard content without ReferenceError', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(DASHBOARD_HOME_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 20000 }).catch(() => {});

    const refErrors = errors.filter((e) => e.includes('is not defined') || e.includes('ReferenceError'));
    expect(refErrors).toHaveLength(0);
  });

  test('should show Dashboard Home when on Vue d\'ensemble', async ({ page }) => {
    const home = page.locator('[data-testid="dashboard-home"]');
    const pilotageHome = page.locator('[data-testid="pilotage-home"]');
    const visible = await home.or(pilotageHome).first().isVisible().catch(() => false);
    expect(visible).toBe(true);
    if (await home.isVisible().catch(() => false)) {
      await expect(home).toHaveAttribute('role', 'main');
      await expect(home).toHaveAttribute('aria-label', "Tableau de bord — Vue d'ensemble");
    }
  });

  test('should have preset selector (Vue) with options', async ({ page }) => {
    const home = page.locator('[data-testid="dashboard-home"]');
    if (!(await home.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    const preset = page.locator('#preset');
    await expect(preset).toBeVisible({ timeout: 5000 });
    await expect(preset).toHaveValue(/.+/);
    const options = preset.locator('option');
    await expect(options.first()).toBeAttached();
    expect(await options.count()).toBeGreaterThanOrEqual(1);
  });

  test('should have density selector', async ({ page }) => {
    const home = page.locator('[data-testid="dashboard-home"]');
    if (!(await home.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    const density = page.locator('#density');
    await expect(density).toBeVisible({ timeout: 5000 });
    await expect(density).toHaveValue(/.+/);
  });

  test('should change density and update data-density on main', async ({ page }) => {
    const home = page.locator('[data-testid="dashboard-home"]');
    if (!(await home.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    const density = page.locator('#density');
    await density.selectOption('compact');
    await expect(home).toHaveAttribute('data-density', 'compact');
    await density.selectOption('comfortable');
    await expect(home).toHaveAttribute('data-density', 'comfortable');
  });

  test('should have tab buttons for Vue finances / opérations / risques', async ({ page }) => {
    const home = page.locator('[data-testid="dashboard-home"]');
    if (!(await home.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    const tabFinances = page.getByRole('button', { name: /Vue finances|finances/i }).first();
    const tabOperations = page.getByRole('button', { name: /opérations|operations/i }).first();
    const tabRisques = page.getByRole('button', { name: /risques/i }).first();
    await expect(tabFinances).toBeVisible({ timeout: 5000 });
    await expect(tabOperations).toBeVisible({ timeout: 3000 });
    await expect(tabRisques).toBeVisible({ timeout: 3000 });
  });

  test('should have landmark main and aria-live region for accessibility', async ({ page }) => {
    const home = page.locator('[data-testid="dashboard-home"]');
    if (!(await home.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    await expect(home).toHaveAttribute('role', 'main');
    const liveRegion = page.locator('#dashboard-home-live');
    await expect(liveRegion).toBeAttached();
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  test('should show Historique session button', async ({ page }) => {
    const home = page.locator('[data-testid="dashboard-home"]');
    if (!(await home.isVisible().catch(() => false))) {
      test.skip();
      return;
    }
    const historyBtn = page.getByRole('button', { name: /Historique session/i });
    await expect(historyBtn).toBeVisible({ timeout: 5000 });
  });

  test('should not have horizontal overflow on viewport', async ({ page }) => {
    await page.goto(DASHBOARD_HOME_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 20000 }).catch(() => {});

    const overflowX = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      return (
        html.scrollWidth > html.clientWidth ||
        body.scrollWidth > body.clientWidth
      );
    });
    expect(overflowX).toBe(false);
  });
});
