'use client';

/**
 * BmoLayoutShell — Shell BMO (sidebar cachée sous bouton hamburger + topbar + main).
 * La sidebar est masquée par défaut et s’ouvre au clic sur le bouton trois traits.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BmoSidebar } from '@/components/bmo/navigation/BmoSidebar';
import { BmoTopbar } from '@/components/bmo/navigation/BmoTopbar';
import { SkipLink } from '@/components/ui/skip-link';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores/app-store';
import { useAuth } from '@lib-root/contexts/AuthContext';
import {
  SIDEBAR_MOBILE_BREAKPOINT,
  SIDEBAR_WIDTH_CLASS,
} from '@/lib/design-tokens';

export interface BmoLayoutShellProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarCollapse?: () => void;
  className?: string;
}

const FONT_SCALE_CLASSES = {
  small: 'bmo-font-small text-[87.5%]',
  medium: 'bmo-font-medium',
  large: 'bmo-font-large text-[112.5%]',
} as const;

const FALLBACK_DISPLAY_NAME = 'Meissa MOUSSA DIA';
const FALLBACK_INITIALS = 'MM';

/** Dérive name/role/initials pour la topbar à partir du User (lib). Résistant aux nom/prenom vides. */
function topbarUserFromAuth(user: { nom?: string; prenom?: string; role?: string; displayName?: string } | null) {
  if (!user) {
    return { name: FALLBACK_DISPLAY_NAME, role: 'DG', initials: FALLBACK_INITIALS };
  }
  const prenom = (user.prenom ?? '').trim();
  const nom = (user.nom ?? '').trim();
  const displayName = (user as { displayName?: string }).displayName;
  const hasName = prenom || nom;
  const name = hasName
    ? `${(prenom || ' ').charAt(0).toUpperCase()}. ${nom}`.trim() || displayName || FALLBACK_DISPLAY_NAME
    : (displayName || FALLBACK_DISPLAY_NAME);
  const roleLabel = user.role === 'admin' ? 'DG' : user.role === 'manager' ? 'Manager' : (user.role || 'DG');
  const initials = hasName
    ? `${(prenom || ' ').charAt(0)}${(nom || ' ').charAt(0)}`.toUpperCase().replace(/\s/g, '') || FALLBACK_INITIALS
    : FALLBACK_INITIALS;
  return { name, role: roleLabel, initials: initials || FALLBACK_INITIALS };
}

export function BmoLayoutShell({
  children,
  sidebarCollapsed: controlledCollapsed,
  onSidebarCollapse,
  className,
}: BmoLayoutShellProps) {
  // Utiliser app-store pour l'état de la sidebar
  const sidebarOpenFromStore = useAppStore((s) => s.sidebarOpen);
  const toggleSidebarStore = useAppStore((s) => s.toggleSidebar);
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_BREAKPOINT - 1}px)`) : null;
    if (!mq) return;
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  const fontSizeScale = useAppStore((s) => s.fontSizeScale);
  const { user: authUser } = useAuth();
  const topbarUser = useMemo(() => topbarUserFromAuth(authUser ?? null), [authUser]);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileDrawerOpen((o) => !o);
    } else {
      toggleSidebarStore();
      onSidebarCollapse?.();
    }
  }, [isMobile, toggleSidebarStore, onSidebarCollapse]);

  const closeMobileDrawer = useCallback(() => setMobileDrawerOpen(false), []);

  const collapsed = controlledCollapsed ?? !sidebarOpenFromStore;
  const sidebarVisibleOutlook = !isMobile;
  const sidebarOpenMobile = mobileDrawerOpen;

  return (
    <div
      className={cn(
        'flex h-screen w-screen overflow-hidden transition-colors',
        'bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
        className
      )}
    >
      <SkipLink href="#main-content">Aller au contenu</SkipLink>

      {/* Mobile : overlay quand tiroir ouvert */}
      {isMobile && sidebarOpenMobile && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          onClick={closeMobileDrawer}
        />
      )}

      {/* Sidebar style Outlook : largeurs depuis design-tokens, repli fluide */}
      <aside
        className={cn(
          'flex flex-col border-r border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-950 shrink-0 overflow-hidden',
          'transition-[width] duration-300 ease-out',
          'sidebar-dashboard',
          sidebarVisibleOutlook
            ? 'relative z-30'
            : 'fixed left-0 top-0 bottom-0 z-[50] shadow-xl',
          sidebarVisibleOutlook && (collapsed ? SIDEBAR_WIDTH_CLASS.collapsed : SIDEBAR_WIDTH_CLASS.expanded),
          !sidebarVisibleOutlook && SIDEBAR_WIDTH_CLASS.expanded,
          isMobile && !sidebarOpenMobile && '-translate-x-full'
        )}
      >
        <BmoSidebar collapsed={collapsed} onCollapse={isMobile ? closeMobileDrawer : toggleSidebar} />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <BmoTopbar
          user={topbarUser}
          notificationCount={4}
          onMenuClick={toggleSidebar}
          onSearchClick={() => {
            const event = new CustomEvent('bmo-open-command-palette', { bubbles: true });
            if (typeof document !== 'undefined') document.dispatchEvent(event);
          }}
          onNotificationsClick={() => {
            const event = new CustomEvent('bmo-open-notifications', { bubbles: true });
            if (typeof document !== 'undefined') document.dispatchEvent(event);
          }}
        />
        <main
          className={cn(
            'flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-y-auto scrollbar-dashboard',
            FONT_SCALE_CLASSES[fontSizeScale]
          )}
          id="main-content"
          role="main"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
