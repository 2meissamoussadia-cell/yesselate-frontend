/**
 * Page Escalades en cours
 * Liste des escalades actives nécessitant une intervention
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { PointAttention } from '../../types/gouvernanceTypes';
import { AlertTriangle } from 'lucide-react';
import { cn, exportDataAsCSV } from '@/lib/utils';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function EscaladesPage() {
  const { data, isLoading } = useGouvernanceData('escalades');

  const escalades = normalizeToArray<PointAttention>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Escalades en cours"
        subtitle="Escalades actives nécessitant une intervention urgente"
        onExport={() => {
          const rows = escalades
            .filter((e: PointAttention) => e.type === 'escalade')
            .map((e: PointAttention) => ({
              id: e.id,
              titre: e.titre,
              priorite: e.priorite,
              impact: e.impact,
              projet: e.projet_nom,
              description: e.description ?? '',
            }));
          exportDataAsCSV(rows, 'escalades');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : escalades.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucune escalade en cours</div>
      ) : (
        <div className="space-y-2">
          {escalades
            .filter((e: PointAttention) => e.type === 'escalade')
            .map((escalade: PointAttention) => (
              <div
                key={escalade.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1',
                  escalade.priorite === 'critical'
                    ? 'bg-rose-500/10 ring-rose-500/20'
                    : escalade.priorite === 'high'
                      ? 'bg-amber-500/10 ring-amber-500/20'
                      : 'bg-white/5 ring-white/10'
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span className="font-medium">{escalade.titre}</span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        escalade.priorite === 'critical'
                          ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                          : escalade.priorite === 'high'
                            ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                            : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                      )}
                    >
                      {escalade.priorite === 'critical' ? 'Critique' : escalade.priorite === 'high' ? 'Élevé' : 'Moyen'}
                    </span>
                  </div>
                  {escalade.description && (
                    <div className="text-sm text-slate-300 mt-1">{escalade.description}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {escalade.projet_nom && `Projet : ${escalade.projet_nom} • `}
                    Impact : {escalade.impact}
                  </div>
                </div>
                <button type="button" aria-label="Traiter l'escalade" className="rounded-xl bg-rose-500/15 px-3 py-2 min-h-[44px] text-xs font-medium text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/25 focus-visible:outline focus-visible:ring-2 focus-visible:ring-rose-500">
                  Traiter
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

