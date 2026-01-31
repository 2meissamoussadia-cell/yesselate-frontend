/**
 * Modal de statistiques
 * Affiche les KPIs et statistiques détaillées
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { contratsApiService, type ContratsStats } from '@/lib/services/contratsApiService';
import { cn } from '@/lib/utils';

interface ContratStatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ContratStatsModal({ open, onClose }: ContratStatsModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContratsStats | null>(null);

  useEffect(() => {
    if (open) {
      loadStats();
    }
  }, [open]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await contratsApiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-slate-200">Statistiques</DialogTitle>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-700 text-slate-400"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
          </div>
        ) : stats ? (
          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Total contrats"
                value={stats.total}
                trend="+8"
                trendUp={true}
              />
              <StatCard
                label="En attente"
                value={stats.pending}
                trend="-3"
                trendUp={false}
              />
              <StatCard
                label="Validés"
                value={stats.validated}
                trend="+12"
                trendUp={true}
              />
              <StatCard
                label="Taux validation"
                value={`${stats.tauxValidation}%`}
                trend="+4%"
                trendUp={true}
              />
            </div>

            {/* Répartition par statut */}
            <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Répartition par statut</h3>
              <div className="space-y-3">
                <ProgressBar label="Validés" value={stats.validated} total={stats.total} color="emerald" />
                <ProgressBar label="En attente" value={stats.pending} total={stats.total} color="amber" />
                <ProgressBar label="Rejetés" value={stats.rejected} total={stats.total} color="red" />
                <ProgressBar label="Négociation" value={stats.negotiation} total={stats.total} color="blue" />
              </div>
            </div>

            {/* Répartition par type */}
            <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Répartition par type</h3>
              <div className="space-y-3">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <ProgressBar
                    key={type}
                    label={type}
                    value={count as number}
                    total={stats.total}
                    color="purple"
                  />
                ))}
              </div>
            </div>

            {/* Métriques financières */}
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                label="Montant total"
                value={`${(stats.totalMontant / 1000000).toFixed(1)}M FCFA`}
              />
              <MetricCard
                label="Montant moyen"
                value={`${(stats.avgMontant / 1000000).toFixed(1)}M FCFA`}
              />
              <MetricCard
                label="Délai moyen"
                value={`${stats.avgDelaiValidation.toFixed(1)} jours`}
              />
            </div>

            {/* Répartition par urgence */}
            <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Répartition par urgence</h3>
              <div className="space-y-3">
                {Object.entries(stats.byUrgency).map(([urgency, count]) => {
                  const colors = {
                    critical: 'red',
                    high: 'amber',
                    medium: 'blue',
                    low: 'slate',
                  };
                  return (
                    <ProgressBar
                      key={urgency}
                      label={urgency}
                      value={count as number}
                      total={stats.total}
                      color={colors[urgency as keyof typeof colors] || 'slate'}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            Aucune donnée disponible
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value, trend, trendUp }: { label: string; value: string | number; trend: string; trendUp: boolean }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-200 mb-1">{value}</p>
      <div className="flex items-center gap-1">
        {trendUp ? (
          <TrendingUp className="h-3 w-3 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3 w-3 text-amber-400" />
        )}
        <span className={cn('text-xs', trendUp ? 'text-emerald-400' : 'text-amber-400')}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = Math.round((value / total) * 100);
  
  const colors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-400 capitalize">{label}</span>
        <span className="text-sm font-medium text-slate-300">{percentage}% ({value})</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colors[color as keyof typeof colors])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-200">{value}</p>
    </div>
  );
}

