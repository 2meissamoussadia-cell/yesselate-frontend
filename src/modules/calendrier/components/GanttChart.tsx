/**
 * Composant Gantt Chart
 * Intègre la visualisation Gantt et les graphiques complémentaires
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import type { Jalon, EvenementCalendrier, Chantier } from '../types/calendrierTypes';
import { GanttVisualization } from './GanttVisualization';
import { GanttStatsCharts } from './GanttStatsCharts';

interface GanttChartProps {
  jalons?: Jalon[];
  evenements?: EvenementCalendrier[];
  chantiers?: Chantier[];
  chantierId?: number | null;
  dateDebut?: string;
  dateFin?: string;
  className?: string;
}

export function GanttChart({
  jalons = [],
  evenements = [],
  chantiers = [],
  chantierId,
  dateDebut,
  dateFin,
  className,
}: GanttChartProps) {

  // Filtrer par chantier si spécifié (doit être défini avant le useEffect)
  const filteredJalons = React.useMemo(() => {
    return chantierId
      ? jalons.filter((j) => j.chantier_id === chantierId)
      : jalons;
  }, [jalons, chantierId]);

  const filteredEvenements = React.useMemo(() => {
    return chantierId
      ? evenements.filter((e) => e.chantier_id === chantierId)
      : evenements;
  }, [evenements, chantierId]);

  // Obtenir le nom du chantier si disponible
  const chantierNom = chantierId && chantiers.length > 0
    ? chantiers.find((c) => c.id === chantierId)?.nom
    : null;

  return (
    <div className={cn('w-full h-full bg-slate-900/50 rounded-lg border border-slate-700/50 p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Vue Gantt</h3>
            {chantierNom && (
              <p className="text-sm text-slate-400 mt-1">Chantier: {chantierNom}</p>
            )}
          </div>
          <div className="text-sm text-slate-400">
            {filteredJalons.length} jalons • {filteredEvenements.length} événements
          </div>
        </div>

        {/* Graphique Gantt */}
        <GanttVisualization
          jalons={filteredJalons}
          evenements={filteredEvenements}
          chantiers={chantiers}
          dateDebut={dateDebut}
          dateFin={dateFin}
        />

        {/* Graphiques complémentaires */}
        {(filteredJalons.length > 0 || filteredEvenements.length > 0) && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300">Statistiques et analyses</h4>
            <GanttStatsCharts
              jalons={filteredJalons}
              evenements={filteredEvenements}
              chantiers={chantiers}
            />
          </div>
        )}

        {/* Liste détaillée des jalons */}
        {filteredJalons.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Détail des jalons ({filteredJalons.length})</h4>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredJalons.map((jalon) => (
                <div
                  key={jalon.id}
                  className="flex items-center gap-2 p-2 bg-slate-800/30 rounded text-xs text-slate-400 hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-medium flex-1">{jalon.libelle}</span>
                  {jalon.date_debut && jalon.date_fin && (
                    <span className="text-slate-400 whitespace-nowrap">
                      {new Date(jalon.date_debut).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(jalon.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {jalon.est_retard && (
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs whitespace-nowrap">
                        Retard
                      </span>
                    )}
                    {jalon.est_sla_risque && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs whitespace-nowrap">
                        À risque
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Liste des événements (détaillée) */}
        {filteredEvenements.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Détail des événements ({filteredEvenements.length})</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredEvenements.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 p-2 bg-slate-800/30 rounded text-xs text-slate-400 hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-medium flex-1">{event.titre || 'Événement'}</span>
                  {event.date_debut && event.date_fin && (
                    <span className="text-slate-400 whitespace-nowrap">
                      {new Date(event.date_debut).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(event.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {event.type && (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs whitespace-nowrap">
                      {event.type}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Message si aucune donnée */}
        {filteredJalons.length === 0 && filteredEvenements.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Aucune donnée à afficher</p>
            {chantierId ? (
              <p className="text-xs text-slate-400 mt-1">
                Aucun jalon ou événement pour ce chantier (ID: {chantierId})
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                Aucun jalon ou événement disponible
              </p>
            )}
            {/* Debug info - seulement en développement */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-xs text-slate-600 space-y-1">
                <p>Debug: jalons={jalons.length}, evenements={evenements.length}, chantiers={chantiers.length}</p>
                <p>Filtrés: jalons={filteredJalons.length}, evenements={filteredEvenements.length}</p>
                {jalons.length > 0 && (
                  <p className="text-slate-400">Premier jalon: {jalons[0]?.libelle} (chantier_id: {jalons[0]?.chantier_id})</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

