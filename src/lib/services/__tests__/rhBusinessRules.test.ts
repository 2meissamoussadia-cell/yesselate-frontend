/**
 * Tests unitaires pour rhBusinessRules
 * Note: Certaines fonctions dépendent de rhBusinessService qui doit être mocké
 */

// Mock rhBusinessService AVANT l'import
jest.mock('../rhBusinessService', () => {
  const mockCalculateWorkingDays = (start: Date, end: Date) => {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const diffTime = Math.abs(endTime - startTime);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays * 5 / 7);
  };

  return {
    rhBusinessService: {
      calculateWorkingDays: mockCalculateWorkingDays
    }
  };
});

import { describe, it, expect } from '@jest/globals';
import { congesRules, depensesRules } from '../rhBusinessRules';
import type { Agent, BudgetControl } from '../rhBusinessRules';

describe('rhBusinessRules', () => {
  describe('congesRules', () => {
    describe('calculateSolde', () => {
      it('should calculate solde for new employee', () => {
        const agent: Agent = {
          id: '1',
          nom: 'Dupont',
          prenom: 'Jean',
          matricule: 'EMP-001',
          bureau: 'BMO',
          service: 'IT',
          poste: 'Développeur',
          dateEmbauche: '2025-01-01',
          salaire: 500000,
          soldeConges: {
            annuel: 30,
            maladie: 0,
            exceptionnel: 0,
            recuperation: 0
          },
          historique: []
        };

        const result = congesRules.calculateSolde(agent, 2025);

        expect(result.droitsTotaux).toBeGreaterThanOrEqual(30); // Base 30 jours + bonus si applicable
        expect(result.bonusAnciennete).toBeGreaterThanOrEqual(0);
        expect(result.anciennete).toBeGreaterThanOrEqual(0);
      });

      it('should calculate solde with anciennete bonus', () => {
        const agent: Agent = {
          id: '1',
          nom: 'Martin',
          prenom: 'Pierre',
          matricule: 'EMP-002',
          bureau: 'BMO',
          service: 'IT',
          poste: 'Senior',
          dateEmbauche: '2018-01-01', // 7 ans d'ancienneté
          salaire: 800000,
          soldeConges: {
            annuel: 32,
            maladie: 0,
            exceptionnel: 0,
            recuperation: 0
          },
          historique: []
        };

        const result = congesRules.calculateSolde(agent, 2025);

        // 7-8 ans = 2 tranches de 3 ans = +2 jours
        expect(result.droitsTotaux).toBe(32); // 30 + 2
        expect(result.bonusAnciennete).toBe(2);
        // L'ancienneté peut varier selon l'année actuelle (7 ou 8 ans)
        expect(result.anciennete).toBeGreaterThanOrEqual(7);
        expect(result.anciennete).toBeLessThanOrEqual(8);
      });
    });

    describe('canAutoValidate', () => {
      it('should auto-validate for short duration (<=3 days)', () => {
        const agent: Agent = {
          id: '1',
          nom: 'Dupont',
          prenom: 'Jean',
          matricule: 'EMP-001',
          bureau: 'BMO',
          service: 'IT',
          poste: 'Développeur',
          dateEmbauche: '2025-01-01',
          salaire: 500000,
          soldeConges: {
            annuel: 30,
            maladie: 0,
            exceptionnel: 0,
            recuperation: 0
          },
          historique: []
        };

        const demande = {
          dateDebut: '2025-02-01',
          dateFin: '2025-02-03',
          workingDays: 3
        };

        const result = congesRules.canAutoValidate(demande, agent);

        expect(result.canValidate).toBe(true);
      });

      it('should not auto-validate if solde insufficient', () => {
        const agent: Agent = {
          id: '1',
          nom: 'Dupont',
          prenom: 'Jean',
          matricule: 'EMP-001',
          bureau: 'BMO',
          service: 'IT',
          poste: 'Développeur',
          dateEmbauche: '2025-01-01',
          salaire: 500000,
          soldeConges: {
            annuel: 2, // Solde insuffisant
            maladie: 0,
            exceptionnel: 0,
            recuperation: 0
          },
          historique: []
        };

        const demande = {
          dateDebut: '2025-02-01',
          dateFin: '2025-02-03',
          workingDays: 3
        };

        const result = congesRules.canAutoValidate(demande, agent);

        expect(result.canValidate).toBe(false);
        expect(result.reason).toBeDefined();
      });
    });
  });

  describe('depensesRules', () => {
    describe('checkBudget', () => {
      it('should validate depense within budget', () => {
        const budgetControl: BudgetControl = {
          bureau: 'BMO',
          annee: 2025,
          budgets: {
            deplacements: {
              alloue: 1000000,
              utilise: 500000,
              restant: 500000,
              pourcentage: 50
            },
            formations: {
              alloue: 500000,
              utilise: 200000,
              restant: 300000,
              pourcentage: 40
            },
            depenses: {
              alloue: 2000000,
              utilise: 1000000,
              restant: 1000000,
              pourcentage: 50
            }
          }
        };

        const montant = 100000;

        const result = depensesRules.checkBudget(montant, 'BMO', budgetControl);

        expect(result.available).toBe(true);
        expect(result.pourcentageUtilise).toBeLessThan(90);
      });

      it('should warn when budget > 90%', () => {
        const budgetControl: BudgetControl = {
          bureau: 'BMO',
          annee: 2025,
          budgets: {
            deplacements: {
              alloue: 1000000,
              utilise: 500000,
              restant: 500000,
              pourcentage: 50
            },
            formations: {
              alloue: 500000,
              utilise: 200000,
              restant: 300000,
              pourcentage: 40
            },
            depenses: {
              alloue: 2000000,
              utilise: 1900000,
              restant: 100000,
              pourcentage: 95
            }
          }
        };

        const montant = 50000;

        const result = depensesRules.checkBudget(montant, 'BMO', budgetControl);

        expect(result.available).toBe(true);
        expect(result.pourcentageUtilise).toBeGreaterThan(90);
        expect(result.message).toContain('Attention');
      });

      it('should reject depense exceeding budget', () => {
        const budgetControl: BudgetControl = {
          bureau: 'BMO',
          annee: 2025,
          budgets: {
            deplacements: {
              alloue: 1000000,
              utilise: 500000,
              restant: 500000,
              pourcentage: 50
            },
            formations: {
              alloue: 500000,
              utilise: 200000,
              restant: 300000,
              pourcentage: 40
            },
            depenses: {
              alloue: 2000000,
              utilise: 1900000,
              restant: 100000,
              pourcentage: 95
            }
          }
        };

        const montant = 200000; // > restant

        const result = depensesRules.checkBudget(montant, 'BMO', budgetControl);

        expect(result.available).toBe(false);
        expect(result.message).toContain('dépassé');
      });
    });

    describe('calculateFraisKm', () => {
      it('should calculate frais for voiture', () => {
        const result = depensesRules.calculateFraisKm(100, 'voiture');
        expect(result).toBe(1500); // 100 km * 15 DZD/km
      });

      it('should calculate frais for moto', () => {
        const result = depensesRules.calculateFraisKm(50, 'moto');
        expect(result).toBe(400); // 50 km * 8 DZD/km
      });

      it('should calculate frais for velo', () => {
        const result = depensesRules.calculateFraisKm(20, 'velo');
        expect(result).toBe(60); // 20 km * 3 DZD/km
      });
    });
  });
});
