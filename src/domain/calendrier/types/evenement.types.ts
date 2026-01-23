/**
 * Types spécifiques pour les événements du calendrier
 */

import type { Evenement } from './calendrier.types';

export interface EvenementMetrics {
  duree_minutes: number;
  is_past: boolean;
  is_today: boolean;
  is_upcoming: boolean;
  jours_restants?: number;
  is_conflict: boolean;
  conflits_count: number;
}

export interface EvenementConflict {
  type: 'overlap' | 'resource' | 'location' | 'time';
  evenement_id: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export function calculateDureeMinutes(evenement: Evenement): number {
  if (!evenement.date_debut || !evenement.date_fin) return 0;
  
  const debut = new Date(evenement.date_debut);
  const fin = new Date(evenement.date_fin);
  
  return Math.round((fin.getTime() - debut.getTime()) / (1000 * 60));
}

export function isEvenementPast(evenement: Evenement): boolean {
  if (!evenement.date_fin) return false;
  return new Date(evenement.date_fin) < new Date();
}

export function isEvenementToday(evenement: Evenement): boolean {
  if (!evenement.date_debut) return false;
  
  const aujourdhui = new Date();
  const dateEvent = new Date(evenement.date_debut);
  
  return (
    dateEvent.getDate() === aujourdhui.getDate() &&
    dateEvent.getMonth() === aujourdhui.getMonth() &&
    dateEvent.getFullYear() === aujourdhui.getFullYear()
  );
}

export function isEvenementUpcoming(evenement: Evenement): boolean {
  if (!evenement.date_debut) return false;
  return new Date(evenement.date_debut) > new Date();
}

export function calculateJoursRestants(evenement: Evenement): number | undefined {
  if (!evenement.date_debut || isEvenementPast(evenement)) return undefined;
  
  const aujourdhui = new Date();
  const dateEvent = new Date(evenement.date_debut);
  aujourdhui.setHours(0, 0, 0, 0);
  dateEvent.setHours(0, 0, 0, 0);
  
  return Math.floor((dateEvent.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateEvenementMetrics(evenement: Evenement): EvenementMetrics {
  return {
    duree_minutes: calculateDureeMinutes(evenement),
    is_past: isEvenementPast(evenement),
    is_today: isEvenementToday(evenement),
    is_upcoming: isEvenementUpcoming(evenement),
    jours_restants: calculateJoursRestants(evenement),
    is_conflict: evenement.is_conflict || false,
    conflits_count: 0, // À calculer avec ConflitService
  };
}
