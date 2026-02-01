/**
 * Types spécifiques pour la récurrence des événements
 */

import type { Recurrence, RecurrenceType } from './calendrier.types';

export type { Recurrence, RecurrenceType };

export interface RecurrencePattern {
  recurrence: Recurrence;
  occurrences: Date[]; // Dates générées
  nextOccurrence?: Date;
  isInfinite: boolean;
}

export function generateRecurrenceDates(
  startDate: Date,
  recurrence: Recurrence,
  endDate?: Date,
  maxOccurrences: number = 100
): Date[] {
  const dates: Date[] = [startDate];
  
  if (recurrence.type === 'none' || !recurrence.type) {
    return dates;
  }
  
  let currentDate = new Date(startDate);
  const interval = recurrence.interval || 1;
  
  while (dates.length < maxOccurrences) {
    // Vérifier date de fin
    if (recurrence.endDate) {
      const end = new Date(recurrence.endDate);
      if (currentDate > end) break;
    }
    
    // Vérifier nombre d'occurrences
    if (recurrence.count && dates.length >= recurrence.count) break;
    
    // Générer prochaine date selon type
    switch (recurrence.type) {
      case 'daily':
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + interval);
        break;
        
      case 'weekly':
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        // Si daysOfWeek spécifié, ajuster au jour de la semaine
        if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
          // Logique complexe pour jours spécifiques
          // Simplifié ici
        }
        break;
        
      case 'monthly':
        currentDate = new Date(currentDate);
        currentDate.setMonth(currentDate.getMonth() + interval);
        if (recurrence.dayOfMonth) {
          currentDate.setDate(recurrence.dayOfMonth);
        }
        break;
        
      case 'yearly':
        currentDate = new Date(currentDate);
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        if (recurrence.monthOfYear) {
          currentDate.setMonth(recurrence.monthOfYear - 1);
        }
        if (recurrence.dayOfMonth) {
          currentDate.setDate(recurrence.dayOfMonth);
        }
        break;
    }
    
    // Vérifier date de fin globale
    if (endDate && currentDate > endDate) break;
    
    dates.push(new Date(currentDate));
  }
  
  return dates;
}

export function calculateNextOccurrence(
  startDate: Date,
  recurrence: Recurrence
): Date | undefined {
  const dates = generateRecurrenceDates(startDate, recurrence, undefined, 2);
  return dates.length > 1 ? dates[1] : undefined;
}

export function isRecurrenceInfinite(recurrence: Recurrence): boolean {
  return !recurrence.endDate && !recurrence.count;
}
