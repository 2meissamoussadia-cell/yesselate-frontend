/**
 * Page Dépassements budgétaires
 * Liste des projets avec dépassements de budget
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { BudgetGouvernance } from '../../types/gouvernanceTypes';
import { cn } from '@/lib/cn';
import { exportDataAsCSV } from '@/lib/utils/export';
import { AlertTriangle } from 'lucide-react';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function DepassementsBudgetPage() {
  const { data, isLoading } = useGouvernanceData('depassements-budget');

  const depassements = normalizeToArray<BudgetGouvernance>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Dépassements budgétaires"
        subtitle="Projets avec dépassement de budget nécessitant une attention"
        onExport={() => {
          const rows = depassements
            .filter((b: BudgetGouvernance) => (b.depassement || 0) > 0)
            .map((b: BudgetGouvernance) => ({
              projet_id: b.projet_id,
              projet_nom: b.projet_nom,
              budget_initial: b.budget_initial,
              budget_consomme: b.budget_consomme,
              depassement: b.depassement,
              depassement_pourcent: b.depassement_pourcent,
            }));
          exportDataAsCSV(rows, 'depassements_budget');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : depassements.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucun dépassement budgétaire</div>
      ) : (
        <div className="space-y-4">
          {depassements
            .filter((b: BudgetGouvernance) => (b.depassement || 0) > 0)
            .map((budget: BudgetGouvernance) => (
              <div
                key={budget.projet_id}
                className="flex items-center justify-between gap-3 rounded-xl bg-rose-500/10 px-4 py-3 ring-1 ring-rose-500/20"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span className="font-medium">{budget.projet_nom}</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    Dépassement :{' '}
                    <span className="font-semibold text-rose-400">
                      {budget.depassement?.toLocaleString('fr-FR')}€ (
                      {budget.depassement_pourcent?.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Budget initial : {budget.budget_initial.toLocaleString('fr-FR')}€ • Consommé :{' '}
                    {budget.budget_consomme.toLocaleString('fr-FR')}€
                  </div>
                </div>
                <button type="button" aria-label="Voir le dépassement" className="rounded-xl bg-rose-500/20 px-3 py-2 min-h-[44px] text-xs font-medium text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-rose-500">
                  Traiter
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

