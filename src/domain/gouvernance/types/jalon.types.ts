/**
 * Types spécifiques pour les jalons de gouvernance
 */

import type { Jalon, JalonStatut } from './gouvernance.types';
export type { Jalon, JalonStatut } from './gouvernance.types';

export interface JalonMetrics {
  is_overdue: boolean;
  retard_jours: number;
  is_sla_risque: boolean;
  jours_restants?: number;
  criticite: 'low' | 'medium' | 'high' | 'critical';
}

export interface JalonAlert {
  type: 'overdue' | 'sla_risque' | 'upcoming';
  message: string;
  action_required: boolean;
}

export function calculateRetardJours(jalon: Jalon): number {
  if (!jalon.date_prevue) return 0;
  
  const datePrevue = new Date(jalon.date_prevue);
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  datePrevue.setHours(0, 0, 0, 0);
  
  if (jalon.date_reelle) {
    const dateReelle = new Date(jalon.date_reelle);
    dateReelle.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((dateReelle.getTime() - datePrevue.getTime()) / (1000 * 60 * 60 * 24)));
  }
  
  if (datePrevue < aujourdhui && jalon.statut !== 'completed') {
    return Math.floor((aujourdhui.getTime() - datePrevue.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  return 0;
}

export function isJalonOverdue(jalon: Jalon): boolean {
  return calculateRetardJours(jalon) > 0;
}

export function isJalonSLARisque(jalon: Jalon): boolean {
  if (!jalon.date_prevue) return false;
  if (jalon.type !== 'SLA') return false;
  if (jalon.statut === 'completed') return false;
  
  const datePrevue = new Date(jalon.date_prevue);
  const aujourdhui = new Date();
  const joursRestants = Math.floor((datePrevue.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));
  
  // SLA à risque si moins de 7 jours restants
  return joursRestants <= 7 && joursRestants > 0;
}

export function calculateJalonCriticite(jalon: Jalon): 'low' | 'medium' | 'high' | 'critical' {
  const retardJours = calculateRetardJours(jalon);
  
  if (retardJours > 30) return 'critical';
  if (retardJours > 14) return 'high';
  if (retardJours > 7 || isJalonSLARisque(jalon)) return 'medium';
  return 'low';
}

export function calculateJalonMetrics(jalon: Jalon): JalonMetrics {
  const retardJours = calculateRetardJours(jalon);
  const isOverdue = isJalonOverdue(jalon);
  const isSLARisque = isJalonSLARisque(jalon);
  
  let joursRestants: number | undefined;
  if (jalon.date_prevue && !isOverdue) {
    const datePrevue = new Date(jalon.date_prevue);
    const aujourdhui = new Date();
    joursRestants = Math.floor((datePrevue.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  return {
    is_overdue: isOverdue,
    retard_jours: retardJours,
    is_sla_risque: isSLARisque,
    jours_restants: joursRestants,
    criticite: calculateJalonCriticite(jalon),
  };
}

export function getJalonAlerts(jalon: Jalon): JalonAlert[] {
  const alerts: JalonAlert[] = [];
  const metrics = calculateJalonMetrics(jalon);
  
  if (metrics.is_overdue) {
    alerts.push({
      type: 'overdue',
      message: `Jalon en retard de ${metrics.retard_jours} jour(s)`,
      action_required: true,
    });
  } else if (metrics.is_sla_risque) {
    alerts.push({
      type: 'sla_risque',
      message: `SLA à risque: ${metrics.jours_restants} jour(s) restant(s)`,
      action_required: true,
    });
  } else if (metrics.jours_restants && metrics.jours_restants <= 14) {
    alerts.push({
      type: 'upcoming',
      message: `Jalon à venir dans ${metrics.jours_restants} jour(s)`,
      action_required: false,
    });
  }
  
  return alerts;
}
