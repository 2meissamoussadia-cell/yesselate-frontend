'use client';

/**
 * BmoTopbar — Barre supérieure BMO : recherche, fil d'Ariane (centre), user, notifications.
 * Spec Dashboard ERP BTP : menu utilisateur (Mon profil, Paramètres, Déconnexion).
 * Optimisé : un seul selector store dashboard, styles partagés, bouton Avancer corrigé.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Bell, ChevronRight, ChevronLeft, ChevronDown, MoreVertical, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleByPath, bmoModuleGroupLabels } from '@/lib/navigation/bmoModules';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore, type SupportedLocale } from '@/lib/stores/app-store';
import { useShallow } from 'zustand/react/shallow';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardNavigationConfig } from '@/modules/dashboard/navigation/dashboardNavigationConfig';

const LOCALE_OPTIONS: { value: SupportedLocale; label: string }[] = [
  { value: 'fr-FR', label: 'Français' },
  { value: 'en-GB', label: 'English' },
  { value: 'ar-MA', label: 'العربية' },
];

const BTN_ICON_CLASS =
  'p-1.5 rounded transition-colors text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/80';

type MoreMenuSubId = 'fichier' | 'edition' | 'affichage' | 'parametrage' | 'reglage';

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

/** Dérive un libellé court depuis le pathname (hors dashboard). */
function getBreadcrumbFromPath(pathname: string): { group: string; page: string } {
  const module = getModuleByPath(pathname);
  if (module) {
    return {
      group: bmoModuleGroupLabels[module.group] ?? module.group,
      page: module.label,
    };
  }
  if (!pathname || pathname === '/maitre-ouvrage' || pathname === '/maitre-ouvrage/') {
    return { group: 'PILOTAGE', page: 'Dashboard' };
  }
  if (pathname.includes('/alerts')) return { group: 'PILOTAGE', page: 'Alertes & Incidents' };
  if (pathname.includes('/governance')) return { group: 'PILOTAGE', page: 'Gouvernance' };
  if (pathname.includes('/chantiers')) return { group: 'EXÉCUTION', page: 'Chantiers' };
  if (pathname.includes('/finance') || pathname.includes('/engagements')) return { group: 'EXÉCUTION', page: 'Engagements' };
  const segment = pathname.split('/').filter(Boolean).pop();
  const label = segment ? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Maître d\'ouvrage';
  return { group: 'PILOTAGE', page: label };
}

/** Fil d'Ariane dynamique à partir du store de navigation (dashboard uniquement). */
function getBreadcrumbFromDashboardNavigation(
  mainCategory: string,
  subCategory: string | null,
  subSubCategory: string | null
): { group: string; page: string } {
  const main = mainCategory as keyof typeof dashboardNavigationConfig;
  const mainNode = dashboardNavigationConfig[main];
  const group = mainNode?.label ?? mainCategory;
  if (!subCategory) {
    return { group, page: mainNode?.children?.[0]?.label ?? 'Dashboard' };
  }
  const subNode = mainNode?.children?.find((c) => c.id === subCategory);
  const page = subNode?.label ?? subCategory;
  return { group, page };
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
  const { darkMode, setDarkMode, localeOverride, setLocaleOverride, fontSizeScale, setFontSizeScale } = useAppStore();
  const isDashboard = pathname?.includes('/maitre-ouvrage/dashboard') ?? false;

  const dashboard = useDashboardCommandCenterStore(
    useShallow((s) => ({
      navigation: s.navigation,
      goBack: s.goBack,
      goForward: s.goForward,
      navigate: s.navigate,
      navigationHistory: s.navigationHistory,
      forwardHistory: s.forwardHistory,
      toggleSidebar: s.toggleSidebar,
    }))
  );
  const {
    navigation,
    goBack,
    goForward,
    navigate,
    navigationHistory,
    forwardHistory,
    toggleSidebar,
  } = dashboard;

  const breadcrumb = useMemo(() => {
    if (isDashboard) {
      return getBreadcrumbFromDashboardNavigation(
        navigation.mainCategory,
        navigation.subCategory,
        navigation.subSubCategory
      );
    }
    return getBreadcrumbFromPath(pathname ?? '');
  }, [isDashboard, pathname, navigation.mainCategory, navigation.subCategory, navigation.subSubCategory]);

  const currentMainSections = useMemo(() => {
    const main = navigation.mainCategory as keyof typeof dashboardNavigationConfig;
    return dashboardNavigationConfig[main]?.children ?? [];
  }, [navigation.mainCategory]);

  const canGoBack = isDashboard && navigationHistory.length > 0;
  const canGoForward = isDashboard && forwardHistory.length > 0;

  // La recherche est dans le hero (PilotageHome) → jamais afficher la barre search en topbar sur le dashboard
  const showTopbarSearch = false;
  const basePath = pathname ?? '/maitre-ouvrage/dashboard';

  const goToCurrentMainHome = useCallback(() => {
    const main = navigation.mainCategory as keyof typeof dashboardNavigationConfig;
    const firstSub = dashboardNavigationConfig[main]?.children?.[0]?.id ?? 'dashboard';
    const q = new URLSearchParams();
    q.set('main', navigation.mainCategory);
    q.set('sub', firstSub);
    q.set('leaf', 'default');
    router.push(`${basePath}?${q.toString()}`);
    navigate(navigation.mainCategory, firstSub, 'default');
  }, [navigation.mainCategory, navigate, router, basePath]);

  const handleGoBack = useCallback(() => {
    if (!canGoBack) return;
    const prev = navigationHistory[navigationHistory.length - 1];
    const q = new URLSearchParams();
    q.set('main', prev.mainCategory);
    if (prev.subCategory) q.set('sub', prev.subCategory);
    if (prev.subSubCategory) q.set('leaf', prev.subSubCategory);
    router.push(`${basePath}?${q.toString()}`);
    goBack();
  }, [canGoBack, navigationHistory, goBack, router, basePath]);

  const handleGoForward = useCallback(() => {
    if (!canGoForward) return;
    const next = forwardHistory[forwardHistory.length - 1];
    const q = new URLSearchParams();
    q.set('main', next.mainCategory);
    if (next.subCategory) q.set('sub', next.subCategory);
    if (next.subSubCategory) q.set('leaf', next.subSubCategory);
    router.push(`${basePath}?${q.toString()}`);
    goForward();
  }, [canGoForward, forwardHistory, goForward, router, basePath]);

  const parametresPath = '/maitre-ouvrage/parametres';
  const displayLocale = localeOverride ?? 'fr-FR';
  const btnIconCn = BTN_ICON_CLASS;
  const [moreMenuSub, setMoreMenuSub] = useState<MoreMenuSubId | null>(null);

  return (
    <header
      data-testid="bmo-topbar"
      suppressHydrationWarning
      className={cn(
        'relative z-[40] h-11 shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 border-b backdrop-blur-sm transition-colors text-[11px]',
        'border-slate-200 bg-white/95 dark:border-slate-800/70 dark:bg-slate-950/80',
        className
      )}
      role="banner"
    >
      {/* Gauche : menu hamburger + séparateur + recherche */}
      <div className="flex items-center gap-0.5 min-w-0 shrink-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className={btnIconCn}
            aria-label="Ouvrir le menu"
            title="Menu"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>
        )}
        <div className="w-px h-5 mx-0.5 shrink-0 bg-slate-300 dark:bg-slate-700/80" aria-hidden />
        {onSearchClick && !isDashboard && (
          <button
            type="button"
            data-testid="topbar-search"
            onClick={onSearchClick}
            className={btnIconCn}
            aria-label="Rechercher (Ctrl+K)"
            title="Rechercher (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {/* Centre : Retour / Avancer (dashboard) + fil d'Ariane */}
      <div className="flex-1 min-w-0 flex items-center justify-start gap-1.5 overflow-hidden">
        {isDashboard && (canGoBack || canGoForward) && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={handleGoBack}
              disabled={!canGoBack}
              className={cn(btnIconCn, 'p-1 disabled:opacity-40 disabled:pointer-events-none')}
              aria-label="Revenir à la vue précédente"
              title="Revenir en arrière"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleGoForward}
              disabled={!canGoForward}
              className={cn(btnIconCn, 'p-1 disabled:opacity-40 disabled:pointer-events-none')}
              aria-label="Aller à la vue suivante"
              title="Avancer"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        )}
        <nav data-testid="topbar-breadcrumb" aria-label="Fil d'Ariane" className="flex items-center gap-1 text-[11px] min-w-0 text-slate-500 dark:text-slate-400">
          {isDashboard ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'font-medium truncate max-w-[120px] sm:max-w-[160px] text-left min-h-[44px] py-2 px-2 -mx-1 rounded flex items-center gap-1',
                    'text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800/50',
                    'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
                  )}
                  title={`Choisir une section — ${breadcrumb.group}`}
                  aria-label={`Choisir une section — ${breadcrumb.group}`}
                  aria-haspopup="true"
                >
                  {breadcrumb.group}
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[220px]">
                <DropdownMenuLabel className="text-slate-400 font-normal">
                  Choisir une section — {breadcrumb.group}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {currentMainSections.map((section) => {
                  const goToSection = () => {
                    const q = new URLSearchParams();
                    q.set('main', navigation.mainCategory);
                    q.set('sub', section.id);
                    q.set('leaf', 'default');
                    router.push(`${pathname ?? '/maitre-ouvrage/dashboard'}?${q.toString()}`);
                    navigate(navigation.mainCategory, section.id, 'default');
                  };
                  return (
                    <DropdownMenuItem
                      key={section.id}
                      onClick={goToSection}
                      className="flex items-center gap-2 cursor-pointer py-1.5 pr-2 pl-2 text-sm"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate min-w-0">{section.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span
              className={cn(
                'font-medium truncate max-w-[100px] sm:max-w-[140px] py-1 px-1.5',
                'text-slate-600 dark:text-slate-300'
              )}
            >
              {breadcrumb.group}
            </span>
          )}
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-600" aria-hidden />
          <button
            type="button"
            onClick={isDashboard ? goToCurrentMainHome : undefined}
            className={cn(
              'font-medium truncate max-w-[160px] sm:max-w-[200px] text-left py-1 px-1.5',
              'text-slate-800 hover:text-slate-900 dark:text-slate-200 dark:hover:text-slate-100',
              isDashboard && 'hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded'
            )}
            title={isDashboard ? `Accueil — ${breadcrumb.group}` : undefined}
            aria-current="page"
          >
            {breadcrumb.page}
          </button>
        </nav>
        {showTopbarSearch && (
          <button
            type="button"
            onClick={onSearchClick}
            className={cn(
              'flex-1 min-w-0 max-w-md flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer',
              'border-0 transition-all duration-200 text-left',
              'bg-slate-100/90 text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-sky-400/40 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/70 dark:focus-visible:ring-sky-500/40'
            )}
            aria-label="Rechercher (Ctrl+K)"
            title="Rechercher — Ctrl+K"
          >
            <Search className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
            <span className="flex-1 min-w-0 truncate text-[13px]" title="Accéder à un module, une action, un chiffre">
              Module, action, chiffre…
            </span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium tabular-nums opacity-50" title="Raccourci recherche">
              Ctrl+K
            </kbd>
          </button>
        )}
      </div>

      {/* Droite : séparateur + notifications + user + menu trois points (tout à droite) */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <div className="w-px h-5 mr-0.5 shrink-0 bg-slate-300 dark:bg-slate-700/80" aria-hidden />
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className={cn(
            'relative p-2 rounded-lg transition-all duration-200',
            darkMode ? 'hover:bg-slate-800/60 text-slate-400 hover:text-amber-400' : 'hover:bg-slate-100 text-slate-500 hover:text-amber-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
          )}
          aria-label={darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? (
            <Sun className="h-4 w-4" aria-hidden strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4" aria-hidden strokeWidth={1.5} />
          )}
        </button>
        {onNotificationsClick && (
          <button
            type="button"
            onClick={onNotificationsClick}
            className={cn(
              'relative p-2 rounded-lg transition-all duration-200',
              'hover:bg-slate-100 text-slate-500 hover:text-slate-800 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-100',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
            )}
            aria-label={notificationCount > 0 ? `Notifications (${notificationCount} non lues)` : 'Notifications'}
            title={notificationCount > 0 ? `${notificationCount} notification(s)` : 'Notifications'}
          >
            <Bell className="h-4 w-4" aria-hidden strokeWidth={1.5} />
            {notificationCount > 0 && (
              <span
                className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 bg-rose-500/95 text-[10px] font-semibold text-white shadow-sm ring-2 ring-slate-950"
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
                'flex items-center gap-1.5 pl-1.5 border-l transition-colors text-left min-w-0 rounded-r',
                darkMode
                  ? 'border-slate-800/70 hover:bg-slate-800/60'
                  : 'border-slate-200 hover:bg-slate-100'
              )}
              aria-label="Menu utilisateur"
              aria-haspopup="true"
            >
              <div
                className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-semibold shrink-0"
                aria-hidden
              >
                {user.initials ?? user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <div className="text-[11px] font-medium leading-tight truncate text-slate-800 dark:text-slate-200">
                  {user.name}
                </div>
                <div className="text-[9px] flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" aria-hidden />
                  {user.role}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 shrink-0 hidden sm:block text-slate-500 dark:text-slate-400" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem] text-[11px]">
            <DropdownMenuLabel className="text-slate-400 font-normal text-[10px]">
              {user.name} — {user.role}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onLogout?.()}
              className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 focus:bg-rose-500/10"
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menu trois points : 5 sous-menus (Fichier, Édition, Affichage, Paramétrage, Réglage) — clic pour afficher le contenu */}
        <DropdownMenu onOpenChange={(open) => !open && setMoreMenuSub(null)}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-testid="topbar-menu-more"
              className={cn(btnIconCn, 'rounded-r')}
              aria-label="Menu (Fichier, Édition, Affichage, Paramétrage, Réglage)"
              title="Menu"
            >
              <MoreVertical className="h-4 w-4" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className={cn(
              'flex max-h-[85vh] p-0',
              moreMenuSub ? 'min-w-[460px]' : 'min-w-[180px]'
            )}
          >
            {/* Liste des 5 sous-menus — cliquer pour afficher le contenu à droite (largeur fixe pour éviter le chevauchement) */}
            <div
              className={cn(
                'flex flex-col w-[180px] shrink-0 border-r py-1 pr-0',
                'border-slate-200 dark:border-slate-700'
              )}
            >
              <DropdownMenuSubTrigger onClick={() => setMoreMenuSub('fichier')} className={cn(moreMenuSub === 'fichier' && 'bg-slate-100 dark:bg-slate-800')}>
                Fichier <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubTrigger onClick={() => setMoreMenuSub('edition')} className={cn(moreMenuSub === 'edition' && 'bg-slate-100 dark:bg-slate-800')}>
                Édition <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubTrigger onClick={() => setMoreMenuSub('affichage')} className={cn(moreMenuSub === 'affichage' && 'bg-slate-100 dark:bg-slate-800')}>
                Affichage <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubTrigger onClick={() => setMoreMenuSub('parametrage')} className={cn(moreMenuSub === 'parametrage' && 'bg-slate-100 dark:bg-slate-800')}>
                Paramétrage <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubTrigger onClick={() => setMoreMenuSub('reglage')} className={cn(moreMenuSub === 'reglage' && 'bg-slate-100 dark:bg-slate-800')}>
                Réglage <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </DropdownMenuSubTrigger>
            </div>
            {/* Contenu du sous-menu sélectionné — panneau à droite, sans chevaucher la liste */}
            {moreMenuSub && (
              <div
                className={cn(
                  'flex flex-col w-[280px] shrink-0 max-h-[85vh] overflow-y-auto py-1 pl-2',
                  'bg-slate-50/80 dark:bg-slate-900/50'
                )}
              >
                {moreMenuSub === 'fichier' && (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/maitre-ouvrage/demandes')}>Nouvelle demande</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/maitre-ouvrage/documents')}>Ouvrir / Documents</DropdownMenuItem>
                    <DropdownMenuItem>Nouveau chantier</DropdownMenuItem>
                    <DropdownMenuItem>Nouveau devis</DropdownMenuItem>
                    <DropdownMenuItem>Importer des données</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Enregistrer <kbd className="ml-auto text-xs">⌘S</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Enregistrer sous</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Exporter (PDF)</DropdownMenuItem>
                    <DropdownMenuItem>Exporter (Excel)</DropdownMenuItem>
                    <DropdownMenuItem>Exporter (CSV)</DropdownMenuItem>
                    <DropdownMenuItem>Imprimer <kbd className="ml-auto text-xs">⌘P</kbd></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Modèles et modèles de documents</DropdownMenuItem>
                    <DropdownMenuItem>Fermer</DropdownMenuItem>
                  </>
                )}
                {moreMenuSub === 'edition' && (
                  <>
                    <DropdownMenuItem>Annuler <kbd className="ml-auto text-xs">⌘Z</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Rétablir <kbd className="ml-auto text-xs">⌘⇧Z</kbd></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Copier <kbd className="ml-auto text-xs">⌘C</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Coller <kbd className="ml-auto text-xs">⌘V</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Couper <kbd className="ml-auto text-xs">⌘X</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Tout sélectionner <kbd className="ml-auto text-xs">⌘A</kbd></DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSearchClick?.()}>Rechercher <kbd className="ml-auto text-xs">⌘K</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Rechercher et remplacer</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Préférences d&apos;édition</DropdownMenuItem>
                  </>
                )}
                {moreMenuSub === 'affichage' && (
                  <>
                    <DropdownMenuItem>Zoom + <kbd className="ml-auto text-xs">⌘+</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Zoom − <kbd className="ml-auto text-xs">⌘-</kbd></DropdownMenuItem>
                    <DropdownMenuItem>Taille réelle <kbd className="ml-auto text-xs">⌘0</kbd></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Plein écran <kbd className="ml-auto text-xs">F11</kbd></DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleSidebar}>Replier / Déplier la barre latérale</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.reload()}>Actualiser la page</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Vue Grille</DropdownMenuItem>
                    <DropdownMenuItem>Vue Liste</DropdownMenuItem>
                    <DropdownMenuItem>Densité compacte</DropdownMenuItem>
                    <DropdownMenuItem>Filtres visibles</DropdownMenuItem>
                    <DropdownMenuItem>Barre d&apos;outils</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDarkMode(!darkMode)}>Thème : {darkMode ? 'Sombre' : 'Clair'}</DropdownMenuItem>
                  </>
                )}
                {moreMenuSub === 'parametrage' && (
                  <>
                    <DropdownMenuLabel className="text-slate-400 font-normal text-xs pt-1" data-testid="topbar-menu-parametrage-content">Langue de l&apos;interface</DropdownMenuLabel>
                    {LOCALE_OPTIONS.map(({ value, label }) => (
                      <DropdownMenuItem
                        key={value}
                        onClick={() => setLocaleOverride(value)}
                        className={cn(displayLocale === value && 'bg-slate-100 dark:bg-slate-800/60')}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(parametresPath)}>Mon profil</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(parametresPath)}>Préférences</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNotificationsClick?.()}>Notifications</DropdownMenuItem>
                    <DropdownMenuItem>Confidentialité</DropdownMenuItem>
                    <DropdownMenuItem>Sécurité du compte</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Raccourcis clavier</DropdownMenuItem>
                    <DropdownMenuItem>Aide</DropdownMenuItem>
                    <DropdownMenuItem>À propos de Yessalate</DropdownMenuItem>
                  </>
                )}
                {moreMenuSub === 'reglage' && (
                  <>
                    <DropdownMenuLabel className="text-slate-400 font-normal text-[10px] pt-1" data-testid="topbar-menu-reglage-content">Taille du texte</DropdownMenuLabel>
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => setFontSizeScale(size)}
                        className={cn(fontSizeScale === size && 'bg-slate-100 dark:bg-slate-800/60')}
                      >
                        {size === 'small' && 'Réduire'}
                        {size === 'medium' && 'Normal'}
                        {size === 'large' && 'Augmenter'}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/maitre-ouvrage/parametres')}>Paramètres du module</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/maitre-ouvrage/parametres/referentiels')}>Référentiels</DropdownMenuItem>
                    <DropdownMenuItem>Droits d&apos;accès & rôles</DropdownMenuItem>
                    <DropdownMenuItem>Unités et devises</DropdownMenuItem>
                    <DropdownMenuItem>Périmètres et périmètres métier</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Connexions & intégrations</DropdownMenuItem>
                    <DropdownMenuItem>API & webhooks</DropdownMenuItem>
                    <DropdownMenuItem>Exports planifiés</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Sauvegardes</DropdownMenuItem>
                    <DropdownMenuItem>Journal d&apos;audit</DropdownMenuItem>
                    <DropdownMenuItem>Logs d&apos;activité</DropdownMenuItem>
                    <DropdownMenuItem>Maintenance & santé du système</DropdownMenuItem>
                  </>
                )}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
