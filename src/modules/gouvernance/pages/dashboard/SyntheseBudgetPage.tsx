/**
 * Page Synthèse budget
 * Vue d'ensemble des budgets par projet
 */

'use client';

import React from 'react';
import { GouvernanceHeader } from '../../components/GouvernanceHeader';
import { useGouvernanceData } from '../../hooks/useGouvernanceData';
import type { BudgetGouvernance } from '../../types/gouvernanceTypes';
import { cn, exportDataAsCSV } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { normalizeToArray } from '../../utils/dataNormalization';

export default function SyntheseBudgetPage() {
  const { data, isLoading } = useGouvernanceData('synthese-budget');

  const budgets = normalizeToArray<BudgetGouvernance>(data);

  return (
    <div className="h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white p-6">
      <GouvernanceHeader
        title="Synthèse budget"
        subtitle="Vue d'ensemble des budgets par projet avec consommation et tendances"
        onExport={() => {
          const rows = budgets.map((b: BudgetGouvernance) => ({
            projet_id: b.projet_id,
            projet_nom: b.projet_nom,
            budget_initial: b.budget_initial,
            budget_consomme: b.budget_consomme,
            budget_restant: b.budget_restant,
            depassement: b.depassement,
            depassement_pourcent: b.depassement_pourcent,
          }));
          exportDataAsCSV(rows, 'synthese_budget');
        }}
      />

      {isLoading ? (
        <div className="text-center text-slate-400 py-12">Chargement...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center text-slate-400 py-12">Aucune donnée budget disponible</div>
      ) : (
        <div className="space-y-4">
          {/* Cards de synthèse */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">Budget total</div>
              <div className="text-2xl font-semibold">
                {budgets
                  .reduce((sum: number, b: BudgetGouvernance) => sum + b.budget_initial, 0)
                  .toLocaleString('fr-FR')}
                €
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">Budget consommé</div>
              <div className="text-2xl font-semibold">
                {budgets
                  .reduce((sum: number, b: BudgetGouvernance) => sum + b.budget_consomme, 0)
                  .toLocaleString('fr-FR')}
                €
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">Budget restant</div>
              <div className="text-2xl font-semibold">
                {budgets
                  .reduce((sum: number, b: BudgetGouvernance) => sum + b.budget_restant, 0)
                  .toLocaleString('fr-FR')}
                €
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs text-slate-400 mb-2">Dépassements</div>
              <div className="text-2xl font-semibold text-rose-400">
                {budgets
                  .filter((b: BudgetGouvernance) => (b.depassement || 0) > 0)
                  .length}
              </div>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs text-slate-300">
                <tr>
                  <th className="px-4 py-3">Projet</th>
                  <th className="px-4 py-3">Budget initial</th>
                  <th className="px-4 py-3">Consommé</th>
                  <th className="px-4 py-3">Restant</th>
                  <th className="px-4 py-3">%</th>
                  <th className="px-4 py-3">Tendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {budgets.map((budget: BudgetGouvernance) => (
                  <tr key={budget.projet_id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium">{budget.projet_nom}</td>
                    <td className="px-4 py-3">
                      {budget.budget_initial.toLocaleString('fr-FR')}€
                    </td>
                    <td className="px-4 py-3">
                      {budget.budget_consomme.toLocaleString('fr-FR')}€
                    </td>
                    <td className="px-4 py-3">
                      {budget.budget_restant.toLocaleString('fr-FR')}€
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full',
                              budget.pourcent_consomme > 100
                                ? 'bg-rose-500'
                                : budget.pourcent_consomme > 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(budget.pourcent_consomme, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs">{budget.pourcent_consomme.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {budget.tendance === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-rose-400" />
                      ) : budget.tendance === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Minus className="h-4 w-4 text-slate-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

