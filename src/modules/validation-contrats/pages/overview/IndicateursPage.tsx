/**
 * Page : Vue d'ensemble > Indicateurs en temps réel
 */

'use client';

import React from 'react';
import { useContratsStats } from '../../hooks';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';
import { KpiPanel } from '../../components/KpiPanel';

export function IndicateursPage() {
  const { data: stats, isLoading, error } = useContratsStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des indicateurs...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des indicateurs</div>
      </div>
    );
  }

  const kpiCards = [
    {
      icon: Activity,
      title: 'Total contrats',
      value: stats.total,
      change: '+5',
      changeType: 'positive' as const,
      color: 'purple',
    },
    {
      icon: Clock,
      title: 'En attente',
      value: stats.enAttente,
      change: '-3',
      changeType: 'negative' as const,
      color: 'yellow',
    },
    {
      icon: CheckCircle2,
      title: 'Validés ce mois',
      value: stats.valides,
      change: '+8',
      changeType: 'positive' as const,
      color: 'green',
    },
    {
      icon: TrendingUp,
      title: 'Taux validation',
      value: `${stats.tauxValidation}%`,
      change: '+2%',
      changeType: 'positive' as const,
      color: 'blue',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Indicateurs en temps réel</h2>
        <p className="text-sm text-slate-400">
          Vue d'ensemble des contrats actifs et des métriques clés
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, index) => (
          <KpiPanel
            key={index}
            icon={card.icon}
            title={card.title}
            value={card.value}
            change={card.change}
            changeType={card.changeType}
            color={card.color}
          />
        ))}
      </div>

      {/* Contrats à valider */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-200">Contrats à valider</h3>
          <span className="text-sm text-slate-400">
            {stats.enAttente + stats.urgents} contrat(s)
          </span>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Critiques</span>
              <span className="text-red-400 font-medium">{stats.parPriorite.CRITICAL}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Moyens</span>
              <span className="text-yellow-400 font-medium">{stats.parPriorite.MEDIUM}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Faible priorité</span>
              <span className="text-slate-400 font-medium">{stats.parPriorite.LOW}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

