/**
 * Vue stratégique > KPI directeurs
 * Projets actifs et tendance, Budget consommé vs prévisionnel, Jalons respect/retard, Risques ouverts et exposition
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  Wallet,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export function DirectorKPIsView() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">KPI directeurs</h2>
        <p className="text-sm text-slate-400 mt-1">
          Projets actifs et tendance, Budget consommé vs prévisionnel, Jalons respect/retard, Risques ouverts et exposition
        </p>
      </div>

      {/* Projets actifs */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Projets actifs et tendance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total projets', value: '24', trend: '+2', status: 'positive' },
            { label: 'On-track', value: '12', trend: '+1', status: 'positive' },
            { label: 'At-risk', value: '8', trend: '-1', status: 'warning' },
            { label: 'En retard', value: '4', trend: '+2', status: 'negative' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-900/50 rounded p-3">
              <p className="text-sm text-slate-400 mb-1">{kpi.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-slate-200">{kpi.value}</span>
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  kpi.status === 'positive' ? 'text-emerald-400' : kpi.status === 'negative' ? 'text-red-400' : 'text-amber-400'
                )}>
                  {kpi.status === 'positive' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Budget consommé vs prévisionnel</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Budget consommé</span>
            <span className="text-sm font-medium text-slate-200">12.5M€ / 18.7M€ (67%)</span>
          </div>
          <div className="w-full bg-slate-900/50 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: '67%' }} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Écart: -3% vs prévisionnel</span>
            <span>•</span>
            <span>Prévisionnel: 18.7M€</span>
          </div>
        </div>
      </div>

      {/* Jalons */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Jalons respect/retard</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Respectés', value: '45', total: 50, status: 'success' },
            { label: 'En retard', value: '5', total: 50, status: 'warning' },
            { label: 'Taux respect', value: '90%', status: 'success' },
            { label: 'Retard moyen', value: '7j', status: 'warning' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-900/50 rounded p-3">
              <p className="text-sm text-slate-400 mb-1">{kpi.label}</p>
              <p className={cn(
                'text-xl font-semibold',
                kpi.status === 'success' ? 'text-emerald-400' : 'text-amber-400'
              )}>
                {kpi.value}
              </p>
              {kpi.total && (
                <p className="text-xs text-slate-400 mt-1">sur {kpi.total}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Risques */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Risques ouverts et exposition</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Risques ouverts', value: '18', status: 'warning' },
            { label: 'Risques critiques', value: '3', status: 'critical' },
            { label: 'Exposition financière', value: '450K€', status: 'critical' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-900/50 rounded p-3">
              <p className="text-sm text-slate-400 mb-1">{kpi.label}</p>
              <p className={cn(
                'text-xl font-semibold',
                kpi.status === 'critical' ? 'text-red-400' : 'text-amber-400'
              )}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

