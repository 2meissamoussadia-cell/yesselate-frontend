'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, MessageSquare, AlertTriangle, 
  FileText, TrendingUp, DollarSign, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { contratsApiService, type ContratsStats } from '@/lib/services/contratsApiService';
import { useContratsWorkspaceStore } from '@/lib/stores/contratsWorkspaceStore';

interface Props {
  onOpenQueue: (queue: string, title: string, icon: string) => void;
  compact?: boolean;
}

export function ContratsLiveCounters({ onOpenQueue, compact = false }: Props) {
  const { openTab } = useContratsWorkspaceStore();
  const [stats, setStats] = useState<ContratsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await contratsApiService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  const counters = [
    {
      key: 'pending',
      label: 'À valider',
      value: stats.pending,
      icon: Clock,
      color: stats.pending > 0 ? 'amber' : 'slate',
      action: () => onOpenQueue('pending', 'À valider', '⏳'),
    },
    {
      key: 'critical',
      label: 'Urgents',
      value: stats.byUrgency?.critical || 0,
      icon: AlertTriangle,
      color: (stats.byUrgency?.critical || 0) > 0 ? 'red' : 'slate',
      action: () => onOpenQueue('critical', 'Urgents', '🚨'),
    },
    {
      key: 'negotiation',
      label: 'En négociation',
      value: stats.negotiation,
      icon: MessageSquare,
      color: stats.negotiation > 0 ? 'blue' : 'slate',
      action: () => onOpenQueue('negotiation', 'En négociation', '💬'),
    },
    {
      key: 'validated',
      label: 'Validés',
      value: stats.validated,
      icon: CheckCircle,
      color: 'emerald',
      action: () => onOpenQueue('validated', 'Validés', '✅'),
    },
    {
      key: 'rejected',
      label: 'Rejetés',
      value: stats.rejected,
      icon: XCircle,
      color: stats.rejected > 0 ? 'red' : 'slate',
      action: () => onOpenQueue('rejected', 'Rejetés', '❌'),
    },
    {
      key: 'montant',
      label: 'Montant total',
      value: contratsApiService.formatMontant(stats.totalMontant),
      suffix: 'FCFA',
      icon: DollarSign,
      color: 'purple',
      action: () => openTab({ type: 'analytics', title: 'Analytics', icon: '📊', data: {} }),
    },
  ];

  return (
    <div className={cn(
      "grid gap-3",
      compact 
        ? "grid-cols-3 md:grid-cols-6" 
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
    )}>
      {counters.map((counter) => {
        const Icon = counter.icon;
        const hasValue = typeof counter.value === 'number' ? counter.value > 0 : true;
        
        return (
          <button
            key={counter.key}
            onClick={counter.action}
            className={cn(
              "p-4 rounded-xl border text-left transition-all hover:shadow-md group",
              hasValue && counter.color !== 'slate'
                ? `bg-${counter.color}-500/10 border-${counter.color}-500/30 hover:border-${counter.color}-500/50`
                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn(
                "w-4 h-4",
                hasValue && counter.color !== 'slate'
                  ? counter.color === 'red' ? 'text-red-500' :
                    counter.color === 'amber' ? 'text-amber-500' :
                    counter.color === 'blue' ? 'text-blue-500' :
                    counter.color === 'emerald' ? 'text-emerald-500' :
                    counter.color === 'purple' ? 'text-purple-500' :
                    'text-slate-400'
                  : 'text-slate-400',
                counter.key === 'critical' && (stats.byUrgency?.critical || 0) > 0 && 'animate-pulse'
              )} />
              <span className="text-xs text-slate-400 font-medium">{counter.label}</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              hasValue && counter.color !== 'slate'
                ? counter.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  counter.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                  counter.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                  counter.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  'text-slate-900 dark:text-slate-100'
                : 'text-slate-900 dark:text-slate-100'
            )}>
              {counter.value}
              {counter.suffix && (
                <span className="text-xs font-normal text-slate-400 ml-1">{counter.suffix}</span>
              )}
            </p>
          </button>
        );
      })}
    </div>
  );
}

