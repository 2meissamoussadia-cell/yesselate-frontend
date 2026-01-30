'use client';

import { cn } from '@/lib/utils';

/**
 * SkipLinks - Liens de navigation rapide pour l'accessibilité.
 * Permet aux utilisateurs de clavier de sauter au contenu principal (#main-content) et à la navigation (#navigation).
 * Ne pas utiliser si BmoPortalLayout/BmoLayoutShell est déjà en place (lien « Aller au contenu » déjà présent).
 */
export function SkipLinks() {
  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'fixed top-4 left-4 z-[1000]',
          'px-4 py-2 rounded-lg',
          'bg-blue-600 text-white font-semibold',
          'focus:outline-none focus:ring-4 focus:ring-blue-300',
          'transition-all'
        )}
      >
        Aller au contenu principal
      </a>
      <a
        href="#navigation"
        className={cn(
          'sr-only focus:not-sr-only',
          'fixed top-4 left-4 z-[1000]',
          'px-4 py-2 rounded-lg',
          'bg-blue-600 text-white font-semibold',
          'focus:outline-none focus:ring-4 focus:ring-blue-300',
          'transition-all'
        )}
        style={{ top: '4.5rem' }}
      >
        Aller à la navigation
      </a>
    </div>
  );
}

/**
 * Composant AriaLiveRegion pour les annonces aux lecteurs d'écran
 */
export function AriaLiveRegion({ 
  message, 
  politeness = 'polite' 
}: { 
  message: string; 
  politeness?: 'polite' | 'assertive';
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

