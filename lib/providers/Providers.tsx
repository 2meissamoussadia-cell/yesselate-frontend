'use client';

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '@/components/features/bmo/ToastProvider';
import { ModalManager } from '@/components/shared/ModalManager';
import { ErrorBoundary } from '@/components/features/bmo/ErrorBoundary';
import { I18nProviderWrapper } from '@/lib/i18n';
import { PwaRegistration } from '@/components/pwa/PwaRegistration';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';
import { SearchGlobal } from '@/components/SearchGlobal';
import { ThemeSync } from '@/components/shared/ThemeSync';
import { CookieConsentBanner } from '@/components/shared/CookieConsentBanner';
import { SessionTimeoutWarning } from '@/components/shared/SessionTimeoutWarning';

/**
 * Providers - Wrapper centralisé pour tous les providers
 *
 * Ce composant regroupe tous les providers nécessaires à l'application:
 * - ThemeSync: Applique dark/light sur <html> selon useAppStore.darkMode (source unique du thème)
 * - ErrorBoundary: Capture les erreurs React
 * - I18nProviderWrapper: Phase P12 - Internationalisation (locale, currency, timezone, RTL)
 * - AuthProvider: Gestion authentification
 * - ToastProvider: Notifications globales
 * - ModalManager: Gestion des modals
 * - PwaRegistration: Enregistrement du service worker (PWA installable)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeSync />
      <I18nProviderWrapper>
        <AuthProvider>
          <SessionTimeoutWarning />
          <PwaRegistration />
          <PwaInstallPrompt />
          <ToastProvider>
            <ModalManager />
            <SearchGlobal />
            <CookieConsentBanner privacyPolicyUrl="/privacy" />
            {children}
          </ToastProvider>
        </AuthProvider>
      </I18nProviderWrapper>
    </ErrorBoundary>
  );
}
