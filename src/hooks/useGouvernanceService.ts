/**
 * Hook React pour utiliser les services du domaine Gouvernance
 * Fournit une interface réactive pour les calculs et validations
 */

'use client';

import { useMemo } from 'react';
import {
  GouvernanceService,
  ProjetService,
  BudgetService,
  JalonService,
  RisqueService,
  ValidationService,
} from '@/domain/gouvernance/services';
import type {
  GouvernanceData,
  GouvernanceOverview,
  GouvernanceStats,
  TendanceMensuelle,
  GouvernanceFilters,
  Projet,
  Budget,
  Jalon,
  Risque,
  Validation,
} from '@/domain/gouvernance/types';

export function useGouvernanceService(data: GouvernanceData | null) {
  // Vue d'ensemble
  const overview = useMemo(() => {
    if (!data) return null;
    return GouvernanceService.calculateOverview(data);
  }, [data]);

  // Statistiques
  const stats = useMemo(() => {
    if (!data) return null;
    return GouvernanceService.calculateStats(data);
  }, [data]);

  // Tendances mensuelles
  const tendances = useMemo(() => {
    if (!data) return null;
    return GouvernanceService.calculateTendances(data, 12);
  }, [data]);

  // Projets
  const projetsMetrics = useMemo(() => {
    if (!data) return null;
    return data.projets.map(p => ProjetService.calculateMetrics(p));
  }, [data]);

  const projetsSummaries = useMemo(() => {
    if (!data) return null;
    return data.projets.map(p => ProjetService.generateSummary(p));
  }, [data]);

  // Budgets
  const budgetsMetrics = useMemo(() => {
    if (!data) return null;
    return data.budgets.map(b => BudgetService.calculateMetrics(b));
  }, [data]);

  const budgetsAlerts = useMemo(() => {
    if (!data) return null;
    return data.budgets.flatMap(b => BudgetService.getAlerts(b));
  }, [data]);

  // Jalons
  const jalonsMetrics = useMemo(() => {
    if (!data) return null;
    return data.jalons.map(j => JalonService.calculateMetrics(j));
  }, [data]);

  const jalonsAlerts = useMemo(() => {
    if (!data) return null;
    return data.jalons.flatMap(j => JalonService.getAlerts(j));
  }, [data]);

  // Risques
  const risquesMetrics = useMemo(() => {
    if (!data) return null;
    return data.risques.map(r => RisqueService.calculateMetrics(r));
  }, [data]);

  const risquesAlerts = useMemo(() => {
    if (!data) return null;
    return data.risques.flatMap(r => RisqueService.getAlerts(r));
  }, [data]);

  // Validations
  const validationsMetrics = useMemo(() => {
    if (!data) return null;
    return data.validations.map(v => ValidationService.calculateMetrics(v));
  }, [data]);

  const validationsAlerts = useMemo(() => {
    if (!data) return null;
    return data.validations.flatMap(v => ValidationService.getAlerts(v));
  }, [data]);

  // Fonctions de filtrage
  const filterData = useMemo(() => {
    return (filters: GouvernanceFilters) => {
      if (!data) return null;
      return GouvernanceService.filterData(data, filters);
    };
  }, [data]);

  const filterProjets = useMemo(() => {
    return (filters: { bureau?: string; statut?: string; search?: string }) => {
      if (!data) return [];
      return ProjetService.filterProjets(data.projets, filters);
    };
  }, [data]);

  const filterBudgets = useMemo(() => {
    return (filters: { bureau?: string; projet_id?: number; statut?: string }) => {
      if (!data) return [];
      return BudgetService.filterBudgets(data.budgets, filters);
    };
  }, [data]);

  const filterJalons = useMemo(() => {
    return (filters: {
      bureau?: string;
      projet_id?: number;
      type?: string;
      statut?: string;
      est_retard?: boolean;
      est_sla_risque?: boolean;
    }) => {
      if (!data) return [];
      return JalonService.filterJalons(data.jalons, filters);
    };
  }, [data]);

  const filterRisques = useMemo(() => {
    return (filters: {
      bureau?: string;
      projet_id?: number;
      severite?: string;
      statut?: string;
    }) => {
      if (!data) return [];
      return RisqueService.filterRisques(data.risques, filters);
    };
  }, [data]);

  const filterValidations = useMemo(() => {
    return (filters: {
      bureau?: string;
      projet_id?: number;
      statut?: string;
      type?: string;
    }) => {
      if (!data) return [];
      return ValidationService.filterValidations(data.validations, filters);
    };
  }, [data]);

  // Fonctions de tri
  const sortProjetsByPriority = useMemo(() => {
    return () => {
      if (!data) return [];
      return ProjetService.sortByPriority(data.projets);
    };
  }, [data]);

  const sortJalonsByPriority = useMemo(() => {
    return () => {
      if (!data) return [];
      return JalonService.sortByPriority(data.jalons);
    };
  }, [data]);

  const sortRisquesByCriticite = useMemo(() => {
    return () => {
      if (!data) return [];
      return RisqueService.sortByCriticite(data.risques);
    };
  }, [data]);

  const sortValidationsByPriority = useMemo(() => {
    return () => {
      if (!data) return [];
      return ValidationService.sortByPriority(data.validations);
    };
  }, [data]);

  return {
    // Données de base
    data,
    
    // Vue d'ensemble et stats
    overview,
    stats,
    tendances,
    
    // Métriques par type
    projetsMetrics,
    projetsSummaries,
    budgetsMetrics,
    jalonsMetrics,
    risquesMetrics,
    validationsMetrics,
    
    // Alertes
    budgetsAlerts,
    jalonsAlerts,
    risquesAlerts,
    validationsAlerts,
    
    // Fonctions de filtrage
    filterData,
    filterProjets,
    filterBudgets,
    filterJalons,
    filterRisques,
    filterValidations,
    
    // Fonctions de tri
    sortProjetsByPriority,
    sortJalonsByPriority,
    sortRisquesByCriticite,
    sortValidationsByPriority,
    
    // Services directs (pour utilisation avancée)
    services: {
      gouvernance: GouvernanceService,
      projet: ProjetService,
      budget: BudgetService,
      jalon: JalonService,
      risque: RisqueService,
      validation: ValidationService,
    },
  };
}
