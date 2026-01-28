/**
 * Layout pour le Dashboard
 * Fournit le contexte de navigation et synchronise avec l'URL
 * ✅ Amélioré avec ErrorBoundary et gestion d'erreurs
 * Phase P12: Bootstrap i18n server-side (charge messages depuis JSON)
 */

import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { resolveLocaleContext } from '@/lib/server/i18n';
import { loadMessages } from '@/lib/server/i18n/loadMessages';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import {
  DashboardLayoutFallback,
  DashboardLayoutError,
  DashboardSyncClient,
  DashboardErrorFallback,
} from './DashboardLayoutClient';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    // Phase P12: Résoudre le contexte i18n côté serveur
    const headersList = await headers();
    
    let baseCtx;
    try {
      baseCtx = extractContextFromHeaders(headersList);
    } catch (error) {
      console.error('[DashboardLayout] Error extracting context from headers:', error);
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
      console.error('[DashboardLayout] Error resolving locale context:', error);
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
      console.error('[DashboardLayout] Error loading messages:', error);
      // Fallback sur messages vides plutôt que de faire échouer
      messages = {};
    }
    
    return (
      <ErrorBoundary fallback={<DashboardErrorFallback error={new Error('')} />}>
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
          <ErrorBoundary fallback={<DashboardErrorFallback error={new Error('')} />}>
            {children}
          </ErrorBoundary>
        </I18nProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    // Gérer les erreurs serveur (DB, headers, etc.)
    const errorMessage = error instanceof Error 
      ? error.message 
      : error instanceof AggregateError
      ? error.errors?.map(e => e instanceof Error ? e.message : String(e)).join(', ') || 'Unknown aggregate error'
      : String(error);
    
    console.error('[DashboardLayout] Server error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    
    return (
      <ErrorBoundary fallback={<DashboardErrorFallback error={new Error('')} />}>
        <DashboardLayoutError 
          error={new Error(`Dashboard Layout Error: ${errorMessage}`)} 
        />
      </ErrorBoundary>
    );
  }
}

