/**
 * useMemoizedCallback Hook
 * Hook pour mémoriser des callbacks avec dépendances
 */

import { useCallback, useRef } from 'react';

/**
 * Hook pour mémoriser un callback avec dépendances
 * Plus performant que useCallback pour les callbacks complexes
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);

  // Mettre à jour la référence si les dépendances changent
  const hasChanged = deps.some((dep, i) => dep !== depsRef.current[i]);
  
  if (hasChanged) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  const memoized = useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []);

  return memoized as T;
}

