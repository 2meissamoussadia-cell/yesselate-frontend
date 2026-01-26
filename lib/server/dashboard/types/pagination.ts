// lib/server/dashboard/types/pagination.ts
// Phase P11: Types et helpers pour la pagination

/**
 * Options de pagination pour les requêtes
 */
export interface PaginationOptions {
  page: number;  // Numéro de page (commence à 1)
  limit: number;  // Nombre d'éléments par page
}

/**
 * Réponse paginée standardisée
 * 
 * @template T - Type des items dans la liste
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Parse et valide les paramètres de pagination depuis l'URL
 * 
 * @param url - URL de la requête
 * @returns Options de pagination validées
 */
export function parsePaginationParams(url: URL): PaginationOptions {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const limit = Math.min(500, Math.max(50, Number(url.searchParams.get('limit') ?? 100)));
  
  return { page, limit };
}

/**
 * Calcule l'offset SQL depuis les options de pagination
 * 
 * @param options - Options de pagination
 * @returns Offset pour la clause OFFSET
 */
export function getOffset(options: PaginationOptions): number {
  return (options.page - 1) * options.limit;
}

/**
 * Crée une réponse paginée depuis les résultats
 * 
 * @param items - Items de la page courante
 * @param total - Nombre total d'items
 * @param options - Options de pagination
 * @returns Réponse paginée standardisée
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  options: PaginationOptions
): PaginatedResponse<T> {
  return {
    items,
    page: options.page,
    limit: options.limit,
    total,
    hasMore: options.page * options.limit < total,
  };
}
