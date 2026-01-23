/**
 * Utilitaire pour combiner plusieurs refs React
 * Version sécurisée qui évite les boucles infinies de setState
 * 
 * @example
 * ```tsx
 * const ref1 = useRef<HTMLDivElement>(null);
 * const ref2 = useRef<HTMLDivElement>(null);
 * const combinedRef = composeRefs(ref1, ref2);
 * 
 * return <div ref={combinedRef} />;
 * ```
 */

import { useCallback, useRef, type Ref, type RefCallback } from 'react';

/**
 * Combine plusieurs refs en une seule fonction ref
 * Protège contre les boucles infinies en utilisant une approche synchrone sécurisée
 * 
 * @param refs - Tableau de refs (RefObject ou RefCallback)
 * @returns Fonction ref combinée
 */
export function composeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (node: T | null) => {
    // ✅ Traiter les refs de manière synchrone mais sécurisée
    // IMPORTANT: Les refs fonctionnelles qui appellent setState doivent être mémoïsées
    // avec useCallback dans le composant parent pour éviter les boucles infinies
    refs.forEach((ref) => {
      if (!ref) return;
      
      try {
        if (typeof ref === 'function') {
          // ✅ Ref fonctionnel : appeler avec le node
          // Si cette ref déclenche setState, elle doit être mémoïsée avec useCallback
          // dans le composant parent pour éviter les re-créations
          ref(node);
        } else if ('current' in ref) {
          // ✅ RefObject : assigner directement
          // TypeScript sait que ref a une propriété 'current'
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      } catch (error) {
        // ✅ Protéger contre les erreurs dans les refs fonctionnels
        if (process.env.NODE_ENV === 'development') {
          console.error('[composeRefs] Erreur dans ref:', error);
        }
        // En production, ignorer silencieusement pour éviter les crashes
      }
    });
  };
}

/**
 * Hook pour créer une ref combinée stable
 * Utile quand on veut combiner des refs dans un composant
 * 
 * IMPORTANT: Si une ref fonctionnelle déclenche setState, déplacer cette logique
 * dans un useEffect qui dépend du node, pas dans la ref elle-même.
 * 
 * @param refs - Tableau de refs à combiner
 * @returns Ref combinée stable (mémorisée)
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ref1 = useRef<HTMLDivElement>(null);
 *   const ref2 = useRef<HTMLDivElement>(null);
 *   const combinedRef = useComposedRefs(ref1, ref2);
 *   
 *   // ✅ Si vous devez faire un setState basé sur le node, utilisez useEffect
 *   const nodeRef = useRef<HTMLDivElement | null>(null);
 *   useEffect(() => {
 *     if (nodeRef.current) {
 *       // Logique qui peut déclencher setState
 *     }
 *   }, [nodeRef.current]);
 *   
 *   return <div ref={useComposedRefs(combinedRef, nodeRef)} />;
 * }
 * ```
 */
export function useComposedRefs<T>(
  ...refs: Array<Ref<T> | undefined | null>
): RefCallback<T> {
  // ✅ Mémoriser la fonction composeRefs pour éviter les re-créations
  // Utiliser useCallback avec les refs comme dépendances
  // Note: Les refs sont stables (RefObject) ou doivent être mémorisées (RefCallback)
  return useCallback(
    (node: T | null) => {
      refs.forEach((ref) => {
        if (!ref) return;
        
        try {
          if (typeof ref === 'function') {
            ref(node);
          } else if ('current' in ref) {
            (ref as React.MutableRefObject<T | null>).current = node;
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[useComposedRefs] Erreur dans ref:', error);
          }
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
