/**
 * V5 — Consentement et abonnement Web Push (Cockpit DG).
 * Récupère la clé VAPID, s’abonne via le SW, enregistre côté API.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const CONSENT_KEY = 'cockpit-push-consent';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface UsePushConsentResult {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  dismissBanner: () => void;
  shouldShowBanner: boolean;
}

export function usePushConsent(): UsePushConsentResult {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(ok);
    if (ok) setPermission(Notification.permission);
    try {
      const dismissed = localStorage.getItem(CONSENT_KEY) === 'dismissed';
      setBannerDismissed(dismissed);
    } catch {
      setBannerDismissed(false);
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);
    setError(null);
    try {
      const resKey = await fetch('/api/push/vapid-public');
      if (!resKey.ok) throw new Error('VAPID key unavailable');
      const { publicKey } = (await resKey.json()) as { publicKey: string };
      if (!publicKey) throw new Error('No public key');

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const resSub = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!resSub.ok) {
        const data = await resSub.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Subscribe failed');
      }

      setPermission(Notification.permission);
      setIsSubscribed(true);
      try {
        localStorage.setItem(CONSENT_KEY, 'granted');
      } catch {
        // ignore
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!isSupported) return;
    setIsLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setIsSubscribed(false);
      try {
        localStorage.removeItem(CONSENT_KEY);
      } catch {
        // ignore
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(CONSENT_KEY, 'dismissed');
    } catch {
      // ignore
    }
  }, []);

  // Vérifier l’état d’abonnement au chargement
  useEffect(() => {
    if (!isSupported) return;
    let cancelled = false;
    navigator.serviceWorker.ready.then((reg) => reg.pushManager.getSubscription()).then((sub) => {
      if (!cancelled) setIsSubscribed(!!sub);
    });
    return () => {
      cancelled = true;
    };
  }, [isSupported]);

  const shouldShowBanner =
    isSupported &&
    permission !== 'granted' &&
    permission !== 'denied' &&
    !isSubscribed &&
    !bannerDismissed;

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    dismissBanner,
    shouldShowBanner,
  };
}
