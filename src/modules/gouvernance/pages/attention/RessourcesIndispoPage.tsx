/**
 * Page Ressources indisponibles
 * Liste des ressources critiques indisponibles
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { PointAttention } from '../../types/gouvernanceTypes';
import { UserX } from 'lucide-react';
import { exportDataAsCSV } from '@/lib/utils';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function RessourcesIndispoPage() {
  const { data, isLoading } = useGouvernanceData('ressources-indispo');

  const ressources = normalizeToArray<PointAttention>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Ressources indisponibles"
        subtitle="Ressources critiques indisponibles impactant les projets"
        onExport={() => {
          const rows = ressources
            .filter((r: PointAttention) => r.type === 'ressource-indispo')
            .map((r: PointAttention) => ({
              id: r.id,
              titre: r.titre,
              priorite: r.priorite,
              impact: r.impact,
              projet_nom: r.projet_nom,
              description: r.description ?? '',
            }));
          exportDataAsCSV(rows, 'ressources_indisponibles');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : ressources.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucune ressource indisponible</div>
      ) : (
        <div className="space-y-2">
          {ressources
            .filter((r: PointAttention) => r.type === 'ressource-indispo')
            .map((ressource: PointAttention) => (
              <div
                key={ressource.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-yellow-500/10 px-4 py-3 ring-1 ring-yellow-500/20"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <UserX className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">{ressource.titre}</span>
                  </div>
                  {ressource.description && (
                    <div className="text-sm text-slate-300 mt-1">{ressource.description}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {ressource.projet_nom && `Projet : ${ressource.projet_nom} • `}
                    Impact : {ressource.impact}
                  </div>
                </div>
                <button type="button" aria-label="Voir le détail" className="rounded-xl bg-yellow-500/20 px-3 py-2 min-h-[44px] text-xs font-medium text-yellow-200 ring-1 ring-yellow-500/30 hover:bg-yellow-500/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-yellow-500">
                  Traiter
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

