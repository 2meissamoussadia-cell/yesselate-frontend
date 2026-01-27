// lib/server/security/cspNonce.tsx
// Phase P18: Provider pour exposer le nonce CSP dans Next.js 13/14

'use client';

import React, { createContext, useContext, useMemo } from 'react';

/**
 * Contexte pour le nonce CSP
 */
const CspNonceContext = createContext<string | null>(null);

/**
 * Provider pour le nonce CSP
 * 
 * Le nonce est injecté par le middleware dans le header x-csp-nonce
 * et doit être récupéré côté client pour les scripts inline critiques.
 */
export function CspNonceProvider({ children }: { children: React.ReactNode }) {
  // Récupérer le nonce depuis le meta tag ou le header
  // Le middleware injecte le nonce dans un meta tag ou via un script
  const nonce = useMemo(() => {
    if (typeof window === 'undefined') {
      // SSR: le nonce sera injecté par le middleware
      return null;
    }

    // Option 1: Depuis un meta tag injecté par le middleware
    const metaNonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');
    if (metaNonce) {
      return metaNonce;
    }

    // Option 2: Depuis un script tag avec data-nonce
    const scriptNonce = document.querySelector('script[data-nonce]')?.getAttribute('data-nonce');
    if (scriptNonce) {
      return scriptNonce;
    }

    // Option 3: Depuis window (injecté par le middleware via un script inline)
    if (typeof window !== 'undefined' && (window as any).__CSP_NONCE__) {
      return (window as any).__CSP_NONCE__;
    }

    // Option 4: Depuis le cookie (injecté par le middleware)
    const cookieNonce = document.cookie
      .split('; ')
      .find(row => row.startsWith('csp-nonce='))
      ?.split('=')[1];
    if (cookieNonce) {
      return cookieNonce;
    }

    return null;
  }, []);

  return (
    <CspNonceContext.Provider value={nonce}>
      {children}
    </CspNonceContext.Provider>
  );
}

/**
 * Hook pour utiliser le nonce CSP
 * 
 * Usage:
 * ```tsx
 * const nonce = useCspNonce();
 * return <script nonce={nonce}>...</script>
 * ```
 */
export function useCspNonce(): string | null {
  const nonce = useContext(CspNonceContext);
  return nonce;
}
