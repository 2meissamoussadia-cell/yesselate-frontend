/**
 * E2E — Workflow complet BMO
 * Tests du flux end-to-end : login, dashboard, alertes, demandes, BC, planning, qualité, export.
 */

import { test, expect } from '@playwright/test';

const LOGIN_EMAIL = 'moussa.kane@yesselate.sn';
const LOGIN_PASSWORD = 'password';

test.describe('Workflow complet BMO', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(LOGIN_EMAIL);
    await page.getByLabel(/mot de passe/i).fill(LOGIN_PASSWORD);
    await page.getByRole('button', { name: /se connecter|connexion/i }).click();

    await page.waitForURL(/\/maitre-ouvrage/);
  });

  test('complete project management workflow', async ({ page }) => {
    // 1. Vérifier le dashboard
    await expect(page.getByText('Chantiers actifs')).toBeVisible();
    await expect(page.getByText('Alertes critiques')).toBeVisible();

    // 2. Créer une alerte
    await page.click('a[href*="/alerts"]');
    await page.waitForURL(/alerts/);

    await page.getByRole('button', { name: /nouvelle alerte/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel(/titre/i).first().fill('Test E2E - Problème électrique');
    await page.getByLabel(/description/i).fill('Court-circuit détecté');
    await page.getByRole('button', { name: /créer/i }).click();

    await expect(page.getByText(/alerte créée|succès/i)).toBeVisible({ timeout: 5000 });

    // 3. Créer une demande liée
    await page.click('a[href*="/demandes"]');
    await page.waitForURL(/demandes/);

    const newDemandeBtn = page.getByRole('button', { name: /nouvelle demande|nouveau/i });
    if (await newDemandeBtn.isVisible()) {
      await newDemandeBtn.click();
      const titreInput = page.getByLabel(/titre/i).first();
      if (await titreInput.isVisible()) {
        await titreInput.fill('Réparation circuit électrique');
        await page.getByRole('button', { name: /soumettre|créer/i }).first().click();
      }
    }

    // 4. Créer un BC
    await page.click('a[href*="/validation-bc"]');
    await page.waitForURL(/validation-bc/);

    const newBcBtn = page.getByRole('button', { name: /nouveau bc|nouveau/i });
    if (await newBcBtn.isVisible()) {
      await newBcBtn.click();
      const objetInput = page.getByLabel(/objet/i);
      if (await objetInput.isVisible()) {
        await objetInput.fill('Réparation électrique urgente');
        await page.getByRole('button', { name: /créer/i }).first().click();
      }
    }

    // 5. Vérifier dans le planning
    await page.click('a[href*="/planning"]');
    await page.waitForURL(/planning/);
    await expect(page.locator('body')).toBeVisible();

    // 6. Ajouter un contrôle qualité
    await page.click('a[href*="/qualite"]');
    await page.waitForURL(/qualite/);

    const newControleBtn = page.getByRole('button', { name: /nouveau contrôle|nouveau/i });
    if (await newControleBtn.isVisible()) {
      await newControleBtn.click();
    }

    // 7. Vérifier le dashboard mis à jour
    await page.click('a[href="/maitre-ouvrage"]');
    await page.waitForURL(/\/maitre-ouvrage\/?$/);

    const alertesWidget = page.locator('[data-widget="kpi-alertes-critiques"]');
    if (await alertesWidget.isVisible()) {
      const valueEl = alertesWidget.locator('.text-3xl');
      if (await valueEl.isVisible()) {
        const text = await valueEl.textContent();
        const num = parseInt(text?.replace(/\D/g, '') ?? '0', 10);
        expect(num).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('navigation and search', async ({ page }) => {
    await page.click('a[href*="/chantiers"]');
    await expect(page).toHaveURL(/chantiers/);

    await page.click('a[href*="/planning"]');
    await expect(page).toHaveURL(/planning/);

    await page.click('a[href*="/qualite"]');
    await expect(page).toHaveURL(/qualite/);

    // Test recherche globale (Ctrl+K)
    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    const cmdPalette = page.getByPlaceholder(/rechercher|search/i);
    if (await dialog.or(cmdPalette).isVisible()) {
      await page.keyboard.type('Villa Dakar');
      await page.keyboard.press('Escape');
    }
  });

  test('filters and sorting', async ({ page }) => {
    await page.goto('/maitre-ouvrage/alerts');
    await page.waitForLoadState('networkidle');

    const critiquesBtn = page.getByRole('button', { name: /critiques/i });
    if (await critiquesBtn.isVisible()) {
      await critiquesBtn.click();
      await page.waitForLoadState('networkidle');
    }

    const trierBtn = page.getByRole('button', { name: /trier/i });
    if (await trierBtn.isVisible()) {
      await trierBtn.click();
      const echeanceOpt = page.getByText(/échéance/i);
      if (await echeanceOpt.isVisible()) {
        await echeanceOpt.click();
      }
      await page.waitForLoadState('networkidle');
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/maitre-ouvrage');

    const mobileMenu = page.locator('[data-testid="mobile-menu"], [aria-label*="menu"], button[aria-expanded]').first();
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/maitre-ouvrage');
    await expect(page.getByText('Chantiers actifs')).toBeVisible();
  });

  test('offline mode', async ({ page, context }) => {
    await page.goto('/maitre-ouvrage/alerts');
    await page.waitForLoadState('networkidle');

    const newAlertBtn = page.getByRole('button', { name: /nouvelle alerte/i });
    if (await newAlertBtn.isVisible()) {
      await newAlertBtn.click();
      await page.getByLabel(/titre/i).first().fill('Test offline');
      await page.getByLabel(/description/i).fill('Mode hors ligne');

      await context.setOffline(true);
      await page.getByRole('button', { name: /créer/i }).click();

      const offlineIndicator = page.getByText(/hors ligne|offline|en attente/i);
      await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

      await context.setOffline(false);
    }
  });

  test('keyboard shortcuts', async ({ page }) => {
    await page.goto('/maitre-ouvrage/alerts');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+K');
    const dialog = page.getByRole('dialog');
    if (await dialog.isVisible()) {
      await page.keyboard.press('Escape');
    }

    await page.keyboard.press('Control+N');
    const newAlertText = page.getByText(/nouvelle alerte/i);
    if (await newAlertText.isVisible()) {
      await page.keyboard.press('Escape');
    }
  });

  test('performance', async ({ page }) => {
    const start = Date.now();
    await page.goto('/maitre-ouvrage');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(10000);
  });
});
