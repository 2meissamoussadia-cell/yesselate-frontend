'use client';

/**
 * BmoTopbar — Barre supérieure BMO : recherche, fil d'Ariane (centre), user, notifications.
 */

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleByPath, bmoModuleGroupLabels } from '@/lib/navigation/bmoModules';

export interface BmoTopbarProps {
  user?: { name: string; role: string; initials?: string };
  /** Ouvre/ferme la sidebar (bouton trois traits) */
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  /** Nombre de notifications non lues (badge) */
  notificationCount?: number;
  className?: string;
}

/** Dérive un libellé court depuis le pathname (fallback si pas dans le sitemap). */
function getBreadcrumbFromPath(pathname: string): { group: string; page: string } {
  const module = getModuleByPath(pathname);
  if (module) {
    return {
      group: bmoModuleGroupLabels[module.group] ?? module.group,
      page: module.label,
    };
  }
  if (!pathname || pathname === '/maitre-ouvrage' || pathname === '/maitre-ouvrage/') {
    return { group: 'PILOTAGE', page: 'Cockpit DG' };
  }
  if (pathname.includes('/dashboard')) return { group: 'PILOTAGE', page: 'Dashboard' };
  if (pathname.includes('/cockpit')) return { group: 'PILOTAGE', page: 'Cockpit DG' };
  if (pathname.includes('/alerts')) return { group: 'PILOTAGE', page: 'Alertes & Incidents' };
  if (pathname.includes('/governance')) return { group: 'PILOTAGE', page: 'Gouvernance' };
  if (pathname.includes('/chantiers')) return { group: 'EXÉCUTION', page: 'Chantiers' };
  if (pathname.includes('/finance') || pathname.includes('/engagements')) return { group: 'EXÉCUTION', page: 'Engagements' };
  const segment = pathname.split('/').filter(Boolean).pop();
  const label = segment ? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Maître d\'ouvrage';
  return { group: 'PILOTAGE', page: label };
}

export function BmoTopbar({
  user = { name: 'A. DIALLO', role: 'DG', initials: 'AD' },
  onMenuClick,
  onSearchClick,
  onNotificationsClick,
  notificationCount = 0,
  className,
}: BmoTopbarProps) {
  const pathname = usePathname();
  const breadcrumb = useMemo(() => getBreadcrumbFromPath(pathname ?? ''), [pathname]);

  return (
    <header
      className={cn(
        'h-14 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-sm',
        className
      )}
      role="banner"
    >
      {/* Gauche : menu (trois traits) + recherche */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Ouvrir le menu"
            title="Menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        )}
        {onSearchClick && (
          <button
            type="button"
            onClick={onSearchClick}
            className="p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Rechercher (⌘K)"
            title="Rechercher (⌘K)"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Centre : fil d'Ariane décalé à gauche */}
      <div className="flex-1 min-w-0 flex items-center justify-start">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-medium text-slate-300">{breadcrumb.group}</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" aria-hidden />
          <span className="font-medium text-slate-200 truncate max-w-[180px] sm:max-w-[240px]" aria-current="page">
            {breadcrumb.page}
          </span>
        </nav>
      </div>

      {/* Droite : notifications + user */}
      <div className="flex items-center gap-2 shrink-0">
        {onNotificationsClick && (
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-4 w-4" aria-hidden />
            {notificationCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[14px] h-3.5 px-1 rounded-full bg-rose-500 text-[10px] font-semibold text-white flex items-center justify-center"
                aria-hidden
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800/70">
          <div
            className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-semibold"
            aria-hidden
          >
            {user.initials ?? user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-slate-200 leading-tight">
              {user.name}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
              {user.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
