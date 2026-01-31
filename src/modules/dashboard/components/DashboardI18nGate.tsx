'use client';

/**
 * DashboardI18nGate — Applique la locale préférée (store) ou la locale serveur.
 * Charge les messages côté client quand l'utilisateur change de langue (FR/EN/AR).
 */

import React, { useEffect, useState } from 'react';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { useAppStore } from '@/lib/stores/app-store';

const RTL_LOCALES = new Set(['ar-MA', 'ar']);
function getDirection(locale: string): 'ltr' | 'rtl' {
  const lang = locale.split('-')[0].toLowerCase();
  return RTL_LOCALES.has(locale) || RTL_LOCALES.has(lang) ? 'rtl' : 'ltr';
}

export interface DashboardI18nGateProps {
  initialBundle: {
    locale: string;
    currency: string;
    timezone: string;
    direction: 'ltr' | 'rtl';
  };
  initialMessages: Record<string, string>;
  children: React.ReactNode;
}

export function DashboardI18nGate({
  initialBundle,
  initialMessages,
  children,
}: DashboardI18nGateProps) {
  const localeOverride = useAppStore((s) => s.localeOverride);
  const [messages, setMessages] = useState<Record<string, string>>(initialMessages);
  const [effectiveLocale, setEffectiveLocale] = useState(initialBundle.locale);
  const [effectiveDir, setEffectiveDir] = useState(initialBundle.direction);

  const targetLocale: string = localeOverride ?? initialBundle.locale;

  useEffect(() => {
    if (targetLocale === initialBundle.locale) {
      setMessages(initialMessages);
      setEffectiveLocale(initialBundle.locale);
      setEffectiveDir(initialBundle.direction);
      return;
    }
    let cancelled = false;
    fetch(`/locales/${targetLocale}.json`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: Record<string, string>) => {
        if (!cancelled) {
          setMessages(data);
          setEffectiveLocale(targetLocale);
          setEffectiveDir(getDirection(targetLocale));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages(initialMessages);
          setEffectiveLocale(initialBundle.locale);
          setEffectiveDir(initialBundle.direction);
        }
      });
    return () => { cancelled = true; };
  }, [targetLocale, initialBundle.locale, initialBundle.direction, initialMessages]);

  return (
    <I18nProvider
      messages={messages}
      locale={effectiveLocale}
      currency={initialBundle.currency}
      timezone={initialBundle.timezone}
      dir={effectiveDir}
    >
      {children}
    </I18nProvider>
  );
}
