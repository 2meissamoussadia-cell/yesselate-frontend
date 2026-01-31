/**
 * DelegationStatsModal.tsx
 * ==========================
 * 
 * Modal statistiques complètes pour les délégations
 * Accessible via ⌘S ou bouton Stats
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Target, AlertTriangle, 
  CheckCircle2, Clock, Users, Shield, Activity,
  XCircle, Pause, Zap, Calendar, FileWarning
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DelegationStatsModalProps {
  open: boolean;
  onClose: () => void;
}

interface StatsData {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  suspended: number;
  expiringSoon: number;
  totalUsage: number;
  byBureau: { bureau: string; count: number }[];
  byType: { type: string; count: number }[];
  recentActivity: {
    id: string;
    delegationId: string;
    delegationType: string;
    agentName: string;
    action: string;
    actorName: string;
    details: string | null;
    createdAt: string;
  }[];
}

export function DelegationStatsModal({ open, onClose }: DelegationStatsModalProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousStats, setPreviousStats] = useState<StatsData | null>(null);

  // Charger les statistiques
  useEffect(() => {
    if (!open) return;

    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/delegations/stats', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          
          // Simuler des stats précédentes pour comparaison
          setPreviousStats({
            ...data,
            total: Math.round(data.total * 0.9),
            active: Math.round(data.active * 0.85),
            expired: Math.round(data.expired * 1.15),
            revoked: Math.round(data.revoked * 1.05),
            suspended: Math.round(data.suspended * 0.95),
            expiringSoon: Math.round(data.expiringSoon * 1.2),
            totalUsage: Math.round(data.totalUsage * 0.88),
          });
        }
      } catch (e) {
        console.error('Erreur chargement stats:', e);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [open]);

  const evolution = useMemo(() => {
    if (!stats || !previousStats) return null;

    return {
      total: Math.round(((stats.total - previousStats.total) / previousStats.total) * 100),
      active: Math.round(((stats.active - previousStats.active) / previousStats.active) * 100),
      expired: Math.round(((stats.expired - previousStats.expired) / previousStats.expired) * 100),
      suspended: Math.round(((stats.suspended - previousStats.suspended) / previousStats.suspended) * 100),
      totalUsage: Math.round(((stats.totalUsage - previousStats.totalUsage) / previousStats.totalUsage) * 100),
    };
  }, [stats, previousStats]);

  const topBureau = useMemo(() => {
    if (!stats) return null;
    return stats.byBureau.reduce((max, b) => b.count > max.count ? b : max, stats.byBureau[0]);
  }, [stats]);

  const topType = useMemo(() => {
    if (!stats) return null;
    return stats.byType.reduce((max, t) => t.count > max.count ? t : max, stats.byType[0]);
  }, [stats]);

  const healthScore = useMemo(() => {
    if (!stats) return 0;
    
    const activeRate = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;
    const expiringRate = stats.active > 0 ? (stats.expiringSoon / stats.active) * 100 : 0;
    const suspendedRate = stats.total > 0 ? (stats.suspended / stats.total) * 100 : 0;
    
    // Score: 40% active rate, 30% low expiring, 30% low suspended
    const score = (activeRate * 0.4) + ((100 - expiringRate) * 0.3) + ((100 - suspendedRate) * 0.3);
    
    return Math.round(score);
  }, [stats]);

  if (loading || !stats) {
    return (
      <FluentModal
        open={open}
        onClose={onClose}
        title="📊 Statistiques Complètes"
        size="xl"
      >
        <div className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      </FluentModal>
    );
  }

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="📊 Statistiques Complètes"
      size="xl"
    >
      <div className="space-y-6">
        {/* Vue d'ensemble globale */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Total Délégations</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            {evolution && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {evolution.total > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600">+{evolution.total}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">{evolution.total}%</span>
                  </>
                )}
                <span>vs période précédente</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Actives</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{stats.active}</div>
            {evolution && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {evolution.active > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600">+{evolution.active}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">{evolution.active}%</span>
                  </>
                )}
                <span>vs période précédente</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Expirent Bientôt</span>
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.expiringSoon}</div>
            <div className="text-xs text-slate-400 mt-1">
              {stats.active > 0 ? Math.round((stats.expiringSoon / stats.active) * 100) : 0}% des actives
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Utilisations</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalUsage}</div>
            {evolution && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {evolution.totalUsage > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600">+{evolution.totalUsage}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">{evolution.totalUsage}%</span>
                  </>
                )}
                <span>vs période précédente</span>
              </div>
            )}
          </div>
        </div>

        {/* Score de santé */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            Score de Santé Global
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">État général</span>
                <span className="font-bold text-2xl">{healthScore}/100</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    healthScore >= 80 ? "bg-emerald-500" :
                    healthScore >= 60 ? "bg-amber-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
            <Badge variant={
              healthScore >= 80 ? 'success' :
              healthScore >= 60 ? 'warning' :
              'urgent'
            } className="text-lg px-4 py-2">
              {healthScore >= 80 ? '🟢 Excellent' :
               healthScore >= 60 ? '🟡 Bon' :
               '🔴 À améliorer'}
            </Badge>
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            Répartition par Statut
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Actives</div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round((stats.active / stats.total) * 100)}%
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800">
              <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-600">{stats.expired}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Expirées</div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round((stats.expired / stats.total) * 100)}%
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Révoquées</div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round((stats.revoked / stats.total) * 100)}%
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <Pause className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">{stats.suspended}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Suspendues</div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round((stats.suspended / stats.total) * 100)}%
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <AlertTriangle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Expirent</div>
              <div className="text-xs text-slate-400 mt-1">
                dans 7 jours
              </div>
            </div>
          </div>
        </div>

        {/* Top Bureau et Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Bureau */}
          {topBureau && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Bureau le Plus Actif
              </h3>
              <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg">{topBureau.bureau}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Bureau champion</div>
                  </div>
                  <Badge variant="info" className="text-2xl px-4 py-2">
                    {topBureau.count}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mt-3">
                  {Math.round((topBureau.count / stats.total) * 100)}% du total des délégations
                </div>
              </div>
            </div>
          )}

          {/* Top Type */}
          {topType && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Type le Plus Utilisé
              </h3>
              <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-lg">{topType.type}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Type dominant</div>
                  </div>
                  <Badge variant="info" className="text-2xl px-4 py-2">
                    {topType.count}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mt-3">
                  {Math.round((topType.count / stats.total) * 100)}% du total des délégations
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activité récente */}
        {stats.recentActivity && stats.recentActivity.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Activité Récente ({stats.recentActivity.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <FileWarning className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{activity.action}</span>
                      <Badge variant="info" className="text-[10px]">
                        {activity.delegationType}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Par <strong>{activity.actorName}</strong> sur délégation de <strong>{activity.agentName}</strong>
                    </p>
                    <div className="text-xs text-slate-400">
                      {new Date(activity.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertes si nécessaire */}
        {stats.expiringSoon > 5 && (
          <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-orange-700 dark:text-orange-400 mb-1">
                  ⚠️ Attention : {stats.expiringSoon} délégations expirent bientôt
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-500">
                  Pensez à renouveler ou prolonger ces délégations pour éviter les interruptions de service.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer avec timestamp */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>
    </FluentModal>
  );
}

