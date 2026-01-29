/**
 * Hook optionnel pour l'authentification
 * Ne lance pas d'erreur si AuthProvider n'est pas disponible
 * Utile pour les composants qui doivent fonctionner avec ou sans authentification
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '@lib-root/contexts/AuthContext';

/**
 * Hook optionnel pour obtenir le contexte d'authentification
 * Retourne null si le provider n'est pas disponible au lieu de lancer une erreur
 * 
 * IMPORTANT: useContext ne lance jamais d'erreur - il retourne simplement undefined
 * si le contexte n'est pas disponible. On peut donc l'appeler directement sans try-catch.
 * 
 * @returns Contexte d'authentification ou null si non disponible
 */
export function useAuthOptional() {
  // useContext ne lance jamais d'erreur, il retourne simplement undefined
  // si le contexte n'est pas disponible dans l'arbre de composants
  const context = useContext(AuthContext);
  
  // Si le contexte est undefined, le provider n'est pas disponible
  return context || null;
}
