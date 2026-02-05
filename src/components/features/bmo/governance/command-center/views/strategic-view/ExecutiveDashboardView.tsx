/**
 * Vue stratégique > Tableau de bord exécutif
 * KPI synthétiques, alertes critiques exécutives, tendances trimestre
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  BarChart3,
} from 'lucide-react';

export function ExecutiveDashboardView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-200">Tableau de bord exécutif</h2>
          <p className="text-sm text-slate-400 mt-1">
            KPI synthétiques, alertes critiques exécutives, tendances trimestre
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-400">
          Exporter
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Projets actifs', value: '24', trend: 'up', trendValue: '+2', icon: LayoutDashboard },
          { label: 'Budget consommé', value: '67%', trend: 'down', trendValue: '-3%', icon: BarChart3 },
          { label: 'Jalons en retard', value: '5', trend: 'up', trendValue: '+1', icon: Calendar },
          { label: 'Risques critiques', value: '3', trend: 'stable', trendValue: '0', icon: AlertTriangle },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-slate-200">{kpi.value}</span>
              {kpi.trend && (
                <div className={cn(
                  'flex items-center gap-1 text-xs',
                  kpi.trend === 'up' ? 'text-red-400' : kpi.trend === 'down' ? 'text-emerald-400' : 'text-slate-400'
                )}>
                  {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : kpi.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                  {kpi.trendValue}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Alertes critiques */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Alertes critiques exécutives</h3>
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
            3 critiques
          </Badge>
        </div>
        <div className="space-y-3">
          {[
            { id: '1', title: 'Dépassement budget lot 4 - Projet Alpha', impact: '450K€', priority: 'critical' },
            { id: '2', title: 'Retard validation BC bloquant', impact: '1.2M€', priority: 'critical' },
            { id: '3', title: 'Ressource critique indisponible', impact: 'Jalon J5', priority: 'high' },
          ].map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 bg-slate-900/50 rounded border border-slate-700/30"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{alert.title}</p>
                <p className="text-xs text-slate-400 mt-1">Impact: {alert.impact}</p>
              </div>
              <Badge
                variant={alert.priority === 'critical' ? 'destructive' : 'warning'}
                className="ml-4"
              >
                {alert.priority === 'critical' ? 'Critique' : 'Élevé'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Tendances trimestre */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Tendances trimestre</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Évolution projets', value: '+12%', status: 'positive' },
            { label: 'Budget vs prévisionnel', value: '-3%', status: 'positive' },
            { label: 'Respect jalons', value: '85%', status: 'neutral' },
          ].map((trend) => (
            <div key={trend.label} className="bg-slate-900/50 rounded p-3">
              <p className="text-sm text-slate-400 mb-1">{trend.label}</p>
              <p className={cn(
                'text-xl font-semibold',
                trend.status === 'positive' ? 'text-emerald-400' : 'text-slate-300'
              )}>
                {trend.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Graphiques de synthèse - Placeholder */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Graphiques de synthèse</h3>
        <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded border border-slate-700/30">
          <p className="text-sm text-slate-400">Graphiques de synthèse à implémenter</p>
        </div>
      </div>
    </div>
  );
}

