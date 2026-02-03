/**
 * Export des graphiques en PNG / SVG (Phase 2 #7)
 * Utilisé par ChartContainer pour le téléchargement d'image.
 */

import html2canvas from 'html2canvas';

function downloadBlob(blob: Blob, filename: string, mimeType: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporte le premier SVG trouvé dans l'élément en fichier .svg
 */
export function exportChartAsSvg(container: HTMLElement, filename: string): void {
  const svg = container.querySelector('svg');
  if (!svg) return;
  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const svgString = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const name = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  downloadBlob(blob, name, 'image/svg+xml');
}

/**
 * Exporte l'élément en image PNG via html2canvas
 */
export async function exportChartAsPng(container: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: null,
  });
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const name = filename.endsWith('.png') ? filename : `${filename}.png`;
      downloadBlob(blob, name, 'image/png');
    },
    'image/png',
    1
  );
}
