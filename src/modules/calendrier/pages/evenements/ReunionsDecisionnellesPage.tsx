/**
 * Page Réunions décisionnelles (liées à Gouvernance)
 */

'use client';

import React from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { useEvenements } from '../../hooks/useCalendrierData';
import { CalendarClock, Gavel } from 'lucide-react';

export function ReunionsDecisionnellesPage() {
  // Les réunions décisionnelles sont des réunions liées à la gouvernance
  const { evenements, loading, error } = useEvenements({ type: 'REUNION' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Erreur: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <CalendarHeader breadcrumb={['Calendrier', 'Événements & Réunions', 'Réunions décisionnelles']} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Gavel className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-slate-200">
              Réunions décisionnelles ({evenements.length})
            </h2>
          </div>

          {evenements.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucune réunion décisionnelle
            </div>
          ) : (
            <div className="space-y-3">
              {evenements.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-amber-500/30"
                >
                  <div className="p-2 bg-amber-500/10 rounded">
                    <CalendarClock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{event.titre}</span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                        Décisionnelle
                      </span>
                    </div>
                    {event.description && (
                      <div className="text-sm text-slate-400 mb-1">{event.description}</div>
                    )}
                    {event.date_debut && event.date_fin && (
                      <div className="text-sm text-slate-400">
                        {new Date(event.date_debut).toLocaleDateString()} -{' '}
                        {new Date(event.date_fin).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

