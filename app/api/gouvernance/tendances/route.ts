/**
 * GET /api/gouvernance/tendances
 * ===============================
 * 
 * Tendances mensuelles de gouvernance
 * Retourne les tendances sur plusieurs mois pour les graphiques
 * 
 * Query params:
 * - bureau: Filtrer par bureau (optionnel)
 * - months: Nombre de mois à retourner (défaut: 12)
 * - date_debut: Date de début (optionnel)
 * - date_fin: Date de fin (optionnel)
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockTendances } from '@/modules/gouvernance/api/gouvernanceApiMock';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bureau = searchParams.get('bureau');
    const months = parseInt(searchParams.get('months') || '12', 10);
    const date_debut = searchParams.get('date_debut');
    const date_fin = searchParams.get('date_fin');

    // TODO: Remplacer par vrai appel backend/BDD
    // Pour l'instant, retourner les données mockées
    let tendances = [...mockTendances];

    // Limiter le nombre de mois si spécifié
    if (months > 0 && months < tendances.length) {
      tendances = tendances.slice(0, months);
    }

    // Appliquer filtres si présents (simulation)
    // En production, ces filtres seraient appliqués côté backend
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
      data: tendances,
    });
  } catch (error) {
    console.error('Error fetching governance trends:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des tendances',
      },
      { status: 500 }
    );
  }
}
