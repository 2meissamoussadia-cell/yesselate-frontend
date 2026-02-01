/**
 * Page de connexion
 * Utilise le AuthProvider (lib) — redirection vers dashboard après login réussi.
 * useSearchParams() est dans LoginPageContent, enveloppé dans Suspense pour le prerender.
 */

import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
