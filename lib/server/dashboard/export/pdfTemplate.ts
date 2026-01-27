// lib/server/dashboard/export/pdfTemplate.ts
// Phase P12.b: Template HTML pour PDF riche avec support RTL/CJK

/**
 * Options pour le template PDF
 */
export interface PdfTemplateOptions {
  title: string;
  rows: any[];
  locale: string;
  currency: string;
  timezone: string;
  direction: 'ltr' | 'rtl';
  /** Orientation de la page (portrait ou landscape) */
  orientation?: 'portrait' | 'landscape';
  /** En-tête personnalisé (optionnel) */
  header?: string;
  /** Pied de page personnalisé (optionnel) */
  footer?: string;
  /** Filigrane (ex: "CONFIDENTIEL") */
  watermark?: string;
}

/**
 * Génère le HTML pour le PDF avec support RTL/CJK
 */
export function renderPdfHtml(options: PdfTemplateOptions): string {
  const {
    title,
    rows,
    locale,
    direction,
    orientation = 'portrait',
    header,
    footer,
    watermark,
  } = options;

  // Extraire les colonnes depuis la première ligne
  const columns = rows.length > 0 ? Object.keys(rows[0] ?? {}) : [];

  // Construire le contenu du footer (avec support des compteurs CSS)
  const footerContent = footer 
    ? `"${footer.replace(/"/g, '\\"')}"`
    : '"Page " counter(page) " / " counter(pages)';

  // CSS avec support RTL et polices
  const css = `
    <style>
      @page {
        size: A4 ${orientation};
        margin: 14mm;
        @top-center {
          content: "${header || ''}";
          font-size: 10px;
          color: #64748b;
        }
        @bottom-center {
          content: ${footerContent};
          font-size: 10px;
          color: #64748b;
        }
      }
      
      /* Polices RTL/CJK */
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap');
      
      body {
        font-family: ${direction === 'rtl' 
          ? "'Noto Sans Arabic', system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          : "system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans SC', Helvetica, Arial, sans-serif"
        };
        color: #0f172a;
        direction: ${direction};
        margin: 0;
        padding: 0;
      }
      
      /* Filigrane */
      ${watermark ? `
      body::before {
        content: "${watermark}";
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 72px;
        color: rgba(0, 0, 0, 0.05);
        z-index: -1;
        font-weight: bold;
        pointer-events: none;
      }
      ` : ''}
      
      h1 {
        font-size: 18px;
        margin: 0 0 12px;
        font-weight: 700;
        color: #1e293b;
        text-align: ${direction === 'rtl' ? 'right' : 'left'};
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
        font-size: 11px;
      }
      
      th, td {
        border: 1px solid #cbd5e1;
        padding: 6px 8px;
        text-align: ${direction === 'rtl' ? 'right' : 'left'};
      }
      
      th {
        background: #e2e8f0;
        font-weight: 600;
        color: #1e293b;
      }
      
      tr:nth-child(even) {
        background: #f8fafc;
      }
      
      /* Alignement des nombres à droite */
      td[data-type="number"],
      td[data-type="currency"],
      td[data-type="percent"] {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      
      /* Alignement des dates au centre */
      td[data-type="date"] {
        text-align: center;
      }
    </style>
  `;

  const head = `
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    ${css}
  `;

  // Générer le tableau
  let tableHtml = '';
  if (rows.length === 0) {
    tableHtml = '<p>Aucune donnée</p>';
  } else {
    const headerRow = columns.map((col) => `<th>${escapeHtml(String(col))}</th>`).join('');
    const bodyRows = rows.map((row) => {
      const cells = columns.map((col) => {
        const value = row[col];
        const cellType = inferCellType(col, value);
        return `<td data-type="${cellType}">${formatCellValue(value, cellType, options.locale, options.currency, options.timezone)}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    
    tableHtml = `
      <table>
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    `;
  }

  return `<!doctype html>
<html lang="${locale}" dir="${direction}">
  <head>${head}</head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    ${tableHtml}
  </body>
</html>`;
}

/**
 * Échappe le HTML pour éviter les injections
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Infère le type de cellule pour le formatage
 */
function inferCellType(columnName: string, value: any): 'text' | 'number' | 'currency' | 'date' | 'percent' {
  const lower = columnName.toLowerCase();
  
  if (lower.includes('date')) return 'date';
  if (lower.includes('pourcent') || lower.includes('taux') || lower.includes('ratio')) return 'percent';
  if (lower.includes('ht') || lower.includes('montant') || lower.includes('budget') || 
      lower.includes('prix') || lower.includes('cout') || lower.includes('total')) return 'currency';
  if (typeof value === 'number') return 'number';
  
  return 'text';
}

/**
 * Formate la valeur d'une cellule selon son type et la locale
 */
function formatCellValue(
  value: any,
  type: 'text' | 'number' | 'currency' | 'date' | 'percent',
  locale: string,
  currency: string,
  timezone: string
): string {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'date':
      if (value instanceof Date) {
        return new Intl.DateTimeFormat(locale, { timeZone: timezone, dateStyle: 'short' }).format(value);
      }
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return new Intl.DateTimeFormat(locale, { timeZone: timezone, dateStyle: 'short' }).format(new Date(value));
      }
      return escapeHtml(String(value));
    
    case 'percent':
      if (typeof value === 'number') {
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(value);
      }
      return escapeHtml(String(value));
    
    case 'currency':
      if (typeof value === 'number') {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: currency === 'XOF' ? 0 : 2,
          maximumFractionDigits: currency === 'XOF' ? 0 : 2,
        }).format(value);
      }
      return escapeHtml(String(value));
    
    case 'number':
      if (typeof value === 'number') {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
      }
      return escapeHtml(String(value));
    
    default:
      return escapeHtml(String(value));
  }
}
