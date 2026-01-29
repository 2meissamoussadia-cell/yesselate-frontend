/**
 * CRON Rapport DG (Lundi matin)
 * Génère le rapport DG (Top 5 risques, Budget vs Réel, Évolution).
 * À planifier : Lundi 8h (ex. Vercel Cron ou cron externe).
 *
 * Protection: CRON_SECRET dans header Authorization ou x-cron-secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatAsDGReportXLSX, type DGReportData } from '@lib-root/server/dashboard/export/dgReportXlsx';

const CRON_SECRET = process.env.CRON_SECRET || 'change-me-in-production';

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
    const authHeader = req.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '') || req.headers.get('x-cron-secret');
    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await buildDGReportData();
    const buffer = await formatAsDGReportXLSX(data);
    const filename = `rapport-dg-${new Date().toISOString().slice(0, 10)}.xlsx`;

    // TODO: Envoyer par email au DG ou stocker dans S3/Blob
    // await sendReportEmail(buffer, filename);
    // await storeReport(buffer, filename);

    return NextResponse.json({
      success: true,
      message: 'Rapport DG généré (Lundi matin)',
      generatedAt: data.generatedAt,
      sizeBytes: buffer.length,
      filename,
    });
  } catch (e) {
    console.error('[cron/report-dg]', e);
    return NextResponse.json(
      { error: 'Failed to generate report', message: e instanceof Error ? e.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
