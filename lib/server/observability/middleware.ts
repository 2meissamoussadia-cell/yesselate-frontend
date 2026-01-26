/**
 * Middleware d'observabilité pour Next.js
 * Phase P4: Observabilité & Robustesse
 * 
 * Injecte x-request-id, trace les requêtes, collecte les métriques
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiRequestCounter, apiRequestDuration, apiErrorCounter } from './metrics';
import { observeHttp } from './httpMetrics';
import { logger, withReq } from '@/lib/server/logging';
import { withSpan } from './telemetry';
import { randomUUID } from 'crypto';

// Type pour le handler
type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Middleware d'observabilité
 * Phase P4: Tracing + Métriques + Logs corrélés
 * 
 * À utiliser dans middleware.ts Next.js
 */
export async function observabilityMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  
  // Générer ou récupérer request ID
  const requestId = req.headers.get('x-request-id') || randomUUID();
  const log = withReq(requestId).child({
    method: req.method,
    path: req.nextUrl.pathname,
    userAgent: req.headers.get('user-agent') || undefined,
  });

  // Créer un span OpenTelemetry
  return withSpan(
    `http.${req.method.toLowerCase()} ${req.nextUrl.pathname}`,
    async (span) => {
      try {
        log.info({ type: 'request_start' }, `[API] ${req.method} ${req.nextUrl.pathname}`);

        // Ajouter request ID aux headers de la réponse
        const response = await handler(req);
        response.headers.set('x-request-id', requestId);

        const duration = (Date.now() - startTime) / 1000;
        const status = response.status;

        // Enregistrer les métriques
        const route = req.nextUrl.pathname;
        apiRequestCounter.inc({ method: req.method, route, status: String(status) });
        apiRequestDuration.observe({ method: req.method, route, status: String(status) }, duration);
        
        // Métrique HTTP simplifiée (prom-client)
        observeHttp(req.method, route, status, duration);

        // Logger la fin de la requête
        log.info(
          {
            type: 'request_end',
            status,
            duration,
          },
          `[API] ${req.method} ${req.nextUrl.pathname} ${status} (${duration.toFixed(3)}s)`
        );

        // Ajouter des attributs au span
        if (span) {
          span.setAttributes({
            'http.method': req.method,
            'http.route': route,
            'http.status_code': status,
            'http.response_time': duration,
          });
        }

        return response;
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        const route = req.nextUrl.pathname;
        const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';

        // Enregistrer l'erreur
        apiErrorCounter.inc({ method: req.method, route, error_type: errorType });
        log.error(
          {
            err: error,
            type: 'request_error',
            duration,
          },
          `[API] Error ${req.method} ${req.nextUrl.pathname}`
        );

        // Re-throw pour que Next.js gère l'erreur
        throw error;
      }
    },
    {
      'http.method': req.method,
      'http.route': req.nextUrl.pathname,
    }
  );
}
