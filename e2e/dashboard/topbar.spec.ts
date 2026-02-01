/**
 * Tests E2E pour la topbar BMO
 * Vérifie : menus (Fichier, Paramétrage, Réglage), recherche, fil d'Ariane, langue dans Paramétrage, taille du texte dans Réglage.
 */

import { test, expect } from '@playwright/test';

test.describe('BMO Topbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/maitre-ouvrage/dashboard');
    await page.waitForSelector('[data-testid="bmo-topbar"]', { timeout: 10000 });
  });

  test('topbar is visible and has main elements', async ({ page }) => {
    const topbar = page.getByTestId('bmo-topbar');
    await expect(topbar).toBeVisible();
    await expect(topbar).toHaveAttribute('role', 'banner');
    await expect(page.getByTestId('topbar-breadcrumb')).toBeVisible();
  });

  test('menu Fichier opens and contains expected items', async ({ page }) => {
    await page.getByTestId('topbar-menu-fichier').click();
    const content = page.getByTestId('topbar-menu-fichier-content');
    await expect(content).toBeVisible();
    await expect(content).toContainText('Nouvelle demande');
    await expect(content).toContainText('Ouvrir / Documents');
    await expect(content).toContainText('Exporter');
  });

  test('menu Paramétrage opens and contains Langue (not separate language dropdown on right)', async ({ page }) => {
    await page.getByTestId('topbar-menu-parametrage').click();
    const content = page.getByTestId('topbar-menu-parametrage-content');
    await expect(content).toBeVisible();
    await expect(content).toContainText('Langue');
    await expect(content).toContainText('Français');
    await expect(content).toContainText('Mon profil');
  });

  test('menu Réglage opens and contains Taille du texte (Réduire / Normal / Augmenter)', async ({ page }) => {
    await page.getByTestId('topbar-menu-reglage').click();
    const content = page.getByTestId('topbar-menu-reglage-content');
    await expect(content).toBeVisible();
    await expect(content).toContainText('Taille du texte');
    await expect(content).toContainText('Réduire');
    await expect(content).toContainText('Normal');
    await expect(content).toContainText('Augmenter');
  });

  test('Réglage font size: selecting Augmenter applies larger font to main content', async ({ page }) => {
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
    await page.getByTestId('topbar-menu-reglage').click();
    await page.getByTestId('topbar-menu-reglage-content').getByRole('menuitem', { name: 'Augmenter' }).click();
    await page.waitForTimeout(300);
    await expect(main).toHaveClass(/bmo-font-large|text-\[112\.5%\]/);
  });

  test('search button opens command palette', async ({ page }) => {
    await page.getByTestId('topbar-search').click();
    const dialog = page.getByRole('dialog', { name: /recherche|commandes/i });
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 2000 });
  });

  test('breadcrumb is visible and shows PILOTAGE on dashboard', async ({ page }) => {
    const breadcrumb = page.getByTestId('topbar-breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('PILOTAGE');
  });
});
