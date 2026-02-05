/**
 * Demandes Command Center - Overview View
 * Vue d'ensemble avec KPIs et actions prioritaires
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Receipt,
  FileEdit,
  ShoppingCart,
  Building2,
  Scale,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
} from 'lucide-react';

export function DemandesOverviewView() {
  const { navigate, openModal, liveStats } = useDemandesCommandCenterStore();

  // Mock data for overview
  const kpis = [
    { id: 'pending', label: 'En attente', value: liveStats.pending || 45, trend: -5, icon: Clock, color: 'amber' },
    { id: 'urgent', label: 'Urgentes', value: liveStats.urgent || 12, trend: 3, icon: AlertCircle, color: 'rose' },
    { id: 'validated', label: 'Validées (24h)', value: liveStats.validated || 24, trend: 8, icon: CheckCircle, color: 'emerald' },
    { id: 'avgDelay', label: 'Délai moyen', value: `${liveStats.avgDelay || 2.3}j`, trend: -0.5, icon: BarChart3, color: 'blue' },
  ];

  const priorityActions = [
    { id: 'BC-2024-0892', title: 'BC Fournitures Bureau', type: 'bc', bureau: 'Achats', urgency: 'critical', delay: '5j' },
    { id: 'FAC-2024-1234', title: 'Facture Transport', type: 'facture', bureau: 'Finance', urgency: 'warning', delay: '3j' },
    { id: 'AVE-2024-0156', title: 'Avenant Contrat Maintenance', type: 'avenant', bureau: 'Juridique', urgency: 'critical', delay: '7j' },
    { id: 'BC-2024-0901', title: 'BC Matériel Informatique', type: 'bc', bureau: 'Achats', urgency: 'warning', delay: '2j' },
  ];

  const byService = [
    { id: 'achats', label: 'Service Achats', count: 156, icon: ShoppingCart, color: 'blue' },
    { id: 'finance', label: 'Service Finance', count: 198, icon: Building2, color: 'emerald' },
    { id: 'juridique', label: 'Service Juridique', count: 45, icon: Scale, color: 'purple' },
  ];

  const byType = [
    { id: 'bc', label: 'Bons de commande', count: 234, icon: FileText, color: 'blue' },
    { id: 'factures', label: 'Factures', count: 189, icon: Receipt, color: 'emerald' },
    { id: 'avenants', label: 'Avenants', count: 30, icon: FileEdit, color: 'purple' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* KPIs Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Performance Globale
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal('stats')}
            className="text-slate-400 hover:text-slate-200"
          >
            Statistiques complètes
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const iconColorClasses: Record<string, string> = {
              amber: 'text-amber-400',
              rose: 'text-rose-400',
              emerald: 'text-emerald-400',
              blue: 'text-blue-400',
            };

            return (
              <button
                key={kpi.id}
                onClick={() => navigate(kpi.id as any)}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <Icon className={cn('w-5 h-5', iconColorClasses[kpi.color])} />
                  </div>
                  {kpi.trend !== 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      {kpi.trend > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      {Math.abs(kpi.trend)}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-200">{kpi.value}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{kpi.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Actions prioritaires + Par service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions prioritaires */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Actions Prioritaires
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="warning">{priorityActions.length}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('urgent')}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Voir tout
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {priorityActions.map((action) => (
              <button
                key={action.id}
                onClick={() => openModal('demande-detail', { demandeId: action.id })}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    action.urgency === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{action.title}</p>
                  <p className="text-xs text-slate-400 truncate">{action.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {action.bureau}
                  </Badge>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      action.urgency === 'critical' ? 'text-rose-400' : 'text-amber-400'
                    )}
                  >
                    {action.delay}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Par service */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Par Service
            </h2>
          </div>

          <div className="divide-y divide-slate-800/50">
            {byService.map((service) => {
              const Icon = service.icon;
              const colorClasses: Record<string, string> = {
                blue: 'text-blue-400 bg-blue-500/10',
                emerald: 'text-emerald-400 bg-emerald-500/10',
                purple: 'text-purple-400 bg-purple-500/10',
              };

              return (
                <button
                  key={service.id}
                  onClick={() => navigate('pending', service.id as any)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className={cn('p-2 rounded-lg', colorClasses[service.color])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm text-slate-300">{service.label}</span>
                  <span className="text-lg font-semibold text-slate-200">{service.count}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Par type de document */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Par Type de Document
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {byType.map((type) => {
            const Icon = type.icon;
            const colorClasses: Record<string, string> = {
              blue: 'text-blue-400',
              emerald: 'text-emerald-400',
              purple: 'text-purple-400',
            };

            return (
              <button
                key={type.id}
                onClick={() => navigate('pending', type.id as any)}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-5 h-5', colorClasses[type.color])} />
                  <div>
                    <p className="text-sm text-slate-400">{type.label}</p>
                    <p className="text-xl font-semibold text-slate-200">{type.count}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}


