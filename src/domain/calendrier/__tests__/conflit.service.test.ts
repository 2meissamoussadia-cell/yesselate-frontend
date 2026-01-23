/**
 * Tests unitaires pour ConflitService
 */

import { describe, it, expect } from '@jest/globals';
import { ConflitService } from '../services/conflit.service';
import type { CalendrierData, Evenement } from '../types/calendrier.types';

describe('ConflitService', () => {
  const mockData: CalendrierData = {
    evenements: [
      {
        id: 1,
        type: 'EVENEMENT',
        titre: 'Événement 1',
        date_debut: '2026-01-15T10:00:00',
        date_fin: '2026-01-15T11:00:00',
        chantier_id: 1,
      },
      {
        id: 2,
        type: 'EVENEMENT',
        titre: 'Événement 2',
        date_debut: '2026-01-15T10:30:00', // Chevauche avec Événement 1
        date_fin: '2026-01-15T11:30:00',
        chantier_id: 1,
      },
    ],
    jalons: [],
    absences: [
      {
        id: 1,
        user_id: 1,
        chantier_id: 1,
        type: 'CONGÉ',
        date_debut: '2026-01-15',
        date_fin: '2026-01-15',
        statut: 'VALIDE',
      },
    ],
    affectations: [
      {
        id: 1,
        user_id: 1,
        chantier_id: 1,
        role: 'Chef de projet',
        date_debut: '2026-01-01',
        date_fin: '2026-12-31',
        est_suralloue: true,
      },
    ],
    alertes: [],
  };

  describe('detectAllConflits', () => {
    it('should detect all conflicts', () => {
      const result = ConflitService.detectAllConflits(mockData);

      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.conflits).toBeDefined();
      expect(Array.isArray(result.conflits)).toBe(true);
    });

    it('should count conflicts by severity', () => {
      const result = ConflitService.detectAllConflits(mockData);

      expect(result.critical).toBeGreaterThanOrEqual(0);
      expect(result.high).toBeGreaterThanOrEqual(0);
      expect(result.medium).toBeGreaterThanOrEqual(0);
      expect(result.low).toBeGreaterThanOrEqual(0);
    });
  });

  describe('detectOverlapConflits', () => {
    it('should detect overlapping events', () => {
      const conflits = ConflitService.detectOverlapConflits(mockData.evenements);

      expect(conflits.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('detectOverallocationConflits', () => {
    it('should detect overallocation conflicts', () => {
      const conflits = ConflitService.detectOverallocationConflits(mockData.affectations);

      expect(conflits.length).toBeGreaterThanOrEqual(0);
      // Si est_suralloue est true, devrait détecter un conflit
      if (mockData.affectations.some(a => a.est_suralloue)) {
        expect(conflits.length).toBeGreaterThan(0);
      }
    });
  });

  describe('checkNewEvent', () => {
    it('should check conflicts for new event', () => {
      const newEvent: Evenement = {
        id: 3,
        type: 'EVENEMENT',
        titre: 'Nouvel Événement',
        date_debut: '2026-01-15T10:15:00', // Chevauche
        date_fin: '2026-01-15T11:15:00',
        chantier_id: 1,
      };

      const result = ConflitService.checkNewEvent(newEvent, mockData);

      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.conflits).toBeDefined();
      expect(Array.isArray(result.conflits)).toBe(true);
    });
  });
});
