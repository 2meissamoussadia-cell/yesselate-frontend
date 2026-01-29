/**
 * Widget Finances globales — CA mois (réel vs prévu), Trésorerie, Créances, Dettes, Marge.
 * Exemple : FINANCES JANVIER 2026 | CA Réalisé 45M/50M 90% | Trésorerie 12M 🟢 | etc.
 */

'use client';

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoneyCompact } from '@lib-root/dashboard/kpi';
import type { FinancesGlobalesMock } from '../../data/financesGlobalesMock';

export interface FinancesGlobalesWidgetProps {
  data: FinancesGlobalesMock;
  className?: string;
}

export function FinancesGlobalesWidget({ data, className }: FinancesGlobalesWidgetProps) {
  const caPct = data.caPrevu > 0 ? Math.round((data.caRealise / data.caPrevu) * 100) : 0;

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden',
        className
      )}
    >
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/80">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
          Finances {data.moisLabel}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {/* CA Réalisé / Prévu + barre */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-slate-400">CA Réalisé</span>
            <span className="text-sm font-semibold text-slate-200">
              {formatMoneyCompact(data.caRealise)} / {formatMoneyCompact(data.caPrevu)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                caPct >= 90 ? 'bg-emerald-500' : caPct >= 70 ? 'bg-amber-500' : 'bg-rose-500'
              )}
              style={{ width: `${Math.min(100, caPct)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{caPct} %</p>
        </div>

        {/* Trésorerie + statut */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Trésorerie</span>
          <span className="text-sm font-semibold text-slate-200">
            {formatMoneyCompact(data.tresorerie)}
          </span>
          <TresorerieBadge status={data.tresorerieStatus} />
        </div>

        {/* Créances + alerte > 30j */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Créances</span>
          <span className="text-sm font-semibold text-slate-200">
            {formatMoneyCompact(data.creances)}
          </span>
          {data.creancesPlus30j > 0 && (
            <span className="text-xs font-medium text-amber-400">
              ⚠️ {data.creancesPlus30j} &gt; 30j
            </span>
          )}
        </div>

        {/* Dettes */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">Dettes fournisseurs</span>
          <span className="text-sm font-semibold text-slate-200">
            {formatMoneyCompact(data.dettes)}
          </span>
        </div>

        {/* Marge moyenne + objectif */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/50">
          <span className="text-xs text-slate-400">Marge moyenne</span>
          <span className="text-sm font-semibold text-slate-200">
            {data.margeMoyennePct} %
          </span>
          <MargeBadge status={data.margeStatus} objectif={data.margeObjectifPct} />
        </div>
      </div>
    </div>
  );
}

function TresorerieBadge({ status }: { status: 'sain' | 'attention' | 'critique' }) {
  const config = {
    sain: { label: 'Sain', className: 'text-emerald-400', icon: CheckCircle },
    attention: { label: 'Attention', className: 'text-amber-400', icon: AlertTriangle },
    critique: { label: 'Critique', className: 'text-rose-400', icon: AlertTriangle },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', c.className)}>
      <Icon className="h-3.5 w-3.5" />
      {c.label}
    </span>
  );
}

function MargeBadge({ status, objectif }: { status: 'ok' | 'sous_objectif'; objectif: number }) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
        <CheckCircle className="h-3.5 w-3.5" />
        Objectif {objectif}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
      <AlertTriangle className="h-3.5 w-3.5" />
      Sous objectif
    </span>
  );
}
