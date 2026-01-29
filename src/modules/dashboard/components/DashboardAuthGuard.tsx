/**
 * Garde d'authentification pour le dashboard
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */

'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthOptional } from '../hooks/useAuthOptional';

const LOGIN_PATH = '/login';

interface DashboardAuthGuardProps {
  children: React.ReactNode;
}

export function DashboardAuthGuard({ children }: DashboardAuthGuardProps) {
  const auth = useAuthOptional();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth === null) return; // pas de provider
    if (auth.isLoading) return;

    if (!auth.isAuthenticated) {
      const redirect = encodeURIComponent(pathname || '/maitre-ouvrage/dashboard');
      router.replace(`${LOGIN_PATH}?redirect=${redirect}`);
    }
  }, [auth?.isAuthenticated, auth?.isLoading, auth === null, pathname, router]);

  if (auth === null) {
    return <>{children}</>;
  }
  if (auth.isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
          <p className="text-slate-400 text-sm">Vérification de la session…</p>
        </div>
      </div>
    );
  }
  if (!auth.isAuthenticated) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
          <p className="text-slate-400 text-sm">Redirection vers la connexion…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
