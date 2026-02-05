'use client';

/**
 * BmoLayoutShell — Shell BMO (sidebar cachée sous bouton hamburger + topbar + main).
 * La sidebar est masquée par défaut et s’ouvre au clic sur le bouton trois traits.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { BmoTopbar } from '@/components/bmo/navigation/BmoTopbar';
import { BmoSidebar } from '@/components/bmo/navigation/BmoSidebar';
import { SkipLink } from '@/components/ui/skip-link';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores/app-store';
import { useAuth } from '@lib-root/contexts/AuthContext';

export interface BmoLayoutShellProps {
  children: React.ReactNode;
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
  className,
}: BmoLayoutShellProps) {
  const fontSizeScale = useAppStore((s) => s.fontSizeScale);
  const { user: authUser } = useAuth();
  const topbarUser = useMemo(() => topbarUserFromAuth(authUser ?? null), [authUser]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div
      className={cn(
        'flex h-screen w-screen overflow-hidden transition-colors',
        'bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
        className
      )}
      style={{ ['--sidebar-width' as string]: '0px' } as React.CSSProperties}
    >
      <SkipLink href="#main-content">Aller au contenu</SkipLink>

      {/* Sidebar principale : ouverte au clic sur le bouton menu du topbar (overlay). */}
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={closeSidebar}
          />
          <aside
            className={cn(
              'fixed top-0 left-0 bottom-0 z-50 w-56 max-w-[85vw]',
              'flex flex-col border-r border-slate-200 dark:border-slate-800/70',
              'bg-white dark:bg-slate-950 shadow-xl',
              'animate-in slide-in-from-left-4 duration-200'
            )}
            aria-label="Navigation BMO"
          >
            <BmoSidebar collapsed={false} onCollapse={closeSidebar} className="h-full" />
          </aside>
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <BmoTopbar
          user={topbarUser}
          notificationCount={4}
          onMenuClick={openSidebar}
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
            'flex-1 min-h-0 min-w-0 max-w-full flex flex-col overflow-hidden relative z-0 isolate',
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
