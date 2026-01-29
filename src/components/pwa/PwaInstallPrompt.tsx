'use client';

import { useEffect, useState, useCallback } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const BANNER_DISMISSED_KEY = 'pwa-install-banner-dismissed';
const BANNER_DISMISSED_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const isBannerDismissed = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const raw = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!raw) return false;
    try {
      const { at } = JSON.parse(raw);
      return Date.now() - at < BANNER_DISMISSED_TTL_MS;
    } catch {
      return false;
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, JSON.stringify({ at: Date.now() }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Déjà installé (standalone ou TWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isBannerDismissed()) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isBannerDismissed]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!showBanner || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div
      role="banner"
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 border-t border-orange-500/30 bg-[#0F0F11] px-4 py-3 shadow-lg"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      <div className="flex flex-1 items-center gap-3">
        <img
          src="/images/log_yessalate.png"
          alt=""
          className="h-10 w-10 rounded-lg object-contain"
        />
        <div>
          <p className="font-semibold text-white">Installer Cockpit DG V5</p>
          <p className="text-sm text-gray-400">Utilisez l’app hors ligne et depuis l’écran d’accueil.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Installer
        </button>
        <button
          type="button"
          onClick={dismissBanner}
          className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
          aria-label="Fermer"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}
