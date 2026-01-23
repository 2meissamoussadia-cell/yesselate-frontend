'use client';
import { useState, useEffect } from 'react';
import { alertingService, type Alert, type AlertStats } from '../../../../lib/services/alertingService';
import { AlertTriangle, Bell, CheckCircle, XCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  module?: string;
  showStats?: boolean;
  maxItems?: number;
  className?: string;
}

const SEVERITY_CONFIG = {
  critical: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: XCircle,
  },
  high: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: AlertTriangle,
  },
  medium: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: AlertTriangle,
  },
  low: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: Bell,
  },
};

export function AlertsPanel({ module, showStats = true, maxItems, className }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');

  useEffect(() => {
    loadAlerts();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, [module, filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);

      const filters: any = {};
      if (module) filters.module = module;
      if (filter !== 'all') filters.status = [filter];

      const [alertsData, statsData] = await Promise.all([
        alertingService.getActiveAlerts(filters),
        showStats ? alertingService.getStats() : Promise.resolve(null),
      ]);

      setAlerts(maxItems ? alertsData.slice(0, maxItems) : alertsData);
      setStats(statsData);
    } catch (e) {
      console.error('Erreur chargement alertes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await alertingService.acknowledgeAlert(alertId, 'current-user-id');
      await loadAlerts();
    } catch (e) {
      console.error('Erreur acknowledge:', e);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await alertingService.resolveAlert(alertId, 'current-user-id');
      await loadAlerts();
    } catch (e) {
      console.error('Erreur resolve:', e);
    }
  };

  const handleIgnore = async (alertId: string) => {
    try {
      await alertingService.ignoreAlert(alertId);
      await loadAlerts();
    } catch (e) {
      console.error('Erreur ignore:', e);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Statistiques */}
      {showStats && stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={Bell}
            color="text-slate-400"
          />
          <StatCard
            label="Actives"
            value={stats.active}
            icon={AlertTriangle}
            color="text-red-400"
          />
          <StatCard
            label="Accusées"
            value={stats.acknowledged}
            icon={Eye}
            color="text-yellow-400"
          />
          <StatCard
            label="Résolues"
            value={stats.resolved}
            icon={CheckCircle}
            color="text-green-400"
          />
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2">
        {(['all', 'active', 'acknowledged', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50'
            )}
          >
            {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : f === 'acknowledged' ? 'Accusées' : 'Résolues'}
          </button>
        ))}
      </div>

      {/* Liste des alertes */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-800/30" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Aucune alerte</p>
          <p className="text-sm text-slate-500 mt-1">Tout va bien pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onIgnore={handleIgnore}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Composant carte de statistique
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <p className="text-2xl font-bold text-slate-200">{value}</p>
    </div>
  );
}

// Composant carte d'alerte individuelle
function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onIgnore,
}: {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onIgnore: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all hover:shadow-lg',
        config.bgColor,
        config.borderColor,
        alert.status === 'resolved' && 'opacity-60'
      )}
    >
      <div className="flex gap-4">
        {/* Icône */}
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}>
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h4 className="font-semibold text-slate-200">{alert.titre}</h4>
              <p className="text-sm text-slate-400 mt-0.5">{alert.description}</p>
            </div>

            {/* Badge de sévérité */}
            <span
              className={cn(
                'px-2 py-1 rounded-lg text-xs font-semibold uppercase',
                config.color,
                config.bgColor
              )}
            >
              {alert.severity}
            </span>
          </div>

          {/* Métadonnées */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              📦 {alert.module}
            </span>
            <span className="flex items-center gap-1">
              🕐 {new Date(alert.createdAt).toLocaleString('fr-FR')}
            </span>
            {alert.tags && alert.tags.length > 0 && (
              <div className="flex gap-1">
                {alert.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {alert.status === 'active' && (
            <div className="flex items-center gap-2 mt-4">
              {alert.actionUrl && (
                <a
                  href={alert.actionUrl}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <TrendingUp className="w-3 h-3" />
                  {alert.actionLabel || 'Agir'}
                </a>
              )}

              <button
                onClick={() => onAcknowledge(alert.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
              >
                <Eye className="w-3 h-3" />
                Accuser réception
              </button>

              <button
                onClick={() => onResolve(alert.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                Résoudre
              </button>

              <button
                onClick={() => onIgnore(alert.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-700/30 transition-colors"
                title="Ignorer"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          )}

          {alert.status === 'acknowledged' && (
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => onResolve(alert.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                Résoudre
              </button>

              <span className="text-xs text-slate-500">
                Accusée par {alert.acknowledgedBy} {alert.acknowledgedAt && `le ${new Date(alert.acknowledgedAt).toLocaleString('fr-FR')}`}
              </span>
            </div>
          )}

          {alert.status === 'resolved' && (
            <div className="flex items-center gap-2 mt-4 text-xs text-green-400">
              <CheckCircle className="w-4 h-4" />
              Résolue par {alert.resolvedBy} {alert.resolvedAt && `le ${new Date(alert.resolvedAt).toLocaleString('fr-FR')}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

