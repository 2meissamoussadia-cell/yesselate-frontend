/**
 * GET /api/dashboard/kpis/[id]
 * Détail d'un KPI avec historique et drill-down
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'year'; // 'month' | 'quarter' | 'year'

    // Générer historique selon la période
    const generateHistory = () => {
      const months = period === 'month' ? 1 : period === 'quarter' ? 3 : 12;
      return Array.from({ length: months }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - 1 - i));
        
        return {
          period: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          value: Math.floor(Math.random() * 100) + 150,
          target: 200,
        };
      });
    };

    // Données spécifiques par KPI
    const kpiData: Record<string, any> = {
      demandes: {
        id: 'demandes',
        label: 'Demandes',
        description: 'Nombre total de demandes traitées',
        currentValue: 247,
        previousValue: 220,
        target: 260,
        unit: '',
        trend: 12,
        history: generateHistory(),
        breakdown: {
          byBureau: [
            { bureau: 'BF', value: 52, percentage: 21 },
            { bureau: 'BCG', value: 48, percentage: 19 },
            { bureau: 'BJA', value: 35, percentage: 14 },
            { bureau: 'BOP', value: 67, percentage: 27 },
            { bureau: 'BRH', value: 45, percentage: 18 },
          ],
          byType: [
            { type: 'BC', value: 98, percentage: 40 },
            { type: 'Paiement', value: 74, percentage: 30 },
            { type: 'Contrat', value: 49, percentage: 20 },
            { type: 'Autre', value: 26, percentage: 10 },
          ],
          byStatus: [
            { status: 'Validées', value: 220, percentage: 89 },
            { status: 'Rejetées', value: 27, percentage: 11 },
          ],
        },
        relatedMetrics: [
          { id: 'validations', label: 'Taux validation', value: '89%' },
          { id: 'delais', label: 'Délai moyen', value: '2.4j' },
        ],
      },
      validations: {
        id: 'validations',
        label: 'Validations',
        description: 'Taux de validation des demandes',
        currentValue: 89,
        previousValue: 86,
        target: 92,
        unit: '%',
        trend: 3,
        history: generateHistory(),
        breakdown: {
          byBureau: [
            { bureau: 'BF', value: 94, percentage: 0 },
            { bureau: 'BCG', value: 87, percentage: 0 },
            { bureau: 'BJA', value: 82, percentage: 0 },
            { bureau: 'BOP', value: 78, percentage: 0 },
            { bureau: 'BRH', value: 91, percentage: 0 },
          ],
        },
        relatedMetrics: [
          { id: 'demandes', label: 'Demandes', value: 247 },
          { id: 'rejets', label: 'Rejets', value: '11%' },
        ],
      },
      budget: {
        id: 'budget',
        label: 'Budget traité',
        description: 'Montant total du budget traité',
        currentValue: 4.2,
        previousValue: 3.8,
        target: 5.0,
        unit: 'Mds FCFA',
        trend: 10,
        history: generateHistory(),
        breakdown: {
          byBureau: [
            { bureau: 'BF', value: 1200, percentage: 29 },
            { bureau: 'BCG', value: 980, percentage: 23 },
            { bureau: 'BJA', value: 650, percentage: 15 },
            { bureau: 'BOP', value: 890, percentage: 21 },
            { bureau: 'BRH', value: 480, percentage: 11 },
          ],
          byCategory: [
            { category: 'Matériaux', value: 1800, percentage: 43 },
            { category: 'Main d\'œuvre', value: 1400, percentage: 33 },
            { category: 'Équipements', value: 650, percentage: 15 },
            { category: 'Services', value: 350, percentage: 8 },
          ],
        },
        relatedMetrics: [
          { id: 'sla', label: 'Conformité SLA', value: '94%' },
        ],
      },
      blocages: {
        id: 'blocages',
        label: 'Blocages',
        description: 'Nombre de dossiers actuellement bloqués',
        currentValue: 5,
        previousValue: 7,
        target: 0,
        unit: '',
        trend: -2,
        history: generateHistory(),
        breakdown: {
          byBureau: [
            { bureau: 'BF', value: 1, percentage: 20 },
            { bureau: 'BCG', value: 2, percentage: 40 },
            { bureau: 'BJA', value: 1, percentage: 20 },
            { bureau: 'BOP', value: 1, percentage: 20 },
          ],
          byType: [
            { type: 'Validation manquante', value: 2, percentage: 40 },
            { type: 'Documentation incomplète', value: 2, percentage: 40 },
            { type: 'Conflit de ressources', value: 1, percentage: 20 },
          ],
          byStatus: [
            { status: 'En attente', value: 3, percentage: 60 },
            { status: 'En cours de résolution', value: 2, percentage: 40 },
          ],
        },
        relatedMetrics: [
          { id: 'demandes', label: 'Demandes totales', value: 247 },
          { id: 'validations', label: 'Taux validation', value: '89%' },
        ],
      },
    };

    const kpi = kpiData[id];

    if (!kpi) {
      return NextResponse.json(
        { error: `KPI '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      kpi,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching KPI details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI details' },
      { status: 500 }
    );
  }
}

