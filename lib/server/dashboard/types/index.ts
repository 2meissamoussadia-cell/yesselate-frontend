// lib/server/dashboard/types/index.ts
// Phase P11: Exports centralisés pour les types dashboard

export type {
  PaginationOptions,
  PaginatedResponse,
} from './pagination';

export {
  parsePaginationParams,
  getOffset,
  createPaginatedResponse,
} from './pagination';
