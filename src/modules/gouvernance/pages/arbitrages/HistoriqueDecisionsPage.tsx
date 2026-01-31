/**
 * Page Historique des décisions
 * Timeline des décisions prises
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { DecisionGouvernance } from '../../types/gouvernanceTypes';
import { cn } from '@/lib/utils';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function HistoriqueDecisionsPage() {
  const { data, isLoading } = useGouvernanceData('historique-decisions');

  const decisions = normalizeToArray<DecisionGouvernance>(data);

  // Grouper par date
  const decisionsByDate = decisions.reduce((acc: Record<string, DecisionGouvernance[]>, decision: DecisionGouvernance) => {
    const date = decision.date_decision
      ? new Date(decision.date_decision).toLocaleDateString('fr-FR')
      : 'Sans date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(decision);
    return acc;
  }, {});

  return (
    <div className="h-full w-full bg-slate-950 text-white p-6">
      <GouvernanceHeader
        title="Historique des décisions"
        subtitle="Timeline des décisions prises récemment"
        onExport={() => { /* TODO: export historique */ }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : decisions.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucune décision dans l'historique</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(decisionsByDate).map(([date, dateDecisions]) => (
            <div key={date}>
              <div className="text-sm font-semibold text-slate-300 mb-3">{date}</div>
              <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                {dateDecisions.map((decision: DecisionGouvernance) => (
                  <div
                    key={decision.id}
                    className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-400">{decision.reference}</span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                            decision.statut === 'valide'
                              ? 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
                              : decision.statut === 'rejete'
                                ? 'bg-rose-500/15 text-rose-200 ring-rose-500/30'
                                : 'bg-slate-500/15 text-slate-200 ring-slate-500/30'
                          )}
                        >
                          {decision.statut === 'valide' ? 'Validé' : decision.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                        </span>
                      </div>
                      <div className="text-sm font-medium">{decision.titre}</div>
                      {decision.description && (
                        <div className="text-sm text-slate-300 mt-1">{decision.description}</div>
                      )}
                      <div className="text-xs text-slate-400 mt-1">
                        {decision.projet_nom && `Projet : ${decision.projet_nom} • `}
                        Responsable : {decision.responsable}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

