/**
 * E2E — Cockpit DG + Executive Controls (V5)
 * Vérifie que la page Cockpit charge, que la barre Executive est visible
 * et qu'il n'y a pas de scroll horizontal (layout cadré).
 */

import { test, expect } from '@playwright/test';

test.describe('Cockpit DG + Executive', () => {
  test('should load Cockpit DG page without ReferenceError', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Aller sur la vue Cockpit (accueil ou route cockpit si dédiée)
    const cockpitLink = page.getByRole('link', { name: /tableau de bord|accueil|cockpit/i }).first();
    if (await cockpitLink.isVisible().catch(() => false)) {
      await cockpitLink.click();
      await page.waitForTimeout(1500);
    }

    const refErrors = errors.filter((e) => e.includes('is not defined') || e.includes('ReferenceError'));
    expect(refErrors).toHaveLength(0);
  });

  test('should show Executive toolbar (commandes exécutives)', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const toolbar = page.getByRole('toolbar', { name: /commandes exécutives|V5/i });
    await expect(toolbar).toBeVisible({ timeout: 15000 });
  });

  test('should not have horizontal overflow on viewport', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForLoadState('networkidle').catch(() => {});

    const body = page.locator('body');
    await expect(body).toBeVisible();

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

  test('should open Actions panel and show commands', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const actionsBtn = page.getByRole('button', { name: /actions/i }).first();
    await expect(actionsBtn).toBeVisible({ timeout: 15000 });
    await actionsBtn.click();

    const panel = page.locator('[aria-labelledby="actions-panel-title"]').or(
      page.getByRole('dialog').filter({ has: page.getByText('Actions rapides') })
    );
    await expect(panel).toBeVisible({ timeout: 5000 });

    await expect(panel.getByRole('button', { name: /fermer/i }).or(panel.getByText('Fermer'))).toBeVisible({ timeout: 3000 });
  });

  test('breadcrumbs should render without t is not defined', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForLoadState('networkidle').catch(() => {});

    const breadcrumb = page.getByRole('navigation', { name: /fil d'ariane/i });
    await expect(breadcrumb).toBeVisible({ timeout: 10000 });

    const tErrors = errors.filter((e) => e.includes('t is not defined') || e.includes('ReferenceError'));
    expect(tErrors).toHaveLength(0);
  });
});

test.describe('PWA (V5)', () => {
  test('manifest.json should be served and valid', async ({ request }) => {
    const res = await request.get('/manifest.json');
    expect(res.ok()).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('short_name');
    expect(json).toHaveProperty('start_url');
    expect(json).toHaveProperty('icons');
    expect(Array.isArray(json.icons)).toBe(true);
  });
});
