// lib/server/dashboard/export/csvFormatter.ts
// Phase P9: Formateur CSV avec support streaming

export function formatAsCSV(data: any): string {
  if (!data || typeof data !== 'object') {
    return '';
  }

  // Si c'est un tableau, exporter directement
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => escapeCSVValue(row[h])));
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
  const values = headers.map((h) => escapeCSVValue(flat[h]));
  return [headers.join(','), values.join(',')].join('\n');
}

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
