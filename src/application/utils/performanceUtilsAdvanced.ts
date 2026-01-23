/**
 * Advanced Performance Utilities
 * Helpers pour l'optimisation des performances
 */

/**
 * Crée une fonction memoized avec cache LRU
 */
export function createMemoizedFunction<T extends (...args: any[]) => any>(
  fn: T,
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  const keys: string[] = [];

  return ((...args: any[]) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      // Mettre à jour l'ordre (LRU)
      const index = keys.indexOf(key);
      keys.splice(index, 1);
      keys.push(key);
      return cache.get(key);
    }

    const result = fn(...args);

    // Gérer la taille du cache
    if (cache.size >= maxCacheSize) {
      const oldestKey = keys.shift();
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, result);
    keys.push(key);

    return result;
  }) as T;
}

/**
 * Debounce avec cache
 */
export function createCachedDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  maxCacheSize: number = 50
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<ReturnType<T>>((resolve) => {
      timeoutId = setTimeout(() => {
        const result = fn(...args);
        cache.set(key, result);

        // Limiter la taille du cache
        if (cache.size > maxCacheSize) {
          const firstKey = cache.keys().next().value;
          if (firstKey !== undefined) {
            cache.delete(firstKey);
          }
        }

        resolve(result);
      }, delay);
    });
  }) as T;
}

/**
 * Profiler pour mesurer les performances
 */
export class PerformanceProfilerAdvanced {
  private measurements: Map<string, number[]> = new Map();

  start(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }

      this.measurements.get(label)!.push(duration);
    };
  }

  getStats(label: string): {
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const measurements = this.measurements.get(label);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, m) => sum + m, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      total,
      average,
      min,
      max,
    };
  }

  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {};

    for (const label of this.measurements.keys()) {
      stats[label] = this.getStats(label);
    }

    return stats;
  }

  clear(): void {
    this.measurements.clear();
  }

  clearLabel(label: string): void {
    this.measurements.delete(label);
  }
}

/**
 * Instance globale du profiler
 */
export const performanceProfiler = new PerformanceProfilerAdvanced();

/**
 * Décorateur pour mesurer les performances d'une fonction
 */
export function measurePerformanceAdvanced<T extends (...args: any[]) => any>(
  fn: T,
  label?: string
): T {
  const functionLabel = label || fn.name || 'anonymous';

  return ((...args: any[]) => {
    const end = performanceProfiler.start(functionLabel);
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.finally(end) as ReturnType<T>;
      }
      end();
      return result;
    } catch (error) {
      end();
      throw error;
    }
  }) as T;
}

/**
 * Batch les mises à jour pour améliorer les performances
 */
export class UpdateBatcher {
  private updates: Map<string, () => void> = new Map();
  private timeoutId: NodeJS.Timeout | null = null;
  private batchDelay: number;

  constructor(batchDelay: number = 16) {
    this.batchDelay = batchDelay;
  }

  schedule(key: string, update: () => void): void {
    this.updates.set(key, update);

    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.batchDelay);
    }
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const updates = Array.from(this.updates.values());
    this.updates.clear();

    updates.forEach((update) => update());
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.updates.clear();
  }
}

/**
 * Instance globale du batcher
 */
export const updateBatcher = new UpdateBatcher();

/**
 * Optimise les re-renders avec requestAnimationFrame
 */
export function optimizeRender(callback: () => void): () => void {
  let rafId: number | null = null;

  const optimizedCallback = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      callback();
      rafId = null;
    });
  };

  return optimizedCallback;
}

/**
 * Crée un pool d'objets réutilisables
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn?: (obj: T) => void,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length >= this.maxSize) {
      return;
    }

    if (this.resetFn) {
      this.resetFn(obj);
    }

    this.pool.push(obj);
  }

  clear(): void {
    this.pool = [];
  }

  get size(): number {
    return this.pool.length;
  }
}

