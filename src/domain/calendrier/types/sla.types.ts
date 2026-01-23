/**
 * Types spécifiques pour les SLA du calendrier
 */

import type { Jalon } from './calendrier.types';

export interface SLAMetrics {
  jours_restants: number;
  jours_ecoules: number;
  pourcent_ecoule: number;
  is_at_risk: boolean;
  is_overdue: boolean;
  criticite: 'low' | 'medium' | 'high' | 'critical';
  seuil_alerte: number; // Jours avant échéance pour alerter
}

export interface SLAAlert {
  type: 'at_risk' | 'overdue' | 'upcoming';
  message: string;
  action_required: boolean;
  priorite: 'low' | 'medium' | 'high' | 'critical';
}

export function calculateJoursRestantsSLA(jalon: Jalon): number {
  if (!jalon.date_fin) return 0;
  if (jalon.statut === 'Terminé') return 0;
  
  const aujourdhui = new Date();
  const dateFin = new Date(jalon.date_fin);
  aujourdhui.setHours(0, 0, 0, 0);
  dateFin.setHours(0, 0, 0, 0);
  
  return Math.floor((dateFin.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateJoursEcoulesSLA(jalon: Jalon): number {
  if (!jalon.date_debut) return 0;
  
  const aujourdhui = new Date();
  const dateDebut = new Date(jalon.date_debut);
  aujourdhui.setHours(0, 0, 0, 0);
  dateDebut.setHours(0, 0, 0, 0);
  
  return Math.max(0, Math.floor((aujourdhui.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)));
}

export function isSLAAtRisk(jalon: Jalon): boolean {
  if (jalon.type !== 'SLA') return false;
  if (jalon.statut === 'Terminé') return false;
  
  const joursRestants = calculateJoursRestantsSLA(jalon);
  // SLA à risque si moins de 7 jours restants
  return joursRestants > 0 && joursRestants <= 7;
}

export function isSLAOverdue(jalon: Jalon): boolean {
  if (jalon.type !== 'SLA') return false;
  if (jalon.statut === 'Terminé') return false;
  
  const joursRestants = calculateJoursRestantsSLA(jalon);
  return joursRestants < 0;
}

export function calculateSLACriticite(jalon: Jalon): 'low' | 'medium' | 'high' | 'critical' {
  if (jalon.type !== 'SLA') return 'low';
  if (jalon.statut === 'Terminé') return 'low';
  
  const joursRestants = calculateJoursRestantsSLA(jalon);
  
  if (joursRestants < 0) return 'critical'; // En retard
  if (joursRestants <= 3) return 'high'; // Très proche
  if (joursRestants <= 7) return 'medium'; // À risque
  return 'low';
}

export function calculateSLAMetrics(jalon: Jalon): SLAMetrics {
  if (jalon.type !== 'SLA') {
    return {
      jours_restants: 0,
      jours_ecoules: 0,
      pourcent_ecoule: 0,
      is_at_risk: false,
      is_overdue: false,
      criticite: 'low',
      seuil_alerte: 7,
    };
  }
  
  const joursRestants = calculateJoursRestantsSLA(jalon);
  const joursEcoules = calculateJoursEcoulesSLA(jalon);
  
  let totalJours = 0;
  if (jalon.date_debut && jalon.date_fin) {
    const debut = new Date(jalon.date_debut);
    const fin = new Date(jalon.date_fin);
    totalJours = Math.floor((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  const pourcentEcoule = totalJours > 0 ? (joursEcoules / totalJours) * 100 : 0;
  
  return {
    jours_restants: joursRestants,
    jours_ecoules: joursEcoules,
    pourcent_ecoule: pourcentEcoule,
    is_at_risk: isSLAAtRisk(jalon),
    is_overdue: isSLAOverdue(jalon),
    criticite: calculateSLACriticite(jalon),
    seuil_alerte: 7,
  };
}

export function getSLAAlerts(jalon: Jalon): SLAAlert[] {
  const alerts: SLAAlert[] = [];
  const metrics = calculateSLAMetrics(jalon);
  
  if (metrics.is_overdue) {
    alerts.push({
      type: 'overdue',
      message: `SLA en retard de ${Math.abs(metrics.jours_restants)} jour(s)`,
      action_required: true,
      priorite: 'critical',
    });
  } else if (metrics.is_at_risk) {
    alerts.push({
      type: 'at_risk',
      message: `SLA à risque: ${metrics.jours_restants} jour(s) restant(s)`,
      action_required: true,
      priorite: metrics.criticite === 'high' ? 'high' : 'medium',
    });
  } else if (metrics.jours_restants <= 14 && metrics.jours_restants > 7) {
    alerts.push({
      type: 'upcoming',
      message: `SLA à venir dans ${metrics.jours_restants} jour(s)`,
      action_required: false,
      priorite: 'low',
    });
  }
  
  return alerts;
}
