/**
 * Tests unitaires pour rhBusinessService
 */

import { describe, it, expect } from '@jest/globals';
import {
  calculateWorkingDays,
  getCongeBalance,
  validateCongeDemand,
  validateDepenseDemand,
  checkConflicts,
} from '../rhBusinessService';
import type { HRRequest } from '@/lib/types/bmo.types';

describe('rhBusinessService', () => {
  describe('calculateWorkingDays', () => {
    it('should calculate working days excluding weekends', () => {
      const result = calculateWorkingDays('2025-01-06', '2025-01-10'); // Lundi à Vendredi

      expect(result.workingDays).toBe(5);
      expect(result.weekendDays).toBe(0);
      expect(result.totalDays).toBe(5);
    });

    it('should exclude weekends from calculation', () => {
      const result = calculateWorkingDays('2025-01-06', '2025-01-12'); // Lundi à Dimanche

      expect(result.workingDays).toBe(5); // Lundi-Vendredi
      expect(result.weekendDays).toBe(2); // Samedi-Dimanche
      expect(result.totalDays).toBe(7);
    });

    it('should exclude public holidays', () => {
      const result = calculateWorkingDays('2025-01-01', '2025-01-03'); // Inclut jour de l'an

      expect(result.workingDays).toBeLessThan(3); // Moins de 3 car jour férié
      expect(result.publicHolidays.length).toBeGreaterThan(0);
    });
  });

  describe('getCongeBalance', () => {
    it('should return balance for existing employee', () => {
      const result = getCongeBalance('EMP-007');

      expect(result).toBeDefined();
      expect(result?.employeeId).toBe('EMP-007');
      expect(result?.annuelRestant).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-existent employee', () => {
      const result = getCongeBalance('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('validateCongeDemand', () => {
    it('should validate conge demand with sufficient balance', () => {
      const demand: HRRequest = {
        id: '1',
        type: 'conge',
        employeeId: 'EMP-007',
        dateDebut: '2025-02-01',
        dateFin: '2025-02-05',
        workingDays: 5,
      } as HRRequest;

      const result = validateCongeDemand(demand);

      expect(result.valid).toBe(true);
      expect(result.rules.length).toBe(0);
    });

    it('should reject conge demand with insufficient balance', () => {
      const demand: HRRequest = {
        id: '1',
        type: 'conge',
        employeeId: 'EMP-007',
        dateDebut: '2025-02-01',
        dateFin: '2025-02-20', // 15 jours
        workingDays: 15,
      } as HRRequest;

      const result = validateCongeDemand(demand);

      // Devrait être invalide car solde insuffisant (10 jours restants)
      expect(result.valid).toBe(false);
      expect(result.rules.length).toBeGreaterThan(0);
    });

    it('should require manager approval for long conge', () => {
      const demand: HRRequest = {
        id: '1',
        type: 'conge',
        employeeId: 'EMP-007',
        dateDebut: '2025-02-01',
        dateFin: '2025-02-15', // > 10 jours
        workingDays: 11,
      } as HRRequest;

      const result = validateCongeDemand(demand);

      expect(result.requiresManagerApproval).toBe(true);
    });
  });

  describe('validateDepenseDemand', () => {
    it('should validate small depense (< 100k)', () => {
      const demand: HRRequest = {
        id: '1',
        type: 'depense',
        employeeId: 'EMP-007',
        montant: 50000,
      } as HRRequest;

      const result = validateDepenseDemand(demand);

      expect(result.valid).toBe(true);
      expect(result.requiresManagerApproval).toBe(false);
      expect(result.requiresDGApproval).toBe(false);
    });

    it('should require manager approval for medium depense (100k-500k)', () => {
      const demand: HRRequest = {
        id: '1',
        type: 'depense',
        employeeId: 'EMP-007',
        montant: 200000,
      } as HRRequest;

      const result = validateDepenseDemand(demand);

      expect(result.requiresManagerApproval).toBe(true);
      expect(result.requiresDGApproval).toBe(false);
    });

    it('should require DG approval for large depense (> 500k)', () => {
      const demand: HRRequest = {
        id: '1',
        type: 'depense',
        employeeId: 'EMP-007',
        montant: 600000,
      } as HRRequest;

      const result = validateDepenseDemand(demand);

      expect(result.requiresDGApproval).toBe(true);
    });
  });

  describe('checkConflicts', () => {
    it('should detect no conflicts for isolated demand', () => {
      const demand: HRRequest = {
        id: '1',
        type: 'conge',
        employeeId: 'EMP-007',
        dateDebut: '2025-02-01',
        dateFin: '2025-02-05',
      } as HRRequest;

      const allDemands: HRRequest[] = [];

      const result = checkConflicts(demand, allDemands);

      expect(result.hasConflict).toBe(false);
      expect(result.conflicts.length).toBe(0);
    });

    it('should detect conflict for same employee overlapping period', () => {
      const demand1: HRRequest = {
        id: '1',
        type: 'conge',
        employeeId: 'EMP-007',
        dateDebut: '2025-02-01',
        dateFin: '2025-02-05',
      } as HRRequest;

      const demand2: HRRequest = {
        id: '2',
        type: 'conge',
        employeeId: 'EMP-007',
        dateDebut: '2025-02-03', // Chevauchement
        dateFin: '2025-02-07',
      } as HRRequest;

      const result = checkConflicts(demand1, [demand2]);

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });

    it('should not detect conflict for different employees', () => {
      const demand1: HRRequest = {
        id: '1',
        type: 'conge',
        employeeId: 'EMP-007',
        dateDebut: '2025-02-01',
        dateFin: '2025-02-05',
      } as HRRequest;

      const demand2: HRRequest = {
        id: '2',
        type: 'conge',
        employeeId: 'EMP-009', // Autre employé
        dateDebut: '2025-02-01',
        dateFin: '2025-02-05',
      } as HRRequest;

      const result = checkConflicts(demand1, [demand2]);

      expect(result.hasConflict).toBe(false);
    });
  });
});

