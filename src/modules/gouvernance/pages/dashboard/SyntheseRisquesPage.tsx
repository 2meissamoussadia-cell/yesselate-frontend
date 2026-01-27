/**
 * Page Synthèse risques
 * Vue matricielle des risques avec exposition
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { RisqueGouvernance } from '../../types/gouvernanceTypes';
import { cn } from '@/lib/utils';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function SyntheseRisquesPage() {
  const { data, isLoading } = useGouvernanceData('synthese-risques');

  const risques = normalizeToArray<RisqueGouvernance>(data);

  return (
    <div className="h-full w-full bg-slate-950 text-white p-6">
      <GouvernanceHeader
        title="Synthèse risques"
        subtitle="Vue d'ensemble des risques majeurs avec probabilité et impact"
        onExport={() => console.log('Export synthèse risques')}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : risques.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucun risque identifié</div>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-slate-300">
              <tr>
                <th className="px-4 py-3">Risque</th>
                <th className="px-4 py-3">Projet</th>
                <th className="px-4 py-3">Probabilité</th>
                <th className="px-4 py-3">Impact</th>
                <th className="px-4 py-3">Exposition</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {risques.map((risque: RisqueGouvernance) => (
                <tr key={risque.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{risque.titre}</div>
                    {risque.description && (
                      <div className="text-xs text-slate-400 mt-1">{risque.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{risque.projet_nom}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        risque.probabilite === 'high'
                          ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                          : risque.probabilite === 'medium'
                            ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                            : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                      )}
                    >
                      {risque.probabilite === 'high' ? 'Élevée' : risque.probabilite === 'medium' ? 'Moyenne' : 'Faible'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        risque.impact === 'financial'
                          ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                          : risque.impact === 'planning'
                            ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                            : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                      )}
                    >
                      {risque.impact === 'financial' ? 'Financier' : risque.impact === 'planning' ? 'Planning' : risque.impact === 'reputation' ? 'Réputation' : 'Qualité'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">
                      {risque.exposition_type === 'financial'
                        ? `${risque.exposition.toLocaleString('fr-FR')}€`
                        : risque.exposition_type === 'days'
                          ? `${risque.exposition} jour${risque.exposition > 1 ? 's' : ''}`
                          : risque.exposition}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        risque.statut === 'ouvert'
                          ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                          : risque.statut === 'mitige'
                            ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                      )}
                    >
                      {risque.statut === 'ouvert' ? 'Ouvert' : risque.statut === 'mitige' ? 'Mitigé' : 'Fermé'}
                    </span>
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

