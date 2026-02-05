/**
 * Vue d'ensemble des Demandes RH
 * Statistiques et actions prioritaires
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  DollarSign,
  Plane,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { useDemandesRHCommandCenterStore } from '@/lib/stores/demandesRHCommandCenterStore';

export function DemandesRHOverviewView() {
  const { navigate, openDetailModal } = useDemandesRHCommandCenterStore();

  // Mock data - À remplacer par de vraies données API
  const stats = {
    total: 234,
    enAttente: 23,
    validees: 178,
    rejetees: 18,
    urgentes: 5,
    conges: 89,
    depenses: 67,
    deplacements: 45,
    avances: 10,
  };

  const kpis = [
    {
      id: 'en-attente',
      label: 'En attente',
      value: stats.enAttente,
      trend: -5,
      icon: Clock,
      color: 'amber',
      onClick: () => navigate('pending', 'all'),
    },
    {
      id: 'urgentes',
      label: 'Urgentes',
      value: stats.urgentes,
      trend: 3,
      icon: AlertTriangle,
      color: 'rose',
      onClick: () => navigate('urgent', 'all'),
    },
    {
      id: 'validees',
      label: 'Validées (24h)',
      value: 24,
      trend: 8,
      icon: CheckCircle,
      color: 'emerald',
      onClick: () => navigate('validated', 'all'),
    },
    {
      id: 'taux-validation',
      label: 'Taux validation',
      value: '87%',
      trend: 3,
      icon: BarChart3,
      color: 'blue',
    },
  ];

  const byType = [
    {
      id: 'conges',
      label: 'Congés',
      count: stats.conges,
      icon: Calendar,
      color: 'blue',
      onClick: () => navigate('conges', 'all'),
    },
    {
      id: 'depenses',
      label: 'Dépenses',
      count: stats.depenses,
      icon: DollarSign,
      color: 'emerald',
      onClick: () => navigate('depenses', 'all'),
    },
    {
      id: 'deplacements',
      label: 'Déplacements',
      count: stats.deplacements,
      icon: Plane,
      color: 'purple',
      onClick: () => navigate('deplacements', 'all'),
    },
    {
      id: 'avances',
      label: 'Avances',
      count: stats.avances,
      icon: Wallet,
      color: 'orange',
      onClick: () => navigate('avances', 'all'),
    },
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
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const colorClasses = {
              amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
              rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
              emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
              blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
            };

            return (
              <button
                key={kpi.id}
                onClick={kpi.onClick}
                className={cn(
                  'p-4 rounded-xl border transition-all duration-200',
                  'hover:scale-[1.02] hover:shadow-lg',
                  colorClasses[kpi.color as keyof typeof colorClasses] || colorClasses.blue,
                  kpi.onClick && 'cursor-pointer'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5" />
                  {kpi.trend !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      <span>{kpi.trend > 0 ? '+' : ''}{kpi.trend}</span>
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1">{kpi.value}</p>
                <p className="text-xs opacity-80">{kpi.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Par Type */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-400" />
          Répartition par type
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {byType.map((type) => {
            const Icon = type.icon;
            const colorClasses = {
              blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20',
              emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
              purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20',
              orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20',
            };

            return (
              <button
                key={type.id}
                onClick={type.onClick}
                className={cn(
                  'p-6 rounded-xl border transition-all duration-200',
                  'hover:scale-[1.02] hover:shadow-lg cursor-pointer',
                  colorClasses[type.color as keyof typeof colorClasses] || colorClasses.blue
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-6 h-6" />
                  <h3 className="font-semibold text-lg">{type.count}</h3>
                </div>
                <p className="text-sm opacity-80">{type.label}</p>
                <div className="mt-3 flex items-center gap-1 text-xs opacity-60">
                  <span>Voir</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Statistiques Globales */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Statistiques Globales
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <p className="text-xs text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-200">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <p className="text-xs text-slate-400 mb-1">En attente</p>
            <p className="text-2xl font-bold text-amber-400">{stats.enAttente}</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <p className="text-xs text-slate-400 mb-1">Validées</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.validees}</p>
          </div>
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
            <p className="text-xs text-slate-400 mb-1">Rejetées</p>
            <p className="text-2xl font-bold text-rose-400">{stats.rejetees}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

