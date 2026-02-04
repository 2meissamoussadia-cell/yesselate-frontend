'use client';

import { useMemo } from 'react';
import { AlertCircle, AlertTriangle, Clock, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';
import { filterAlertsByQueue } from '@/lib/data/alerts';

interface AlertAlertsBannerProps {
  dismissedIds?: Set<string> | string[];
  onDismiss?: (alertId: string) => void;
}

/**
 * AlertAlertsBanner
 * =================
 * 
 * Bannière pour afficher les alertes critiques nécessitant une action immédiate.
 * Similaire à DelegationAlertsBanner mais pour les alertes système.
 */
export function AlertAlertsBanner({ dismissedIds, onDismiss }: AlertAlertsBannerProps) {
  const { openTab } = useAlertWorkspaceStore();
  
  // Convert dismissedIds to Set if array
  const dismissedSet = useMemo(() => {
    if (!dismissedIds) return new Set<string>();
    return dismissedIds instanceof Set ? dismissedIds : new Set(dismissedIds);
  }, [dismissedIds]);
  
  // Récupérer les alertes critiques actives (exclure les dismissed)
  const criticalAlerts = useMemo(() => {
    return filterAlertsByQueue('critical')
      .filter(alert => !dismissedSet.has(alert.id))
      .slice(0, 3); // Max 3 pour ne pas surcharger
  }, [dismissedSet]);

  if (criticalAlerts.length === 0) return null;

  const handleAlertClick = (alertId: string, title: string) => {
    openTab({
      id: `alert:${alertId}`,
      type: 'alert',
      title: title,
      icon: '🔴',
      data: { alertId },
    });
  };

  return (
    <div className="space-y-2">
      {criticalAlerts.map((alert) => {
        const isSLA = alert.type === 'sla';
        const isBlocked = alert.type === 'blocked' && alert.daysBlocked && alert.daysBlocked > 5;
        const isBudget = alert.type === 'budget';
        
        return (
          <div
            key={alert.id}
            className={cn(
              "relative rounded-xl border p-4 transition-all duration-300",
              "bg-gradient-to-r backdrop-blur-sm",
              isSLA && "from-rose-500/10 to-orange-500/10 border-rose-500/30",
              isBlocked && "from-orange-500/10 to-amber-500/10 border-orange-500/30",
              isBudget && "from-amber-500/10 to-yellow-500/10 border-amber-500/30",
              !isSLA && !isBlocked && !isBudget && "from-rose-500/10 to-red-500/10 border-rose-500/30"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                isSLA && "bg-rose-500/20",
                isBlocked && "bg-orange-500/20",
                isBudget && "bg-amber-500/20",
                !isSLA && !isBlocked && !isBudget && "bg-rose-500/20"
              )}>
                {isSLA ? (
                  <Clock className="w-5 h-5 text-rose-500 animate-pulse" />
                ) : isBlocked ? (
                  <AlertTriangle className="w-5 h-5 text-orange-500 animate-pulse" />
                ) : isBudget ? (
                  <TrendingUp className="w-5 h-5 text-amber-500 animate-pulse" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                    {alert.title}
                  </h3>
                  {onDismiss && (
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="p-1 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      title="Masquer cette alerte"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {alert.description}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {alert.bureau && (
                    <span className="px-2 py-1 rounded-full bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                      Bureau: {alert.bureau}
                    </span>
                  )}
                  
                  {alert.responsible && (
                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Responsable: {alert.responsible}
                    </span>
                  )}
                  
                  {alert.daysBlocked && alert.daysBlocked > 0 && (
                    <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">
                      🔥 Bloqué depuis {alert.daysBlocked} jours
                    </span>
                  )}

                  {alert.amount && (
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      💰 {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'XOF', 
                        maximumFractionDigits: 0 
                      }).format(alert.amount)}
                    </span>
                  )}

                  <button
                    onClick={() => handleAlertClick(alert.id, alert.title)}
                    className={cn(
                      "ml-auto px-3 py-1 rounded-lg font-medium transition-colors",
                      isSLA && "bg-rose-500 hover:bg-rose-600 text-white",
                      isBlocked && "bg-orange-500 hover:bg-orange-600 text-white",
                      isBudget && "bg-amber-500 hover:bg-amber-600 text-white",
                      !isSLA && !isBlocked && !isBudget && "bg-rose-500 hover:bg-rose-600 text-white"
                    )}
                  >
                    Traiter maintenant →
                  </button>
                </div>
              </div>
            </div>

            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}

