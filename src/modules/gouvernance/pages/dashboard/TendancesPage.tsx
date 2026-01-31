/**
 * Page Tendances mensuelles
 * Graphiques d'évolution sur plusieurs mois
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { TendancesChart } from '../../components/TendancesChart';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';

export default function TendancesPage() {
  const { data: tendances, isLoading } = useGouvernanceData('tendances');

  return (
    <div className="h-full w-full bg-slate-950 text-white p-6">
      <GouvernanceHeader
        title="Tendances mensuelles"
        subtitle="Évolution des indicateurs clés sur les derniers mois"
        onExport={() => { /* TODO: export tendances */ }}
      />

      <div className="space-y-6">
        {/* Graphique principal */}
        <TendancesChart type="line" />

        {/* Graphiques supplémentaires */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TendancesChart type="bar" />
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-sm font-semibold mb-4">Analyse comparative</div>
            {isLoading ? (
              <div className="text-sm text-slate-400">Chargement...</div>
            ) : (
              <div className="text-sm text-slate-300">
                Données de tendances disponibles : {Array.isArray(tendances) ? tendances.length : 0} mois
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

