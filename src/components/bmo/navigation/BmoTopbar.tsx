'use client';

/**
 * BmoTopbar — Barre supérieure BMO : recherche, fil d'Ariane (centre), user, notifications.
 * Spec Dashboard ERP BTP : menu utilisateur (Mon profil, Paramètres, Déconnexion).
 */

import React, { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Bell, ChevronRight, User, Settings, LogOut, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleByPath, bmoModuleGroupLabels } from '@/lib/navigation/bmoModules';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useAppStore, type SupportedLocale } from '@/lib/stores/app-store';

const LOCALE_OPTIONS: { value: SupportedLocale; label: string }[] = [
  { value: 'fr-FR', label: 'Français' },
  { value: 'en-GB', label: 'English' },
  { value: 'ar-MA', label: 'العربية' },
];

export interface BmoTopbarProps {
  user?: { name: string; role: string; initials?: string };
  /** Ouvre/ferme la sidebar (bouton trois traits) */
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  /** Nombre de notifications non lues (badge) */
  notificationCount?: number;
  /** Callback déconnexion (optionnel) */
  onLogout?: () => void;
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
  onLogout,
  className,
}: BmoTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, setDarkMode, localeOverride, setLocaleOverride } = useAppStore();
  const breadcrumb = useMemo(() => getBreadcrumbFromPath(pathname ?? ''), [pathname]);
  const parametresPath = '/maitre-ouvrage/parametres';
  const displayLocale = localeOverride ?? 'fr-FR';
  const currentLabel = LOCALE_OPTIONS.find((o) => o.value === displayLocale)?.label ?? 'Français';

  return (
    <header
      className={cn(
        'h-14 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 border-b backdrop-blur-sm transition-colors',
        darkMode
          ? 'border-slate-800/70 bg-slate-950/80'
          : 'border-slate-200 bg-white/95',
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
            className={cn(
              'p-2 rounded-lg transition-colors',
              darkMode ? 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            )}
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
            className={cn(
              'p-2 rounded-lg transition-colors',
              darkMode ? 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            )}
            aria-label="Rechercher (⌘K)"
            title="Rechercher (⌘K)"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Centre : fil d'Ariane décalé à gauche */}
      <div className="flex-1 min-w-0 flex items-center justify-start">
        <nav aria-label="Fil d'Ariane" className={cn('flex items-center gap-1.5 text-xs', darkMode ? 'text-slate-400' : 'text-slate-400')}>
          <span className={cn('font-medium', darkMode ? 'text-slate-300' : 'text-slate-600')}>{breadcrumb.group}</span>
          <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', darkMode ? 'text-slate-600' : 'text-slate-400')} aria-hidden />
          <span className={cn('font-medium truncate max-w-[180px] sm:max-w-[240px]', darkMode ? 'text-slate-200' : 'text-slate-800')} aria-current="page">
            {breadcrumb.page}
          </span>
        </nav>
      </div>

      {/* Droite : langue, thème, notifications, user */}
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors text-xs font-medium',
                darkMode ? 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
              )}
              aria-label="Changer la langue"
              aria-haspopup="true"
            >
              <Globe className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline max-w-[4rem] truncate">{currentLabel}</span>
              <ChevronDown className="h-3 w-3 shrink-0 hidden sm:block" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-slate-400 font-normal">Langue</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LOCALE_OPTIONS.map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setLocaleOverride(value)}
                className={cn(
                  'flex items-center gap-2',
                  displayLocale === value && (darkMode ? 'bg-slate-800/60 text-slate-200' : 'bg-slate-100 text-slate-800')
                )}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DarkModeToggle
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          className={darkMode ? undefined : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'}
        />
        {onNotificationsClick && (
          <button
            type="button"
            onClick={onNotificationsClick}
            className={cn(
              'relative p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              darkMode ? 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            )}
            aria-label={notificationCount > 0 ? `Notifications (${notificationCount} non lues)` : 'Notifications'}
            title={notificationCount > 0 ? `${notificationCount} notification(s) non lue(s)` : 'Notifications'}
          >
            <Bell className="h-4 w-4" aria-hidden />
            {notificationCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
                aria-hidden
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 pl-2 border-l rounded-r-lg transition-colors text-left min-w-0',
                darkMode
                  ? 'border-slate-800/70 hover:bg-slate-800/60'
                  : 'border-slate-200 hover:bg-slate-100'
              )}
              aria-label="Menu utilisateur"
              aria-haspopup="true"
            >
              <div
                className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-semibold shrink-0"
                aria-hidden
              >
                {user.initials ?? user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <div className={cn('text-xs font-medium leading-tight truncate', darkMode ? 'text-slate-200' : 'text-slate-800')}>
                  {user.name}
                </div>
                <div className={cn('text-[10px] flex items-center gap-1', darkMode ? 'text-slate-400' : 'text-slate-400')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden />
                  {user.role}
                </div>
              </div>
              <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 hidden sm:block', darkMode ? 'text-slate-400' : 'text-slate-400')} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[11rem]">
            <DropdownMenuLabel className="text-slate-400 font-normal">
              {user.name} — {user.role}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(parametresPath)} className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(parametresPath)} className="flex items-center gap-2">
              <Settings className="h-3.5 w-3.5" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onLogout?.()}
              className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 focus:bg-rose-500/10 flex items-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
