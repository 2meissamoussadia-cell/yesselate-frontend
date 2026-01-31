'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { PieChart, BarChart2, TrendingUp, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { getValidationStats } from '@/lib/services/validation-bc-api';
import type { ValidationStats } from '@/lib/services/validation-bc-api';

export function ValidationBCStatsModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ValidationStats | null>(null);

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
      loadStats();
    };
    window.addEventListener('validation-bc:open-stats', handleOpen);
    return () => window.removeEventListener('validation-bc:open-stats', handleOpen);
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getValidationStats('manual');
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FluentModal open={open} title="Statistiques" onClose={() => setOpen(false)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Vue d'ensemble</h3>
          <FluentButton size="sm" variant="secondary" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </FluentButton>
        </div>

        {loading && !stats && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-blue-200/50 bg-blue-50/50 dark:border-blue-800/30 dark:bg-blue-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-slate-400">Total</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-slate-400">Validés</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.validated}</div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-400">En attente</span>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-red-200/50 bg-red-50/50 dark:border-red-800/30 dark:bg-red-900/20">
                <div className="text-xs text-slate-400 mb-1">Rejetés</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
              </div>

              <div className="p-4 rounded-xl border border-orange-200/50 bg-orange-50/50 dark:border-orange-800/30 dark:bg-orange-900/20">
                <div className="text-xs text-slate-400 mb-1">Anomalies</div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{stats.anomalies}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <h4 className="font-semibold mb-3 text-sm">Par type de document</h4>
              <div className="space-y-2">
                {stats.byType.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-sm">{item.type}</span>
                    <span className="text-sm font-mono font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <h4 className="font-semibold mb-3 text-sm">Par bureau</h4>
              <div className="space-y-2">
                {stats.byBureau.map((item) => (
                  <div key={item.bureau} className="flex items-center justify-between">
                    <span className="text-sm">{item.bureau}</span>
                    <span className="text-sm font-mono font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <h4 className="font-semibold mb-3 text-sm">Activité récente</h4>
                <div className="space-y-2">
                  {stats.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{activity.documentId}</span> - {activity.action} par{' '}
                      {activity.actorName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-400 text-center">
              Dernière mise à jour: {new Date(stats.ts).toLocaleString('fr-FR')}
            </div>
          </>
        )}
      </div>
    </FluentModal>
  );
}
