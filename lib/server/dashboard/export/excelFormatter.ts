// lib/server/dashboard/export/excelFormatter.ts
// Phase P9: Formateur Excel (XLSX)

export async function formatAsExcel(
  data: any,
  meta: { main?: string; sub?: string | null; leaf?: string | null }
): Promise<Buffer> {
  // Pour l'instant, retourner un CSV comme Excel (compatible)
  // TODO: Installer xlsx et implémenter le vrai format Excel
  const { formatAsCSV } = await import('./csvFormatter');
  const csv = formatAsCSV(data);
  return Buffer.from(csv, 'utf-8');
}
