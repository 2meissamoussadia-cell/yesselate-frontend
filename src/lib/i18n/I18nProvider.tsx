// src/lib/i18n/I18nProvider.tsx
// Phase P12: Provider i18n simplifié
'use client';

import React, { createContext, useContext, useMemo } from 'react';

/**
 * Contexte i18n
 */
type I18nCtx = {
  t: (key: string, vars?: Record<string, any>) => string;
  locale: string;
  currency: string;
  timezone: string;
  dir: 'ltr' | 'rtl';
  fmt: {
    number: (n: number, opts?: Intl.NumberFormatOptions) => string;
    currency: (n: number, c?: string, opts?: Intl.NumberFormatOptions) => string;
    percent: (n: number, opts?: Intl.NumberFormatOptions) => string;
    date: (d: Date | string, opts?: Intl.DateTimeFormatOptions) => string;
  };
};

const I18nContext = createContext<I18nCtx | null>(null);

/**
 * Props du provider
 */
interface I18nProviderProps {
  messages: Record<string, string>;
  locale: string;
  currency: string;
  timezone: string;
  dir: 'ltr' | 'rtl';
  children: React.ReactNode;
}

/**
 * Provider i18n
 * 
 * Reçoit directement les messages et le bundle i18n en props
 */
export function I18nProvider({
  messages,
  locale,
  currency,
  timezone,
  dir,
  children,
}: I18nProviderProps) {
  // Fonction de traduction avec interpolation simple {var}
  const t = (key: string, vars: Record<string, any> = {}) => {
    let s = messages[key] ?? key;
    // Interpolation simple {var}
    for (const k of Object.keys(vars)) {
      s = s.replace(new RegExp(`{${k}}`, 'g'), String(vars[k]));
    }
    return s;
  };

  // Helpers de formatage (mémorisés)
  const fmt = useMemo(
    () => ({
      number: (n: number, opts?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, opts).format(n),
      currency: (n: number, cur = currency, opts?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: cur,
          ...opts,
        }).format(n),
      percent: (n: number, opts?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, {
          style: 'percent',
          maximumFractionDigits: 1,
          ...opts,
        }).format(n),
      date: (d: Date | string, opts?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(locale, {
          timeZone: timezone,
          ...opts,
        }).format(typeof d === 'string' ? new Date(d) : d),
    }),
    [locale, currency, timezone]
  );

  // Appliquer la direction au document
  React.useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('lang', locale);
  }, [dir, locale]);

  return (
    <I18nContext.Provider value={{ t, locale, currency, timezone, dir, fmt }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte i18n
 */
export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
