// app/_nonce-script.tsx
// Phase P18: Script inline pour injecter le nonce CSP dans window
// Ce script est injecté par le middleware et permet au CspNonceProvider de récupérer le nonce

/**
 * Ce composant est injecté dans le HTML par le middleware
 * pour exposer le nonce CSP côté client via window.__CSP_NONCE__
 * 
 * Usage: Injecter dans le <head> ou au début du <body>
 */
export function NonceScript({ nonce }: { nonce: string }) {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `window.__CSP_NONCE__ = ${JSON.stringify(nonce)};`,
      }}
    />
  );
}
