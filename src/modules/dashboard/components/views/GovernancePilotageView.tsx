/**
 * Vue Gouvernance & décisions — sous-menu PILOTAGE.
 * Décisions et instances de pilotage, délais, arbitrages.
 * Audit ERP BTP 2026 : vue dédiée (remplace le placeholder "Vue en cours de développement").
 */

'use client';

import React, { memo } from 'react';
import { Building2, Gavel, FileCheck, Clock, AlertTriangle } from 'lucide-react';
import { DashboardPanel } from '../shared/DashboardPanel';

export const GovernancePilotageView = memo(function GovernancePilotageView() {
  return (
    <div className="p-4 sm:p-6 w-full min-w-0 max-w-full overflow-x-hidden space-y-6" role="region" aria-labelledby="governance-view-title">
      <h1 id="governance-view-title" className="sr-only">Gouvernance & décisions</h1>
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400" aria-hidden>
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Gouvernance & décisions</h2>
          <p className="text-sm text-slate-400">Décisions et instances de pilotage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardPanel title="Décisions en attente" icon={Gavel} className="border-amber-500/30 bg-amber-500/5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">À valider</span>
              <span className="font-semibold text-amber-400">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dont urgentes</span>
              <span className="font-medium text-slate-200">3</span>
            </div>
            <p className="text-xs text-slate-400 pt-2">Délai moyen de décision : 2,4 j</p>
          </div>
        </DashboardPanel>
        <DashboardPanel title="Instances de pilotage" icon={FileCheck}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">COPIL cette semaine</span>
              <span className="font-semibold text-slate-200">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Comité direction</span>
              <span className="font-medium text-slate-200">J+5</span>
            </div>
          </div>
        </DashboardPanel>
        <DashboardPanel title="Arbitrages & escalades" icon={AlertTriangle} className="border-rose-500/30 bg-rose-500/5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">En attente DG</span>
              <span className="font-semibold text-rose-400">4</span>
            </div>
            <p className="text-xs text-slate-400 pt-2">Préparées par les équipes : 2</p>
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel title="Prochaines décisions" icon={Clock} subtitle="Délais et priorités">
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <th className="p-3 text-left font-semibold text-slate-200">Sujet</th>
                <th className="p-3 text-left font-semibold text-slate-200">Type</th>
                <th className="p-3 text-right font-semibold text-slate-200">Délai</th>
                <th className="p-3 text-right font-semibold text-slate-200">Priorité</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-800/60">
                <td className="p-3 text-slate-200">Approbation marché école</td>
                <td className="p-3 text-slate-400">Marché</td>
                <td className="p-3 text-right text-amber-400">J+2</td>
                <td className="p-3 text-right"><span className="rounded px-2 py-0.5 text-xs bg-rose-500/20 text-rose-300">Haute</span></td>
              </tr>
              <tr className="border-t border-slate-800/60">
                <td className="p-3 text-slate-200">Délégation signature</td>
                <td className="p-3 text-slate-400">RH</td>
                <td className="p-3 text-right text-slate-400">J+5</td>
                <td className="p-3 text-right"><span className="rounded px-2 py-0.5 text-xs bg-slate-700/60 text-slate-300">Moyenne</span></td>
              </tr>
              <tr className="border-t border-slate-800/60">
                <td className="p-3 text-slate-200">Avenant chantier #042</td>
                <td className="p-3 text-slate-400">Contractuel</td>
                <td className="p-3 text-right text-amber-400">J+3</td>
                <td className="p-3 text-right"><span className="rounded px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300">Haute</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    </div>
  );
});
