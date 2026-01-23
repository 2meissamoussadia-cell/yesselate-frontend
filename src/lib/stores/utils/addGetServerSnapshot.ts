/**
 * Utilitaire pour ajouter getServerSnapshot aux stores Zustand avec persist
 * 
 * @example
 * const getServerSnapshot = createGetServerSnapshot(initialState, actions);
 * 
 * export const useMyStore = create<MyStore>()(
 *   persist(
 *     (set) => ({ ...initialState, ...actions }),
 *     {
 *       name: 'my-store',
 *       getServerSnapshot, // ✅ Ajouté automatiquement
 *     }
 *   )
 * );
 */

/**
 * Crée une fonction getServerSnapshot pour un store Zustand
 * 
 * @param initialState - État initial du store
 * @param actions - Actions du store (fonctions vides pour SSR)
 * @returns Fonction getServerSnapshot compatible avec Zustand persist
 */
export function createGetServerSnapshot<TState, TActions>(
  initialState: TState,
  actions: TActions
): () => TState & TActions {
  return () => ({
    ...initialState,
    ...actions,
  } as TState & TActions);
}

/**
 * Crée des actions vides pour SSR
 * Utile pour créer getServerSnapshot rapidement
 * 
 * @param actionNames - Noms des actions à créer
 * @returns Objet avec des fonctions vides pour chaque action
 */
export function createEmptyActions<T extends Record<string, string>>(
  actionNames: T
): Record<keyof T, () => void> {
  const actions = {} as Record<keyof T, () => void>;
  for (const key in actionNames) {
    actions[key] = () => {};
  }
  return actions;
}

/**
 * Exemple d'utilisation:
 * 
 * ```typescript
 * interface MyStore {
 *   count: number;
 *   increment: () => void;
 *   decrement: () => void;
 * }
 * 
 * const initialState = { count: 0 };
 * const emptyActions = createEmptyActions({ increment: 'increment', decrement: 'decrement' });
 * const getServerSnapshot = createGetServerSnapshot(initialState, emptyActions);
 * 
 * export const useMyStore = create<MyStore>()(
 *   persist(
 *     (set) => ({
 *       ...initialState,
 *       increment: () => set((state) => ({ count: state.count + 1 })),
 *       decrement: () => set((state) => ({ count: state.count - 1 })),
 *     }),
 *     {
 *       name: 'my-store',
 *       getServerSnapshot,
 *     }
 *   )
 * );
 * ```
 */
