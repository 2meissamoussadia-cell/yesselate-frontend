/**
 * Phase 3 #22 — Indicateur de présence (collaboration temps réel)
 * Affiche le nombre d'utilisateurs en ligne (mock ou WebSocket plus tard)
 */

'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePresenceStore } from '@/lib/stores/presenceStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface PresenceIndicatorProps {
  className?: string;
  showCount?: boolean;
}

export function PresenceIndicator({ className, showCount = true }: PresenceIndicatorProps) {
  const users = usePresenceStore((s) => s.users);
  const isConnected = usePresenceStore((s) => s.isConnected);
  const [open, setOpen] = useState(false);

  const count = users.length;

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors',
            isConnected
              ? 'text-emerald-500/90 hover:text-emerald-400 hover:bg-emerald-500/10'
              : 'text-slate-500',
            className
          )}
          aria-label={`${count} utilisateur${count > 1 ? 's' : ''} en ligne`}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-emerald-500' : 'bg-slate-500'
            )}
            aria-hidden
          />
          {showCount && <span>{count} en ligne</span>}
          <Users className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold text-slate-100">Collaboration temps réel</p>
          <p className="text-xs text-slate-300">
            {count} utilisateur{count > 1 ? 's' : ''} connecté{count > 1 ? 's' : ''}
          </p>
          <ul className="text-xs text-slate-400 space-y-1">
            {users.slice(0, 5).map((u) => (
              <li key={u.id}>
                {u.name}
                {u.currentView ? ` — ${u.currentView}` : ''}
              </li>
            ))}
          </ul>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
