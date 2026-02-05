/**
 * Status Bar pour Validation Paiements
 * Footer avec indicateurs de connexion et mise à jour
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface PaiementsStatusBarProps {
  lastUpdate?: Date | null;
  isConnected?: boolean;
  autoRefresh?: boolean;
  stats?: {
    total: number;
    pending: number;
    validated: number;
    rejected: number;
  } | null;
}

export const PaiementsStatusBar = React.memo(function PaiementsStatusBar({
  lastUpdate,
  isConnected = true,
  autoRefresh = true,
  stats,
}: PaiementsStatusBarProps) {
  const formatLastUpdate = (date: Date | null | undefined) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    return `Il y a ${Math.floor(diff / 3600)}h`;
  };

  return (
    <div className="bg-slate-900/60 border-t border-slate-700/50 px-4 py-1.5">
      <div className="flex items-center justify-between text-xs">
        {/* Left: Update Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <RefreshCw
              className={cn(
                'h-3 w-3',
                autoRefresh ? 'text-emerald-400 animate-spin-slow' : 'text-slate-400'
              )}
            />
            <span className="text-slate-400">
              MAJ: {formatLastUpdate(lastUpdate)}
            </span>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="flex items-center gap-3 text-slate-400">
              <span>Total: <span className="text-slate-300 font-medium">{stats.total}</span></span>
              <span className="text-slate-700">•</span>
              <span>En attente: <span className="text-amber-400 font-medium">{stats.pending}</span></span>
              <span className="text-slate-700">•</span>
              <span>Validés: <span className="text-emerald-400 font-medium">{stats.validated}</span></span>
              <span className="text-slate-700">•</span>
              <span>Rejetés: <span className="text-red-400 font-medium">{stats.rejected}</span></span>
            </div>
          )}
        </div>

        {/* Right: Connection Status */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-0.5 rounded',
            isConnected ? 'bg-emerald-500/10' : 'bg-red-500/10'
          )}>
            {isConnected ? (
              <Wifi className="h-3 w-3 text-emerald-400" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-400" />
            )}
            <span className={cn(
              'font-medium',
              isConnected ? 'text-emerald-400' : 'text-red-400'
            )}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

