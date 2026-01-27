// src/modules/dashboard/telemetry/consent/useTelemetryConsent.ts
// Phase P14: Observabilité produit - Gestion du consentement RGPD

'use client';

import { useState, useEffect, useCallback } from 'react';

const CONSENT_COOKIE_NAME = 'telemetry_consent';
const CONSENT_COOKIE_EXPIRY_DAYS = 365; // 1 an

type ConsentStatus = boolean | null; // null = pas encore décidé, true = accepté, false = refusé

/**
 * Hook pour gérer le consentement télémetrie
 * Phase P14: Observabilité produit - RGPD
 * 
 * Stocke le consentement dans un cookie `telemetry_consent` (on/off/null)
 * et expose des méthodes pour accepter/refuser.
 */
export function useTelemetryConsent() {
  const [hasConsent, setHasConsentState] = useState<ConsentStatus>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Lit le cookie de consentement
   */
  const readConsent = useCallback((): ConsentStatus => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const consentCookie = cookies.find((c) => c.trim().startsWith(`${CONSENT_COOKIE_NAME}=`));

    if (!consentCookie) return null;

    const value = consentCookie.split('=')[1]?.trim();
    if (value === 'on') return true;
    if (value === 'off') return false;
    return null;
  }, []);

  /**
   * Écrit le cookie de consentement
   */
  const writeConsent = useCallback((consent: boolean) => {
    if (typeof document === 'undefined') return;

    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + CONSENT_COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const cookieValue = consent ? 'on' : 'off';
    document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  }, []);

  /**
   * Initialise le consentement depuis le cookie
   */
  useEffect(() => {
    const consent = readConsent();
    setHasConsentState(consent);
    setIsLoading(false);
  }, [readConsent]);

  /**
   * Définit le consentement (accepte ou refuse)
   */
  const setConsent = useCallback(
    (consent: boolean) => {
      writeConsent(consent);
      setHasConsentState(consent);
    },
    [writeConsent]
  );

  /**
   * Vérifie si la télémetrie est autorisée
   */
  const isTelemetryAllowed = hasConsent === true;

  return {
    hasConsent,
    isTelemetryAllowed,
    isLoading,
    setConsent,
  };
}
