/**
 * BMOAppShell - Shell principal pour l'application BMO
 *
 * Fournit la structure de base avec:
 * - Sidebar BMO (navigation 3 niveaux, mode collapsed w-72 → w-20)
 * - Header BMO
 * - PageTemplate + SubNavigation contextuelle
 * - Overlays (Notifications, AI Assistant, Toast)
 */

'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useNavigationStore } from '@/lib/stores';
import { Sidebar, PageTemplate } from '@/components/navigation';
import { BMOHeader } from '@/components/features/bmo/Header';
import { AIAssistant } from '@/components/features/bmo/AIAssistant';
import { NotificationsPanel as SharedNotificationsPanel } from '@/components/shared/NotificationsPanel';
import { ToastContainer } from '@/components/features/bmo/ToastContainer';
import { useBMOStore } from '@/lib/stores';
import { AutoSyncProvider } from '@/components/shared/AutoSyncProvider';

interface BMOAppShellProps {
  children: React.ReactNode;
}

export function BMOAppShell({ children }: BMOAppShellProps) {
  const { sidebarOpen, darkMode, toggleSidebar } = useAppStore();
  const { pageCounts } = useNavigationStore();
  const { showNotifications, setShowNotifications } = useBMOStore();

  return (
    <AutoSyncProvider>
      <div
        className={cn(
          'min-h-screen flex min-w-0 max-w-full overflow-x-hidden',
          'bg-[rgb(var(--bg))] text-[rgb(var(--text))]',
          darkMode ? 'dark' : 'light'
        )}
      >
        {/* Sidebar YESSALATE BMO (3 niveaux, collapsed w-72 → w-20) */}
        <Sidebar
          collapsed={!sidebarOpen}
          onToggleCollapse={toggleSidebar}
          badgeCounts={pageCounts}
          user={{ name: 'A. DIALLO', role: 'DG', initials: 'AD', online: true }}
        />

        {/* Main content */}
        <main
          className={cn(
            'flex-1 flex flex-col min-w-0 max-w-full transition-all duration-300',
            sidebarOpen ? 'ml-72' : 'ml-20'
          )}
        >
          <BMOHeader />

          {/* Page content + SubNavigation contextuelle */}
          <PageTemplate>{children}</PageTemplate>
        </main>

        <SharedNotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          moduleName="BMO"
        />
        <AIAssistant />
        <ToastContainer />
      </div>
    </AutoSyncProvider>
  );
}

