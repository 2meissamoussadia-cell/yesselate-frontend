'use client';

/**
 * BmoLayoutShell — Shell BMO (sidebar cachée sous bouton hamburger + topbar + main).
 * La sidebar est masquée par défaut et s’ouvre au clic sur le bouton trois traits.
 */

import React, { useState, useCallback } from 'react';
import { BmoSidebar } from '@/components/bmo/navigation/BmoSidebar';
import { BmoTopbar } from '@/components/bmo/navigation/BmoTopbar';
import { cn } from '@/lib/utils';

export interface BmoLayoutShellProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarCollapse?: () => void;
  className?: string;
}

export function BmoLayoutShell({
  children,
  sidebarCollapsed: controlledCollapsed,
  onSidebarCollapse,
  className,
}: BmoLayoutShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div
      className={cn(
        'flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden',
        className
      )}
    >
      {/* Lien « Aller au contenu » : hors du main pour ne pas recevoir le focus après une nav (ex. clic sub-sidebar) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:rounded focus:bg-black focus:px-3 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>
      {/* Overlay : clic ferme la sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar en tiroir : cachée par défaut, slide au clic sur hamburger */}
      <div
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-56 flex flex-col bg-slate-950 border-r border-slate-800/70 shadow-xl transition-transform duration-300 ease-out',
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
        <main className="flex-1 min-h-0 min-w-0 overflow-auto scrollbar-dashboard" id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
