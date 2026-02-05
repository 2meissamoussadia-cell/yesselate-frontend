/**
 * Page : Vue d'ensemble > Indicateurs en temps réel
 */

'use client';

import React from 'react';
import { useValidationStats } from '../../hooks';
import { FileCheck, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';

export function IndicateursPage() {
  const { data: stats, isLoading, error, isError } = useValidationStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des indicateurs...</div>
      </div>
    );
  }

  if (isError || error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des indicateurs</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Aucune donnée disponible</div>
      </div>
    );
  }

  const kpiCards = [
    {
      icon: FileCheck,
      title: 'Documents Total',
      value: stats.totalDocuments,
      change: '+8',
      changeType: 'positive' as const,
      color: 'muted',
      sparkline: [140, 145, 150, 148, 156],
    },
    {
      icon: Clock,
      title: 'En Attente',
      value: stats.enAttente,
      change: '-3',
      changeType: 'negative' as const,
      color: 'warning',
      sparkline: [49, 48, 47, 46],
    },
    {
      icon: CheckCircle2,
      title: 'Validés',
      value: stats.valides,
      change: '+12',
      changeType: 'positive' as const,
      color: 'success',
      sparkline: [75, 80, 82, 85, 87],
    },
    {
      icon: XCircle,
      title: 'Rejetés',
      value: stats.rejetes,
      change: undefined,
      changeType: 'neutral' as const,
      color: 'muted',
      sparkline: [8, 8, 8, 8, 8],
    },
    {
      icon: AlertTriangle,
      title: 'Urgents',
      value: stats.urgents,
      change: '-2',
      changeType: 'negative' as const,
      color: 'critical',
      sparkline: [14, 13, 12],
    },
    {
      icon: TrendingUp,
      title: 'Taux Validation',
      value: `${stats.tauxValidation.toFixed(0)}%`,
      change: '+3%',
      changeType: 'positive' as const,
      color: 'success',
      sparkline: [89, 90, 91, 92],
    },
    {
      icon: Clock,
      title: 'Délai Moyen',
      value: `${stats.delaiMoyen.toFixed(1)}j`,
      change: '-0.5j',
      changeType: 'negative' as const,
      color: 'warning',
      sparkline: [2.8, 2.6, 2.5, 2.3],
    },
    {
      icon: Activity,
      title: 'Anomalies',
      value: stats.anomalies,
      change: undefined,
      changeType: 'neutral' as const,
      color: 'muted',
      sparkline: [15, 15, 15, 15, 15],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Indicateurs en temps réel</h2>
        <p className="text-sm text-slate-400">
          Vue d'ensemble des documents et des métriques clés de validation
        </p>
      </div>

      {/* Indicateurs EN TEMPS RÉEL */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            INDICATEURS EN TEMPS RÉEL
          </h3>
          <span className="text-xs text-slate-400">Mise à jour: à l'instant</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            const maxValue = Math.max(...card.sparkline);
            const minValue = Math.min(...card.sparkline);
            const range = maxValue - minValue || 1;

            return (
              <div
                key={card.title}
                className={cn(
                  'p-4 rounded-lg border transition-all hover:scale-105',
                  card.color === 'critical'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : card.color === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : card.color === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium opacity-80 truncate">{card.title}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <div className="text-2xl font-bold">{card.value}</div>
                  {card.change && (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        card.changeType === 'positive' && 'text-emerald-400',
                        card.changeType === 'negative' && 'text-amber-400',
                        (card.changeType as string) === 'neutral' && 'text-slate-400'
                      )}
                    >
                      {card.change}
                    </span>
                  )}
                </div>

                {/* Sparkline */}
                <div className="flex items-end gap-0.5 h-8">
                  {card.sparkline.map((value, index) => {
                    const height = ((value - minValue) / range) * 100;
                    return (
                      <div
                        key={index}
                        className={cn(
                          'flex-1 rounded-t',
                          card.changeType === 'positive' && 'bg-emerald-500/50',
                          card.changeType === 'negative' && 'bg-amber-500/50',
                          card.changeType === 'neutral' && 'bg-slate-600/50'
                        )}
                        style={{ height: `${Math.max(height, 20)}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

