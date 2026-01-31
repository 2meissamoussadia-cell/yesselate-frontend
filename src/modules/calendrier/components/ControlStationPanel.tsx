/**
 * Poste de contrôle Calendrier
 * Affiche l'état de synchronisation avec les autres modules
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useCalendrierSyncStatus } from '../hooks/useCalendrierSyncStatus';
import type { SyncStatus } from '../types/calendrierTypes';

interface SyncIndicatorProps {
  label: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  lastSync: string;
  message?: string;
}

function SyncIndicator({ label, status, lastSync, message }: SyncIndicatorProps) {
  const statusConfig = {
    OK: {
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    WARNING: {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    ERROR: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Formater la date de dernière synchronisation
  const formatLastSync = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `Il y a ${diffDays}j`;
    } catch {
      return 'Inconnu';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-all',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={cn('p-1.5 rounded', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-slate-200">{label}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                status === 'OK'
                  ? 'bg-green-500/20 text-green-400'
                  : status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-red-500/20 text-red-400'
              )}
            >
              {status === 'OK' ? 'Synchronisé' : status === 'WARNING' ? 'Alerte' : 'Erreur'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {formatLastSync(lastSync)}
            {message && ` • ${message}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ControlStationPanel() {
  const { statuts, loading, error, refetch } = useCalendrierSyncStatus();

  // Mapping des modules vers des labels lisibles
  const moduleLabels: Record<SyncStatus['module'], string> = {
    DEMANDES: 'Demandes',
    VALIDATIONS: 'Validations',
    PROJETS: 'Projets',
    RH: 'RH',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">
          Poste de contrôle Calendrier
        </h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={loading}
          aria-label="Rafraîchir les données"
          className="p-2 min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
          title="Rafraîchir"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden />
        </button>
      </div>

      {loading && (
        <div className="text-sm text-slate-400 text-center py-4">
          Chargement...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-4">
          Erreur: {error.message}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2">
          {statuts.map((statut) => (
            <SyncIndicator
              key={statut.module}
              label={moduleLabels[statut.module]}
              status={statut.statut}
              lastSync={statut.derniere_sync}
              message={statut.message}
            />
          ))}
        </div>
      )}
    </div>
  );
}

