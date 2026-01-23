/**
 * Hook React pour utiliser les services du domaine Calendrier
 * Fournit une interface réactive pour les calculs et validations
 */

'use client';

import { useMemo } from 'react';
import {
  CalendrierService,
  SLAService,
  ConflitService,
  RecurrenceService,
  PermissionService,
} from '@/domain/calendrier/services';
import type {
  CalendrierData,
  CalendrierOverview,
  CalendrierStats,
  CalendrierFilters,
  Evenement,
  Jalon,
  Absence,
  Affectation,
} from '@/domain/calendrier/types';

export function useCalendrierService(data: CalendrierData | null) {
  // Vue d'ensemble
  const overview = useMemo(() => {
    if (!data) return null;
    return CalendrierService.calculateOverview(data);
  }, [data]);

  // Statistiques
  const stats = useMemo(() => {
    if (!data) return null;
    return CalendrierService.calculateStats(data);
  }, [data]);

  // Conflits
  const conflits = useMemo(() => {
    if (!data) return null;
    return ConflitService.detectAllConflits(data);
  }, [data]);

  // SLA
  const slaMetrics = useMemo(() => {
    if (!data) return null;
    return data.jalons
      .filter(j => j.type === 'SLA')
      .map(j => SLAService.calculateMetrics(j));
  }, [data]);

  const slaAlerts = useMemo(() => {
    if (!data) return null;
    return data.jalons
      .filter(j => j.type === 'SLA')
      .flatMap(j => SLAService.getAlerts(j));
  }, [data]);

  // Fonctions de filtrage
  const filterData = useMemo(() => {
    return (filters: CalendrierFilters) => {
      if (!data) return null;
      return CalendrierService.filterData(data, filters);
    };
  }, [data]);

  // Fonctions de tri
  const sortSLAJalonsByPriority = useMemo(() => {
    return () => {
      if (!data) return [];
      return SLAService.sortByPriority(data.jalons);
    };
  }, [data]);

  return {
    // Données de base
    data,
    
    // Vue d'ensemble et stats
    overview,
    stats,
    
    // Conflits
    conflits,
    hasConflits: conflits ? conflits.total > 0 : false,
    criticalConflits: conflits ? conflits.critical : 0,
    
    // SLA
    slaMetrics,
    slaAlerts,
    slaConformityRate: data
      ? SLAService.calculateConformityRate(data.jalons)
      : 100,
    
    // Fonctions de filtrage
    filterData,
    
    // Fonctions de tri
    sortSLAJalonsByPriority,
    
    // Services directs (pour utilisation avancée)
    services: {
      calendrier: CalendrierService,
      sla: SLAService,
      conflit: ConflitService,
      recurrence: RecurrenceService,
      permission: PermissionService,
    },
  };
}
