/**
 * Tests unitaires pour CalendrierService
 */

import { describe, it, expect } from '@jest/globals';
import { CalendrierService } from '../services/calendrier.service';
import type { CalendrierData } from '../types/calendrier.types';

describe('CalendrierService', () => {
  const mockData: CalendrierData = {
    evenements: [
      {
        id: 1,
        type: 'EVENEMENT',
        titre: 'Événement Test',
        date_debut: new Date().toISOString(),
        date_fin: new Date(Date.now() + 3600000).toISOString(),
        chantier_id: 1,
      },
      {
        id: 2,
        type: 'REUNION_PROJET',
        titre: 'Réunion Test',
        date_debut: new Date(Date.now() + 86400000).toISOString(),
        date_fin: new Date(Date.now() + 9000000).toISOString(),
        chantier_id: 1,
      },
    ],
    jalons: [
      {
        id: 1,
        chantier_id: 1,
        libelle: 'Jalon SLA',
        type: 'SLA',
        date_debut: '2026-01-01',
        date_fin: '2026-01-15',
        est_retard: false,
        est_sla_risque: false,
        statut: 'À venir',
      },
      {
        id: 2,
        chantier_id: 1,
        libelle: 'Jalon Retard',
        type: 'SLA',
        date_debut: '2026-01-01',
        date_fin: '2026-01-10',
        est_retard: true,
        est_sla_risque: true,
        statut: 'En cours',
      },
    ],
    absences: [
      {
        id: 1,
        user_id: 1,
        chantier_id: 1,
        type: 'CONGÉ',
        date_debut: '2026-01-20',
        date_fin: '2026-01-25',
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
        est_suralloue: false,
      },
      {
        id: 2,
        user_id: 1,
        chantier_id: 2,
        role: 'Chef de projet',
        date_debut: '2026-01-01',
        date_fin: '2026-12-31',
        est_suralloue: true,
      },
    ],
    alertes: [],
  };

  describe('calculateOverview', () => {
    it('should calculate overview correctly', () => {
      const overview = CalendrierService.calculateOverview(mockData);

      expect(overview).toBeDefined();
      expect(overview.evenements_total).toBe(2);
      expect(overview.jalons_total).toBe(2);
      expect(overview.jalons_retard).toBe(1);
      expect(overview.absences_total).toBe(1);
      expect(overview.sur_allocations).toBe(1);
    });

    it('should count today events', () => {
      const overview = CalendrierService.calculateOverview(mockData);
      expect(overview.evenements_aujourdhui).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate stats correctly', () => {
      const stats = CalendrierService.calculateStats(mockData);

      expect(stats).toBeDefined();
      expect(stats.evenements_total).toBe(2);
      expect(stats.jalons_total).toBe(2);
      expect(stats.taux_conformite_sla).toBeGreaterThanOrEqual(0);
      expect(stats.taux_conformite_sla).toBeLessThanOrEqual(100);
    });
  });

  describe('filterData', () => {
    it('should filter by chantier_id', () => {
      const filtered = CalendrierService.filterData(mockData, {
        chantier_id: 1,
      });

      expect(filtered.evenements.every(e => e.chantier_id === 1)).toBe(true);
      expect(filtered.jalons.every(j => j.chantier_id === 1)).toBe(true);
    });

    it('should filter by date range', () => {
      const filtered = CalendrierService.filterData(mockData, {
        date_debut: '2026-01-01',
        date_fin: '2026-01-31',
      });

      expect(filtered.evenements.length).toBeGreaterThanOrEqual(0);
    });

    it('should return all data if no filters', () => {
      const filtered = CalendrierService.filterData(mockData, {});

      expect(filtered.evenements.length).toBe(mockData.evenements.length);
      expect(filtered.jalons.length).toBe(mockData.jalons.length);
    });
  });
});
