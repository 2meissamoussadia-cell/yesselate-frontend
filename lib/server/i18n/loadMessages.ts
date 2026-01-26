// lib/server/i18n/loadMessages.ts
// Phase P12: Helper server-side pour charger les messages depuis public/locales/

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Charge les messages de traduction depuis public/locales/{locale}.json
 * 
 * @param locale - Locale (ex: 'fr-FR', 'en-GB', 'ar-MA')
 * @returns Messages de traduction (Record<string, string>)
 */
export function loadMessages(locale: string): Record<string, string> {
  try {
    // Normaliser la locale (ex: 'fr-FR' -> 'fr-FR', 'fr' -> 'fr-FR')
    const normalizedLocale = locale.includes('-') 
      ? locale 
      : `${locale}-${locale.toUpperCase()}`;
    
    // Chemin vers le fichier de locale
    const localePath = join(process.cwd(), 'public', 'locales', `${normalizedLocale}.json`);
    
    // Lire le fichier
    const content = readFileSync(localePath, 'utf-8');
    const messages = JSON.parse(content) as Record<string, string>;
    
    return messages;
  } catch (error) {
    // Fallback sur fr-FR si locale non trouvée
    if (locale !== 'fr-FR') {
      try {
        const fallbackPath = join(process.cwd(), 'public', 'locales', 'fr-FR.json');
        const fallbackContent = readFileSync(fallbackPath, 'utf-8');
        const fallbackMessages = JSON.parse(fallbackContent) as Record<string, string>;
        console.warn(`[I18n] Locale ${locale} not found, falling back to fr-FR`);
        return fallbackMessages;
      } catch (fallbackError) {
        console.error('[I18n] Failed to load fallback locale fr-FR', fallbackError);
        return {};
      }
    }
    
    console.error(`[I18n] Failed to load locale ${locale}`, error);
    return {};
  }
}
