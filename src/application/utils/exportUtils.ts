/**
 * Export Utilities
 * Utilitaires pour exporter des données (CSV, JSON, Excel)
 */

import { formatDate, formatCurrency, formatNumber } from './formatUtils';

/**
 * Exporte des données en CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export',
  options?: {
    headers?: string[];
    excludeKeys?: (keyof T)[];
    formatters?: Partial<Record<keyof T, (value: any) => string>>;
  }
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { headers, excludeKeys = [], formatters = {} as Partial<Record<keyof T, (value: any) => string>> } = options || {};
  
  // Déterminer les colonnes
  const keys = Object.keys(data[0]) as (keyof T)[];
  const columns = keys.filter(key => !excludeKeys.includes(key));
  
  // Créer les en-têtes
  const csvHeaders = headers || columns.map(key => String(key));
  
  // Créer les lignes
  const rows = data.map(row => {
    return columns.map(key => {
      const value = row[key];
      const formatter = formatters[key];
      
      if (formatter && typeof formatter === 'function') {
        return formatter(value);
      }
      
      // Formatage par défaut
      if (value == null) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  });

  // Combiner en CSV
  const csvContent = [
    csvHeaders.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Télécharger
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporte des données en JSON
 */
export function exportToJSON<T>(
  data: T,
  filename: string = 'export',
  pretty: boolean = true
): void {
  const jsonContent = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Exporte un tableau en Excel (format CSV avec extension .xlsx)
 * Note: Pour un vrai Excel, utiliser une bibliothèque comme xlsx
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export',
  options?: {
    sheetName?: string;
    headers?: string[];
    excludeKeys?: (keyof T)[];
  }
): void {
  // Pour l'instant, on exporte en CSV avec extension .xlsx
  // Pour un vrai Excel, il faudrait utiliser une bibliothèque comme 'xlsx'
  exportToCSV(data, filename, options);
  
  // TODO: Implémenter avec xlsx si nécessaire
  // import * as XLSX from 'xlsx';
  // const ws = XLSX.utils.json_to_sheet(data);
  // const wb = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Sheet1');
  // XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Télécharge un fichier
 */
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exporte un tableau HTML en PDF
 * Note: Nécessite html2canvas et jspdf
 */
export async function exportTableToPDF(
  tableElement: HTMLElement,
  filename: string = 'export',
  options?: {
    title?: string;
    orientation?: 'portrait' | 'landscape';
  }
): Promise<void> {
  try {
    // Vérifier si les dépendances sont disponibles
    if (typeof window === 'undefined') {
      throw new Error('PDF export is only available in browser');
    }

    // Dynamiquement importer les dépendances
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Convertir le tableau en image
    const canvas = await html2canvas(tableElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: options?.orientation || 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Ajouter un titre si fourni
    if (options?.title) {
      pdf.setFontSize(16);
      pdf.text(options.title, 14, 20);
    }

    // Calculer les dimensions
    const imgWidth = 190; // A4 width - margins
    const pageHeight = 295; // A4 height
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = options?.title ? 30 : 20;

    // Ajouter la première page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position - 10;

    // Ajouter des pages supplémentaires si nécessaire
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF. Make sure html2canvas and jspdf are installed.');
  }
}

/**
 * Exporte des données avec formatage personnalisé
 */
export function exportData<T extends Record<string, any>>(
  data: T[],
  format: 'csv' | 'json' | 'excel',
  filename: string = 'export',
  options?: {
    headers?: string[];
    excludeKeys?: (keyof T)[];
    formatters?: Partial<Record<keyof T, (value: any) => string>>;
  }
): void {
  switch (format) {
    case 'csv':
      exportToCSV(data, filename, options);
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Formatters prédéfinis pour les exports
 */
export const exportFormatters = {
  date: (value: string | Date | null) => formatDate(value, 'dd/MM/yyyy'),
  datetime: (value: string | Date | null) => formatDate(value, 'dd/MM/yyyy HH:mm'),
  currency: (value: number | null) => formatCurrency(value),
  number: (value: number | null, decimals: number = 0) => formatNumber(value, decimals),
  percent: (value: number | null) => `${formatNumber(value, 1)}%`,
  boolean: (value: boolean | null) => value ? 'Oui' : 'Non',
};

