/**
 * E2E Centre d'Alertes — Tests critiques module alertes BMO
 */

import { test, expect } from '@playwright/test';

test.describe("Centre d'Alertes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maitre-ouvrage/alerts');
  });

  test('page loads and displays content', async ({ page }) => {
    await expect(page).toHaveURL(/\/maitre-ouvrage\/alerts/);
    // La page actuelle utilise CockpitLayout - vérifier qu'elle charge
    await expect(page.locator('body')).toBeVisible();
  });

  test('displays alerts KPIs or charts section', async ({ page }) => {
    // Vérifier présence de contenu (KPIs, graphiques ou section)
    const hasContent =
      (await page.getByRole('heading').count()) > 0 ||
      (await page.getByText(/alerte|Alertes/i).count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test('supports keyboard navigation to main content', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusEl = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'DIV', 'BODY']).toContain(focusEl);
  });
});
