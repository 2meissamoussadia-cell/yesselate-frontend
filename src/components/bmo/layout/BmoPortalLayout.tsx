'use client';

/**
 * BmoPortalLayout — Shell partagé pour (bmo) et (portals)/maitre-ouvrage.
 * Une seule source de vérité : FluentProviderClient + ToastProvider + BmoLayoutShell + PageTemplate.
 * Spec Dashboard ERP BTP : Header → cloche ouvre le panneau notifications.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { BmoLayoutShell } from '@/components/bmo/layout/BmoLayoutShell';
import { PageTemplate } from '@/components/navigation/PageTemplate';
import { FluentProviderClient } from '@/components/shared/FluentProviderClient';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from 'sonner';
import { NotificationPanel } from '@/components/notifications';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { useBMOStore } from '@/lib/stores/bmo-store';

export interface BmoPortalLayoutProps {
  children: ReactNode;
}

export function BmoPortalLayout({ children }: BmoPortalLayoutProps) {
  const showNotifications = useBMOStore((s) => s.showNotifications);
  const setShowNotifications = useBMOStore((s) => s.setShowNotifications);

  useEffect(() => {
    const onOpen = () => setShowNotifications(true);
    document.addEventListener('bmo-open-notifications', onOpen);
    return () => document.removeEventListener('bmo-open-notifications', onOpen);
  }, [setShowNotifications]);

  // Escape ferme le panneau notifications (raccourcis clavier, WCAG)
  useEffect(() => {
    if (!showNotifications) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showNotifications, setShowNotifications]);

  return (
    <FluentProviderClient>
      <OfflineBanner />
      <ToastProvider>
        <BmoLayoutShell>
          <PageTemplate>{children}</PageTemplate>
        </BmoLayoutShell>
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
        <Toaster position="top-right" theme="dark" richColors expand closeButton />
      </ToastProvider>
    </FluentProviderClient>
  );
}
