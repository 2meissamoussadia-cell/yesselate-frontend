// ============================================
// Fonctions d'export CSV avec traçabilité BMO
// ============================================

import type { Facture } from '@/lib/types/bmo.types';

/**
 * Exporte les factures au format CSV avec toutes les informations de traçabilité BMO
 * 
 * @param factures - Liste des factures à exporter
 * @param addToast - Fonction pour afficher une notification (optionnel)
 * 
 * @example
 * ```tsx
 * import { exportFacturesAsCSV } from '@/lib/utils/export';
 * 
 * const handleExport = () => {
 *   exportFacturesAsCSV(factures, addToast);
 * };
 * ```
 */
export const exportFacturesAsCSV = (
  factures: Facture[],
  addToast?: (msg: string, variant?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'ID Facture',
    'Fournisseur',
    'Chantier',
    'Montant TTC (FCFA)',
    'Statut',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Commentaire BMO',
  ];

  const rows = factures.map(f => [
    f.id,
    f.fournisseur,
    f.chantier,
    f.montantTTC.toString(),
    f.statut,
    f.decisionBMO?.origin || 'Hors périmètre BMO',
    f.decisionBMO?.decisionId || '',
    f.decisionBMO?.validatorRole || '',
    f.decisionBMO?.hash || '',
    `"${f.decisionBMO?.comment || f.commentaire || ''}"`,
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `factures_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  if (addToast) {
    addToast('✅ Export factures généré (traçabilité BMO incluse)', 'success');
  }
};



// ============================================
// Helpers génériques (réutilisables dans Analytics, etc.)
// ============================================

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: unknown, delimiter: string) {
  const s = String(value ?? '');
  const needsQuotes = s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(delimiter);
  const cleaned = s.replace(/"/g, '""');
  return needsQuotes ? `"${cleaned}"` : cleaned;
}

export function toCsv(
  rows: Array<Record<string, unknown>>,
  opts?: { delimiter?: string; withBom?: boolean }
) {
  const delimiter = opts?.delimiter ?? ';';
  const withBom = opts?.withBom ?? true;
  const cols = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r ?? {}).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );

  const header = cols.map((c) => escapeCsvCell(c, delimiter)).join(delimiter);
  const body = rows
    .map((r) => cols.map((c) => escapeCsvCell((r as any)?.[c], delimiter)).join(delimiter))
    .join('\n');

  const content = `${header}\n${body}`;
  return (withBom ? '\uFEFF' : '') + content;
}

export function exportJsonFile(data: unknown, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * Exporte des données génériques en CSV.
 * Utilisé par les pages Gouvernance et autres modules.
 */
export function exportDataAsCSV(
  rows: Array<Record<string, unknown>>,
  filename: string,
  addToast?: (msg: string, variant?: 'success' | 'warning' | 'info' | 'error') => void
) {
  if (rows.length === 0) {
    addToast?.('Aucune donnée à exporter', 'warning');
    return;
  }
  const csvContent = toCsv(rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  addToast?.(`Export ${filename} généré`, 'success');
}

export async function exportElementAsPdf(
  element: HTMLElement,
  filename: string,
  opts?: { background?: string; scale?: number }
) {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const scale = Math.max(1, Math.min(3, opts?.scale ?? 2));
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: opts?.background ?? null,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

