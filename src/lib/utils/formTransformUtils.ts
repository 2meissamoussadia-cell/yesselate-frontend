/**
 * Utilitaires génériques de transformation de formulaires
 * =======================================================
 * 
 * Helpers réutilisables pour la transformation de données
 * entre les formats Row (liste) et FormData (formulaire).
 */

/**
 * Crée une valeur par défaut si undefined/null
 */
export function withDefault<T>(value: T | undefined | null, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * Crée un objet avec des valeurs par défaut
 */
export function withDefaults<T extends Record<string, unknown>>(
  obj: Partial<T>,
  defaults: T
): T {
  return { ...defaults, ...obj } as T;
}

/**
 * Transforme un objet en ne gardant que les propriétés définies
 */
export function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
}

/**
 * Transforme une date en string ISO ou format français
 */
export function formatDateValue(date: Date | string | undefined, format: 'iso' | 'fr' = 'iso'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  if (format === 'fr') {
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  return d.toISOString().split('T')[0];
}

/**
 * Parse une chaîne en nombre avec valeur par défaut
 */
export function parseNumber(value: string | number | undefined, defaultValue: number = 0): number {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Type helper pour les fonctions de transformation Row ↔ FormData
 */
export type FormTransformer<TRow, TForm> = {
  rowToFormData: (row: TRow) => TForm;
  formDataToRow: (form: TForm, id?: string) => TRow;
};

/**
 * Crée un transformateur typé Row ↔ FormData
 */
export function createFormTransformer<TRow, TForm>(
  rowToFormData: (row: TRow) => TForm,
  formDataToRow: (form: TForm, id?: string) => TRow
): FormTransformer<TRow, TForm> {
  return { rowToFormData, formDataToRow };
}

/**
 * Transforme un tableau de rows en tableau de formData
 */
export function transformRows<TRow, TForm>(
  rows: TRow[],
  transformer: (row: TRow) => TForm
): TForm[] {
  return rows.map(transformer);
}

/**
 * Valide qu'un objet a toutes les propriétés requises
 */
export function validateRequired<T extends Record<string, unknown>>(
  obj: Partial<T>,
  requiredKeys: (keyof T)[]
): { valid: boolean; missing: (keyof T)[] } {
  const missing = requiredKeys.filter(
    (key) => obj[key] === undefined || obj[key] === null || obj[key] === ''
  );
  return { valid: missing.length === 0, missing };
}
