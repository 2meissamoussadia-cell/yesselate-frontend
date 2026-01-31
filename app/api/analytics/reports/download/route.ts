/**
 * GET /api/analytics/reports/download
 * Téléchargement d'un rapport généré (mock : retourne un fichier placeholder).
 * Query: ?id= (reportId)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Paramètre id requis' },
        { status: 400 }
      );
    }

    // Mock : contenu placeholder (en production : lire fichier stocké ou régénérer)
    const content = `Rapport Analytics - Mock\nID: ${id}\nGénéré le: ${new Date().toISOString()}\n`;
    const filename = `rapport-analytics-${id}.txt`;

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/reports/download:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du téléchargement du rapport' },
      { status: 500 }
    );
  }
}
