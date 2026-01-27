/**
 * Endpoint CSP report-uri pour violations CSP
 * Phase P15: Observabilité & réponse - CSP violations
 * 
 * Reçoit les rapports de violations CSP depuis les navigateurs
 * et les agrège pour alertes (P15)
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';

/**
 * POST /api/security/csp-report
 * 
 * Reçoit les rapports de violations CSP au format JSON
 * Format : https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP#violation_report_syntax
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = extractContextFromHeaders(req.headers);
    const body = await req.json();
    
    // Format CSP report : { "csp-report": { ... } }
    const cspReport = body['csp-report'] || body;
    
    // Extraire les informations pertinentes
    const violation = {
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      documentUri: cspReport['document-uri'],
      violatedDirective: cspReport['violated-directive'],
      effectiveDirective: cspReport['effective-directive'],
      originalPolicy: cspReport['original-policy'],
      blockedUri: cspReport['blocked-uri'],
      sourceFile: cspReport['source-file'],
      lineNumber: cspReport['line-number'],
      columnNumber: cspReport['column-number'],
      statusCode: cspReport['status-code'],
      referrer: cspReport.referrer,
      timestamp: new Date().toISOString(),
      requestId: req.headers.get('x-request-id'),
    };
    
    // Log la violation (à intégrer avec système de logging P4)
    console.warn('[CSP Violation]', violation);
    
    // TODO: Stocker dans DB pour agrégation et alertes (P15)
    // await storeCspViolation(violation);
    
    // TODO: Déclencher alerte si seuil dépassé (P15)
    // await checkCspViolationThreshold(ctx.tenantId);
    
    // Retourner 204 No Content (standard pour CSP reports)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Ne pas exposer d'erreur au navigateur (éviter fuite d'infos)
    console.error('[CSP Report] Error processing report:', error);
    return new NextResponse(null, { status: 204 });
  }
}

/**
 * GET /api/security/csp-report (optionnel, pour debug)
 */
export async function GET() {
  return NextResponse.json({
    message: 'CSP report endpoint',
    format: 'POST with JSON body containing "csp-report" object',
  });
}
