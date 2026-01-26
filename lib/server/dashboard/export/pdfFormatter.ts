// lib/server/dashboard/export/pdfFormatter.ts
// Phase P9: Formateur PDF (simplifié, peut être étendu avec pdfkit ou puppeteer)
// Phase P12: Support RTL prévu pour PDF riche (HTML→PDF)
// Phase P12.b: Implémentation PDF riche avec Chromium headless (playwright)

import { chromium, Browser, Page } from 'playwright';
import { renderPdfHtml, PdfTemplateOptions } from './pdfTemplate';

export interface PDFOptions {
  /** Locale pour déterminer la direction RTL/LTR */
  locale: string;
  /** Currency pour formatage */
  currency: string;
  /** Timezone pour dates */
  timezone: string;
  /** Direction du texte (ltr/rtl) */
  direction: 'ltr' | 'rtl';
  /** Orientation de la page */
  orientation?: 'portrait' | 'landscape';
  /** En-tête personnalisé */
  header?: string;
  /** Pied de page personnalisé */
  footer?: string;
  /** Filigrane */
  watermark?: string;
}

/**
 * Génère un PDF riche depuis HTML avec Chromium headless
 * 
 * @param data - Données à exporter
 * @param meta - Métadonnées (main, sub, leaf)
 * @param options - Options de formatage (locale, currency, timezone, direction)
 * @returns Buffer du fichier PDF
 */
export async function formatAsPDF(
  data: any,
  meta: { main?: string; sub?: string | null; leaf?: string | null },
  options: PDFOptions
): Promise<Buffer> {
  // Extraire les lignes
  const rows = inferRows(data);
  const title = `Dashboard Export - ${meta.main}${meta.sub ? `/${meta.sub}` : ''}${meta.leaf ? `/${meta.leaf}` : ''}`;
  
  // Générer le HTML
  const html = renderPdfHtml({
    title,
    rows,
    locale: options.locale,
    currency: options.currency,
    timezone: options.timezone,
    direction: options.direction,
    orientation: options.orientation,
    header: options.header,
    footer: options.footer,
    watermark: options.watermark,
  });
  
  // Lancer Chromium headless
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  
  let page: Page | null = null;
  
  try {
    page = await browser.newPage();
    
    // Définir le contenu HTML
    await page.setContent(html, {
      waitUntil: 'networkidle',
      timeout: 30_000, // 30s timeout pour le chargement
    });
    
    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '14mm',
        right: '14mm',
        bottom: '14mm',
        left: '14mm',
      },
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) await page.close();
    await browser.close();
  }
}

/**
 * Extrait les lignes de données (même logique que CSV/XLSX)
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

/**
 * Phase P12: Notes pour PDF riche (HTML→PDF)
 * 
 * Quand on implémentera le PDF riche (via Chromium headless / puppeteer):
 * 
 * 1. Fonts compatibles RTL:
 *    - NotoSansArabic pour l'arabe
 *    - NotoSansCJK pour chinois/japonais/coréen si besoin
 *    - Précharger les fonts dans le template HTML
 * 
 * 2. Direction RTL:
 *    - Appliquer dir="rtl" dans les gabarits HTML→PDF
 *    - Utiliser CSS: direction: rtl; text-align: right;
 *    - Inverser les marges (margin-left ↔ margin-right)
 * 
 * 3. Exemple avec puppeteer:
 *    ```typescript
 *    const browser = await puppeteer.launch({
 *      args: ['--font-render-hinting=none']
 *    });
 *    const page = await browser.newPage();
 *    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
 *    const pdf = await page.pdf({
 *      format: 'A4',
 *      printBackground: true,
 *      preferCSSPageSize: true,
 *    });
 *    ```
 * 
 * 4. Template HTML avec RTL:
 *    ```html
 *    <html dir="${options.direction || 'ltr'}" lang="${options.locale || 'fr-FR'}">
 *      <head>
 *        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
 *        <style>
 *          body { direction: ${options.direction || 'ltr'}; font-family: 'Noto Sans Arabic', sans-serif; }
 *        </style>
 *      </head>
 *      <body>...</body>
 *    </html>
 *    ```
 */
