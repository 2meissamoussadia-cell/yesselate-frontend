/**
 * Génération du rapport DG en XLSX (Top 5 risques, Budget vs Réel, Évolution)
 */

import ExcelJS from 'exceljs';

export interface DGReportData {
  generatedAt: string;
  top5Risks: Array<{
    id: string;
    severity: string;
    score: number;
    title: string;
    detail: string;
    source: string;
    trend: string;
    createdAt: string;
  }>;
  budgetVsReel: {
    budget: number;
    reel: number;
    ecart: number;
    ecartPct: number;
    unit: string;
  };
  evolution: Array<{
    mois: string;
    demandes: number;
    validations: number;
    budget: number;
  }>;
}

export async function formatAsDGReportXLSX(data: DGReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Rapport DG';
  wb.created = new Date();
  wb.modified = new Date();

  const wsRisks = wb.addWorksheet('Top 5 risques', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsRisks.columns = [
    { header: 'Id', key: 'id', width: 14 },
    { header: 'Sévérité', key: 'severity', width: 10 },
    { header: 'Score', key: 'score', width: 8 },
    { header: 'Titre', key: 'title', width: 28 },
    { header: 'Détail', key: 'detail', width: 32 },
    { header: 'Source', key: 'source', width: 10 },
    { header: 'Tendance', key: 'trend', width: 8 },
    { header: 'Date', key: 'createdAt', width: 14 },
  ];
  const headerRisks = wsRisks.getRow(1);
  headerRisks.font = { bold: true };
  headerRisks.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  data.top5Risks.forEach((r) => wsRisks.addRow(r));

  const wsBudget = wb.addWorksheet('Budget vs Réel', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsBudget.columns = [
    { header: 'Indicateur', key: 'indicateur', width: 18 },
    { header: 'Valeur', key: 'valeur', width: 16 },
    { header: 'Unité', key: 'unite', width: 10 },
  ];
  const headerBudget = wsBudget.getRow(1);
  headerBudget.font = { bold: true };
  headerBudget.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  const b = data.budgetVsReel;
  wsBudget.addRow({ indicateur: 'Budget', valeur: b.budget, unite: b.unit });
  wsBudget.addRow({ indicateur: 'Réel', valeur: b.reel, unite: b.unit });
  wsBudget.addRow({ indicateur: 'Écart', valeur: b.ecart, unite: b.unit });
  wsBudget.addRow({ indicateur: 'Écart %', valeur: b.ecartPct, unite: '%' });

  const wsEvol = wb.addWorksheet('Évolution', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsEvol.columns = [
    { header: 'Mois', key: 'mois', width: 14 },
    { header: 'Demandes', key: 'demandes', width: 12 },
    { header: 'Validations', key: 'validations', width: 12 },
    { header: 'Budget', key: 'budget', width: 12 },
  ];
  const headerEvol = wsEvol.getRow(1);
  headerEvol.font = { bold: true };
  headerEvol.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
  data.evolution.forEach((r) => wsEvol.addRow(r));

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf as ArrayBuffer);
}
