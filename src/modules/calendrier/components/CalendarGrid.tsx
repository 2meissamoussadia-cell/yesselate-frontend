/**
 * Composant Calendrier Grid
 * Vue calendrier classique (mois/semaine)
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Jalon, EvenementCalendrier, Absence } from '../types/calendrierTypes';

interface CalendarGridProps {
  jalons?: Jalon[];
  evenements?: EvenementCalendrier[];
  absences?: Absence[];
  periode: 'semaine' | 'mois' | 'trimestre';
  chantierId?: number | null;
  dateDebut?: string;
  dateFin?: string;
  className?: string;
}

export function CalendarGrid({
  jalons = [],
  evenements = [],
  absences = [],
  periode,
  chantierId,
  dateDebut,
  dateFin,
  className,
}: CalendarGridProps) {
  // Filtrer par chantier si spécifié
  const filteredJalons = useMemo(() => {
    return chantierId
      ? jalons.filter((j) => j.chantier_id === chantierId)
      : jalons;
  }, [jalons, chantierId]);

  const filteredEvenements = useMemo(() => {
    return chantierId
      ? evenements.filter((e) => e.chantier_id === chantierId)
      : evenements;
  }, [evenements, chantierId]);

  const filteredAbsences = useMemo(() => {
    return chantierId
      ? absences.filter((a) => a.chantier_id === chantierId)
      : absences;
  }, [absences, chantierId]);

  // Générer les jours de la période
  const days = useMemo(() => {
    const start = dateDebut ? new Date(dateDebut) : new Date();
    const end = dateFin ? new Date(dateFin) : new Date();

    if (periode === 'semaine') {
      // Semaine en cours
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() - start.getDay());
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        days.push(day);
      }
      return days;
    } else if (periode === 'mois') {
      // Mois en cours
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      const days: Date[] = [];
      for (let i = 1; i <= monthEnd.getDate(); i++) {
        days.push(new Date(start.getFullYear(), start.getMonth(), i));
      }
      return days;
    } else {
      // Trimestre (simplifié: 3 mois)
      const days: Date[] = [];
      for (let m = 0; m < 3; m++) {
        const monthStart = new Date(start.getFullYear(), start.getMonth() + m, 1);
        const monthEnd = new Date(start.getFullYear(), start.getMonth() + m + 1, 0);
        for (let i = 1; i <= monthEnd.getDate(); i++) {
          days.push(new Date(start.getFullYear(), start.getMonth() + m, i));
        }
      }
      return days;
    }
  }, [periode, dateDebut, dateFin]);

  // Obtenir les événements pour un jour donné
  const getEventsForDay = (day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return {
      jalons: filteredJalons.filter(
        (j) =>
          (j.date_debut && j.date_fin && j.date_debut <= dayStr && j.date_fin >= dayStr) ||
          dayStr === j.date_debut ||
          dayStr === j.date_fin
      ),
      evenements: filteredEvenements.filter(
        (e) => {
          if (!e.date_debut || !e.date_fin) return false;
          const eventStart = e.date_debut.split('T')[0];
          const eventEnd = e.date_fin.split('T')[0];
          return (eventStart <= dayStr && eventEnd >= dayStr) ||
            dayStr === eventStart ||
            dayStr === eventEnd;
        }
      ),
      absences: filteredAbsences.filter(
        (a) =>
          (a.date_debut && a.date_fin && a.date_debut <= dayStr && a.date_fin >= dayStr) ||
          dayStr === a.date_debut ||
          dayStr === a.date_fin
      ),
    };
  };

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  return (
    <div className={cn('w-full h-full bg-slate-900/50 rounded-lg border border-slate-700/50 p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">Vue Calendrier</h3>
          <div className="text-sm text-slate-400">
            {periode === 'semaine' && 'Semaine'}
            {periode === 'mois' && days.length > 0 && monthNames[days[0].getMonth()]}
            {periode === 'trimestre' && 'Trimestre'}
          </div>
        </div>

        {/* Grille calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {/* En-têtes des jours */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-slate-400"
            >
              {day}
            </div>
          ))}

          {/* Jours */}
          {days.map((day, index) => {
            const events = getEventsForDay(day);
            const isToday =
              day.toDateString() === new Date().toDateString();
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

            return (
              <div
                key={index}
                className={cn(
                  'min-h-[80px] p-1.5 rounded border transition-all',
                  isToday
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : isWeekend
                    ? 'bg-slate-800/30 border-slate-700/30'
                    : 'bg-slate-800/50 border-slate-700/50'
                )}
              >
                <div
                  className={cn(
                    'text-xs font-medium mb-1',
                    isToday ? 'text-blue-400' : 'text-slate-300'
                  )}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {events.jalons.slice(0, 2).map((jalon) => (
                    <div
                      key={jalon.id}
                      className={cn(
                        'text-xs px-1 py-0.5 rounded truncate',
                        jalon.est_retard
                          ? 'bg-red-500/20 text-red-400'
                          : jalon.est_sla_risque
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      )}
                      title={jalon.libelle}
                    >
                      {jalon.libelle}
                    </div>
                  ))}
                  {events.evenements.slice(0, 1).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs px-1 py-0.5 rounded bg-purple-500/20 text-purple-400 truncate"
                      title={event.titre || ''}
                    >
                      {event.titre || 'Événement'}
                    </div>
                  ))}
                  {events.absences.slice(0, 1).map((absence) => (
                    <div
                      key={absence.id}
                      className="text-xs px-1 py-0.5 rounded bg-slate-500/20 text-slate-400 truncate"
                      title={absence.employe_nom || `User ${absence.user_id}`}
                    >
                      {absence.employe_nom || `User ${absence.user_id}`}
                    </div>
                  ))}
                  {(events.jalons.length > 2 ||
                    events.evenements.length > 1 ||
                    events.absences.length > 1) && (
                    <div className="text-xs text-slate-400">
                      +{events.jalons.length +
                        events.evenements.length +
                        events.absences.length -
                        3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

