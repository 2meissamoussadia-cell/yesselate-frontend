// src/lib/security/CspNonceProvider.tsx
// Phase P18: Provider pour exposer le nonce CSP dans Next.js 13/14

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CspNonceContextValue {
  nonce: string | null;
}

const CspNonceContext = createContext<CspNonceContextValue>({ nonce: null });

/**
 * Provider pour exposer le nonce CSP
 * 
 * Le nonce est injecté par le middleware dans le header x-csp-nonce
 * et récupéré côté client pour être utilisé dans les scripts inline
 */
export function CspNonceProvider({ children }: { children: React.ReactNode }) {
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer le nonce depuis le meta tag ou le header
    // Le middleware injecte le nonce dans un meta tag ou via un script
    const metaNonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');
    
    if (metaNonce) {
      setNonce(metaNonce);
    } else {
      // Fallback: essayer de récupérer depuis un script avec nonce
      const scriptWithNonce = document.querySelector('script[nonce]');
      if (scriptWithNonce) {
        setNonce(scriptWithNonce.getAttribute('nonce'));
      }
    }
  }, []);

  return (
    <CspNonceContext.Provider value={{ nonce }}>
      {children}
    </CspNonceContext.Provider>
  );
}

/**
 * Hook pour utiliser le nonce CSP
 */
export function useCspNonce(): string | null {
  const { nonce } = useContext(CspNonceContext);
  return nonce;
}

/**
 * Helper pour injecter le nonce dans un script inline
 * 
 * Usage:
 * ```tsx
 * const nonce = useCspNonce();
 * <script nonce={nonce} dangerouslySetInnerHTML={{ __html: '...' }} />
 * ```
 */
export function ScriptWithNonce({ 
  children, 
  ...props 
}: { 
  children?: string;
  [key: string]: any;
}) {
  const nonce = useCspNonce();
  
  if (children) {
    return (
      <script 
        nonce={nonce || undefined} 
        dangerouslySetInnerHTML={{ __html: children }}
        {...props}
      />
    );
  }
  
  return <script nonce={nonce || undefined} {...props} />;
}
