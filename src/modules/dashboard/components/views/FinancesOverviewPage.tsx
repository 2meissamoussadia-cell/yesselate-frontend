/**
 * Vue financière détaillée — Widget global, Cashflow, Par chantier (Budget vs Dépensé, Marge, ROI).
 */

'use client';

import React, { useMemo } from 'react';
import { Wallet, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoneyCompact } from '@lib-root/dashboard/kpi';
import {
  financesGlobales,
  cashflowMois,
  financesParChantier,
} from '../../data/financesGlobalesMock';
import { FinancesGlobalesWidget } from '../shared/FinancesGlobalesWidget';
import { CashflowChart } from '../shared/CashflowChart';
import {
  DashboardPageLayout,
  DashboardSection,
  DashboardPanel,
  DashboardGrid,
} from '../shared';

export function FinancesOverviewPage() {
  const chantiers = useMemo(() => financesParChantier, []);

  return (
    <DashboardPageLayout>
      <DashboardSection
        title="Vue financière"
        subtitle="Finances globales, cashflow prévisionnel, indicateurs par chantier"
        icon={Wallet}
      >
        <div className="space-y-6">
          {/* Widget Finances globales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FinancesGlobalesWidget data={financesGlobales} />
            <CashflowChart data={cashflowMois} height={200} />
          </div>

          {/* Par chantier : Budget vs Dépensé %, Marge prévisionnelle, Rentabilité */}
          <DashboardSection
            title="Par chantier"
            subtitle="Budget vs Dépensé (%), Marge prévisionnelle, Rentabilité estimée (ROI)"
            icon={Building2}
          >
            <DashboardPanel padding="md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Chantier</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Budget</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Dépensé</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Budget vs Dépensé</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Marge prév.</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Rentabilité (ROI)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chantiers.map((row) => (
                      <tr
                        key={row.chantierId}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-200">{row.chantierId}</span>
                          {row.chantierNom && (
                            <span className="text-slate-400 text-xs block">{row.chantierNom}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">
                          {formatMoneyCompact(row.budget)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">
                          {formatMoneyCompact(row.depense)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  row.depensePct <= 80 ? 'bg-emerald-500' : row.depensePct <= 95 ? 'bg-amber-500' : 'bg-rose-500'
                                )}
                                style={{ width: `${Math.min(100, row.depensePct)}%` }}
                              />
                            </div>
                            <span className="font-medium text-slate-200 w-12">{row.depensePct.toFixed(1)} %</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn(
                              'font-medium',
                              row.margePct >= 20 ? 'text-emerald-400' : 'text-amber-400'
                            )}
                          >
                            {row.margePct} %
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={cn(
                              'font-medium',
                              row.rentabilitePct >= 15 ? 'text-emerald-400' : row.rentabilitePct >= 10 ? 'text-slate-300' : 'text-amber-400'
                            )}
                          >
                            {row.rentabilitePct} %
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardPanel>
          </DashboardSection>
        </div>
      </DashboardSection>
    </DashboardPageLayout>
  );
}
