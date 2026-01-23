/**
 * Advanced Test Utilities
 * Utilitaires avancés pour les tests
 */

/**
 * Crée un mock de fonction avec historique
 */
export function createAdvancedMockFunction<T extends (...args: any[]) => any>(
  returnValue?: ReturnType<T>
) {
  const calls: Parameters<T>[] = [];
  const returns: ReturnType<T>[] = [];

  const mockFn = ((...args: Parameters<T>) => {
    calls.push(args);
    const value = returnValue !== undefined ? returnValue : undefined;
    returns.push(value as ReturnType<T>);
    return value;
  }) as T & {
    calls: typeof calls;
    returns: typeof returns;
    reset: () => void;
    called: boolean;
    callCount: number;
    lastCall: Parameters<T> | undefined;
    lastReturn: ReturnType<T> | undefined;
  };

  mockFn.calls = calls;
  mockFn.returns = returns;
  mockFn.reset = () => {
    calls.length = 0;
    returns.length = 0;
  };
  Object.defineProperty(mockFn, 'called', {
    get: () => calls.length > 0,
  });
  Object.defineProperty(mockFn, 'callCount', {
    get: () => calls.length,
  });
  Object.defineProperty(mockFn, 'lastCall', {
    get: () => calls[calls.length - 1],
  });
  Object.defineProperty(mockFn, 'lastReturn', {
    get: () => returns[returns.length - 1],
  });

  return mockFn;
}

/**
 * Crée un mock de promesse
 */
export function createMockPromise<T = any>(
  resolveValue?: T,
  rejectValue?: any
): Promise<T> & {
  resolve: (value: T) => void;
  reject: (error: any) => void;
} {
  let resolveFn: (value: T) => void;
  let rejectFn: (error: any) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  // Résoudre ou rejeter immédiatement si des valeurs sont fournies
  if (resolveValue !== undefined) {
    setTimeout(() => resolveFn(resolveValue), 0);
  } else if (rejectValue !== undefined) {
    setTimeout(() => rejectFn(rejectValue), 0);
  }

  return Object.assign(promise, {
    resolve: (value: T) => resolveFn(value),
    reject: (error: any) => rejectFn(error),
  });
}

/**
 * Attend qu'une condition soit vraie (version avancée)
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

/**
 * Simule un délai
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Crée un générateur de données de test
 */
export class TestDataGenerator {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Générateur de nombres aléatoires avec seed
   */
  private random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Génère un nombre aléatoire entre min et max
   */
  number(min: number = 0, max: number = 100): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Génère une chaîne aléatoire
   */
  string(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(this.random() * chars.length));
    }
    return result;
  }

  /**
   * Génère un email aléatoire
   */
  email(): string {
    return `${this.string(8)}@${this.string(5)}.com`;
  }

  /**
   * Génère une date aléatoire
   */
  date(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + this.random() * (endTime - startTime);
    return new Date(randomTime);
  }

  /**
   * Génère un booléen aléatoire
   */
  boolean(): boolean {
    return this.random() > 0.5;
  }

  /**
   * Sélectionne un élément aléatoire d'un tableau
   */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  /**
   * Génère un tableau de données
   */
  array<T>(generator: () => T, length: number = 10): T[] {
    return Array.from({ length }, () => generator());
  }
}

/**
 * Instance globale du générateur
 */
export const testDataGenerator = new TestDataGenerator();

/**
 * Crée un mock d'événement
 */
export function createMockEvent(
  type: string,
  options: Partial<Event> = {}
): Event {
  const event = new Event(type, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? true,
  });

  Object.assign(event, options);

  return event;
}

/**
 * Crée un mock d'événement de souris
 */
export function createMockMouseEvent(
  type: string,
  options: Partial<MouseEvent> = {}
): MouseEvent {
  const event = new MouseEvent(type, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? true,
    clientX: options.clientX ?? 0,
    clientY: options.clientY ?? 0,
  });

  Object.assign(event, options);

  return event;
}

/**
 * Crée un mock d'événement de clavier
 */
export function createMockKeyboardEvent(
  type: string,
  options: Partial<KeyboardEvent> = {}
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? true,
    key: options.key ?? '',
    code: options.code ?? '',
  });

  Object.assign(event, options);

  return event;
}

/**
 * Mock d'une fonction fetch
 */
export function createMockFetch(
  response: any,
  options: Partial<Response> = {}
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers.set(key, value);
        });
      } else if (Array.isArray(options.headers)) {
        (options.headers as [string, string][]).forEach(([key, value]) => {
          headers.set(key, value);
        });
      } else {
        Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
          headers.set(key, value);
        });
      }
    }
    return new Response(JSON.stringify(response), {
      status: options.status ?? 200,
      statusText: options.statusText ?? 'OK',
      headers,
    }) as Response;
  };
}

