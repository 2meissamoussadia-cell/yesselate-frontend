'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Shield,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { calculateAlertStats, type AlertStats } from '@/lib/data/alerts';

interface AlertLiveCountersProps {
  onQueueClick?: (queue: string) => void;
  compact?: boolean;
}

/**
 * AlertLiveCounters
 * =================
 * 
 * Compteurs live des alertes avec indicateurs de tendance.
 * Cliquable pour ouvrir la queue correspondante.
 */
export function AlertLiveCounters({ onQueueClick, compact = false }: AlertLiveCountersProps) {
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Charger les stats
  const loadStats = useCallback(() => {
    setLoading(true);
    // Simuler un délai réseau
    setTimeout(() => {
      const newStats = calculateAlertStats();
      setStats(newStats);
      setLastUpdate(new Date());
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    loadStats();
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (!stats) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const counters = [
    {
      label: 'Critiques',
      value: stats.critical,
      queue: 'critical',
      icon: AlertCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
      borderColor: 'border-rose-500/30',
      trend: 0, // À calculer avec historique
    },
    {
      label: 'Avertissements',
      value: stats.warning,
      queue: 'warning',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      trend: 0,
    },
    {
      label: 'Bloqués',
      value: stats.byType?.blocked || 0,
      queue: 'blocked',
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      trend: 0,
    },
    {
      label: 'Info',
      value: stats.info,
      queue: 'info',
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      trend: 0,
    },
    {
      label: 'Acquittées',
      value: stats.acknowledged,
      queue: 'acknowledged',
      icon: CheckCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      trend: 1,
    },
    {
      label: 'Résolues',
      value: stats.resolved,
      queue: 'resolved',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      trend: 1,
    },
  ];

  if (compact) {
    // Version compacte (pour mobile ou header réduit)
    return (
      <div className="flex items-center gap-2">
        {counters.slice(0, 3).map((counter) => {
          const Icon = counter.icon;
          return (
            <button
              key={counter.queue}
              onClick={() => onQueueClick?.(counter.queue)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all',
                counter.bgColor,
                'hover:scale-105 border',
                counter.borderColor,
                counter.value > 0 && counter.queue === 'critical' && 'animate-pulse'
              )}
              title={counter.label}
            >
              <Icon className={cn('w-3.5 h-3.5', counter.color)} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {counter.value}
              </span>
            </button>
          );
        })}
        <FluentButton
          variant="ghost"
          size="sm"
          onClick={loadStats}
          disabled={loading}
          title="Rafraîchir"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
        </FluentButton>
      </div>
    );
  }

  // Version complète
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Alertes en temps réel
        </h3>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-slate-400">
              Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <FluentButton
            variant="ghost"
            size="sm"
            onClick={loadStats}
            disabled={loading}
            title="Rafraîchir les statistiques"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </FluentButton>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {counters.map((counter) => {
          const Icon = counter.icon;
          const TrendIcon = counter.trend > 0 ? TrendingUp : counter.trend < 0 ? TrendingDown : Minus;
          
          return (
            <button
              key={counter.queue}
              onClick={() => onQueueClick?.(counter.queue)}
              className={cn(
                'group relative flex flex-col items-start gap-1 p-3 rounded-xl transition-all',
                counter.bgColor,
                'hover:scale-105 hover:shadow-md border',
                counter.borderColor,
                counter.value > 0 && counter.queue === 'critical' && 'animate-pulse'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={cn('w-4 h-4', counter.color)} />
                {counter.trend !== 0 && (
                  <TrendIcon 
                    className={cn(
                      'w-3 h-3',
                      counter.trend > 0 ? 'text-emerald-500' : 'text-rose-500'
                    )} 
                  />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                  {counter.value}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {counter.label}
              </span>
              
              {/* Overlay hover */}
              <div className="absolute inset-0 rounded-xl bg-slate-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          );
        })}
      </div>
      
      {/* Résumé additionnel */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{stats.total}</strong> total
          </span>
          <span>
            Temps moy. résolution: <strong className="text-slate-700 dark:text-slate-300">{stats.avgResolutionTime}min</strong>
          </span>
          <span>
            Temps moy. réponse: <strong className="text-slate-700 dark:text-slate-300">{stats.avgResponseTime}min</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

