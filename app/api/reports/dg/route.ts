/**
 * GET /api/reports/dg
 * Rapport DG : Top 5 chantiers risque, Budget vs Réel, Graphiques évolution.
 * ?format=json (défaut) | xlsx | pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatAsDGReportXLSX, type DGReportData } from '@lib-root/server/dashboard/export/dgReportXlsx';
import { formatAsPDF } from '@lib-root/server/dashboard/export/pdfFormatter';

/** Données de rapport DG (Top 5 risques, Budget vs Réel, Évolution) */
async function buildDGReportData(): Promise<DGReportData> {
  const top5Risks: DGReportData['top5Risks'] = [
    { id: 'RISK-001', severity: 'critical', score: 92, title: 'BC bloqué depuis 5 jours', detail: 'BC-2024-0847 • Matériaux Phase 3', source: 'BF', trend: 'up', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'RISK-002', severity: 'critical', score: 88, title: 'Paiement en retard 3 jours', detail: 'PAY-2024-1234 • 128.5M FCFA', source: 'BCG', trend: 'stable', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'RISK-003', severity: 'warning', score: 72, title: 'Contrat expire dans 5 jours', detail: 'CTR-2024-0567 • Sous-traitance', source: 'BJA', trend: 'down', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'RISK-004', severity: 'warning', score: 65, title: 'Charge bureau excessive', detail: 'BOP • Charge à 95%', source: 'Système', trend: 'up', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'RISK-005', severity: 'warning', score: 58, title: 'Arbitrage en attente 3 jours', detail: 'ARB-2024-0089', source: 'BOP', trend: 'stable', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];
  const budget: number = 4.2;
  const reel = 3.9;
  const ecart = reel - budget;
  const ecartPct = budget !== 0 ? (ecart / budget) * 100 : 0;
  const now = new Date();
  const evolution: DGReportData['evolution'] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    evolution.push({
      mois: d.toISOString().slice(0, 7),
      demandes: 20 + Math.floor(Math.random() * 10),
      validations: 18 + Math.floor(Math.random() * 8),
      budget: 0.3 + Math.random() * 0.2,
    });
  }
  return {
    generatedAt: new Date().toISOString(),
    top5Risks,
    budgetVsReel: { budget, reel, ecart, ecartPct, unit: 'Mds FCFA' },
    evolution,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    const data = await buildDGReportData();

    if (format === 'json') {
      return NextResponse.json(data);
    }

    if (format === 'xlsx') {
      const buffer = await formatAsDGReportXLSX(data);
      const filename = `rapport-dg-${new Date().toISOString().slice(0, 10)}.xlsx`;
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === 'pdf') {
      const rows = [
        ...data.top5Risks.map((r) => ({ Risque: r.title, Score: r.score, Source: r.source })),
        { Indicateur: 'Budget vs Réel', Budget: data.budgetVsReel.budget, Réel: data.budgetVsReel.reel, Écart: data.budgetVsReel.ecart },
        ...data.evolution.map((e) => ({ Mois: e.mois, Demandes: e.demandes, Validations: e.validations, Budget: e.budget })),
      ];
      const buffer = await formatAsPDF(
        { rows },
        { main: 'rapport-dg', sub: null, leaf: null },
        { locale: 'fr-FR', currency: 'XOF', timezone: 'Africa/Dakar', direction: 'ltr', orientation: 'portrait' }
      );
      const filename = `rapport-dg-${new Date().toISOString().slice(0, 10)}.pdf`;
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format', allowed: ['json', 'xlsx', 'pdf'] }, { status: 400 });
  } catch (e) {
    console.error('[reports/dg]', e);
    return NextResponse.json(
      { error: 'Failed to generate report', message: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}
