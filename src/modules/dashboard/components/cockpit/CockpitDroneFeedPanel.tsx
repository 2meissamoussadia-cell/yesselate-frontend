/**
 * Phase 6 — Feed Drone (optionnel)
 * Placeholder pour flux drone live ; iframe ou message "Non connecté".
 */

'use client';

import React from 'react';
import { Video, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '../../utils/dashboardDesignTokens';

const DRONE_FEED_URL = process.env.NEXT_PUBLIC_DRONE_FEED_URL || '';

export function CockpitDroneFeedPanel() {
  const hasFeed = Boolean(DRONE_FEED_URL);

  return (
    <div className="space-y-4">
      {hasFeed ? (
        <div className="rounded-xl border border-slate-800/60 overflow-hidden bg-slate-950 aspect-video">
          <iframe
            src={DRONE_FEED_URL}
            title="Feed drone"
            className="w-full h-full min-h-[240px]"
            allow="autoplay; fullscreen"
          />
        </div>
      ) : (
        <div
          className={cn(
            'rounded-xl border border-dashed aspect-video flex flex-col items-center justify-center',
            colors.border.default,
            'bg-slate-900/30'
          )}
        >
          <WifiOff className="h-12 w-12 text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400">Feed drone non connecté</p>
          <p className="text-xs text-slate-400 mt-1">
            Définir <code className="px-1 py-0.5 rounded bg-slate-800 text-slate-400">NEXT_PUBLIC_DRONE_FEED_URL</code> pour afficher le flux.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
            <Video className="h-3.5 w-3.5" />
            Phase 6 — Placeholder
          </div>
        </div>
      )}
    </div>
  );
}
