'use client';

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '@/components/features/bmo/ToastProvider';
import { ModalManager } from '@/components/shared/ModalManager';
import { ErrorBoundary } from '@/components/features/bmo/ErrorBoundary';
import { I18nProviderWrapper } from '@/lib/i18n';

/**
 * Providers - Wrapper centralisé pour tous les providers
 * 
 * Ce composant regroupe tous les providers nécessaires à l'application:
 * - ErrorBoundary: Capture les erreurs React
 * - I18nProviderWrapper: Phase P12 - Internationalisation (locale, currency, timezone, RTL)
 * - AuthProvider: Gestion authentification
 * - ToastProvider: Notifications globales
 * - ModalManager: Gestion des modals
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <I18nProviderWrapper>
        <AuthProvider>
          <ToastProvider>
            <ModalManager />
            {children}
          </ToastProvider>
        </AuthProvider>
      </I18nProviderWrapper>
    </ErrorBoundary>
  );
}
