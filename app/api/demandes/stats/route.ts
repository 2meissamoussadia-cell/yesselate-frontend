/**
 * Route proxy pour /api/demandes/stats
 * Redirige vers /api/demands/stats pour maintenir la compatibilité
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Rediriger vers la route réelle
    const url = new URL('/api/demands/stats', request.url);
    url.search = request.nextUrl.search;
    
    // Faire un fetch interne vers la vraie route
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Si la route n'existe pas, retourner des données mockées
      return NextResponse.json(
        {
          total: 0,
          pending: 0,
          validated: 0,
          rejected: 0,
          urgent: 0,
          high: 0,
          overdue: 0,
          avgDelay: 0,
          ts: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    // En cas d'erreur, retourner des données mockées
    return NextResponse.json(
      {
        total: 0,
        pending: 0,
        validated: 0,
        rejected: 0,
        urgent: 0,
        high: 0,
        overdue: 0,
        avgDelay: 0,
        ts: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
