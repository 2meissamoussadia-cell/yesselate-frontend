/**
 * Avertissement timeout session (#19 audit)
 * Détection d'inactivité + modal "Votre session va expirer" + option Rester connecté / Déconnexion
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@lib-root/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const IDLE_LOGOUT_MS = 30 * 60 * 1000;   // 30 min → déconnexion
const IDLE_WARN_MS = 25 * 60 * 1000;     // 25 min → afficher avertissement (5 min avant)
const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'] as const;

export function SessionTimeoutWarning() {
  const { isAuthenticated, logout } = useAuth();
  const [idleSince, setIdleSince] = useState<number>(Date.now());
  const [showWarn, setShowWarn] = useState(false);

  const resetIdle = useCallback(() => {
    setIdleSince(Date.now());
    setShowWarn(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onActivity = () => {
      resetIdle();
    };

    EVENTS.forEach((ev) => {
      window.addEventListener(ev, onActivity, { passive: true });
    });
    return () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, [isAuthenticated, resetIdle]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const t = setInterval(() => {
      const elapsed = Date.now() - idleSince;
      if (elapsed >= IDLE_LOGOUT_MS) {
        setShowWarn(false);
        logout();
        return;
      }
      if (elapsed >= IDLE_WARN_MS) {
        setShowWarn(true);
      }
    }, 10_000); // vérifier toutes les 10 s
    return () => clearInterval(t);
  }, [isAuthenticated, idleSince, logout]);

  if (!isAuthenticated || !showWarn) return null;

  const remainingMin = Math.ceil((IDLE_LOGOUT_MS - (Date.now() - idleSince)) / 60_000);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center p-4',
        'bg-black/70 backdrop-blur-sm'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6 space-y-4">
        <h2 id="session-timeout-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Session inactive
        </h2>
        <p id="session-timeout-desc" className="text-sm text-slate-600 dark:text-slate-300">
          Vous serez déconnecté dans environ <strong>{remainingMin} min</strong> par mesure de sécurité. Souhaitez-vous rester connecté ?
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-slate-300 dark:border-slate-600"
            onClick={logout}
          >
            Se déconnecter
          </Button>
          <Button
            className="flex-1"
            onClick={resetIdle}
            aria-label="Rester connecté"
          >
            Rester connecté
          </Button>
        </div>
      </div>
    </div>
  );
}
