'use client';

/**
 * CommandCenterStatusBar - Common status bar for Command Centers
 * 
 * Displays:
 * - lastUpdated: Last update timestamp
 * - sync state: Connection/sync status
 * - errors: Error count/status (optional)
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface CommandCenterStatusBarProps {
  lastUpdated?: Date | null;
  isSyncing?: boolean;
  isConnected?: boolean;
  errorCount?: number;
  stats?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

export function CommandCenterStatusBar({
  lastUpdated,
  isSyncing = false,
  isConnected = true,
  errorCount,
  stats,
  rightContent,
  className,
}: CommandCenterStatusBarProps) {
  const formatLastUpdate = (date: Date | null | undefined) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  };

  return (
    <footer
      className={cn(
        'flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs',
        className
      )}
    >
      {/* Left: Update status and stats */}
      <div className="flex items-center gap-4">
        {lastUpdated !== undefined && (
          <>
            <span className="text-slate-600">Màj: {formatLastUpdate(lastUpdated)}</span>
            {stats && (
              <>
                <span className="text-slate-700">•</span>
                {stats}
              </>
            )}
          </>
        )}
        {!lastUpdated && stats && stats}
        {errorCount !== undefined && errorCount > 0 && (
          <>
            {stats && <span className="text-slate-700">•</span>}
            <span className="text-red-400">
              {errorCount} erreur{errorCount > 1 ? 's' : ''}
            </span>
          </>
        )}
      </div>

      {/* Right: Sync state */}
      <div className="flex items-center gap-4">
        {rightContent}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isSyncing ? 'bg-amber-500 animate-pulse' : isConnected ? 'bg-emerald-500' : 'bg-red-500'
            )}
          />
          <span className="text-slate-400">
            {isSyncing ? 'Synchronisation...' : isConnected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>
    </footer>
  );
}
