// lib/server/i18n/locale.server.ts
// Phase P12: Négociation de locale côté serveur
// Résout locale, currency, timezone depuis tenant → user → navigateur

import { pgPool } from '@lib-root/server/db/pool';

/**
 * Bundle de contexte i18n résolu
 */
export type LocaleBundle = {
  locale: string;         // ex. 'fr-FR'
  currency: string;       // ex. 'EUR'
  timezone: string;       // ex. 'Europe/Paris'
  direction: 'ltr' | 'rtl';
};

/**
 * Langues RTL (Right-to-Left)
 */
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

/**
 * Résout le contexte i18n pour un utilisateur
 * 
 * Hiérarchie de résolution :
 * 1. Préférence utilisateur (user_prefs)
 * 2. Accept-Language header (si pas de préférence utilisateur)
 * 3. Préférence tenant (tenant_settings)
 * 4. Valeurs par défaut système
 * 
 * @param headers - Headers HTTP (pour Accept-Language)
 * @param tenantId - ID du tenant
 * @param userId - ID de l'utilisateur (optionnel)
 * @returns Bundle de contexte i18n résolu
 */
export async function resolveLocaleContext(
  headers: Headers,
  tenantId: string,
  userId?: string
): Promise<LocaleBundle> {
  // Si pas de DB, retourner des valeurs par défaut basées sur Accept-Language
  if (!process.env.DATABASE_URL) {
    const acceptLanguage = headers.get('accept-language') ?? '';
    const navLocale = acceptLanguage.split(',')[0]?.split(';')[0]?.trim() || 'fr-FR';
    const lang = navLocale.split('-')[0].toLowerCase();
    const direction: 'ltr' | 'rtl' = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
    
    return {
      locale: navLocale,
      currency: 'EUR',
      timezone: 'Europe/Paris',
      direction,
    };
  }

  let client;
  try {
    client = await pgPool.connect();
  } catch (error) {
    // Si la connexion échoue, retourner des valeurs par défaut (log en string pour éviter sérialisation RSC)
    const msg = error instanceof Error ? error.message : String(error);
    console.debug('[resolveLocaleContext] Database connection failed, using defaults:', msg);
    const acceptLanguage = headers.get('accept-language') ?? '';
    const navLocale = acceptLanguage.split(',')[0]?.split(';')[0]?.trim() || 'fr-FR';
    const lang = navLocale.split('-')[0].toLowerCase();
    const direction: 'ltr' | 'rtl' = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
    
    return {
      locale: navLocale,
      currency: 'EUR',
      timezone: 'Europe/Paris',
      direction,
    };
  }
  
  try {
    // 1. Récupérer les préférences tenant
    const { rows: tenantRows } = await client.query<{
      default_locale: string;
      default_currency: string;
      default_timezone: string;
    }>(
      `SELECT default_locale, default_currency, default_timezone 
       FROM tenant_settings 
       WHERE tenant_id = $1`,
      [tenantId]
    );
    
    const tenantDefaults = tenantRows[0] ?? {
      default_locale: 'fr-FR',
      default_currency: 'EUR',
      default_timezone: 'Europe/Paris',
    };

    // 2. Récupérer les préférences utilisateur (si userId fourni)
    let userPrefs: { locale?: string; currency?: string; timezone?: string } = {};
    
    if (userId) {
      const { rows: userRows } = await client.query<{
        locale: string | null;
        currency: string | null;
        timezone: string | null;
      }>(
        `SELECT locale, currency, timezone 
         FROM user_prefs 
         WHERE tenant_id = $1 AND user_id = $2`,
        [tenantId, userId]
      );
      
      const row = userRows[0];
      userPrefs = row
        ? {
            locale: row.locale ?? undefined,
            currency: row.currency ?? undefined,
            timezone: row.timezone ?? undefined,
          }
        : {};
    }

    // 3. Négocier la locale (user pref > Accept-Language > tenant default)
    const acceptLanguage = headers.get('accept-language') ?? '';
    const navLocale = acceptLanguage.split(',')[0]?.split(';')[0]?.trim();
    
    const locale = 
      userPrefs.locale || 
      navLocale || 
      tenantDefaults.default_locale || 
      'fr-FR';

    // 4. Résoudre currency et timezone (user pref > tenant default)
    const currency = 
      userPrefs.currency || 
      tenantDefaults.default_currency || 
      'EUR';

    const timezone = 
      userPrefs.timezone || 
      tenantDefaults.default_timezone || 
      'Europe/Paris';

    // 5. Déterminer la direction (RTL/LTR) depuis la langue
    const lang = locale.split('-')[0].toLowerCase();
    const direction: 'ltr' | 'rtl' = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';

    return {
      locale,
      currency,
      timezone,
      direction,
    };
  } catch (error) {
    // Si une erreur se produit lors des requêtes, retourner des valeurs par défaut (log en string pour éviter sérialisation RSC)
    const msg = error instanceof Error ? error.message : String(error);
    console.debug('[resolveLocaleContext] Database query failed, using defaults:', msg);
    const acceptLanguage = headers.get('accept-language') ?? '';
    const navLocale = acceptLanguage.split(',')[0]?.split(';')[0]?.trim() || 'fr-FR';
    const lang = navLocale.split('-')[0].toLowerCase();
    const direction: 'ltr' | 'rtl' = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
    
    return {
      locale: navLocale,
      currency: 'EUR',
      timezone: 'Europe/Paris',
      direction,
    };
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Récupère le taux de change pour une paire de devises
 * 
 * @param baseCurrency - Devise de base (ex: 'EUR')
 * @param quoteCurrency - Devise cible (ex: 'XOF')
 * @returns Taux de change ou null si non trouvé
 */
export async function getExchangeRate(
  baseCurrency: string,
  quoteCurrency: string
): Promise<number | null> {
  // Si même devise, taux = 1
  if (baseCurrency === quoteCurrency) {
    return 1;
  }

  const client = await pgPool.connect();
  
  try {
    // Chercher base -> quote
    const { rows } = await client.query<{ rate: number }>(
      `SELECT rate 
       FROM exchange_rates 
       WHERE base_currency = $1 AND quote_currency = $2`,
      [baseCurrency, quoteCurrency]
    );

    if (rows[0]) {
      return Number(rows[0].rate);
    }

    // Si pas trouvé, essayer l'inverse
    const { rows: inverseRows } = await client.query<{ rate: number }>(
      `SELECT rate 
       FROM exchange_rates 
       WHERE base_currency = $1 AND quote_currency = $2`,
      [quoteCurrency, baseCurrency]
    );

    if (inverseRows[0]) {
      return 1.0 / Number(inverseRows[0].rate);
    }

    return null;
  } finally {
    client.release();
  }
}

/**
 * Convertit un montant d'une devise à une autre
 * 
 * @param amount - Montant à convertir
 * @param fromCurrency - Devise source
 * @param toCurrency - Devise cible
 * @returns Montant converti ou null si conversion impossible
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = await getExchangeRate(fromCurrency, toCurrency);
  
  if (rate === null) {
    return null;
  }

  return amount * rate;
}
