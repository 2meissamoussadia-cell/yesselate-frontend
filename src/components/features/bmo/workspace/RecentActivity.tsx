'use client';

import { useEffect, useState } from 'react';
import { 
  CheckCircle2, XCircle, FileText, UserPlus, MessageSquare, 
  Clock, AlertTriangle, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';

type ActivityItem = {
  id: string;
  demandId: string;
  type: string;
  actorName: string;
  message?: string | null;
  createdAt: string;
};

const ACTION_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  creation: { icon: FileText, color: 'text-blue-500 bg-blue-500/10', label: 'Création' },
  validation: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10', label: 'Validation' },
  rejection: { icon: XCircle, color: 'text-rose-500 bg-rose-500/10', label: 'Rejet' },
  assign: { icon: UserPlus, color: 'text-purple-500 bg-purple-500/10', label: 'Affectation' },
  request_complement: { icon: MessageSquare, color: 'text-amber-500 bg-amber-500/10', label: 'Complément' },
  review: { icon: Clock, color: 'text-slate-400 bg-slate-500/10', label: 'Revue' },
};

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes}min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return date.toLocaleDateString();
};

type Props = {
  limit?: number;
  className?: string;
};

export function RecentActivity({ limit = 10, className }: Props) {
  const { openTab } = useWorkspaceStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Récupérer les événements récents depuis plusieurs demandes
        const res = await fetch('/api/demands?queue=pending', { cache: 'no-store' });
        const data = await res.json();
        const demands = data.items ?? [];
        
        // Pour chaque demande, récupérer les événements
        const allActivities: ActivityItem[] = [];
        
        for (const demand of demands.slice(0, 5)) {
          try {
            const demandRes = await fetch(`/api/demands/${demand.id}`, { cache: 'no-store' });
            const demandData = await demandRes.json();
            const item = demandData.item;
            
            if (item?.audit) {
              for (const event of item.audit.slice(0, 3)) {
                allActivities.push({
                  id: event.id,
                  demandId: demand.id,
                  type: event.type,
                  actorName: event.actorName,
                  message: event.message,
                  createdAt: event.createdAt,
                });
              }
            }
          } catch {
            // Ignorer les erreurs individuelles
          }
        }
        
        // Trier par date et limiter
        allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setActivities(allActivities.slice(0, limit));
      } catch (e) {
        logger.error('Erreur chargement activités', e instanceof Error ? e : undefined, { component: 'RecentActivity' });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // Refresh toutes les 60 secondes
    const interval = setInterval(fetchActivities, 60000);
    return () => clearInterval(interval);
  }, [limit]);

  const openDemand = (demandId: string) => {
    openTab({
      type: 'demand',
      id: `demand:${demandId}`,
      title: demandId,
      icon: '📄',
      data: { demandId },
    });
  };

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activité récente
          </h3>
          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Activité récente
        </h3>
        <span className="text-xs text-slate-400">{activities.length} événements</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => {
            const config = ACTION_CONFIG[activity.type] ?? ACTION_CONFIG.review;
            const Icon = config.icon;
            
            return (
              <button
                key={activity.id}
                onClick={() => openDemand(activity.demandId)}
                className="w-full flex items-start gap-3 p-2 rounded-xl text-left transition-colors
                           hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-none", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{activity.demandId}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {config.label}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
                    <span className="font-medium">{activity.actorName}</span>
                    {activity.message && (
                      <span className="text-slate-400"> — {activity.message}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatRelativeTime(activity.createdAt)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

