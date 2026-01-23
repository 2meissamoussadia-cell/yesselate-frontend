/**
 * Tests unitaires pour les adaptateurs Calendrier
 */

import { describe, it, expect } from '@jest/globals';
import {
  adaptEvenement,
  adaptAbsence,
  adaptAffectation,
  adaptJalon,
  adaptCalendrierAlerte,
  adaptCalendrierData,
  adaptCalendrierOverview,
  adaptCalendrierStats,
} from '../adapters/calendrier.adapter';
import type {
  EvenementCalendrier,
  Absence,
  Affectation,
  Jalon,
  CalendrierAlerte,
  CalendrierOverviewResponse,
  CalendrierStats as ApiCalendrierStats,
} from '@/modules/calendrier/types/calendrierTypes';

describe('Calendrier Adapters', () => {
  describe('adaptEvenement', () => {
    it('should adapt EvenementCalendrier to Evenement', () => {
      const apiEvenement: EvenementCalendrier = {
        id: 1,
        type: 'EVENEMENT',
        titre: 'Événement Test',
        description: 'Description',
        date_debut: '2026-01-15T10:00:00',
        date_fin: '2026-01-15T11:00:00',
        chantier_id: 1,
        created_at: '2026-01-01T00:00:00',
      };

      const domainEvenement = adaptEvenement(apiEvenement);

      expect(domainEvenement.id).toBe(apiEvenement.id);
      expect(domainEvenement.type).toBe(apiEvenement.type);
      expect(domainEvenement.titre).toBe(apiEvenement.titre);
      expect(domainEvenement.date_debut).toBe(apiEvenement.date_debut);
    });
  });

  describe('adaptAbsence', () => {
    it('should adapt Absence to Domain Absence', () => {
      const apiAbsence: Absence = {
        id: 1,
        user_id: 1,
        chantier_id: 1,
        type: 'CONGÉ',
        date_debut: '2026-01-20',
        date_fin: '2026-01-25',
        motif: 'Vacances',
        created_at: '2026-01-01T00:00:00',
        employe_nom: 'John Doe',
        equipe_id: 1,
        statut: 'VALIDE',
      };

      const domainAbsence = adaptAbsence(apiAbsence);

      expect(domainAbsence.id).toBe(apiAbsence.id);
      expect(domainAbsence.user_id).toBe(apiAbsence.user_id);
      expect(domainAbsence.type).toBe(apiAbsence.type);
      expect(domainAbsence.statut).toBe(apiAbsence.statut);
    });
  });

  describe('adaptAffectation', () => {
    it('should adapt Affectation to Domain Affectation', () => {
      const apiAffectation: Affectation = {
        id: 1,
        user_id: 1,
        chantier_id: 1,
        role: 'Chef de projet',
        date_debut: '2026-01-01',
        date_fin: '2026-12-31',
        est_suralloue: false,
        created_at: '2026-01-01T00:00:00',
        user_nom: 'John Doe',
        chantier_nom: 'Chantier Test',
      };

      const domainAffectation = adaptAffectation(apiAffectation);

      expect(domainAffectation.id).toBe(apiAffectation.id);
      expect(domainAffectation.user_id).toBe(apiAffectation.user_id);
      expect(domainAffectation.est_suralloue).toBe(apiAffectation.est_suralloue);
    });
  });

  describe('adaptJalon', () => {
    it('should adapt Jalon to Domain Jalon', () => {
      const apiJalon: Jalon = {
        id: 1,
        chantier_id: 1,
        libelle: 'Jalon Test',
        type: 'SLA',
        date_debut: '2026-01-01',
        date_fin: '2026-01-15',
        est_retard: false,
        est_sla_risque: false,
        statut: 'À venir',
        created_at: '2026-01-01T00:00:00',
      };

      const domainJalon = adaptJalon(apiJalon);

      expect(domainJalon.id).toBe(apiJalon.id);
      expect(domainJalon.libelle).toBe(apiJalon.libelle);
      expect(domainJalon.type).toBe(apiJalon.type);
    });
  });

  describe('adaptCalendrierAlerte', () => {
    it('should adapt CalendrierAlerte to Domain CalendrierAlerte', () => {
      const apiAlerte: CalendrierAlerte = {
        id: 1,
        type: 'SLA_RISQUE',
        jalon_id: 1,
        chantier_id: 1,
        user_id: null,
        date_declenchement: '2026-01-15T00:00:00',
        est_resolue: false,
        resolue_at: null,
        created_at: '2026-01-15T00:00:00',
        jalon_libelle: 'Jalon Test',
        chantier_nom: 'Chantier Test',
        user_nom: null,
      };

      const domainAlerte = adaptCalendrierAlerte(apiAlerte);

      expect(domainAlerte.id).toBe(apiAlerte.id);
      expect(domainAlerte.type).toBe(apiAlerte.type);
      expect(domainAlerte.est_resolue).toBe(apiAlerte.est_resolue);
    });
  });

  describe('adaptCalendrierData', () => {
    it('should adapt complete data structure', () => {
      const evenements: EvenementCalendrier[] = [];
      const jalons: Jalon[] = [];
      const absences: Absence[] = [];
      const affectations: Affectation[] = [];
      const alertes: CalendrierAlerte[] = [];

      const domainData = adaptCalendrierData(
        evenements,
        jalons,
        absences,
        affectations,
        alertes
      );

      expect(domainData).toBeDefined();
      expect(domainData.evenements).toBeDefined();
      expect(domainData.jalons).toBeDefined();
      expect(domainData.absences).toBeDefined();
      expect(domainData.affectations).toBeDefined();
      expect(domainData.alertes).toBeDefined();
    });
  });

  describe('adaptCalendrierOverview', () => {
    it('should adapt overview response', () => {
      const apiOverview: CalendrierOverviewResponse = {
        jalons: [],
        evenements: [],
        absences: [],
        chantiers: [],
        stats: {
          jalons_at_risk_count: 2,
          jalons_retard_count: 1,
          jalons_total_count: 10,
          retards_detectes_count: 1,
          sur_allocation_ressources_count: 0,
        },
      };

      const domainOverview = adaptCalendrierOverview(apiOverview);

      expect(domainOverview).toBeDefined();
      expect(domainOverview.jalons_total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('adaptCalendrierStats', () => {
    it('should adapt stats response', () => {
      const apiStats: ApiCalendrierStats = {
        jalons_at_risk_count: 2,
        jalons_retard_count: 1,
        jalons_total_count: 10,
        retards_detectes_count: 1,
        sur_allocation_ressources_count: 0,
        jalons_total: 10,
        jalons_retard: 1,
        evenements_total: 5,
        evenements_aujourdhui: 2,
        evenements_semaine: 3,
        evenements_mois: 5,
        jalons_sla_risque: 2,
        absences_total: 1,
        sur_allocations: 0,
        conflits_detectes: 0,
        taux_conformite_sla: 80,
        temps_moyen_completion: 5,
      };

      const domainStats = adaptCalendrierStats(apiStats);

      expect(domainStats).toBeDefined();
      expect(domainStats.jalons_total).toBe(10);
      expect(domainStats.jalons_retard).toBe(1);
    });
  });
});
