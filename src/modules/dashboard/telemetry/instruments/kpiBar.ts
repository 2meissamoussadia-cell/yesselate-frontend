// src/modules/dashboard/telemetry/instruments/kpiBar.ts
// Phase P14: Observabilité produit - Instrumentation KPI Bar

'use client';

import { useTrackAction } from '../useTrack';

/**
 * Hook de télémetrie pour la KPI Bar
 * Phase P14: Observabilité produit
 * 
 * Centralise tous les trackings d'actions de la KPI Bar :
 * - Exports (CSV, JSON, XLSX, PDF)
 * - Clics sur KPIs
 * - Filtres appliqués
 * 
 * @example
 * const telemetry = useKpiBarTelemetry();
 * telemetry.onExport('xlsx', 'overview::summary::dashboard');
 * telemetry.onKpiClick('production');
 * telemetry.onFilter('date', { from: '2024-01-01', to: '2024-12-31' });
 */
export function useKpiBarTelemetry() {
  const track = useTrackAction();

  return {
    /**
     * Tracker un export déclenché
     * Phase P14: Observabilité produit
     */
    onExport: (format: 'csv' | 'json' | 'xlsx' | 'pdf' | 'excel', routeKey?: string) => {
      // Normaliser 'excel' -> 'xlsx' pour cohérence
      const normalizedFormat = format === 'excel' ? 'xlsx' : format;
      track('export_triggered', {
        format: normalizedFormat,
        routeKey,
      });
    },

    /**
     * Tracker un clic sur un KPI
     * Phase P14: Observabilité produit
     */
    onKpiClick: (kpiId: string, value?: number | string) => {
      track('kpi_click', {
        kpiId,
        value,
      });
    },

    /**
     * Tracker l'application d'un filtre
     * Phase P14: Observabilité produit
     */
    onFilter: (name: string, value: any) => {
      track('filter_applied', {
        filterName: name,
        filterValue: value,
      });
    },

    /**
     * Tracker un drilldown (navigation depuis un KPI)
     * Phase P14: Observabilité produit
     */
    onDrilldown: (kpiId: string, targetRoute: string) => {
      track('kpi_drilldown', {
        kpiId,
        targetRoute,
      });
    },
  };
}
