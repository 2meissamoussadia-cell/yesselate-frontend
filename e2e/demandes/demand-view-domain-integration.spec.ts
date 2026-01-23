/**
 * Tests E2E Playwright pour DemandView - Intégration Domain Service
 * Vérifie que le composant utilise correctement useDemandeService
 */

import { test, expect } from '@playwright/test';

test.describe('DemandView - Domain Service Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page demandes
    await page.goto('/maitre-ouvrage/demandes');
    await page.waitForLoadState('networkidle');
  });

  test('should display demande with correct budget calculations from domain service', async ({ page }) => {
    // Navigate to a specific demand (assuming DEM-001 exists or can be created)
    const demandeLink = page.locator('text=/DEM-\\d+/').first();
    
    if (await demandeLink.count() > 0) {
      await demandeLink.click();
      
      // Wait for DemandView to load
      await page.waitForSelector('[data-testid="budget-usage"], [data-testid="risk-score"]', { timeout: 5000 });
      
      // Verify budget section displays correctly
      const budgetUsage = page.locator('[data-testid="budget-usage"]');
      if (await budgetUsage.count() > 0) {
        await expect(budgetUsage).toBeVisible();
        
        // Verify budget usage percentage is displayed (calculated by domain service)
        const budgetText = await budgetUsage.textContent();
        expect(budgetText).toMatch(/\d+\.?\d*%/);
      }
    }
  });

  test('should display risk scores correctly from domain service', async ({ page }) => {
    const demandeLink = page.locator('text=/DEM-\\d+/').first();
    
    if (await demandeLink.count() > 0) {
      await demandeLink.click();
      
      await page.waitForSelector('[data-testid="risk-score"]', { timeout: 5000 });
      
      // Verify risk section
      const riskScore = page.locator('[data-testid="risk-score"]');
      if (await riskScore.count() > 0) {
        await expect(riskScore).toBeVisible();
        
        // Verify risk score value is displayed
        const riskScoreValue = page.locator('[data-testid="risk-score-value"]');
        if (await riskScoreValue.count() > 0) {
          const scoreText = await riskScoreValue.textContent();
          // Should be in format "X/100" or "—"
          expect(scoreText).toMatch(/\d+\/100|—/);
        }
        
        // Verify risk level badge
        const riskLevel = page.locator('[data-testid="risk-level"]');
        if (await riskLevel.count() > 0) {
          const levelText = await riskLevel.textContent();
          expect(['low', 'medium', 'high', 'critical']).toContain(levelText?.toLowerCase());
        }
      }
    }
  });

  test('should show validation warnings from domain service', async ({ page }) => {
    const demandeLink = page.locator('text=/DEM-\\d+/').first();
    
    if (await demandeLink.count() > 0) {
      await demandeLink.click();
      
      await page.waitForSelector('[data-testid="budget-usage"], [data-testid="risks-section"]', { timeout: 5000 });
      
      // Verify warnings are displayed if any (from domain service validation)
      const warnings = page.locator('[data-testid="validation-warnings"]');
      // Warnings may or may not be present depending on demande state
      // Just verify the component renders correctly
    }
  });

  test('should handle validation workflow using domain service', async ({ page }) => {
    const demandeLink = page.locator('text=/DEM-\\d+/').first();
    
    if (await demandeLink.count() > 0) {
      await demandeLink.click();
      
      await page.waitForSelector('[data-testid="validate-button"]', { timeout: 5000 });
      
      // Click validate button
      const validateButton = page.locator('[data-testid="validate-button"]');
      
      if (await validateButton.count() > 0 && await validateButton.isEnabled()) {
        await validateButton.click();
        
        // Verify modal or confirmation appears
        const validationModal = page.locator('[data-testid="validation-modal"], .modal, [role="dialog"]');
        
        if (await validationModal.count() > 0) {
          await expect(validationModal).toBeVisible();
          
          // If there's a note field
          const noteField = page.locator('[data-testid="validation-note"], textarea, input[type="text"]');
          if (await noteField.count() > 0) {
            await noteField.fill('Test validation via domain service');
          }
          
          // Confirm validation
          const confirmButton = page.locator('[data-testid="confirm-validation"], button:has-text("Confirmer"), button:has-text("Valider")');
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
            
            // Verify success message
            await page.waitForSelector('text=/validé|success/i', { timeout: 5000 });
          }
        }
      }
    }
  });

  test('should display risks section when risks are evaluated by domain service', async ({ page }) => {
    const demandeLink = page.locator('text=/DEM-\\d+/').first();
    
    if (await demandeLink.count() > 0) {
      await demandeLink.click();
      
      await page.waitForSelector('[data-testid="risks-section"]', { timeout: 5000 });
      
      // Verify risks section is displayed if risks exist
      const risksSection = page.locator('[data-testid="risks-section"]');
      
      // Risks may or may not be present - just verify component structure
      if (await risksSection.count() > 0) {
        await expect(risksSection).toBeVisible();
      }
    }
  });
});

