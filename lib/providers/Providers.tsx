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

/**
 * Providers - Wrapper centralisé pour tous les providers
 *
 * Ce composant regroupe tous les providers nécessaires à l'application:
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
      <I18nProviderWrapper>
        <AuthProvider>
          <PwaRegistration />
          <PwaInstallPrompt />
          <ToastProvider>
            <ModalManager />
            <SearchGlobal />
            {children}
          </ToastProvider>
        </AuthProvider>
      </I18nProviderWrapper>
    </ErrorBoundary>
  );
}
