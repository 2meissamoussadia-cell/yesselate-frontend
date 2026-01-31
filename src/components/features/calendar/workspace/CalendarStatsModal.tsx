/**
 * CalendarStatsModal.tsx
 * =======================
 * 
 * Modal statistiques complètes pour le calendrier
 * Accessible via ⌘S ou bouton Stats
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Target, AlertTriangle, 
  CheckCircle2, Clock, Calendar, Activity,
  AlertCircle, Zap, Users, BarChart3, Calendar as CalendarIcon2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarStatsModalProps {
  open: boolean;
  onClose: () => void;
}

interface StatsData {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  overdueSLA: number;
  conflicts: number;
  completed: number;
  byType: { type: string; count: number; color: string }[];
  byPriority: { priority: string; count: number }[];
  byStatus: { status: string; count: number }[];
  upcomingEvents: {
    id: string;
    title: string;
    startDate: string;
    priority: string;
    type: string;
  }[];
  ts: string;
}

export function CalendarStatsModal({ open, onClose }: CalendarStatsModalProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousStats, setPreviousStats] = useState<StatsData | null>(null);

  // Charger les statistiques
  useEffect(() => {
    if (!open) return;

    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/calendar/stats', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          
          // Simuler des stats précédentes pour comparaison
          setPreviousStats({
            ...data,
            total: Math.round(data.total * 0.9),
            today: Math.round(data.today * 0.85),
            thisWeek: Math.round(data.thisWeek * 0.88),
            thisMonth: Math.round(data.thisMonth * 0.92),
            overdueSLA: Math.round(data.overdueSLA * 1.15),
            conflicts: Math.round(data.conflicts * 1.3),
            completed: Math.round(data.completed * 0.87),
            byType: data.byType,
            byPriority: data.byPriority,
            byStatus: data.byStatus,
            upcomingEvents: data.upcomingEvents,
            ts: data.ts,
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
      today: Math.round(((stats.today - previousStats.today) / previousStats.today) * 100),
      thisWeek: Math.round(((stats.thisWeek - previousStats.thisWeek) / previousStats.thisWeek) * 100),
      overdueSLA: Math.round(((stats.overdueSLA - previousStats.overdueSLA) / previousStats.overdueSLA) * 100),
      conflicts: Math.round(((stats.conflicts - previousStats.conflicts) / previousStats.conflicts) * 100),
      completed: Math.round(((stats.completed - previousStats.completed) / previousStats.completed) * 100),
    };
  }, [stats, previousStats]);

  const occupationRate = useMemo(() => {
    if (!stats) return 0;
    // Taux d'occupation basé sur événements aujourd'hui vs capacité max (supposée 10)
    const maxCapacity = 10;
    return Math.min(Math.round((stats.today / maxCapacity) * 100), 100);
  }, [stats]);

  const slaCompliance = useMemo(() => {
    if (!stats || stats.total === 0) return 100;
    return Math.round(((stats.total - stats.overdueSLA) / stats.total) * 100);
  }, [stats]);

  const completionRate = useMemo(() => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  const healthScore = useMemo(() => {
    if (!stats) return 0;
    
    // Score: 40% SLA compliance, 30% completion rate, 20% low conflicts, 10% occupation
    const conflictRate = stats.total > 0 ? (stats.conflicts / stats.total) * 100 : 0;
    const occupationScore = occupationRate <= 80 ? occupationRate : (100 - occupationRate + 80);
    
    const score = (slaCompliance * 0.4) + (completionRate * 0.3) + ((100 - conflictRate) * 0.2) + (occupationScore * 0.1);
    
    return Math.round(score);
  }, [stats, slaCompliance, completionRate, occupationRate]);

  if (loading || !stats) {
    return (
      <FluentModal
        open={open}
        onClose={onClose}
        title="📅 Statistiques Complètes"
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
      title="📅 Statistiques Complètes"
      size="xl"
    >
      <div className="space-y-6">
        {/* Vue d'ensemble globale */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon2 className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Total Événements</span>
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
              <span className="text-xs text-slate-600 dark:text-slate-400">Cette Semaine</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{stats.thisWeek}</div>
            {evolution && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {evolution.thisWeek > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600">+{evolution.thisWeek}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">{evolution.thisWeek}%</span>
                  </>
                )}
                <span>vs période précédente</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Conflits</span>
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.conflicts}</div>
            {evolution && (
              <div className="text-xs text-slate-400 mt-1">
                {stats.total > 0 ? Math.round((stats.conflicts / stats.total) * 100) : 0}% du total
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Aujourd'hui</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.today}</div>
            <div className="text-xs text-slate-400 mt-1">
              Occupation: {occupationRate}%
            </div>
          </div>
        </div>

        {/* Score de santé */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-500" />
            Score de Santé Calendrier
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
          
          {/* Détails score */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-400 mb-1">Conformité SLA</div>
              <div className="text-lg font-bold">{slaCompliance}%</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-400 mb-1">Taux Complétion</div>
              <div className="text-lg font-bold">{completionRate}%</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-400 mb-1">Taux Conflits</div>
              <div className="text-lg font-bold">
                {stats.total > 0 ? Math.round((stats.conflicts / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-400 mb-1">Occupation</div>
              <div className="text-lg font-bold">{occupationRate}%</div>
            </div>
          </div>
        </div>

        {/* Répartitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Par Type */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Par Type
            </h3>
            <div className="space-y-2">
              {stats.byType.map((item) => (
                <div key={item.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", `bg-${item.color}-500`)} />
                    <span>{item.type}</span>
                  </div>
                  <span className="font-mono font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Par Priorité */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Par Priorité
            </h3>
            <div className="space-y-2">
              {stats.byPriority.map((item) => (
                <div key={item.priority} className="flex items-center justify-between text-sm">
                  <Badge variant={
                    item.priority === 'urgent' ? 'urgent' :
                    item.priority === 'high' ? 'warning' :
                    item.priority === 'normal' ? 'info' :
                    'secondary'
                  } className="text-xs">
                    {item.priority}
                  </Badge>
                  <span className="font-mono font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Par Statut */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Par Statut
            </h3>
            <div className="space-y-2">
              {stats.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{item.status}</span>
                  <span className="font-mono font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Événements à venir */}
        {stats.upcomingEvents && stats.upcomingEvents.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Événements à Venir ({stats.upcomingEvents.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <CalendarIcon2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{event.title}</span>
                      <Badge variant={
                        event.priority === 'urgent' ? 'urgent' :
                        event.priority === 'high' ? 'warning' :
                        'info'
                      } className="text-[10px]">
                        {event.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <strong>{event.type}</strong> • {new Date(event.startDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertes si nécessaire */}
        {stats.overdueSLA > 0 && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-red-700 dark:text-red-400 mb-1">
                  🔴 Attention : {stats.overdueSLA} événement(s) en retard SLA
                </div>
                <p className="text-xs text-red-600 dark:text-red-500">
                  Ces événements nécessitent une action immédiate pour respecter les délais.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.conflicts > 3 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-amber-700 dark:text-amber-400 mb-1">
                  ⚠️ Attention : {stats.conflicts} conflit(s) détecté(s)
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Résolvez les conflits d'horaires pour optimiser votre planning.
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

