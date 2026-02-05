/**
 * E2E — Redirection utilisateurs non connectés
 * Valide que l'accès à une page protégée sans session redirige vers /login.
 * Route protégée testée : /maitre-ouvrage/dashboard (DashboardAuthGuard).
 */

import { test, expect } from '@playwright/test';

test.describe('Redirection non connectés', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('accès à /maitre-ouvrage/dashboard sans auth redirige vers /login', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test('URL de redirection contient le paramètre redirect', async ({ page }) => {
    await page.goto('/maitre-ouvrage/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    const url = new URL(page.url());
    const redirectParam = url.searchParams.get('redirect');
    expect(redirectParam).toBeTruthy();
    expect(decodeURIComponent(redirectParam || '')).toMatch(/\/maitre-ouvrage\/dashboard/);
  });
});
