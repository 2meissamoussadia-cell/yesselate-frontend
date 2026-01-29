/**
 * Télémetrie Dashboard - Exports centralisés (Phase P14)
 *
 * Observabilité produit : tracking vues, actions, erreurs, perfs,
 * consentement et instruments KPI.
 */
export { useTrackView, useTrackAction, useTrackError, useTrackPerf } from './useTrack';
export { TelemetryConsentBanner, useTelemetryConsent } from './consent';
export { useKpiBarTelemetry } from './instruments';