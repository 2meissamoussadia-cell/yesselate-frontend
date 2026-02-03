/**
 * ExportManager — Export PDF, CSV, JSON pour modules BMO
 * Utilise downloadBlob et toCsv existants
 */

import { downloadBlob, toCsv } from '@/lib/utils/export';

export type ExportFormat = 'pdf' | 'csv' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
}

export interface AlerteExportRow {
  numero?: string;
  titre?: string;
  description?: string;
  chantier?: string;
  niveau?: string;
  statut?: string;
  emetteur?: string;
  dateCreation?: string;
  echeance?: string;
}

export class ExportManager {
  static async exportAlertes(
    alertes: AlerteExportRow[],
    options: ExportOptions
  ): Promise<void> {
    const baseName = options.filename ?? `alertes_${Date.now()}`;

    switch (options.format) {
      case 'pdf':
        await this.exportToPDF(alertes, baseName);
        break;
      case 'csv':
        this.exportToCSV(alertes, baseName, options.includeMetadata);
        break;
      case 'json':
        this.exportToJSON(alertes, baseName, options.includeMetadata);
        break;
    }
  }

  private static async exportToPDF(
    alertes: AlerteExportRow[],
    filename: string
  ): Promise<void> {
    const { default: JsPDF } = await import('jspdf');
    const doc = new JsPDF();
    doc.setFontSize(16);
    doc.text('YESSALATE BTP - Rapport Alertes', 14, 20);
    doc.setFontSize(10);
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 28);
    doc.text(`Nombre : ${alertes.length}`, 14, 34);

    const headers = ['#', 'Titre', 'Chantier', 'Niveau', 'Statut', 'Date'];
    const rows = alertes.map((a, i) => [
      String(i + 1),
      (a.titre ?? '').slice(0, 30),
      (a.chantier ?? '-').slice(0, 20),
      a.niveau ?? '-',
      a.statut ?? '-',
      a.dateCreation ?? '-',
    ]);

    let y = 44;
    doc.setFontSize(8);
    doc.text(headers.join(' | '), 14, y);
    y += 6;
    for (const row of rows) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(row.join(' | '), 14, y);
      y += 5;
    }

    doc.save(`${filename}.pdf`);
  }

  private static exportToCSV(
    alertes: AlerteExportRow[],
    filename: string,
    _includeMetadata = true
  ): void {
    const rows = alertes.map((a) => ({
      Numéro: a.numero ?? '',
      Titre: a.titre ?? '',
      Chantier: a.chantier ?? '',
      Niveau: a.niveau ?? '',
      Statut: a.statut ?? '',
      Émetteur: a.emetteur ?? '',
      'Date création': a.dateCreation ?? '',
      Échéance: a.echeance ?? '',
    }));

    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
  }

  private static exportToJSON(
    alertes: AlerteExportRow[],
    filename: string,
    includeMetadata = true
  ): void {
    const payload = includeMetadata
      ? {
          metadata: {
            exportDate: new Date().toISOString(),
            count: alertes.length,
            module: "Centre d'alertes BMO",
          },
          data: alertes,
        }
      : alertes;

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
  }

  static async importFromJSON<T = unknown>(file: File): Promise<T[]> {
    const text = await file.text();
    const parsed = JSON.parse(text) as T[] | { data: T[] };
    return Array.isArray(parsed) ? parsed : (parsed as { data: T[] }).data ?? [];
  }

  static async importFromCSV(file: File): Promise<Record<string, string>[]> {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    const delimiter = text.includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map((h) => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter);
      const row: Record<string, string> = {};
      headers.forEach((h, j) => {
        row[h] = values[j]?.trim().replace(/^"|"$/g, '') ?? '';
      });
      rows.push(row);
    }
    return rows;
  }
}
