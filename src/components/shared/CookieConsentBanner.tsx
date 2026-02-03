/**
 * Bannière de consentement cookies RGPD (#21 audit)
 * Conformité EU : informer l'utilisateur et recueillir le consentement avant cookies non essentiels.
 */

'use client';

import { useState, useEffect } from 'react';
import { Shield, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'yesselate-cookie-consent-v1';
type ConsentStatus = 'pending' | 'accepted' | 'rejected' | null;

export function CookieConsentBanner({
  privacyPolicyUrl = '/privacy',
  className,
}: {
  privacyPolicyUrl?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<ConsentStatus>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw === 'accepted' || raw === 'rejected') setStatus(raw);
      else setStatus('pending');
    } catch {
      setStatus('pending');
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      setStatus('accepted');
    } catch {}
  };

  const reject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'rejected');
      setStatus('rejected');
    } catch {}
  };

  if (status !== 'pending') return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm',
        'border-t border-slate-700/50 shadow-lg',
        className
      )}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Cookie className="w-5 h-5" aria-hidden />
            <Shield className="w-5 h-5" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="cookie-consent-title" className="text-sm font-semibold text-slate-100 mb-1">
              Cookies et confidentialité
            </h2>
            <p id="cookie-consent-desc" className="text-xs text-slate-600 dark:text-slate-300">
              Nous utilisons des cookies pour le fonctionnement du site, la sécurité et l&apos;analyse d&apos;usage.
              En poursuivant, vous acceptez notre{' '}
              <a
                href={privacyPolicyUrl}
                className="underline text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                politique de confidentialité
              </a>
              . Vous pouvez refuser les cookies non essentiels.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reject}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Refuser les cookies non essentiels
            </button>
            <button
              type="button"
              onClick={accept}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
