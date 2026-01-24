/**
 * Hook safe pour la navigation du dashboard avec fallback
 * Garantit un fallback sûr si la navigation n'est pas initialisée ou si la route est invalide
 */

'use client';

import { useMemo } from 'react';
import { useDashboardNavigation } from './useDashboardNavigation';
import { normalizeRoute, isValidRoute } from '../utils/routeValidation';

/**
 * Hook safe pour utiliser la navigation du dashboard
 * Retourne toujours des valeurs valides, même si le provider est manquant
 * 
 * @returns Navigation state avec fallback si nécessaire
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { main, sub, leaf, setMain, setSub, setLeaf } = useDashboardNavigationSafe();
 *   // Toujours des valeurs valides, même sans provider
 * }
 * ```
 */
export function useDashboardNavigationSafe() {
  // ✅ Le hook unifié ne dépend plus d'un provider.
  const navigation = useDashboardNavigation();

  // ✅ Normaliser et valider la route
  const normalizedRoute = useMemo(() => {
    const { main, sub, leaf } = navigation;

    // Si la route n'est pas valide, utiliser la route par défaut
    if (!isValidRoute(main, sub ?? null, leaf ?? null)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[useDashboardNavigationSafe] Route invalide, normalisation:',
          { main, sub, leaf }
        );
      }
      return normalizeRoute(main, sub ?? null, leaf ?? null);
    }

    return { main, sub: sub ?? null, leaf: leaf ?? null };
  }, [navigation.main, navigation.sub, navigation.leaf]);

  return {
    ...navigation,
    main: normalizedRoute.main,
    sub: normalizedRoute.sub ?? undefined,
    leaf: normalizedRoute.leaf ?? undefined,
    // ✅ Flag pour indiquer si la route a été normalisée
    isNormalized:
      normalizedRoute.main !== navigation.main ||
      normalizedRoute.sub !== (navigation.sub ?? null) ||
      normalizedRoute.leaf !== (navigation.leaf ?? null),
  };
}
