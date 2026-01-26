/**
 * Layout pour le Dashboard
 * Fournit le contexte de navigation et synchronise avec l'URL
 * ✅ Amélioré avec ErrorBoundary et gestion d'erreurs
 * Phase P12: Bootstrap i18n server-side (charge messages depuis JSON)
 */

import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { I18nProvider } from '@/src/lib/i18n/I18nProvider';
import { resolveLocaleContext } from '@/lib/server/i18n';
import { loadMessages } from '@/lib/server/i18n/loadMessages';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import {
  DashboardLayoutFallback,
  DashboardLayoutError,
  DashboardSyncClient,
} from './DashboardLayoutClient';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Phase P12: Résoudre le contexte i18n côté serveur
  const headersList = await headers();
  const baseCtx = extractContextFromHeaders(headersList);
  const localeBundle = await resolveLocaleContext(
    headersList,
    baseCtx.tenantId,
    baseCtx.userId
  );
  
  // Charger les messages depuis les fichiers JSON
  const messages = loadMessages(localeBundle.locale);
  
  return (
    <ErrorBoundary fallback={(error) => <DashboardLayoutError error={error} />}>
      <I18nProvider
        messages={messages}
        locale={localeBundle.locale}
        currency={localeBundle.currency}
        timezone={localeBundle.timezone}
        dir={localeBundle.direction}
      >
        <Suspense fallback={<DashboardLayoutFallback />}>
          <DashboardSyncClient />
        </Suspense>
        <ErrorBoundary fallback={(error) => <DashboardLayoutError error={error} />}>
          {children}
        </ErrorBoundary>
      </I18nProvider>
    </ErrorBoundary>
  );
}

