/**
 * Paiements Stats Modal - Modal détaillée des statistiques
 * Affiche les KPIs, graphiques et analyses complètes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { paiementsApiService, type PaiementsStats } from '@/lib/services/paiementsApiService';
import { logger } from '@/lib/utils/logger';
import {
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  Download,
  RefreshCw,
} from 'lucide-react';

interface PaiementsStatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaiementsStatsModal({ open, onClose }: PaiementsStatsModalProps) {
  const [stats, setStats] = useState<PaiementsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    setRefreshing(true);
    try {
      const data = await paiementsApiService.getStats();
      setStats(data);
    } catch (error) {
      logger.error('Failed to load stats', error as Error, { context: 'PaiementsStatsModal' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadStats();
    }
  }, [open]);

  if (!open) return null;

  const formatMontant = (montant: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(montant);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-900 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-100">Statistiques Paiements</h2>
              {stats && (
                <p className="text-xs text-slate-400">
                  Dernière mise à jour : {new Date(stats.ts).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadStats}
              disabled={refreshing}
              className="h-8"
            >
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </Button>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* KPIs Principaux */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard
                icon={<BarChart3 className="w-5 h-5" />}
                label="Total"
                value={stats.total}
                color="text-slate-200"
                bgColor="bg-slate-800/50"
              />
              <KPICard
                icon={<Clock className="w-5 h-5" />}
                label="En attente"
                value={stats.pending}
                color="text-amber-400"
                bgColor="bg-amber-500/10"
              />
              <KPICard
                icon={<CheckCircle className="w-5 h-5" />}
                label="Validés"
                value={stats.validated}
                color="text-emerald-400"
                bgColor="bg-emerald-500/10"
              />
              <KPICard
                icon={<XCircle className="w-5 h-5" />}
                label="Rejetés"
                value={stats.rejected}
                color="text-red-400"
                bgColor="bg-red-500/10"
              />
            </div>

            {/* Montants */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-emerald-300">Montant Total</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{formatMontant(stats.totalMontant)}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-blue-300">Moyenne</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{formatMontant(stats.avgMontant)}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-300">Trésorerie</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">{formatMontant(stats.tresorerieDisponible)}</p>
              </div>
            </div>

            {/* Par Urgence */}
            <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Répartition par Urgence
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.byUrgency).map(([key, value]) => (
                  <div key={key} className="flex flex-col items-center p-3 rounded-lg bg-slate-900/50">
                    <span className="text-xs text-slate-400 mb-1 capitalize">{key}</span>
                    <span className={cn(
                      'text-2xl font-bold',
                      key === 'critical' && 'text-red-400',
                      key === 'high' && 'text-amber-400',
                      key === 'medium' && 'text-blue-400',
                      key === 'low' && 'text-slate-400'
                    )}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Par Type */}
            {stats.byType && Object.keys(stats.byType).length > 0 && (
              <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Répartition par Type
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.byType).map(([type, count]) => {
                    const percentage = (count / stats.total) * 100;
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300 capitalize">{type}</span>
                          <span className="text-slate-400">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Échéances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">Échéances J+7</span>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {stats.echeancesJ7}
                  </Badge>
                </div>
                <p className="text-xs text-amber-300/70">Paiements à échéance dans les 7 prochains jours</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">Échéances J+30</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {stats.echeancesJ30}
                  </Badge>
                </div>
                <p className="text-xs text-blue-300/70">Paiements à échéance dans les 30 prochains jours</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <Button
                variant="outline"
                className="flex-1 border-slate-700"
                onClick={() => {
                  // Export stats
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">Aucune donnée disponible</p>
        )}
      </div>
    </div>
  );
}

// Helper Component
function KPICard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={cn('p-4 rounded-xl border border-slate-700/50', bgColor)}>
      <div className="flex items-center gap-2 mb-2">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: cn('w-5 h-5', color) }) : icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
    </div>
  );
}

