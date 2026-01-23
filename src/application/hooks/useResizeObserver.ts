/**
 * useResizeObserver Hook
 * Hook pour observer les changements de taille d'un élément
 */

import { useEffect, useRef, useState, RefObject, useCallback } from 'react';

export interface ResizeObserverSize {
  width: number;
  height: number;
}

export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T | null>,
  ResizeObserverSize | null
] {
  const elementRef = useRef<T | null>(null);
  const [size, setSize] = useState<ResizeObserverSize | null>(null);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const [entry] = entries;
    if (entry) {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleResize]);

  return [elementRef, size];
}

