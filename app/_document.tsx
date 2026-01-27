// app/_document.tsx
// Phase P18: Injection du nonce CSP dans le HTML (Next.js 13+ App Router)
// Note: Dans App Router, le nonce est injecté via middleware et accessible via headers

import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Document personnalisé pour injecter le nonce CSP
 * 
 * Dans Next.js 13+ App Router, le nonce est injecté par le middleware
 * et accessible via les headers. Ce fichier est optionnel si on utilise
 * uniquement le CspNonceProvider côté client.
 */
export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Le nonce sera injecté par le middleware via x-csp-nonce header */}
        {/* Pour scripts inline critiques, utiliser CspNonceProvider */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
