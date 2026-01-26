// lib/server/dashboard/export/csvFormatter.ts
// Phase P9: Formateur CSV avec support streaming
// Phase P12: Support séparateurs localisés (; pour fr-FR, , pour en-GB)

/**
 * Détermine le séparateur CSV selon la locale
 * 
 * @param locale - Locale (ex: 'fr-FR', 'en-GB')
 * @returns Séparateur CSV (';' pour fr-FR, ',' pour les autres)
 */
export function getCsvSeparator(locale: string): string {
  // Français utilise le point-virgule
  if (locale.startsWith('fr')) {
    return ';';
  }
  // Autres locales utilisent la virgule
  return ',';
}

/**
 * Formate les données en CSV avec séparateur localisé
 * 
 * @param data - Données à formater
 * @param locale - Locale pour déterminer le séparateur (défaut: 'fr-FR')
 * @returns CSV formaté
 */
export function formatAsCSV(data: any, locale: string = 'fr-FR'): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  const separator = getCsvSeparator(locale);

  // Si c'est un tableau, exporter directement
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => escapeCSVValue(row[h], separator)));
    return [headers.join(separator), ...rows.map((r) => r.join(separator))].join('\n');
  }

  // Si c'est un objet, le convertir en tableau à plat
  const rows: string[][] = [];
  const flatten = (obj: any, prefix = ''): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(result, flatten(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  const flat = flatten(data);
  const headers = Object.keys(flat);
  const values = headers.map((h) => escapeCSVValue(flat[h], separator));
  return [headers.join(separator), values.join(separator)].join('\n');
}

/**
 * Échappe une valeur CSV selon le séparateur utilisé
 * 
 * @param value - Valeur à échapper
 * @param separator - Séparateur CSV (',' ou ';')
 * @returns Valeur échappée
 */
function escapeCSVValue(value: any, separator: string = ','): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Échapper si contient le séparateur, des guillemets ou des retours à la ligne
  if (str.includes(separator) || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
