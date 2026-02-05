/**
 * Utilitaires de formatage de dates/heures
 * =========================================
 * 
 * Formatage précis sans "environ" pour un ERP professionnel.
 * Inclut tooltip avec date/heure exacte.
 */

import { formatDistanceToNowStrict, format, isToday, isYesterday, isThisWeek, isThisYear, type Locale } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Options de formatage
 */
export interface FormatTimeOptions {
  /** Afficher "il y a" avant la durée relative */
  addSuffix?: boolean;
  /** Format de la date exacte (pour tooltip) */
  exactFormat?: string;
  /** Locale */
  locale?: Locale;
}

/**
 * Formate une date en durée relative PRÉCISE (sans "environ")
 * 
 * Exemples :
 * - "il y a 5 minutes" (pas "il y a environ 5 minutes")
 * - "il y a 2 heures"
 * - "hier à 14:30"
 * - "lundi à 09:15"
 * - "12 janvier"
 * - "12 janvier 2025"
 */
export function formatRelativeTime(
  date: Date | string | number,
  options: FormatTimeOptions = {}
): string {
  const { addSuffix = true, locale = fr } = options;
  
  const d = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(d.getTime())) {
    return '—';
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  // Moins d'une minute
  if (diffMinutes < 1) {
    return "à l'instant";
  }
  
  // Moins d'une heure : afficher les minutes
  if (diffMinutes < 60) {
    return addSuffix 
      ? `il y a ${diffMinutes} min`
      : `${diffMinutes} min`;
  }
  
  // Moins de 24h : afficher les heures
  if (diffHours < 24) {
    return addSuffix
      ? `il y a ${diffHours}h`
      : `${diffHours}h`;
  }
  
  // Hier
  if (isYesterday(d)) {
    return `hier à ${format(d, 'HH:mm', { locale })}`;
  }
  
  // Cette semaine
  if (isThisWeek(d)) {
    return format(d, "EEEE 'à' HH:mm", { locale });
  }
  
  // Cette année
  if (isThisYear(d)) {
    return format(d, 'd MMMM', { locale });
  }
  
  // Année différente
  return format(d, 'd MMMM yyyy', { locale });
}

/**
 * Formate une date pour affichage en tooltip (date + heure exactes)
 */
export function formatExactDateTime(
  date: Date | string | number,
  options: FormatTimeOptions = {}
): string {
  const { exactFormat = "EEEE d MMMM yyyy 'à' HH:mm", locale = fr } = options;
  
  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  
  if (isNaN(d.getTime())) {
    return '—';
  }
  
  return format(d, exactFormat, { locale });
}

/**
 * Formate une date pour affichage court (tableaux, listes)
 */
export function formatShortDate(
  date: Date | string | number,
  options: FormatTimeOptions = {}
): string {
  const { locale = fr } = options;
  
  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  
  if (isNaN(d.getTime())) {
    return '—';
  }
  
  if (isToday(d)) {
    return format(d, 'HH:mm', { locale });
  }
  
  if (isYesterday(d)) {
    return 'Hier';
  }
  
  if (isThisWeek(d)) {
    return format(d, 'EEE', { locale });
  }
  
  if (isThisYear(d)) {
    return format(d, 'd MMM', { locale });
  }
  
  return format(d, 'dd/MM/yy', { locale });
}

/**
 * Formate une durée en heures/minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Formate une échéance avec indicateur de retard
 */
export function formatDeadline(
  date: Date | string | number
): { text: string; isOverdue: boolean; isDueSoon: boolean } {
  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  
  if (isNaN(d.getTime())) {
    return { text: '—', isOverdue: false, isDueSoon: false };
  }
  
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffHours = diffMs / 3600000;
  const diffDays = diffMs / 86400000;
  
  const isOverdue = diffMs < 0;
  const isDueSoon = !isOverdue && diffHours < 24;
  
  if (isOverdue) {
    const overdueHours = Math.abs(diffHours);
    if (overdueHours < 24) {
      return { 
        text: `En retard de ${Math.ceil(overdueHours)}h`, 
        isOverdue: true, 
        isDueSoon: false 
      };
    }
    return { 
      text: `En retard de ${Math.ceil(Math.abs(diffDays))}j`, 
      isOverdue: true, 
      isDueSoon: false 
    };
  }
  
  if (isDueSoon) {
    if (diffHours < 1) {
      return { text: 'Dans moins d\'1h', isOverdue: false, isDueSoon: true };
    }
    return { 
      text: `Dans ${Math.ceil(diffHours)}h`, 
      isOverdue: false, 
      isDueSoon: true 
    };
  }
  
  if (diffDays < 7) {
    return { 
      text: `Dans ${Math.ceil(diffDays)}j`, 
      isOverdue: false, 
      isDueSoon: false 
    };
  }
  
  return { 
    text: formatShortDate(d), 
    isOverdue: false, 
    isDueSoon: false 
  };
}
