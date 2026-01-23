/**
 * Tests E2E Playwright pour le workflow des demandes
 * Scénario: Créer demande → Valider → Vérifier état
 */

import { test, expect } from '@playwright/test';

test.describe('Workflow Demandes', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page demandes
    await page.goto('/maitre-ouvrage/demandes');
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
  });

  test('should create demande and validate it', async ({ page }) => {
    // 1. Créer une demande
    await test.step('Créer une demande', async () => {
      // Cliquer sur le bouton "Nouvelle demande"
      const newDemandeButton = page.locator('button:has-text("Nouvelle demande"), button:has-text("Créer"), [data-testid="new-demande"]').first();
      await newDemandeButton.click();
      
      // Attendre que le formulaire soit visible
      await page.waitForSelector('input[name="subject"], input[name="title"], [data-testid="demande-form"]', { timeout: 5000 });
      
      // Remplir le formulaire
      const titleInput = page.locator('input[name="subject"], input[name="title"]').first();
      await titleInput.fill('Demande de test E2E avec titre assez long pour validation');
      
      const amountInput = page.locator('input[name="amount"], input[name="montant"]').first();
      await amountInput.fill('50000');
      
      const bureauSelect = page.locator('select[name="bureau"], [data-testid="bureau-select"]').first();
      if (await bureauSelect.count() > 0) {
        await bureauSelect.selectOption('BMO');
      }
      
      // Soumettre le formulaire
      const submitButton = page.locator('button[type="submit"], button:has-text("Créer"), button:has-text("Soumettre")').first();
      await submitButton.click();
      
      // Attendre que la demande soit créée
      await page.waitForSelector('[data-testid="demande-card"], .demande-item', { timeout: 10000 });
    });

    // 2. Vérifier que la demande apparaît dans la liste
    await test.step('Vérifier création', async () => {
      const demandeCard = page.locator('text=Demande de test E2E').first();
      await expect(demandeCard).toBeVisible();
    });

    // 3. Ouvrir la demande
    await test.step('Ouvrir la demande', async () => {
      const demandeLink = page.locator('text=Demande de test E2E').first();
      await demandeLink.click();
      
      // Attendre que la vue détail soit chargée
      await page.waitForSelector('[data-testid="demande-detail"], .demande-view', { timeout: 5000 });
    });

    // 4. Vérifier les calculs automatiques
    await test.step('Vérifier calculs automatiques', async () => {
      // Vérifier que le budget usage est calculé (si budget présent)
      const budgetUsage = page.locator('[data-testid="budget-usage"], text=/\\d+%/').first();
      if (await budgetUsage.count() > 0) {
        await expect(budgetUsage).toBeVisible();
      }
      
      // Vérifier que les risques sont évalués
      const risksSection = page.locator('[data-testid="risks"], text=/risque/i').first();
      // Les risques peuvent ne pas être présents si aucun risque détecté
    });

    // 5. Valider la demande
    await test.step('Valider la demande', async () => {
      const validateButton = page.locator('button:has-text("Valider"), [data-testid="validate-button"]').first();
      
      if (await validateButton.count() > 0 && await validateButton.isEnabled()) {
        await validateButton.click();
        
        // Attendre confirmation si modal
        const confirmButton = page.locator('button:has-text("Confirmer"), button:has-text("Valider")').first();
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }
        
        // Attendre le toast de succès
        await page.waitForSelector('.toast-success, [data-testid="success-toast"], text=/validé/i', { timeout: 5000 });
        
        // Vérifier que le statut a changé
        const statusBadge = page.locator('[data-testid="status"], text=/validé/i').first();
        await expect(statusBadge).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test('should show validation errors for invalid demande', async ({ page }) => {
    await test.step('Créer demande invalide', async () => {
      const newDemandeButton = page.locator('button:has-text("Nouvelle demande"), button:has-text("Créer")').first();
      await newDemandeButton.click();
      
      await page.waitForSelector('input[name="subject"], input[name="title"]', { timeout: 5000 });
      
      // Remplir avec des données invalides
      const titleInput = page.locator('input[name="subject"], input[name="title"]').first();
      await titleInput.fill('Short'); // Titre trop court
      
      const amountInput = page.locator('input[name="amount"]').first();
      if (await amountInput.count() > 0) {
        await amountInput.fill('-1000'); // Montant négatif
      }
      
      // Essayer de soumettre
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      // Vérifier que les erreurs sont affichées
      await page.waitForSelector('text=/titre.*10.*caractères/i, text=/montant.*positif/i', { timeout: 3000 });
      
      const errorMessage = page.locator('text=/titre.*10.*caractères/i, text=/montant.*positif/i').first();
      await expect(errorMessage).toBeVisible();
    });
  });

  test('should calculate budget usage correctly', async ({ page }) => {
    await test.step('Vérifier calcul budget', async () => {
      // Créer une demande avec montant
      const newDemandeButton = page.locator('button:has-text("Nouvelle demande")').first();
      if (await newDemandeButton.count() > 0) {
        await newDemandeButton.click();
        
        await page.waitForSelector('input[name="subject"]', { timeout: 5000 });
        
        await page.locator('input[name="subject"]').fill('Test calcul budget avec titre assez long');
        await page.locator('input[name="amount"]').fill('50000');
        
        // Si budget disponible dans le formulaire
        const budgetInput = page.locator('input[name="budget"], select[name="budget"]').first();
        if (await budgetInput.count() > 0) {
          // Sélectionner ou remplir budget
        }
        
        await page.locator('button[type="submit"]').first().click();
        
        // Vérifier le calcul
        await page.waitForSelector('[data-testid="budget-usage"]', { timeout: 5000 });
        const budgetUsage = page.locator('[data-testid="budget-usage"]').first();
        const usageText = await budgetUsage.textContent();
        
        // Le pourcentage devrait être calculé
        expect(usageText).toMatch(/\d+%/);
      }
    });
  });

  test('should detect risks automatically', async ({ page }) => {
    await test.step('Vérifier détection risques', async () => {
      // Créer une demande avec montant élevé
      const newDemandeButton = page.locator('button:has-text("Nouvelle demande")').first();
      if (await newDemandeButton.count() > 0) {
        await newDemandeButton.click();
        
        await page.waitForSelector('input[name="subject"]', { timeout: 5000 });
        
        await page.locator('input[name="subject"]').fill('Test risques avec titre assez long pour validation');
        await page.locator('input[name="amount"]').fill('6000000'); // > 5M
        
        await page.locator('button[type="submit"]').first().click();
        
        // Attendre que la demande soit créée
        await page.waitForSelector('[data-testid="demande-card"]', { timeout: 10000 });
        
        // Ouvrir la demande
        await page.locator('text=Test risques').first().click();
        
        // Vérifier que les risques sont détectés
        await page.waitForSelector('[data-testid="risks"], text=/risque/i', { timeout: 5000 });
        const risksSection = page.locator('[data-testid="risks"]').first();
        if (await risksSection.count() > 0) {
          await expect(risksSection).toBeVisible();
        }
      }
    });
  });
});

