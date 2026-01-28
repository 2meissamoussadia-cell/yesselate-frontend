/**
 * Utilitaires d'export pour le Dashboard
 * Export CSV et JSON
 */

/**
 * Échappe une valeur pour CSV
 */
function escapeCSV(value: any): string {
  if (value == null) return '';
  const stringValue = String(value);
  // Si contient virgule, guillemets ou saut de ligne, entourer de guillemets
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Exporte des données en CSV
 */
export function exportToCSV(
  rows: (string | number)[][],
  headers: string[],
  filename: string
): void {
  const csvRows = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ];
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporte des données en JSON
 */
export function exportToJSON(
  data: any,
  filename: string
): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
