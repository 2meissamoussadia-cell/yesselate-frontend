// app/api/me/policy/route.ts
// Phase P10: Endpoint léger pour exposer perms[] et flags{} au front
// Phase P12: Étendu pour inclure locale/currency/timezone
// Cache court (60s) pour réduire la charge DB

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { hydrateContext } from '@lib-root/server/dashboard/context_ext';
import { resolveLocaleContext } from '@/lib/server/i18n';

export async function GET(req: NextRequest) {
  try {
    const base = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(base);
    
    // Phase P12: Résoudre le contexte i18n
    const localeBundle = await resolveLocaleContext(
      req.headers,
      base.tenantId,
      base.userId
    );
    
    return NextResponse.json(
      { 
        perms: ctx.perms || [], 
        flags: ctx.flags || {},
        // Phase P12: Bundle i18n
        locale: localeBundle.locale,
        currency: localeBundle.currency,
        timezone: localeBundle.timezone,
        direction: localeBundle.direction,
      },
      { 
        status: 200,
        headers: { 
          'Cache-Control': 'private, max-age=60',
          'Content-Type': 'application/json',
          // Phase P12: Headers i18n pour référence
          'X-Locale': localeBundle.locale,
          'X-Currency': localeBundle.currency,
          'X-Timezone': localeBundle.timezone,
          'X-Direction': localeBundle.direction,
        } 
      }
    );
  } catch (error) {
    console.error('[Policy API] Failed to load policy', error);
    // Fallback : retourner des permissions vides et locale par défaut en cas d'erreur
    return NextResponse.json(
      { 
        perms: [], 
        flags: {},
        locale: 'fr-FR',
        currency: 'EUR',
        timezone: 'Europe/Paris',
        direction: 'ltr',
      },
      { 
        status: 200,
        headers: { 
          'Cache-Control': 'private, max-age=60',
          'Content-Type': 'application/json',
          'X-Locale': 'fr-FR',
          'X-Currency': 'EUR',
          'X-Timezone': 'Europe/Paris',
          'X-Direction': 'ltr',
        } 
      }
    );
  }
}
