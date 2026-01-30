/**
 * BMOAppShell v1 — Shell principal BMO (legacy).
 *
 * - BMOHeader (app bar)
 * - Sidebar en overlay fixe (pas de ml-72/ml-20 sur main)
 * - PageTemplate (breadcrumbs, header de page, subnav, contenu)
 * - Overlays : Notifications, IA, Toasts
 *
 * Ne pas utiliser en même temps que BmoPortalLayout (éviter doublon <main id="main-content">).
 * Les routes (bmo) et (portals)/maitre-ouvrage utilisent BmoPortalLayout → BmoLayoutShell.
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Sidebar, PageTemplate } from '@/components/navigation';
import { BMOHeader } from '@/components/features/bmo/Header';
import { AIAssistant } from '@/components/features/bmo/AIAssistant';
import { NotificationPanel } from '@/components/notifications';
import { ToastContainer } from '@/components/features/bmo/ToastContainer';
import { useBMOStore } from '@/lib/stores';
import { AutoSyncProvider } from '@/components/shared/AutoSyncProvider';

interface BMOAppShellProps {
  children: React.ReactNode;
}

export function BMOAppShell({ children }: BMOAppShellProps) {
  const { sidebarOpen, darkMode, toggleSidebar } = useAppStore();
  const { showNotifications, setShowNotifications } = useBMOStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeClass = mounted ? (darkMode ? 'dark' : 'light') : 'dark';

  return (
    <AutoSyncProvider>
      <div
        className={cn(
          'min-h-screen flex min-w-0 max-w-full overflow-x-hidden',
          'bg-[rgb(var(--bg))] text-[rgb(var(--text))]',
          themeClass
        )}
      >
        {/* Sidebar overlay fixe (pas de marge sur main) */}
        <Sidebar
          open={sidebarOpen}
          onToggle={toggleSidebar}
          user={{ name: 'A. DIALLO', role: 'DG', initials: 'AD', online: true }}
        />

        {/* Main : plus de ml-72/ml-20 */}
        <main id="main-content" role="main" tabIndex={-1} className="flex-1 flex flex-col min-w-0 max-w-full">
          <BMOHeader />
          <PageTemplate>{children}</PageTemplate>
        </main>

        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
        <AIAssistant />
        <ToastContainer />
      </div>
    </AutoSyncProvider>
  );
}

