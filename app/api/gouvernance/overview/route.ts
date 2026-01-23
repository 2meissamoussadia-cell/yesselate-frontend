/**
 * GET /api/gouvernance/overview
 * =============================
 * 
 * Vue d'ensemble de la gouvernance
 * Retourne les données de synthèse pour le tableau de bord gouvernance
 * 
 * Query params:
 * - bureau: Filtrer par bureau (optionnel)
 * - date_debut: Date de début (optionnel)
 * - date_fin: Date de fin (optionnel)
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockOverview } from '@/modules/gouvernance/api/gouvernanceApiMock';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bureau = searchParams.get('bureau');
    const date_debut = searchParams.get('date_debut');
    const date_fin = searchParams.get('date_fin');

    // TODO: Remplacer par vrai appel backend/BDD
    // Pour l'instant, retourner les données mockées
    const overview = mockOverview;

    // Appliquer filtres si présents (simulation)
    // En production, ces filtres seraient appliqués côté backend
    let filteredOverview = { ...overview };
    
    if (bureau) {
      // Filtrer par bureau (simulation)
      // En production, filtrer les données réelles
    }

    if (date_debut || date_fin) {
      // Filtrer par dates (simulation)
      // En production, filtrer les données réelles
    }

    return NextResponse.json({
      success: true,
      data: filteredOverview,
    });
  } catch (error) {
    console.error('Error fetching governance overview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de la vue d\'ensemble',
      },
      { status: 500 }
    );
  }
}
