/**
 * Page Jalons à venir (fenêtre glissante J-7, J+30)
 */

'use client';

import React, { useMemo } from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { getJalonsAVenir } from '../../api/calendrierApi';
import { Flag, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

export function JalonsAVenirPage() {
  const [jalons, setJalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculer la fenêtre J-7 à J+30
  const dateRange = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    const end = new Date(today);
    end.setDate(today.getDate() + 30);
    return {
      date_debut: start.toISOString().split('T')[0],
      date_fin: end.toISOString().split('T')[0],
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getJalonsAVenir(dateRange.date_debut, dateRange.date_fin);
        setJalons(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

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
      <CalendarHeader breadcrumb={['Calendrier', 'Jalons & Contrats', 'Jalons à venir']} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-200">
              Jalons à venir (J-7 à J+30) ({jalons.length})
            </h2>
          </div>

          {jalons.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucun jalon à venir dans cette période
            </div>
          ) : (
            <div className="space-y-3">
              {jalons.map((jalon) => (
                <div
                  key={jalon.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="p-2 bg-blue-500/10 rounded">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{jalon.libelle}</span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
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

