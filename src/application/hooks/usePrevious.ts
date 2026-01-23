/**
 * usePrevious Hook
 * Hook pour obtenir la valeur précédente d'une variable
 */

import { useRef, useEffect } from 'react';

/**
 * Hook pour obtenir la valeur précédente
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

