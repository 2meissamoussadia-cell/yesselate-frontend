/**
 * Page Indicateurs conformité
 * Matrice des indicateurs de conformité
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { IndicateurConformite } from '../../types/gouvernanceTypes';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function IndicateursConformitePage() {
  const { data, isLoading } = useGouvernanceData('indicateurs-conformite');

  const indicateurs = normalizeToArray<IndicateurConformite>(data);

  return (
    <div className="h-full w-full bg-slate-950 text-white p-6">
      <GouvernanceHeader
        title="Indicateurs conformité"
        subtitle="Vue d'ensemble des indicateurs de conformité et performance"
        onExport={() => console.log('Export indicateurs conformité')}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : indicateurs.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucun indicateur disponible</div>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-slate-300">
              <tr>
                <th className="px-4 py-3">Indicateur</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Valeur</th>
                <th className="px-4 py-3">Cible</th>
                <th className="px-4 py-3">%</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Tendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {indicateurs.map((indicateur: IndicateurConformite) => (
                <tr key={indicateur.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{indicateur.nom}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        indicateur.type === 'SLA'
                          ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                          : indicateur.type === 'CONTRAT'
                            ? 'bg-purple-500/15 text-purple-200 ring-purple-500/30'
                            : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                      )}
                    >
                      {indicateur.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{indicateur.valeur}</td>
                  <td className="px-4 py-3 text-slate-300">{indicateur.valeur_cible}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full',
                            indicateur.pourcent >= 100
                              ? 'bg-emerald-500'
                              : indicateur.pourcent >= 80
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          )}
                          style={{ width: `${Math.min(indicateur.pourcent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs">{indicateur.pourcent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        indicateur.statut === 'conforme'
                          ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                          : indicateur.statut === 'non-conforme'
                            ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                            : 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                      )}
                    >
                      {indicateur.statut === 'conforme'
                        ? 'Conforme'
                        : indicateur.statut === 'non-conforme'
                          ? 'Non conforme'
                          : 'À risque'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {indicateur.tendance === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : indicateur.tendance === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Minus className="h-4 w-4 text-slate-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

