/**
 * Test Utilities
 * Helpers pour les tests
 */

/**
 * Mock d'une fonction avec retour contrôlé
 */
export function createMockFunction<T extends (...args: any[]) => any>(
  returnValue?: ReturnType<T>
): jest.Mock<ReturnType<T>, Parameters<T>> {
  return jest.fn(() => returnValue) as unknown as jest.Mock<ReturnType<T>, Parameters<T>>;
}

/**
 * Attend qu'une condition soit vraie
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(checkCondition, interval);
      }
    };

    checkCondition();
  });
}

/**
 * Génère des données de test
 */
export function generateTestData<T>(
  generator: (index: number) => T,
  count: number = 10
): T[] {
  return Array.from({ length: count }, (_, index) => generator(index));
}

/**
 * Mock d'un objet avec propriétés optionnelles
 */
export function createMockObject<T extends Record<string, any>>(
  defaults: Partial<T> = {}
): T {
  return defaults as T;
}

/**
 * Vérifie qu'un élément est visible
 */
export function isElementVisible(element: HTMLElement | null): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}

/**
 * Simule un événement utilisateur
 */
export function simulateEvent(
  element: HTMLElement,
  eventType: string,
  options?: EventInit
): void {
  const event = new Event(eventType, { bubbles: true, ...options });
  element.dispatchEvent(event);
}

/**
 * Mock d'une réponse API
 */
export function createMockApiResponse<T>(
  data: T,
  status: number = 200,
  delay: number = 0
): Promise<Response> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
      } as Response);
    }, delay);
  });
}

/**
 * Nettoie les mocks après un test
 */
export function cleanupMocks(): void {
  jest.clearAllMocks();
}

/**
 * Crée un mock de store Zustand
 */
export function createMockStore<T extends Record<string, any>>(
  initialState: T
): {
  getState: () => T;
  setState: (partial: Partial<T>) => void;
  subscribe: (listener: (state: T) => void) => () => void;
} {
  let state = { ...initialState };
  const listeners = new Set<(state: T) => void>();

  return {
    getState: () => state,
    setState: (partial: Partial<T>) => {
      state = { ...state, ...partial };
      listeners.forEach(listener => listener(state));
    },
    subscribe: (listener: (state: T) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * Génère un ID unique pour les tests
 */
export function generateTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mock d'une fonction async avec délai
 */
export function createAsyncMock<T>(
  returnValue: T,
  delay: number = 100
): jest.Mock<Promise<T>, any[]> {
  return jest.fn(
    () => new Promise(resolve => setTimeout(() => resolve(returnValue), delay))
  );
}

