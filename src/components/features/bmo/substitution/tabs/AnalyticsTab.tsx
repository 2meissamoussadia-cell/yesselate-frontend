/**
 * ====================================================================
 * TAB: Analytics & Statistiques
 * Tableaux de bord et graphiques pour les substitutions
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { substitutionApiService } from '@/lib/services/substitutionApiService';
import type { SubstitutionStats } from '@/lib/services/substitutionApiService';

export function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SubstitutionStats | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'year'>('30d');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const statsData = await substitutionApiService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-400">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  const getPercentChange = (current: number, total: number) => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Analytics & Statistiques
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Dernière mise à jour: {new Date(stats.ts).toLocaleString('fr-FR')}
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {[
              { value: '7d', label: '7 jours' },
              { value: '30d', label: '30 jours' },
              { value: '90d', label: '90 jours' },
              { value: 'year', label: 'Année' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value as any)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  period === p.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Total</div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-1">substitutions</div>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Actives</div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.active}</div>
            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {getPercentChange(stats.active, stats.total)}% du total
            </div>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Retard moyen</div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-400">{stats.avgDelay.toFixed(1)}j</div>
            <div className="text-xs text-slate-400 mt-1">jours de retard</div>
          </div>

          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Critiques</div>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.criticalCount}</div>
            <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Urgence haute
            </div>
          </div>
        </div>

        {/* By Reason */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Par Motif</h3>
          <div className="space-y-3">
            {Object.entries(stats.byReason).map(([reason, count]) => {
              const percentage = getPercentChange(count as number, stats.total);
              return (
                <div key={reason}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-300 capitalize">{reason}</span>
                    <span className="text-slate-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Bureau */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Par Bureau</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.byBureau)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([bureau, count]) => (
                <div key={bureau} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{bureau}</div>
                      <div className="text-xs text-slate-400">Bureau</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{count}</div>
                      <div className="text-xs text-slate-400">
                        {getPercentChange(count as number, stats.total)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-sm text-slate-400 mb-2">Absences en cours</div>
            <div className="text-3xl font-bold text-white">{stats.absencesCount}</div>
            <div className="text-xs text-slate-400 mt-1">employés absents</div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-sm text-slate-400 mb-2">Délégations actives</div>
            <div className="text-3xl font-bold text-white">{stats.delegationsCount}</div>
            <div className="text-xs text-slate-400 mt-1">délégations en cours</div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-sm text-slate-400 mb-2">Taux de complétion</div>
            <div className="text-3xl font-bold text-green-400">
              {getPercentChange(stats.completed, stats.total)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">{stats.completed} terminées</div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance Globale</h3>
              <p className="text-slate-300 text-sm">
                Le système traite actuellement {stats.active} substitutions actives avec un retard moyen de {stats.avgDelay.toFixed(1)} jours.
                {stats.criticalCount > 0 && ` ${stats.criticalCount} cas critiques nécessitent une attention immédiate.`}
              </p>
              <div className="flex gap-3 mt-4">
                <div className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">
                  ✅ {stats.completed} Terminées
                </div>
                <div className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">
                  ⏳ {stats.pending} En attente
                </div>
                {stats.expired > 0 && (
                  <div className="px-3 py-1 bg-red-500/20 rounded-full text-sm text-red-400">
                    ⚠️ {stats.expired} Expirées
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

