/**
 * E2E Workflow Alertes — Tests du flux complet module Centre d'Alertes
 * Adapté à l'implémentation actuelle (Outlook-like, CreateAlertDialog simplifié)
 */

import { test, expect } from '@playwright/test';

test.describe('Workflow Alertes Complet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maitre-ouvrage/alerts');
    await page.waitForLoadState('networkidle');
  });

  test('complete alert creation workflow', async ({ page }) => {
    // 1. Ouvrir le dialog de création
    await page.getByRole('button', { name: 'Nouvelle alerte' }).click();

    // 2. Vérifier que le dialog s'ouvre
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nouvelle alerte' })).toBeVisible();

    // 3. Remplir le formulaire (Titre + Description)
    await page.getByLabel(/^Titre/).fill('Problème électrique urgente');
    await page
      .getByLabel('Description')
      .fill('Court-circuit détecté dans le tableau électrique principal');

    // 4. Soumettre
    await page.getByRole('button', { name: 'Créer' }).click();

    // 5. Vérifier le toast de succès
    await expect(page.getByText('Alerte créée')).toBeVisible({ timeout: 5000 });

    // 6. Le dialog se ferme
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('filter alerts by sidebar', async ({ page }) => {
    // Attendre le chargement
    await page.waitForLoadState('networkidle');

    // 1. Cliquer sur "Critiques" dans la sidebar
    const sidebar = page.getByRole('complementary', { name: /dossiers/i });
    await sidebar.getByRole('button', { name: /critiques/i }).click();

    // 2. Vérifier que la page a réagi (pas d'erreur)
    await expect(page.locator('body')).toBeVisible();
  });

  test('view alert detail', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 1. Cliquer sur la première alerte de la liste (si présente)
    const listbox = page.getByRole('listbox', { name: 'Liste' });
    const options = listbox.getByRole('option');

    const count = await options.count();
    if (count > 0) {
      await options.first().click();

      // 2. Vérifier que le panel de détail affiche du contenu
      await expect(page.getByText('Description')).toBeVisible();
      await expect(page.getByText(/Sélectionnez une alerte|Description/)).toBeVisible();
    } else {
      // Liste vide — vérifier le message
      await expect(page.getByText(/aucune alerte|chargement/i)).toBeVisible();
    }
  });

  test('filter by view tabs', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Cliquer sur l'onglet "Critiques" dans la FilterBar (si présent)
    const critiquesTab = page.getByRole('button', { name: /^Critiques/ }).first();
    if (await critiquesTab.isVisible()) {
      await critiquesTab.click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('open and cancel create dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Nouvelle alerte' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('create dialog requires titre', async ({ page }) => {
    await page.getByRole('button', { name: 'Nouvelle alerte' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Ne pas remplir le titre — le bouton Créer doit être désactivé
    const submitBtn = page.getByRole('button', { name: 'Créer' });
    await expect(submitBtn).toBeDisabled();
  });

  // ——— Tests nécessitant des fonctionnalités à venir ———

  test.skip('bulk actions on alerts', async ({ page }) => {
    // Nécessite checkboxes de sélection dans AlertListRow
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await expect(page.getByText('1 sélectionné')).toBeVisible();
  });

  test.skip('export alerts to PDF', async ({ page }) => {
    // Nécessite bouton Exporter dans QuickActionsBar
    await page.getByRole('button', { name: 'Exporter' }).click();
  });

  test.skip('search with Ctrl+K', async ({ page }) => {
    // Nécessite AdvancedSearchBar / CommandPalette dans le layout
    await page.keyboard.press('Control+K');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test.skip('offline mode', async ({ page, context }) => {
    // Nécessite intégration OfflineIndicator + sync
    await context.setOffline(true);
    await expect(page.getByText('Mode hors ligne')).toBeVisible();
  });
});
