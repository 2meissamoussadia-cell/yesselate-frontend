/**
 * Advanced Date Utilities
 * Helpers pour les dates avancées
 */

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInQuarters,
  differenceInYears,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameQuarter,
  isSameYear,
  isBefore,
  isAfter,
  isEqual,
  format,
  parseISO,
  isValid,
  isWeekend,
  getDay,
  getWeek,
  getMonth,
  getQuarter,
  getYear,
} from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Obtient le premier jour de la semaine (lundi)
 */
export function getFirstDayOfWeek(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1, locale: fr });
}

/**
 * Obtient le dernier jour de la semaine (dimanche)
 */
export function getLastDayOfWeek(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1, locale: fr });
}

/**
 * Obtient le premier jour du mois
 */
export function getFirstDayOfMonth(date: Date = new Date()): Date {
  return startOfMonth(date);
}

/**
 * Obtient le dernier jour du mois
 */
export function getLastDayOfMonth(date: Date = new Date()): Date {
  return endOfMonth(date);
}

/**
 * Obtient le premier jour du trimestre
 */
export function getFirstDayOfQuarter(date: Date = new Date()): Date {
  return startOfQuarter(date);
}

/**
 * Obtient le dernier jour du trimestre
 */
export function getLastDayOfQuarter(date: Date = new Date()): Date {
  return endOfQuarter(date);
}

/**
 * Obtient le premier jour de l'année
 */
export function getFirstDayOfYear(date: Date = new Date()): Date {
  return startOfYear(date);
}

/**
 * Obtient le dernier jour de l'année
 */
export function getLastDayOfYear(date: Date = new Date()): Date {
  return endOfYear(date);
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Vérifie si une date est hier
 */
export function isYesterday(date: Date): boolean {
  return isSameDay(date, subDays(new Date(), 1));
}

/**
 * Vérifie si une date est demain
 */
export function isTomorrow(date: Date): boolean {
  return isSameDay(date, addDays(new Date(), 1));
}

/**
 * Vérifie si une date est dans la semaine en cours
 */
export function isThisWeek(date: Date): boolean {
  return isSameWeek(date, new Date(), { weekStartsOn: 1, locale: fr });
}

/**
 * Vérifie si une date est dans le mois en cours
 */
export function isThisMonth(date: Date): boolean {
  return isSameMonth(date, new Date());
}

/**
 * Vérifie si une date est dans le trimestre en cours
 */
export function isThisQuarter(date: Date): boolean {
  return isSameQuarter(date, new Date());
}

/**
 * Vérifie si une date est dans l'année en cours
 */
export function isThisYear(date: Date): boolean {
  return isSameYear(date, new Date());
}

/**
 * Obtient l'âge à partir d'une date de naissance
 */
export function getAge(birthDate: Date): number {
  return differenceInYears(new Date(), birthDate);
}

/**
 * Formate une date relative (il y a X jours, dans X jours)
 */
export function formatRelativeDateAdvanced(date: Date): string {
  const now = new Date();
  const diffInDays = differenceInDays(now, date);

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return 'Hier';
  if (diffInDays === -1) return 'Demain';
  if (diffInDays > 0 && diffInDays <= 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  if (diffInDays < 0 && diffInDays >= -7) return `Dans ${Math.abs(diffInDays)} jour${Math.abs(diffInDays) > 1 ? 's' : ''}`;

  return format(date, 'dd/MM/yyyy', { locale: fr });
}

/**
 * Formate une durée entre deux dates
 */
export function formatDateDuration(startDate: Date, endDate: Date): string {
  const days = differenceInDays(endDate, startDate);
  const hours = differenceInHours(endDate, startDate);
  const minutes = differenceInMinutes(endDate, startDate);
  const seconds = differenceInSeconds(endDate, startDate);

  if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
}

/**
 * Obtient toutes les dates d'un mois
 */
export function getDatesInMonth(date: Date = new Date()): Date[] {
  const firstDay = getFirstDayOfMonth(date);
  const lastDay = getLastDayOfMonth(date);
  const dates: Date[] = [];

  for (let d = new Date(firstDay); d <= lastDay; d = addDays(d, 1)) {
    dates.push(new Date(d));
  }

  return dates;
}

/**
 * Obtient toutes les dates d'une semaine
 */
export function getDatesInWeek(date: Date = new Date()): Date[] {
  const firstDay = getFirstDayOfWeek(date);
  const dates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(firstDay, i));
  }

  return dates;
}

/**
 * Obtient le numéro de semaine dans l'année
 */
export function getWeekNumber(date: Date = new Date()): number {
  return getWeek(date, { weekStartsOn: 1, locale: fr });
}

/**
 * Obtient le numéro de trimestre
 */
export function getQuarterNumber(date: Date = new Date()): number {
  return getQuarter(date);
}

/**
 * Vérifie si une date est un jour de semaine (lundi-vendredi)
 */
function isWeekday(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Vérifie si une date est un jour ouvrable
 */
export function isBusinessDay(date: Date): boolean {
  return isWeekday(date);
}

/**
 * Obtient le prochain jour ouvrable
 */
export function getNextBusinessDay(date: Date = new Date()): Date {
  let nextDay = addDays(date, 1);
  while (isWeekend(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
}

/**
 * Obtient le jour ouvrable précédent
 */
export function getPreviousBusinessDay(date: Date = new Date()): Date {
  let prevDay = subDays(date, 1);
  while (isWeekend(prevDay)) {
    prevDay = subDays(prevDay, 1);
  }
  return prevDay;
}

/**
 * Compte les jours ouvrables entre deux dates
 */
export function countBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  let current = new Date(startDate);

  while (current <= endDate) {
    if (isBusinessDay(current)) {
      count++;
    }
    current = addDays(current, 1);
  }

  return count;
}
