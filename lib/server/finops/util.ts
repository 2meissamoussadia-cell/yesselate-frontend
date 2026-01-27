// lib/server/finops/util.ts
// Phase P16: FinOps — helpers

/**
 * Heuristique pour compter les "lignes" dans une réponse dashboard (tableaux imbriqués).
 */
export function inferRowCount(data: unknown): number {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (typeof data !== 'object') return 0;
  const d = data as Record<string, unknown>;
  const a =
    d.data ??
    d.rows ??
    d.items ??
    d.projets ??
    d.demandes ??
    d.monthly ??
    d.trends ??
    d.tableData ??
    d.highlights;
  return Array.isArray(a) ? a.length : 0;
}
