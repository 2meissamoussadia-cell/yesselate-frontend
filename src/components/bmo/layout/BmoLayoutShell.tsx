'use client';

/**
 * BmoLayoutShell — Shell BMO (sidebar cachée sous bouton hamburger + topbar + main).
 * La sidebar est masquée par défaut et s’ouvre au clic sur le bouton trois traits.
 */

import React, { useState, useCallback } from 'react';
import { BmoSidebar } from '@/components/bmo/navigation/BmoSidebar';
import { BmoTopbar } from '@/components/bmo/navigation/BmoTopbar';
import { SkipLink } from '@/components/ui/skip-link';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores/app-store';

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

export function BmoLayoutShell({
  children,
  sidebarCollapsed: controlledCollapsed,
  onSidebarCollapse,
  className,
}: BmoLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fontSizeScale = useAppStore((s) => s.fontSizeScale);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div
      className={cn(
        'flex h-screen w-screen overflow-hidden transition-colors',
        'bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
        className
      )}
    >
      {/* Lien « Aller au contenu » : navigation clavier WCAG 2.4.1 (Bypass Blocks) */}
      <SkipLink href="#main-content">Aller au contenu</SkipLink>
      {/* Overlay : clic ferme la sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-[2px] transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar en tiroir : z-[50] pour rester au-dessus de la topbar (z-40) et de l'overlay (z-45) */}
      <div
        className={cn(
          'fixed left-0 top-0 bottom-0 z-[50] w-56 flex flex-col border-r shadow-xl transition-all duration-300 ease-out',
          'bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800/70',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <BmoSidebar collapsed={false} onCollapse={closeSidebar} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <BmoTopbar
          user={{ name: 'A. DIALLO', role: 'DG', initials: 'AD' }}
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
