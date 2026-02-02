/**
 * Page Décisions validées
 * Liste des décisions validées récemment
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { DecisionGouvernance } from '../../types/gouvernanceTypes';
import { CheckCircle2 } from 'lucide-react';
import { cn, exportDataAsCSV } from '@/lib/utils';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function DecisionsValideesPage() {
  const { data, isLoading } = useGouvernanceData('decisions-validees');

  const decisions = normalizeToArray<DecisionGouvernance>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Décisions validées"
        subtitle="Historique des décisions validées récemment"
        onExport={() => {
          const rows = decisions
            .filter((d: DecisionGouvernance) => d.statut === 'valide')
            .map((d: DecisionGouvernance) => ({
              reference: d.reference,
              titre: d.titre,
              type: d.type,
              date_decision: d.date_decision ?? '',
              impact: d.impact ?? '',
              projet: d.projet_nom ?? '',
            }));
          exportDataAsCSV(rows, 'decisions-validees');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : decisions.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucune décision validée</div>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-slate-300">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Décision</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date décision</th>
                <th className="px-4 py-3">Impact</th>
                <th className="px-4 py-3">Projet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {decisions
                .filter((d: DecisionGouvernance) => d.statut === 'valide')
                .map((decision: DecisionGouvernance) => (
                  <tr key={decision.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{decision.reference}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{decision.titre}</div>
                      {decision.description && (
                        <div className="text-xs text-slate-400 mt-1">{decision.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                          decision.type === 'budget'
                            ? 'bg-blue-500/15 text-blue-200 ring-blue-500/30'
                            : decision.type === 'planning'
                              ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                              : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                        )}
                      >
                        {decision.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {decision.date_decision
                        ? new Date(decision.date_decision).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                          decision.impact === 'high'
                            ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                            : decision.impact === 'medium'
                              ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
                              : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                        )}
                      >
                        {decision.impact}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{decision.projet_nom || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

