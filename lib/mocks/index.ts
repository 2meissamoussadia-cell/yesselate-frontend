/**
 * Mock Data - Index Central
 * ==========================
 * 
 * Export centralisé de toutes les données mock
 */

// Import des mocks
export * from './projets.mock';
export * from './clients.mock';
export * from './employes.mock';
export * from './blocked.mock';
export * from './comments.mock';
export * from './timeline.mock';
export * from './substitution.mock';

// Réexport pour faciliter l'import
export { mockProjets, mockProjetsStats } from './projets.mock';
export { mockClients, mockClientsStats } from './clients.mock';
export { mockEmployes, mockEmployesStats } from './employes.mock';
export { mockBlockedDossiers, mockBlockedStats } from './blocked.mock';
export { mockComments, mockCommentsByEntity } from './comments.mock';
export { mockTimelineEvents, mockTimelineByEntity } from './timeline.mock';
export { mockSubstitutions, mockSubstitutionStats } from './substitution.mock';

/**
 * Utilitaires pour les mocks
 */

/**
 * Simule un délai réseau
 */
export function mockDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simule une erreur aléatoire (pour tests)
 */
export function mockRandomError(probability: number = 0.1): void {
  if (Math.random() < probability) {
    throw new Error('Erreur simulée pour test');
  }
}

/**
 * Filtre un tableau avec recherche
 */
export function mockSearch<T>(
  items: T[],
  query: string,
  keys: (keyof T)[]
): T[] {
  if (!query.trim()) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return String(value).toLowerCase().includes(lowerQuery);
    })
  );
}

/**
 * Pagine un tableau
 */
export function mockPaginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 20
): { data: T[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } } {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.ceil(items.length / pageSize),
    },
  };
}

/**
 * Tri un tableau
 */
export function mockSort<T>(
  items: T[],
  sortBy: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Génère un ID unique
 */
export function mockGenerateId(prefix: string = 'MOCK'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Clone profond
 */
export function mockDeepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Simule une réponse API
 */
export async function mockApiResponse<T>(
  data: T,
  options?: {
    delay?: number;
    errorProbability?: number;
    errorMessage?: string;
  }
): Promise<T> {
  // Délai réseau
  await mockDelay(options?.delay);

  // Erreur aléatoire
  if (options?.errorProbability) {
    try {
      mockRandomError(options.errorProbability);
    } catch (error) {
      throw new Error(options?.errorMessage || 'Erreur simulée');
    }
  }

  return mockDeepClone(data);
}

/**
 * Mode debug pour les mocks
 */
export const MOCK_DEBUG = process.env.NODE_ENV === 'development';

/**
 * Log pour les mocks (seulement en dev)
 */
export function mockLog(message: string, ...args: any[]): void {
  if (MOCK_DEBUG) {
    console.log(`[MOCK] ${message}`, ...args);
  }
}

