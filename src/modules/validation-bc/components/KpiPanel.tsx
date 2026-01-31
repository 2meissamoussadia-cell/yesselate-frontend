/**
 * Panel KPI pour Validation-BC
 * Indicateurs en temps réel
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FileCheck, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { useValidationStats } from '../hooks';

interface KpiPanelProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function KpiPanel({ collapsed = false, onToggleCollapse }: KpiPanelProps) {
  const { data: stats, isLoading } = useValidationStats();

  if (collapsed || !stats) {
    return (
      <div className="h-12 border-b border-slate-700/50 bg-slate-900/60 flex items-center px-4">
        <button
          onClick={onToggleCollapse}
          className="text-xs text-slate-400 hover:text-slate-300"
        >
          Afficher les KPIs
        </button>
      </div>
    );
  }

  const kpis = [
    {
      icon: FileCheck,
      label: 'Total',
      value: stats.totalDocuments,
      color: 'muted',
    },
    {
      icon: Clock,
      label: 'En Attente',
      value: stats.enAttente,
      color: 'warning',
    },
    {
      icon: CheckCircle2,
      label: 'Validés',
      value: stats.valides,
      color: 'success',
    },
    {
      icon: XCircle,
      label: 'Rejetés',
      value: stats.rejetes,
      color: 'muted',
    },
    {
      icon: AlertTriangle,
      label: 'Urgents',
      value: stats.urgents,
      color: 'critical',
    },
    {
      icon: TrendingUp,
      label: 'Taux Validation',
      value: `${stats.tauxValidation.toFixed(0)}%`,
      color: 'success',
    },
    {
      icon: Clock,
      label: 'Délai Moyen',
      value: `${stats.delaiMoyen.toFixed(1)}j`,
      color: 'warning',
    },
    {
      icon: Activity,
      label: 'Anomalies',
      value: stats.anomalies,
      color: 'muted',
    },
  ];

  return (
    <div className="border-b border-slate-700/50 bg-slate-900/60">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            INDICATEURS EN TEMPS RÉEL
          </span>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-xs text-slate-400 hover:text-slate-300"
            >
              Masquer
            </button>
          )}
        </div>
        <span className="text-xs text-slate-400">Mise à jour: à l'instant</span>
      </div>

      {isLoading ? (
        <div className="px-4 py-3 text-center text-sm text-slate-400">
          Chargement...
        </div>
      ) : (
        <div className="flex items-center gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border min-w-fit',
                  kpi.color === 'critical'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : kpi.color === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : kpi.color === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">{kpi.label}</span>
                  <span className="text-sm font-bold">{kpi.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
