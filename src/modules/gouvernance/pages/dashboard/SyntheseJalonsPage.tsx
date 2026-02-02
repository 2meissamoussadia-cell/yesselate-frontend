/**
 * Page Synthèse jalons
 * Vue matricielle des jalons avec statuts
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { JalonGouvernance } from '../../types/gouvernanceTypes';
import { cn, exportDataAsCSV } from '@/lib/utils';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function SyntheseJalonsPage() {
  const { data, isLoading } = useGouvernanceData('synthese-jalons');

  const jalons = normalizeToArray<JalonGouvernance>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Synthèse jalons"
        subtitle="Vue d'ensemble de tous les jalons avec statuts et retards"
        onExport={() => {
          const rows = jalons.map((j: JalonGouvernance) => ({
            id: j.id,
            libelle: j.libelle,
            projet_nom: j.projet_nom,
            type: j.type,
            date_prevue: j.date_prevue,
            statut: j.statut,
            retard_jours: j.retard_jours,
            est_retard: j.est_retard,
          }));
          exportDataAsCSV(rows, 'synthese_jalons');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : jalons.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucun jalon disponible</div>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-slate-300">
              <tr>
                <th className="px-4 py-3">Jalon</th>
                <th className="px-4 py-3">Projet</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date prévue</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Retard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {jalons.map((jalon: JalonGouvernance) => (
                <tr key={jalon.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{jalon.libelle}</td>
                  <td className="px-4 py-3 text-slate-300">{jalon.projet_nom}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        jalon.type === 'SLA'
                          ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                          : jalon.type === 'CONTRAT'
                            ? 'bg-purple-500/15 text-purple-200 ring-purple-500/30'
                            : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                      )}
                    >
                      {jalon.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {jalon.date_prevue ? new Date(jalon.date_prevue).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                        jalon.statut === 'Terminé'
                          ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                          : jalon.statut === 'En cours'
                            ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                            : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                      )}
                    >
                      {jalon.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {jalon.est_retard && jalon.retard_jours ? (
                      <span className="text-rose-400 font-medium">
                        +{jalon.retard_jours} jour{jalon.retard_jours > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
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

