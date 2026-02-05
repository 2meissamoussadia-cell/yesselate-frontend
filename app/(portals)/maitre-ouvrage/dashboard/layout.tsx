/**
 * Layout pour le Dashboard
 * Fournit le contexte de navigation et synchronise avec l'URL
 * ✅ Amélioré avec ErrorBoundary et gestion d'erreurs
 * Phase P12: Bootstrap i18n server-side (charge messages depuis JSON)
 */
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard | Maître d\'Ouvrage | YESSALATE',
  description:
    'Tableau de bord - KPIs temps réel, pilotage chantiers, indicateurs performance. Cockpit rénovation digitale BTP.',
};

import { headers } from 'next/headers';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { DashboardI18nGate } from '@/modules/dashboard/components/DashboardI18nGate';
import { resolveLocaleContext } from '@/lib/server/i18n';
import { loadMessages } from '@/lib/server/i18n/loadMessages';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import {
  DashboardLayoutFallback,
  DashboardLayoutError,
  DashboardSyncClient,
  DashboardErrorFallback,
} from './DashboardLayoutClient';
import { DashboardAlertProvider } from '@/modules/dashboard/components/DashboardAlertProvider';
import { DashboardAuthGuard } from '@/modules/dashboard/components/DashboardAuthGuard';
import { createLogger } from '@/modules/dashboard/utils/logger.server';

const log = createLogger('DashboardLayout');

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    // Phase P12: Résoudre le contexte i18n côté serveur
    const headersList = await headers();
    
    let baseCtx;
    try {
      baseCtx = extractContextFromHeaders(headersList);
    } catch (error) {
      log.error('Error extracting context from headers', { action: 'extractContext' }, error instanceof Error ? error : undefined);
      throw new Error(`Failed to extract context: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (!baseCtx.tenantId || !baseCtx.userId) {
      throw new Error(`Invalid context: tenantId=${baseCtx.tenantId}, userId=${baseCtx.userId}`);
    }
    
    let localeBundle;
    try {
      localeBundle = await resolveLocaleContext(
        headersList,
        baseCtx.tenantId,
        baseCtx.userId
      );
    } catch (error) {
      log.error('Error resolving locale context', { action: 'resolveLocale' }, error instanceof Error ? error : undefined);
      throw new Error(`Failed to resolve locale context: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (!localeBundle || !localeBundle.locale) {
      throw new Error(`Invalid locale bundle: ${JSON.stringify(localeBundle)}`);
    }
    
    // Charger les messages depuis les fichiers JSON
    let messages;
    try {
      messages = loadMessages(localeBundle.locale);
    } catch (error) {
      log.error('Error loading messages', { action: 'loadMessages' }, error instanceof Error ? error : undefined);
      // Fallback sur messages vides plutôt que de faire échouer
      messages = {};
    }
    
    const initialBundle = {
      locale: localeBundle.locale,
      currency: localeBundle.currency,
      timezone: localeBundle.timezone,
      direction: localeBundle.direction,
    };

    return (
      <ErrorBoundary fallback={<DashboardErrorFallback error={new Error('')} />}>
        <DashboardI18nGate initialBundle={initialBundle} initialMessages={messages}>
          <Suspense fallback={<DashboardLayoutFallback />}>
            <DashboardSyncClient />
          </Suspense>
          <ErrorBoundary fallback={<DashboardErrorFallback error={new Error('')} />}>
            <DashboardAuthGuard>
              <DashboardAlertProvider>
                {children}
              </DashboardAlertProvider>
            </DashboardAuthGuard>
          </ErrorBoundary>
        </DashboardI18nGate>
      </ErrorBoundary>
    );
  } catch (error) {
    // Gérer les erreurs serveur (DB, headers, etc.)
    const errorMessage = error instanceof Error 
      ? error.message 
      : error instanceof AggregateError
      ? error.errors?.map(e => e instanceof Error ? e.message : String(e)).join(', ') || 'Unknown aggregate error'
      : String(error);
    
    log.error('Server error', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    }, error instanceof Error ? error : undefined);
    
    return (
      <ErrorBoundary fallback={<DashboardErrorFallback error={new Error('')} />}>
        <DashboardLayoutError 
          error={new Error(`Dashboard Layout Error: ${errorMessage}`)} 
        />
      </ErrorBoundary>
    );
  }
}

