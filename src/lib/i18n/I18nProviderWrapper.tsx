// src/lib/i18n/I18nProviderWrapper.tsx
// Phase P12: Wrapper qui charge le bundle et les messages depuis l'API
'use client';

import React, { useEffect, useState } from 'react';
import { I18nProvider } from './I18nProvider';

/**
 * Wrapper qui charge automatiquement le bundle et les messages
 * et les passe au I18nProvider simplifié
 */
export function I18nProviderWrapper({ children }: { children: React.ReactNode }) {
  const [bundle, setBundle] = useState<{
    locale: string;
    currency: string;
    timezone: string;
    dir: 'ltr' | 'rtl';
  } | null>(null);
  
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Charger le bundle depuis /api/me/policy
  useEffect(() => {
    let cancelled = false;
    
    async function loadBundle() {
      try {
        const res = await fetch('/api/me/policy', {
          headers: {
            'x-tenant-id': 'default', // TODO: récupérer depuis le contexte auth
            'x-user-id': 'anonymous', // TODO: récupérer depuis le contexte auth
          },
        });
        
        if (cancelled) return;
        
        if (!res.ok) {
          throw new Error(`Failed to load policy: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Phase P12: Extraire le bundle i18n
        const newBundle = {
          locale: data.locale || 'fr-FR',
          currency: data.currency || 'EUR',
          timezone: data.timezone || 'Europe/Paris',
          dir: (data.direction || 'ltr') as 'ltr' | 'rtl',
        };
        
        if (!cancelled) {
          setBundle(newBundle);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[I18n] Failed to load bundle, using defaults', err);
          // Fallback sur valeurs par défaut
          setBundle({
            locale: 'fr-FR',
            currency: 'EUR',
            timezone: 'Europe/Paris',
            dir: 'ltr',
          });
        }
      }
    }
    
    loadBundle();
    return () => { cancelled = true; };
  }, []);

  // Charger les messages depuis /locales/{locale}.json
  useEffect(() => {
    if (!bundle) return;
    
    let cancelled = false;
    
    async function loadMessages() {
      try {
        // Normaliser la locale (ex: 'fr-FR' -> 'fr-FR', 'fr' -> 'fr-FR')
        const localeCode = bundle?.locale || 'fr-FR';
        const normalizedLocale = localeCode.includes('-') 
          ? localeCode 
          : `${localeCode}-${localeCode.toUpperCase()}`;
        
        // Charger les messages
        const res = await fetch(`/locales/${normalizedLocale}.json`);
        
        if (cancelled) return;
        
        if (!res.ok) {
          // Fallback sur fr-FR si locale non trouvée
          if (normalizedLocale !== 'fr-FR') {
            const fallbackRes = await fetch('/locales/fr-FR.json');
            if (fallbackRes.ok) {
              const fallbackMessages = await fallbackRes.json();
              if (!cancelled) {
                setMessages(fallbackMessages);
                setIsLoading(false);
              }
            }
          }
          return;
        }
        
        const loadedMessages = await res.json();
        
        if (!cancelled) {
          setMessages(loadedMessages);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('[I18n] Failed to load messages', err);
          setIsLoading(false);
        }
      }
    }
    
    loadMessages();
    return () => { cancelled = true; };
  }, [bundle]);

  // Afficher les enfants uniquement quand tout est chargé
  if (isLoading || !bundle) {
    return <>{children}</>; // Ou un loader si nécessaire
  }

  return (
    <I18nProvider
      messages={messages}
      locale={bundle.locale}
      currency={bundle.currency}
      timezone={bundle.timezone}
      dir={bundle.dir}
    >
      {children}
    </I18nProvider>
  );
}
