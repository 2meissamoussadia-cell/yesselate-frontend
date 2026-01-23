/**
 * BMOAppShell - Shell principal pour l'application BMO
 * 
 * Fournit la structure de base avec:
 * - Sidebar BMO
 * - Header BMO
 * - Providers (AutoSync, etc.)
 * - Overlays (Notifications, AI Assistant, Toast)
 */

'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { BMOSidebar } from '@/components/features/bmo/Sidebar';
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
  const { sidebarOpen, darkMode } = useAppStore();
  const { showNotifications, setShowNotifications } = useBMOStore();

  return (
    <AutoSyncProvider>
      <div
        className={cn(
          'min-h-screen flex',
          'bg-[rgb(var(--bg))] text-[rgb(var(--text))]',
          darkMode ? 'dark' : 'light'
        )}
      >
        {/* Sidebar */}
        <BMOSidebar />

        {/* Main content */}
        <main
          className={cn(
            'flex-1 flex flex-col transition-all duration-300',
            sidebarOpen ? 'ml-52' : 'ml-14'
          )}
        >
          {/* Header */}
          <BMOHeader />

          {/* Page content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
        </main>

        {/* Overlays & Modals */}
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

