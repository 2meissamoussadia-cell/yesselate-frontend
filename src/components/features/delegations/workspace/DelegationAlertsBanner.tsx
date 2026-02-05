'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { FluentButton } from '@/components/ui/fluent-button';
import { useDelegationWorkspaceStore } from '@/lib/stores/delegationWorkspaceStore';
import {
  AlertTriangle,
  Clock,
  Shield,
  XCircle,
  ChevronDown,
  ChevronUp,
  Bell,
  RefreshCw,
  X,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type AlertLevel = 'INFO' | 'WARNING' | 'CRITICAL';
type AlertType = 
  | 'EXPIRING_SOON' 
  | 'EXPIRED' 
  | 'PENDING_CONTROL' 
  | 'THRESHOLD_WARNING' 
  | 'THRESHOLD_EXCEEDED'
  | 'NO_CONTROLLER'
  | 'ANOMALY'
  | 'SUSPENDED';

interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  delegationId: string;
  delegationTitle: string;
  bureau: string;
  message: string;
  actionLabel: string;
  createdAt: string;
}

interface AlertsResponse {
  alerts: Alert[];
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
  ts: string;
}

// ============================================
// COMPONENT
// ============================================

export function DelegationAlertsBanner() {
  const { openTab } = useDelegationWorkspaceStore();
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertsResponse['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/delegations/alerts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json() as AlertsResponse;
        setAlerts(data.alerts.filter(a => !dismissed.has(a.id)));
        setSummary(data.summary);
      }
    } catch (e) {
      logger.error('Erreur chargement alertes', e instanceof Error ? e : undefined, { component: 'DelegationAlertsBanner' });
    } finally {
      setLoading(false);
    }
  }, [dismissed]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleDismiss = useCallback((id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleOpenDelegation = useCallback((delegationId: string, title: string) => {
    openTab({
      id: `delegation:${delegationId}`,
      type: 'delegation',
      title: delegationId,
      icon: '🔑',
      data: { delegationId },
    });
  }, [openTab]);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));
  const criticalCount = visibleAlerts.filter(a => a.level === 'CRITICAL').length;
  const warningCount = visibleAlerts.filter(a => a.level === 'WARNING').length;

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-300",
      criticalCount > 0
        ? "border-rose-300/50 bg-rose-50/50 dark:border-rose-800/30 dark:bg-rose-950/20"
        : warningCount > 0
        ? "border-amber-300/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/20"
        : "border-slate-200/70 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/30"
    )}>
      {/* Header */}
      <div
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <Bell className={cn(
            "w-5 h-5",
            criticalCount > 0 ? "text-rose-500" : warningCount > 0 ? "text-amber-500" : "text-slate-400"
          )} />
          
          <div>
            <div className="font-medium text-sm">
              {criticalCount > 0 && (
                <span className="text-rose-600 dark:text-rose-400 mr-2">
                  {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  {warningCount} avertissement{warningCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {visibleAlerts.length} alerte{visibleAlerts.length > 1 ? 's' : ''} active{visibleAlerts.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); fetchAlerts(); }}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-400"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded alerts list */}
      {expanded && (
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 divide-y divide-slate-200/50 dark:divide-slate-700/50 max-h-[300px] overflow-auto">
          {visibleAlerts.map(alert => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onDismiss={() => handleDismiss(alert.id)}
              onOpen={() => handleOpenDelegation(alert.delegationId, alert.delegationTitle)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function AlertItem({
  alert,
  onDismiss,
  onOpen,
}: {
  alert: Alert;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  const Icon = getAlertIcon(alert.type);
  
  return (
    <div className="p-3 flex items-start gap-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
      <Icon className={cn(
        "w-4 h-4 flex-none mt-0.5",
        alert.level === 'CRITICAL' && "text-rose-500",
        alert.level === 'WARNING' && "text-amber-500",
        alert.level === 'INFO' && "text-slate-400"
      )} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <button
              onClick={onOpen}
              className="font-medium text-sm hover:underline truncate block"
            >
              {alert.delegationTitle}
            </button>
            <div className="text-xs text-slate-400 truncate">
              {alert.bureau} • {alert.message}
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-none">
            <FluentButton
              size="xs"
              variant={alert.level === 'CRITICAL' ? 'destructive' : 'secondary'}
              onClick={onOpen}
            >
              {alert.actionLabel}
            </FluentButton>
            
            <button
              onClick={onDismiss}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
              title="Ignorer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAlertIcon(type: AlertType) {
  switch (type) {
    case 'EXPIRING_SOON':
    case 'EXPIRED':
      return Clock;
    case 'PENDING_CONTROL':
      return Shield;
    case 'THRESHOLD_WARNING':
    case 'THRESHOLD_EXCEEDED':
      return AlertTriangle;
    case 'SUSPENDED':
      return XCircle;
    default:
      return AlertTriangle;
  }
}

