/**
 * Service principal pour le domaine Calendrier
 * Calcule les vues d'ensemble et statistiques globales
 */

import type {
  CalendrierData,
  CalendrierOverview,
  CalendrierStats,
  CalendrierFilters,
} from '../types/calendrier.types';
import { SLAService } from './sla.service';
import { ConflitService } from './conflit.service';
import { isEvenementToday, isEvenementPast } from '../types/evenement.types';
import { isSLAAtRisk, isSLAOverdue } from '../types/sla.types';

export class CalendrierService {
  /**
   * Calcule la vue d'ensemble du calendrier
   */
  static calculateOverview(data: CalendrierData): CalendrierOverview {
    const aujourdhui = new Date();
    const debutSemaine = new Date(aujourdhui);
    debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay());
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);

    // Événements
    const evenementsTotal = data.evenements.length;
    const evenementsAujourdhui = data.evenements.filter(e => isEvenementToday(e)).length;
    const evenementsSemaine = data.evenements.filter(e => {
      if (!e.date_debut) return false;
      const dateEvent = new Date(e.date_debut);
      return dateEvent >= debutSemaine && dateEvent <= finSemaine;
    }).length;

    // Jalons
    const jalonsTotal = data.jalons.length;
    const jalonsRetard = data.jalons.filter(j => j.est_retard).length;
    const jalonsSLARisque = data.jalons.filter(j => isSLAAtRisk(j)).length;

    // Absences
    const absencesTotal = data.absences.length;

    // Sur-allocations
    const surAllocations = data.affectations.filter(a => a.est_suralloue).length;

    // Conflits
    const conflitsDetectes = ConflitService.detectAllConflits(data).total;

    return {
      evenements_total: evenementsTotal,
      evenements_aujourdhui: evenementsAujourdhui,
      evenements_semaine: evenementsSemaine,
      jalons_total: jalonsTotal,
      jalons_retard: jalonsRetard,
      jalons_sla_risque: jalonsSLARisque,
      absences_total: absencesTotal,
      sur_allocations: surAllocations,
      conflits_detectes: conflitsDetectes,
    };
  }

  /**
   * Calcule les statistiques globales du calendrier
   */
  static calculateStats(data: CalendrierData): CalendrierStats {
    const aujourdhui = new Date();
    const debutSemaine = new Date(aujourdhui);
    debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay());
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(debutSemaine.getDate() + 6);
    
    const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
    const finMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() + 1, 0);

    // Événements
    const evenementsTotal = data.evenements.length;
    const evenementsAujourdhui = data.evenements.filter(e => isEvenementToday(e)).length;
    const evenementsSemaine = data.evenements.filter(e => {
      if (!e.date_debut) return false;
      const dateEvent = new Date(e.date_debut);
      return dateEvent >= debutSemaine && dateEvent <= finSemaine;
    }).length;
    const evenementsMois = data.evenements.filter(e => {
      if (!e.date_debut) return false;
      const dateEvent = new Date(e.date_debut);
      return dateEvent >= debutMois && dateEvent <= finMois;
    }).length;

    // Jalons
    const jalonsTotal = data.jalons.length;
    const jalonsRetard = data.jalons.filter(j => j.est_retard).length;
    const jalonsSLARisque = data.jalons.filter(j => isSLAAtRisk(j)).length;

    // Absences
    const absencesTotal = data.absences.length;

    // Sur-allocations
    const surAllocations = data.affectations.filter(a => a.est_suralloue).length;

    // Conflits
    const conflitsResult = ConflitService.detectAllConflits(data);
    const conflitsDetectes = conflitsResult.total;

    // Taux conformité SLA
    const jalonsSLA = data.jalons.filter(j => j.type === 'SLA');
    const jalonsSLATermines = jalonsSLA.filter(j => j.statut === 'Terminé');
    const tauxConformiteSLA = jalonsSLA.length > 0
      ? (jalonsSLATermines.length / jalonsSLA.length) * 100
      : 100;

    // Temps moyen de complétion (simplifié)
    const evenementsTermines = data.evenements.filter(e => isEvenementPast(e));
    let tempsMoyenCompletion = 0;
    if (evenementsTermines.length > 0) {
      const totalMinutes = evenementsTermines.reduce((sum, e) => {
        if (!e.date_debut || !e.date_fin) return sum;
        const debut = new Date(e.date_debut);
        const fin = new Date(e.date_fin);
        return sum + Math.round((fin.getTime() - debut.getTime()) / (1000 * 60));
      }, 0);
      tempsMoyenCompletion = Math.round(totalMinutes / evenementsTermines.length);
    }

    return {
      evenements_total: evenementsTotal,
      evenements_aujourdhui: evenementsAujourdhui,
      evenements_semaine: evenementsSemaine,
      evenements_mois: evenementsMois,
      jalons_total: jalonsTotal,
      jalons_retard: jalonsRetard,
      jalons_sla_risque: jalonsSLARisque,
      absences_total: absencesTotal,
      sur_allocations: surAllocations,
      conflits_detectes: conflitsDetectes,
      taux_conformite_sla: tauxConformiteSLA,
      temps_moyen_completion: tempsMoyenCompletion,
    };
  }

  /**
   * Filtre les données selon les critères
   */
  static filterData(
    data: CalendrierData,
    filters: CalendrierFilters
  ): CalendrierData {
    let evenements = [...data.evenements];
    let jalons = [...data.jalons];
    let absences = [...data.absences];
    let affectations = [...data.affectations];
    let alertes = [...data.alertes];

    // Filtre par chantier
    if (filters.chantier_id) {
      evenements = evenements.filter(e => e.chantier_id === filters.chantier_id);
      jalons = jalons.filter(j => j.chantier_id === filters.chantier_id);
      absences = absences.filter(a => a.chantier_id === filters.chantier_id);
      affectations = affectations.filter(a => a.chantier_id === filters.chantier_id);
      alertes = alertes.filter(a => a.chantier_id === filters.chantier_id);
    }

    // Filtre par équipe (via absences/affectations)
    if (filters.equipe_id) {
      absences = absences.filter(a => a.equipe_id === filters.equipe_id);
      affectations = affectations.filter(a => {
        // Logique à adapter selon structure réelle
        return true;
      });
    }

    // Filtre par user
    if (filters.user_id) {
      absences = absences.filter(a => a.user_id === filters.user_id);
      affectations = affectations.filter(a => a.user_id === filters.user_id);
      alertes = alertes.filter(a => a.user_id === filters.user_id);
    }

    // Filtre par dates
    if (filters.date_debut || filters.date_fin) {
      if (filters.date_debut) {
        const dateDebut = new Date(filters.date_debut);
        evenements = evenements.filter(e => {
          if (!e.date_debut) return false;
          return new Date(e.date_debut) >= dateDebut;
        });
        jalons = jalons.filter(j => {
          if (!j.date_debut) return false;
          return new Date(j.date_debut) >= dateDebut;
        });
        absences = absences.filter(a => {
          if (!a.date_debut) return false;
          return new Date(a.date_debut) >= dateDebut;
        });
      }
      
      if (filters.date_fin) {
        const dateFin = new Date(filters.date_fin);
        evenements = evenements.filter(e => {
          if (!e.date_fin) return false;
          return new Date(e.date_fin) <= dateFin;
        });
        jalons = jalons.filter(j => {
          if (!j.date_fin) return false;
          return new Date(j.date_fin) <= dateFin;
        });
        absences = absences.filter(a => {
          if (!a.date_fin) return false;
          return new Date(a.date_fin) <= dateFin;
        });
      }
    }

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      evenements = evenements.filter(e =>
        e.titre?.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower)
      );
      jalons = jalons.filter(j =>
        j.libelle.toLowerCase().includes(searchLower)
      );
    }

    return {
      evenements,
      jalons,
      absences,
      affectations,
      alertes,
    };
  }
}
