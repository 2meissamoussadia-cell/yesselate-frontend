/**
 * useCleanup Hook
 * Hook pour gérer le nettoyage de ressources
 */

import { useEffect, useRef } from 'react';

type CleanupFn = () => void;

/**
 * Hook pour enregistrer des fonctions de nettoyage
 */
export function useCleanup(cleanupFn: CleanupFn, deps: React.DependencyList = []) {
  const cleanupRef = useRef<CleanupFn | undefined>(undefined);

  useEffect(() => {
    cleanupRef.current = cleanupFn;
  }, [cleanupFn]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, deps);
}

/**
 * Hook pour créer un cleanup manager
 */
export function useCleanupManager() {
  const cleanupsRef = useRef<Set<CleanupFn>>(new Set());

  const addCleanup = (cleanup: CleanupFn) => {
    cleanupsRef.current.add(cleanup);
    return () => {
      cleanupsRef.current.delete(cleanup);
    };
  };

  useEffect(() => {
    return () => {
      cleanupsRef.current.forEach(cleanup => cleanup());
      cleanupsRef.current.clear();
    };
  }, []);

  return { addCleanup };
}

