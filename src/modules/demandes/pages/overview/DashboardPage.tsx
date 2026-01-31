/**
 * Page Dashboard - Vue d'ensemble des demandes
 * Affiche les KPIs, les actions prioritaires et la répartition par service
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FileCheck, Clock, AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { useDemandesStats } from '../../hooks/useDemandesStats';
import { useDemandesData } from '../../hooks/useDemandesData';
import { useServiceStats } from '../../hooks/useDemandesData';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDemandesStats();
  const { data: demandes, isLoading: demandesLoading } = useDemandesData();
  const { data: serviceStats, isLoading: serviceStatsLoading } = useServiceStats();

  if (statsLoading || demandesLoading || serviceStatsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-32 bg-slate-800/30 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-800/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statsData = stats || {
    total: 453,
    newToday: 0,
    pending: 45,
    urgent: 12,
    validated: 378,
    rejected: 15,
    overdue: 8,
    avgResponseTime: 2.3,
    approvalRate: 83,
    completionRate: 87,
    satisfactionScore: 4.2,
  };

  // Actions prioritaires (urgentes + en attente)
  const priorityActions = React.useMemo(() => {
    if (!demandes) return [];
    return demandes
      .filter((d) => d.status === 'urgent' || d.status === 'pending')
      .sort((a, b) => {
        // Prioriser les urgentes
        if (a.status === 'urgent' && b.status !== 'urgent') return -1;
        if (a.status !== 'urgent' && b.status === 'urgent') return 1;
        // Puis par priorité
        const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
      })
      .slice(0, 4);
  }, [demandes]);

  return (
    <div className="p-6 space-y-6">
      {/* Performance Globale */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Performance Globale</h2>
          <a
            href="#statistiques"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            Statistiques complètes →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* En attente */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-amber-400" />
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <TrendingDown className="h-3 w-3" />
                <span>-5</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-200 mb-1">{statsData.pending}</div>
            <div className="text-sm text-slate-400">En attente</div>
          </div>

          {/* Urgentes */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="flex items-center gap-1 text-green-500 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>+3</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-200 mb-1">{statsData.urgent}</div>
            <div className="text-sm text-slate-400">Urgentes</div>
          </div>

          {/* Validées (24h) */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div className="flex items-center gap-1 text-green-500 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>+8</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-200 mb-1">{statsData.validated}</div>
            <div className="text-sm text-slate-400">Validées (24h)</div>
          </div>

          {/* Délai moyen */}
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="h-5 w-5 text-blue-400" />
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <TrendingDown className="h-3 w-3" />
                <span>-0.5</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-200 mb-1">{statsData.avgResponseTime}j</div>
            <div className="text-sm text-slate-400">Délai moyen</div>
          </div>
        </div>
      </section>

      {/* Actions Prioritaires */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Actions Prioritaires</h2>
          <a
            href="#actions"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
          >
            Voir tout
            <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded">
              {priorityActions.length}
            </span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {priorityActions.slice(0, 4).map((demande) => (
            <div
              key={demande.id}
              className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    demande.priority === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 mb-1">{demande.title}</div>
                  <div className="text-xs text-slate-400 mb-2">{demande.reference}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{demande.service}</span>
                    <span className="text-slate-400">{demande.createdAt.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Par Service */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Par Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {serviceStats?.map((service) => (
            <div
              key={service.service}
              className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30"
            >
              <div className="text-sm font-medium text-slate-200 mb-2 capitalize">{service.service}</div>
              <div className="text-2xl font-bold text-slate-200">{service.total}</div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>{service.pending} en attente</span>
                {service.urgent > 0 && <span className="text-red-400">{service.urgent} urgentes</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

