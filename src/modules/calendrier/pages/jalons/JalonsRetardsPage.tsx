/**
 * Page Jalons en retard
 */

'use client';

import React from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { useJalons } from '../../hooks/useCalendrierData';
import { Flag, XCircle } from 'lucide-react';

export function JalonsRetardsPage() {
  const { jalons, loading, error } = useJalons({ est_retard: true });

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
      <CalendarHeader breadcrumb={['Calendrier', 'Jalons & Contrats', 'Jalons en retard']} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="h-5 w-5 text-red-400" />
            <h2 className="text-xl font-semibold text-slate-200">
              Jalons en retard ({jalons?.jalons.length || 0})
            </h2>
          </div>

          {jalons?.jalons.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucun jalon en retard
            </div>
          ) : (
            <div className="space-y-3">
              {jalons?.jalons.map((jalon) => (
                <div
                  key={jalon.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-red-500/30"
                >
                  <div className="p-2 bg-red-500/10 rounded">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{jalon.libelle}</span>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                        {jalon.type}
                      </span>
                    </div>
                    {jalon.date_debut && jalon.date_fin && (
                      <div className="text-sm text-slate-400">
                        {new Date(jalon.date_debut).toLocaleDateString()} -{' '}
                        {new Date(jalon.date_fin).toLocaleDateString()}
                      </div>
                    )}
                    {jalon.statut && (
                      <div className="text-sm text-slate-400 mt-1">Statut: {jalon.statut}</div>
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

