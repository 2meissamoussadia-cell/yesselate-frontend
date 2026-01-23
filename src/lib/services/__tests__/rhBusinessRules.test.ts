/**
 * Tests unitaires pour rhBusinessRules
 */

import { describe, it, expect } from '@jest/globals';
import { congesRules, depensesRules, deplacementsRules } from '../rhBusinessRules';
import type { Agent } from '../rhBusinessRules';

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

        expect(result.droitsTotaux).toBe(30); // Base 30 jours
        expect(result.bonusAnciennete).toBe(0); // Pas d'ancienneté
        expect(result.anciennete).toBe(0);
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

        // 7 ans = 2 tranches de 3 ans = +2 jours
        expect(result.droitsTotaux).toBe(32); // 30 + 2
        expect(result.bonusAnciennete).toBe(2);
        expect(result.anciennete).toBe(7);
      });

      it('should calculate solde for 9 years anciennete', () => {
        const agent: Agent = {
          id: '1',
          nom: 'Bernard',
          prenom: 'Marie',
          matricule: 'EMP-003',
          bureau: 'BMO',
          service: 'Finance',
          poste: 'Comptable',
          dateEmbauche: '2016-01-01', // 9 ans
          salaire: 600000,
          soldeConges: {
            annuel: 33,
            maladie: 0,
            exceptionnel: 0,
            recuperation: 0
          },
          historique: []
        };

        const result = congesRules.calculateSolde(agent, 2025);

        // 9 ans = 3 tranches de 3 ans = +3 jours
        expect(result.droitsTotaux).toBe(33); // 30 + 3
        expect(result.bonusAnciennete).toBe(3);
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

      it('should not auto-validate for long duration (>3 days)', () => {
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
          dateFin: '2025-02-10',
          workingDays: 8 // > 3 jours
        };

        const result = congesRules.canAutoValidate(demande, agent);

        expect(result.canValidate).toBe(false);
      });
    });
  });

  describe('depensesRules', () => {
    describe('validateDepense', () => {
      it('should validate depense within budget', () => {
        const budget = {
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

        const depense = {
          montant: 100000,
          type: 'depenses',
          bureau: 'BMO'
        };

        const result = depensesRules.validateDepense(depense, budget);

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
      });

      it('should reject depense exceeding budget', () => {
        const budget = {
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
              restant: 100000, // Restant faible
              pourcentage: 95
            }
          }
        };

        const depense = {
          montant: 200000, // > restant
          type: 'depenses',
          bureau: 'BMO'
        };

        const result = depensesRules.validateDepense(depense, budget);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.includes('budget'))).toBe(true);
      });
    });
  });
});

