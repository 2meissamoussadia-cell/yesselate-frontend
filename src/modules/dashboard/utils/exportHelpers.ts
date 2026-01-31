/**
 * Helpers partagés pour l'export dashboard (Phase P9).
 * safeCell et sanitizeFilename sont testables et réutilisables.
 */

/** Sanitise un nom de fichier (caractères autorisés, longueur max 120). */
export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]+/g, '_').slice(0, 120);
}

/** Échappe une cellule pour CSV (anti-injection =+-@, guillemets). */
export function safeCell(v: unknown): string {
  let s = v == null ? '' : String(v);
  if (/^[=\-+@]/.test(s)) s = `'${s}`;
  s = s.replace(/"/g, '""');
  return `"${s}"`;
}
