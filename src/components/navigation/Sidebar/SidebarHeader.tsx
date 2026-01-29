'use client';

/**
 * En-tête de la sidebar — Logo, titre, version, optionnel bloc utilisateur, optionnel bouton réduire
 * Design YESSALATE BMO, masqué partiellement en mode collapsed
 */

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft } from 'lucide-react';

export interface SidebarHeaderUser {
  name: string;
  role: string;
  initials: string;
  online?: boolean;
}

export interface SidebarHeaderProps {
  collapsed?: boolean;
  /** Titre affiché à côté du logo (ex: "YESSALATE BMO" ou "Navigation") */
  title?: string;
  /** Version ou sous-titre (ex: "V1.0") */
  version?: string;
  /** Bloc utilisateur (avatar, nom, rôle) */
  user?: SidebarHeaderUser;
  /** Bouton réduire la sidebar (ex: dashboard) */
  onToggleCollapse?: () => void;
  className?: string;
}

export const SidebarHeader = React.memo(function SidebarHeader({
  collapsed = false,
  title = 'YESSALATE BMO',
  version,
  user,
  onToggleCollapse,
  className,
}: SidebarHeaderProps) {
  const hasCollapseButton = Boolean(onToggleCollapse);

  return (
    <div
      className={cn('flex-shrink-0 border-b border-slate-700/60', className)}
      role="banner"
    >
      <div className={cn('p-3 flex items-center gap-3', hasCollapseButton && 'justify-between')}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-orange-500/40 flex-shrink-0">
            <Image
              src="/images/log_yessalate.png"
              alt="YESSALATE"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 truncate">
                {title}
              </h1>
              {version && (
                <p className="text-[10px] text-amber-500/80 uppercase tracking-wider">
                  {version}
                </p>
              )}
            </div>
          )}
        </div>
        {onToggleCollapse && !collapsed && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="flex-shrink-0 rounded-lg hover:bg-slate-800/50"
                  aria-label="Réduire le menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Réduire le menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {user && !collapsed && (
        <div className="mx-2 mb-2 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div
                className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-sm"
                aria-hidden
              >
                {user.initials}
              </div>
              {user.online && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"
                  aria-label="En ligne"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-slate-100 truncate">
                {user.name}
              </p>
              <p className="text-xs text-amber-500/90 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
