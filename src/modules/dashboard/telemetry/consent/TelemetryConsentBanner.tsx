// src/modules/dashboard/telemetry/consent/TelemetryConsentBanner.tsx
// Phase P14: Observabilité produit - Bannière de consentement RGPD

'use client';

import { useState, useEffect } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelemetryConsent } from './useTelemetryConsent';

interface TelemetryConsentBannerProps {
  /** Message personnalisé par tenant (optionnel) */
  message?: string;
  /** Lien vers la politique de confidentialité */
  privacyPolicyUrl?: string;
  /** Position de la bannière */
  position?: 'top' | 'bottom';
  /** Style personnalisé */
  className?: string;
}

/**
 * Bannière de consentement pour la télémetrie
 * Phase P14: Observabilité produit - RGPD
 * 
 * Affiche une bannière si le consentement n'a pas été donné.
 * Permet d'accepter ou refuser la collecte de données.
 */
export function TelemetryConsentBanner({
  message,
  privacyPolicyUrl = '/privacy',
  position = 'bottom',
  className,
}: TelemetryConsentBannerProps) {
  const { hasConsent, setConsent, isLoading } = useTelemetryConsent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher uniquement si pas de consentement et pas en chargement
    if (!isLoading && hasConsent === null) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [hasConsent, isLoading]);

  const handleAccept = () => {
    setConsent(true);
    setIsVisible(false);
  };

  const handleReject = () => {
    setConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const defaultMessage = message || 
    'Nous utilisons des données anonymisées pour améliorer votre expérience. Acceptez-vous la collecte de données de navigation ?';

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50',
        'shadow-lg',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
      role="banner"
      aria-label="Consentement télémetrie"
    >
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Icône */}
          <div className="flex-shrink-0">
            <Shield className="w-5 h-5 text-blue-400" aria-hidden="true" />
          </div>

          {/* Message */}
          <div className="flex-1 text-sm text-slate-200">
            <p className="mb-1">{defaultMessage}</p>
            {privacyPolicyUrl && (
              <a
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                En savoir plus sur notre politique de confidentialité
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-slate-100 
                       hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Refuser la collecte de données"
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                       rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Accepter la collecte de données"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
