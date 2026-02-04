/**
 * Page Synthèse projets
 * Vue matricielle des projets avec indicateurs
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { ProjetGouvernance } from '../../types/gouvernanceTypes';
import { cn } from '@/lib/cn';
import { exportDataAsCSV } from '@/lib/utils/export';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function SyntheseProjetsPage() {
  const { data, isLoading } = useGouvernanceData('synthese-projets');

  const projets = normalizeToArray<ProjetGouvernance>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Synthèse projets"
        subtitle="Vue d'ensemble de tous les projets avec indicateurs clés"
        onExport={() => {
          const rows = projets.map((p: ProjetGouvernance) => ({
            id: p.id,
            nom: p.nom,
            code: p.code,
            statut: p.statut,
            budget_total: p.budget_total,
            budget_consomme: p.budget_consomme,
            jalons_total: p.jalons_total,
            jalons_valides: p.jalons_valides,
            risques_count: p.risques_count,
            exposition_financiere: p.exposition_financiere,
          }));
          exportDataAsCSV(rows, 'synthese_projets');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : projets.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucun projet disponible</div>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-slate-300">
              <tr>
                <th className="px-4 py-3">Projet</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Jalons</th>
                <th className="px-4 py-3">Risques</th>
                <th className="px-4 py-3">Exposition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {projets.map((projet: ProjetGouvernance) => (
                <tr key={projet.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{projet.nom}</div>
                    {projet.code && (
                      <div className="text-xs text-slate-400">{projet.code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        projet.statut === 'on-track'
                          ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                          : projet.statut === 'at-risk'
                            ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                            : 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                      )}
                    >
                      {projet.statut === 'on-track'
                        ? 'On Track'
                        : projet.statut === 'at-risk'
                          ? 'At Risk'
                          : 'Late'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{projet.budget_pourcent}%</div>
                    <div className="text-xs text-slate-400">
                      {projet.budget_consomme.toLocaleString('fr-FR')}€ /{' '}
                      {projet.budget_total.toLocaleString('fr-FR')}€
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {projet.jalons_valides}/{projet.jalons_total}
                    </div>
                    {projet.jalons_retard > 0 && (
                      <div className="text-xs text-rose-400">
                        {projet.jalons_retard} en retard
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{projet.risques_count}</div>
                    {projet.risques_critiques_count > 0 && (
                      <div className="text-xs text-rose-400">
                        {projet.risques_critiques_count} critiques
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold">
                      {projet.exposition_financiere.toLocaleString('fr-FR')}€
                    </div>
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

