/**
 * Utilitaires pour normaliser les données de gouvernance
 * Gère les différents formats de réponse API (tableau direct, PaginatedResponse, objet avec propriété data, etc.)
 */

/**
 * Normalise les données pour garantir qu'on obtient toujours un tableau
 * Gère les cas suivants :
 * - Tableau direct
 * - PaginatedResponse<T> (avec propriété data)
 * - Objet avec propriété data, tendances, results, etc.
 * - null/undefined
 */
export function normalizeToArray<T>(data: unknown): T[] {
  if (!data) return [];
  
  // Si c'est déjà un tableau, le retourner
  if (Array.isArray(data)) {
    return data as T[];
  }
  
  // Si c'est un objet, chercher différentes propriétés possibles
  if (typeof data === 'object' && data !== null) {
    // Cas 1: PaginatedResponse ou objet avec propriété data
    if ('data' in data && Array.isArray(data.data)) {
      return data.data as T[];
    }
    
    // Cas 2: Objet avec propriété tendances
    if ('tendances' in data && Array.isArray(data.tendances)) {
      return data.tendances as T[];
    }
    
    // Cas 3: Objet avec propriété results
    if ('results' in data && Array.isArray(data.results)) {
      return data.results as T[];
    }
    
    // Cas 4: Objet avec propriété items
    if ('items' in data && Array.isArray(data.items)) {
      return data.items as T[];
    }
  }
  
  // Sinon, retourner un tableau vide
  return [];
}
