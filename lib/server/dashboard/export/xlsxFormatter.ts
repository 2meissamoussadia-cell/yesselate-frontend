// lib/server/dashboard/export/xlsxFormatter.ts
// Phase P12.b: Formateur XLSX natif avec formatage localisé (exceljs)

// Note: exceljs doit être installé: npm install exceljs
import ExcelJS from 'exceljs';

/**
 * Options pour le formatage XLSX
 */
export interface XlsxFormatOptions {
  locale: string;
  currency: string;
  timezone: string;
  direction: 'ltr' | 'rtl';
}

/**
 * Détermine le format de nombre Excel selon la locale et la devise
 */
function getExcelNumberFormat(locale: string, currency: string, columnName: string): string | undefined {
  const lower = columnName.toLowerCase();
  
  // Colonnes monétaires
  if (lower.includes('ht') || lower.includes('montant') || lower.includes('budget') || 
      lower.includes('prix') || lower.includes('cout') || lower.includes('total')) {
    if (locale.startsWith('fr') && currency === 'XOF') {
      return '# ##0" FCFA"';
    }
    if (locale.startsWith('fr')) {
      return '# ##0,00" €"';
    }
    // Format USD/GBP par défaut
    return '"$"* #,##0.00_-';
  }
  
  // Colonnes de dates
  if (lower.includes('date')) {
    return 'yyyy-mm-dd';
  }
  
  // Colonnes de pourcentages
  if (lower.includes('pourcent') || lower.includes('taux') || lower.includes('ratio')) {
    if (locale.startsWith('fr')) {
      return '0.00%';
    }
    return '0.00%';
  }
  
  return undefined;
}

/**
 * Génère un classeur Excel avec formatage localisé
 * 
 * @param data - Données à exporter
 * @param options - Options de formatage (locale, currency, timezone)
 * @param sheetName - Nom de la feuille (défaut: 'Export')
 * @returns Buffer du fichier XLSX
 */
export async function formatAsXLSX(
  data: any,
  options: XlsxFormatOptions,
  sheetName: string = 'Export'
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ERP BTP';
  wb.created = new Date();
  wb.modified = new Date();
  
  // Créer la feuille principale
  const ws = wb.addWorksheet(sheetName);
  
  // Extraire les lignes (même logique que CSV)
  const rows: any[] = inferRows(data);
  
  if (!rows.length) {
    ws.addRow(['No data']);
    ws.getColumn(1).width = 20;
  } else {
    // Extraire les colonnes
    const cols = Array.from(
      rows.reduce<Set<string>>((acc, r) => {
        Object.keys(r ?? {}).forEach(k => acc.add(k));
        return acc;
      }, new Set())
    );
    
    // En-tête
    ws.addRow(cols);
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };
    headerRow.height = 20;
    
    // Données
    for (const row of rows) {
      const values = cols.map((col) => {
        const value = (row ?? {})[col];
        // Convertir les dates en objets Date pour Excel
        if (value instanceof Date) {
          return value;
        }
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          return new Date(value);
        }
        return value ?? '';
      });
      ws.addRow(values);
    }
    
    // Formatage des colonnes
    cols.forEach((colName, idx) => {
      const col = ws.getColumn(idx + 1);
      
      // Largeur automatique (min 12, max 60)
      col.width = Math.min(60, Math.max(12, (colName?.length ?? 0) + 2));
      
      // Format de nombre selon le type de colonne
      const numFmt = getExcelNumberFormat(options.locale, options.currency, colName);
      if (numFmt) {
        col.numFmt = numFmt;
      }
      
      // Alignement
      const lower = colName.toLowerCase();
      if (lower.includes('date')) {
        col.alignment = { horizontal: 'center' };
      } else if (numFmt) {
        col.alignment = { horizontal: 'right' };
      } else {
        col.alignment = { horizontal: 'left' };
      }
    });
    
    // Freeze header (première ligne)
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    
    // Autofilter
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: cols.length }
    };
  }
  
  // Écrire en mémoire (convertir en Buffer Node si besoin)
  const buf = await wb.xlsx.writeBuffer();
  if (Buffer.isBuffer(buf)) return buf;
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf as ArrayBuffer);
  return Buffer.from(arr);
}

/**
 * Extrait les lignes de données (même logique que CSV)
 */
function inferRows(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.projets)) return data.projets;
  if (Array.isArray(data?.demandes)) return data.demandes;
  if (Array.isArray(data?.monthly)) return data.monthly;
  if (Array.isArray(data?.trends)) return data.trends;
  if (Array.isArray(data?.tableData)) return data.tableData;
  return [data];
}
