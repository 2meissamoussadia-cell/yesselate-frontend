/**
 * Hook safe pour la navigation du dashboard avec fallback
 * Garantit un fallback sûr si la navigation n'est pas initialisée ou si la route est invalide
 */

'use client';

import { useMemo } from 'react';
import { useDashboardNavigation } from '../context/DashboardNavigationContext';
import { normalizeRoute, isValidRoute, getDefaultRoute } from '../utils/routeValidation';

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
  // Essayer d'utiliser le hook normal
  let navigation;
  try {
    navigation = useDashboardNavigation();
  } catch (error) {
    // Si le provider est manquant, utiliser le fallback
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[useDashboardNavigationSafe] Provider manquant, utilisation du fallback',
        error
      );
    }
    const defaultRoute = getDefaultRoute();
    navigation = {
      main: defaultRoute.main,
      sub: defaultRoute.sub,
      leaf: defaultRoute.leaf,
      setMain: () => {},
      setSub: () => {},
      setLeaf: () => {},
    };
  }

  // ✅ Normaliser et valider la route
  const normalizedRoute = useMemo(() => {
    const { main, sub, leaf } = navigation;

    // Si la route n'est pas valide, utiliser la route par défaut
    if (!isValidRoute(main, sub, leaf)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[useDashboardNavigationSafe] Route invalide, normalisation:',
          { main, sub, leaf }
        );
      }
      return normalizeRoute(main, sub, leaf);
    }

    return { main, sub, leaf };
  }, [navigation.main, navigation.sub, navigation.leaf]);

  return {
    ...navigation,
    main: normalizedRoute.main,
    sub: normalizedRoute.sub,
    leaf: normalizedRoute.leaf,
    // ✅ Flag pour indiquer si la route a été normalisée
    isNormalized:
      normalizedRoute.main !== navigation.main ||
      normalizedRoute.sub !== navigation.sub ||
      normalizedRoute.leaf !== navigation.leaf,
  };
}
