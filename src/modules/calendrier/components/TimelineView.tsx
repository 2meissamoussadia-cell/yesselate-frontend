/**
 * Composant Timeline View
 * Vue timeline horizontale
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Jalon, EvenementCalendrier, Absence } from '../types/calendrierTypes';

interface TimelineViewProps {
  jalons?: Jalon[];
  evenements?: EvenementCalendrier[];
  absences?: Absence[];
  chantierId?: number | null;
  dateDebut?: string;
  dateFin?: string;
  className?: string;
}

export function TimelineView({
  jalons = [],
  evenements = [],
  absences = [],
  chantierId,
  dateDebut,
  dateFin,
  className,
}: TimelineViewProps) {
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

  // Combiner tous les éléments pour la timeline
  const timelineItems = useMemo(() => {
    const items: Array<{
      id: number;
      type: 'jalon' | 'evenement' | 'absence';
      label: string;
      dateDebut: string;
      dateFin: string;
      data: Jalon | EvenementCalendrier | Absence;
    }> = [];

    filteredJalons.forEach((jalon) => {
      if (jalon.date_debut && jalon.date_fin) {
        items.push({
          id: jalon.id,
          type: 'jalon',
          label: jalon.libelle,
          dateDebut: jalon.date_debut,
          dateFin: jalon.date_fin,
          data: jalon,
        });
      }
    });

    filteredEvenements.forEach((event) => {
      if (event.date_debut && event.date_fin) {
        items.push({
          id: event.id,
          type: 'evenement',
          label: event.titre || 'Événement',
          dateDebut: event.date_debut,
          dateFin: event.date_fin,
          data: event,
        });
      }
    });

    filteredAbsences.forEach((absence) => {
      if (absence.date_debut && absence.date_fin) {
        items.push({
          id: absence.id,
          type: 'absence',
          label: `${absence.employe_nom || `User ${absence.user_id}`} - ${absence.type || 'ABSENCE'}`,
          dateDebut: absence.date_debut,
          dateFin: absence.date_fin,
          data: absence,
        });
      }
    });

    // Trier par date de début
    return items.sort(
      (a, b) =>
        new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
    );
  }, [filteredJalons, filteredEvenements, filteredAbsences]);

  const getItemColor = (type: string, item: any) => {
    if (type === 'jalon') {
      const jalon = item as Jalon;
      if (jalon.est_retard) return 'bg-red-500';
      if (jalon.est_sla_risque) return 'bg-amber-500';
      return 'bg-blue-500';
    }
    if (type === 'evenement') return 'bg-purple-500';
    if (type === 'absence') return 'bg-slate-500';
    return 'bg-slate-400';
  };

  return (
    <div className={cn('w-full h-full bg-slate-900/50 rounded-lg border border-slate-700/50 p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">Vue Timeline</h3>
          <div className="text-sm text-slate-400">
            {timelineItems.length} éléments
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {timelineItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Aucun élément à afficher
            </div>
          ) : (
            timelineItems.map((item) => {
              const startDate = new Date(item.dateDebut);
              const endDate = new Date(item.dateFin);
              const duration = Math.ceil(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  {/* Timeline bar */}
                  <div className="flex-1 relative">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all',
                          getItemColor(item.type, item.data)
                        )}
                        style={{ width: `${Math.max(duration * 2, 20)}px` }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200 truncate">
                            {item.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {startDate.toLocaleDateString()} -{' '}
                            {endDate.toLocaleDateString()}
                          </span>
                        </div>
                        {item.type === 'jalon' && (
                          <div className="flex items-center gap-2 mt-1">
                            {(item.data as Jalon).est_retard && (
                              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                                Retard
                              </span>
                            )}
                            {(item.data as Jalon).est_sla_risque && (
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                                À risque
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

