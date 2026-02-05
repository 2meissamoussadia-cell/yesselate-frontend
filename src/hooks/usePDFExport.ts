// ============================================
// Hook pour exporter en PDF
// ============================================

import { useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/utils/logger';

interface PDFExportOptions {
  title: string;
  content: string | HTMLElement;
  filename?: string;
}

/**
 * Hook pour exporter du contenu en PDF
 * Utilise html2canvas et jsPDF (déjà dans les dépendances)
 */
export function usePDFExport() {
  const exportToPDF = useCallback(async ({ title, content, filename }: PDFExportOptions) => {
    try {
      // Lazy load des dépendances
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      let element: HTMLElement | null = null;

      if (typeof content === 'string') {
        // Sanitizer le HTML pour éviter XSS si le contenu provient d'une source utilisateur
        const sanitized = DOMPurify.sanitize(content, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3'],
          ALLOWED_ATTR: ['class', 'style'],
        });
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitized;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        document.body.appendChild(tempDiv);
        element = tempDiv;
      } else {
        element = content;
      }

      if (!element) {
        throw new Error('Impossible de trouver l\'élément à exporter');
      }

      // Générer le canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Créer le PDF (jsPDF 4.x : default = constructeur)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(16);
      pdf.text(title, 10, 10);
      
      pdf.addImage(imgData, 'PNG', 0, 15, imgWidth, imgHeight);

      // Nettoyer l'élément temporaire si créé
      if (typeof content === 'string' && element.parentNode) {
        element.parentNode.removeChild(element);
      }

      // Télécharger le PDF
      const finalFilename = filename || `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(finalFilename);

      return { success: true };
    } catch (error) {
      logger.error('Erreur lors de l\'export PDF', error instanceof Error ? error : undefined, { component: 'usePDFExport' });
      throw error;
    }
  }, []);

  return { exportToPDF };
}

