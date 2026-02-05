/**
 * OPTIMISATION PRISMA
 * 
 * Helpers pour améliorer les performances des queries :
 * - Query batching
 * - DataLoader pattern
 * - Pagination cursor-based
 * - Select fields optimisé
 * - Soft delete
 * - Bulk operations
 */

import { Prisma, PrismaClient } from '@prisma/client';
import { monitoring } from './monitoringService';

// ============================================
// TYPES
// ============================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

// ============================================
// DATALOADER PATTERN
// ============================================

/**
 * DataLoader simple pour batching de queries
 */
export class DataLoader<K, V> {
  private cache = new Map<K, V>();
  private queue: Array<{
    key: K;
    resolve: (value: V) => void;
    reject: (error: any) => void;
  }> = [];
  private batchScheduled = false;

  constructor(
    private batchLoadFn: (keys: K[]) => Promise<V[]>,
    private options?: {
      cache?: boolean;
      batchDelay?: number;
    }
  ) {}

  async load(key: K): Promise<V> {
    // Vérifier cache
    if (this.options?.cache && this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Ajouter à la queue
    return new Promise<V>((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      // Planifier batch
      if (!this.batchScheduled) {
        this.batchScheduled = true;
        setTimeout(
          () => this.processBatch(),
          this.options?.batchDelay || 10
        );
      }
    });
  }

  private async processBatch(): Promise<void> {
    const batch = this.queue.splice(0);
    this.batchScheduled = false;

    if (batch.length === 0) return;

    try {
      const keys = batch.map(item => item.key);
      const results = await this.batchLoadFn(keys);

      // Résoudre les promises
      batch.forEach((item, index) => {
        const result = results[index];
        
        if (this.options?.cache) {
          this.cache.set(item.key, result);
        }

        item.resolve(result);
      });
    } catch (error) {
      // Rejeter toutes les promises
      batch.forEach(item => item.reject(error));
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// ============================================
// PAGINATION HELPERS
// ============================================

/**
 * Pagination offset-based (simple)
 */
export async function paginateOffsetBased<T>(
  model: any,
  where: any,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 20, 100);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: options.orderBy || { createdAt: 'desc' },
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Pagination cursor-based (performante pour grands datasets)
 */
export async function paginateCursorBased<T extends { id: string }>(
  model: any,
  where: any,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const limit = Math.min(options.limit || 20, 100);
  const cursor = options.cursor;

  // Query avec cursor
  const data = await model.findMany({
    where,
    take: limit + 1, // +1 pour détecter hasNext
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: options.orderBy || { createdAt: 'desc' },
  });

  const hasNext = data.length > limit;
  if (hasNext) data.pop(); // Retirer l'élément extra

  const nextCursor = hasNext && data.length > 0 ? data[data.length - 1].id : undefined;

  // Note: cursor-based ne peut pas facilement calculer le total
  // sans une query COUNT séparée (ce qui annule le bénéfice)
  return {
    data,
    pagination: {
      total: -1, // Non disponible en cursor-based
      page: -1,
      limit,
      totalPages: -1,
      hasNext,
      hasPrev: !!cursor,
      nextCursor,
    },
  };
}

// ============================================
// SELECT OPTIMISÉ
// ============================================

/**
 * Select minimal pour performance
 */
export const minimalSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Exclure des champs (utile pour éviter des blobs)
 */
export function excludeFields<T, K extends keyof T>(
  data: T,
  fields: K[]
): Omit<T, K> {
  const result = { ...data };
  fields.forEach(field => delete result[field]);
  return result;
}

// ============================================
// SOFT DELETE
// ============================================

/**
 * Middleware Prisma pour soft delete
 */
export function createSoftDeleteMiddleware() {
  return async (params: any, next: any) => {
    // Intercepter delete et transformer en update
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      params.args.data = { deletedAt: new Date() };
    }

    // Ajouter filter deletedAt: null sur findMany
    if (params.action === 'findMany' || params.action === 'findFirst') {
      if (!params.args.where) {
        params.args.where = {};
      }
      
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }

    return next(params);
  };
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk insert optimisé
 */
export async function bulkInsert<T>(
  model: any,
  data: T[],
  batchSize: number = 100
): Promise<BulkOperationResult> {
  let success = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  // Découper en batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    try {
      await model.createMany({
        data: batch,
        skipDuplicates: true,
      });

      success += batch.length;
    } catch (error: any) {
      failed += batch.length;
      errors.push({
        id: `batch-${i / batchSize}`,
        error: error.message,
      });
    }
  }

  return { success, failed, errors };
}

/**
 * Bulk update optimisé
 */
export async function bulkUpdate<T extends { id: string }>(
  model: any,
  updates: Array<{ id: string; data: Partial<T> }>
): Promise<BulkOperationResult> {
  let success = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  // Exécuter en parallèle (max 10 à la fois)
  const chunks = chunkArray(updates, 10);

  for (const chunk of chunks) {
    const promises = chunk.map(async ({ id, data }) => {
      try {
        await model.update({
          where: { id },
          data,
        });
        success++;
      } catch (error: any) {
        failed++;
        errors.push({ id, error: error.message });
      }
    });

    await Promise.all(promises);
  }

  return { success, failed, errors };
}

/**
 * Bulk delete optimisé
 */
export async function bulkDelete(
  model: any,
  ids: string[]
): Promise<BulkOperationResult> {
  try {
    const result = await model.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return {
      success: result.count,
      failed: ids.length - result.count,
      errors: [],
    };
  } catch (error: any) {
    return {
      success: 0,
      failed: ids.length,
      errors: [{ id: 'bulk', error: error.message }],
    };
  }
}

// ============================================
// QUERY OPTIMIZATION
// ============================================

/**
 * Eager loading optimisé avec select
 */
export function buildInclude<T>(fields: string[]): any {
  const include: any = {};

  fields.forEach(field => {
    if (field.includes('.')) {
      // Nested relation: user.profile
      const [parent, child] = field.split('.');
      if (!include[parent]) {
        include[parent] = { select: {} };
      }
      include[parent].select[child] = true;
    } else {
      include[field] = true;
    }
  });

  return include;
}

/**
 * Compter rapidement (approximation)
 */
export async function approximateCount(
  model: any,
  tableName: string
): Promise<number> {
  // En production, utiliser query SQL directe pour statistiques table
  // SELECT reltuples::bigint FROM pg_class WHERE relname = 'table_name';
  
  // Fallback: count normal
  return model.count();
}

/**
 * Exists check optimisé
 */
export async function exists(
  model: any,
  where: any
): Promise<boolean> {
  const result = await model.findFirst({
    where,
    select: { id: true },
  });

  return result !== null;
}

// ============================================
// TRANSACTION HELPERS
// ============================================

/**
 * Retry transaction avec backoff
 */
export async function retryTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: any) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn);
    } catch (error: any) {
      lastError = error;
      
      // Ne retry que pour deadlocks/serialization errors
      if (!error.code?.includes('P2034') && !error.code?.includes('P2028')) {
        throw error;
      }

      // Backoff exponentiel
      const delay = Math.min(100 * Math.pow(2, attempt), 1000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.warn(`[Prisma] Retrying transaction (attempt ${attempt + 1}/${maxRetries})`);
    }
  }

  throw lastError;
}

// ============================================
// MONITORING INTEGRATION
// ============================================

/**
 * Wrapper pour monitorer les queries
 */
export function createMonitoredPrismaClient(prisma: PrismaClient): PrismaClient {
  // Middleware pour monitoring
  prisma.$use(async (params, next) => {
    const start = Date.now();

    try {
      const result = await next(params);
      const duration = Date.now() - start;

      // Enregistrer métrique
      monitoring.recordPerformance({
        operation: `prisma.${params.model}.${params.action}`,
        duration,
        success: true,
        metadata: {
          model: params.model,
          action: params.action,
        },
      });

      // Alerter si slow query (> 1s)
      if (duration > 1000) {
        console.warn(`[Prisma] Slow query detected: ${params.model}.${params.action} (${duration}ms)`);
      }

      return result;
    } catch (error: any) {
      const duration = Date.now() - start;

      monitoring.recordPerformance({
        operation: `prisma.${params.model}.${params.action}`,
        duration,
        success: false,
      });

      monitoring.recordError({
        type: 'prisma_error',
        message: error.message,
        stack: error.stack,
        context: {
          model: params.model,
          action: params.action,
        },
      });

      throw error;
    }
  });

  return prisma;
}

// ============================================
// UTILITIES
// ============================================

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/**
 * Exemple: DataLoader pour éviter N+1 queries
 */
export function createUserLoader(prisma: PrismaClient) {
  return new DataLoader<string, any>(
    async (userIds) => {
      const users = await (prisma as unknown as { user: { findMany: (args: unknown) => Promise<Array<{ id: string }>> } }).user.findMany({
        where: { id: { in: userIds as string[] } },
      });

      // Mapper par ID pour préserver l'ordre
      const userMap = new Map(users.map((u: { id: string }) => [u.id, u]));
      return userIds.map(id => userMap.get(id as string));
    },
    { cache: true }
  );
}

/**
 * Exemple: Query optimisée avec pagination
 */
export async function getCalendarEventsPaginated(
  prisma: PrismaClient,
  options: PaginationOptions & { bureauId?: string }
) {
  const where = {
    ...(options.bureauId && { bureauId: options.bureauId }),
    deletedAt: null,
  };

  return paginateCursorBased(
    prisma.calendarEvent,
    where,
    {
      limit: options.limit,
      cursor: options.cursor,
      orderBy: options.orderBy || { start: 'desc' },
    }
  );
}

export default {
  DataLoader,
  paginateOffsetBased,
  paginateCursorBased,
  bulkInsert,
  bulkUpdate,
  bulkDelete,
  retryTransaction,
  createMonitoredPrismaClient,
  exists,
  excludeFields,
};

