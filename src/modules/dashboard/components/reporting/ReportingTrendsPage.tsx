/**
 * Page Reporting Tendances Mensuelles (Phase P7)
 * Série temporelle 12 derniers mois pour pilotage CODIR
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { ChartContainer, AreaChart } from '@/modules/dashboard/charts/ChartKit';
import { ExportButton } from '../shared/ExportButton';
import type { ReportingOverviewMonthlyData } from '../../types/dashboard.readmodels';

interface ReportingTrendsPageProps {
  data?: ReportingOverviewMonthlyData[] | Array<{
    mois?: string;
    productionHt?: number;
    factureHt?: number;
    encaisseHt?: number;
    rapHt?: number;
    rafHt?: number;
  }>;
}

export function ReportingTrendsPage({ data }: ReportingTrendsPageProps = {}) {
  // Normaliser les données
  const normalizedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((d: any) => ({
      mois: d.mois ?? d.moisDate ?? '',
      production_ht: d.productionHt ?? d.production_ht ?? 0,
      facture_ht: d.factureHt ?? d.facture_ht ?? 0,
      encaisse_ht: d.encaisseHt ?? d.encaisse_ht ?? 0,
      rap_ht: d.rapHt ?? d.rap_ht ?? 0,
      raf_ht: d.rafHt ?? d.raf_ht ?? 0,
    }));
  }, [data]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const csvContent = [
      ['Mois', 'Production (€)', 'Factures (€)', 'Encaissements (€)', 'RAP (€)', 'RàF (€)'].join(','),
      ...normalizedData.map((d) =>
        [
          d.mois,
          d.production_ht,
          d.facture_ht,
          d.encaisse_ht,
          d.rap_ht,
          d.raf_ht,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporting-tendances-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [normalizedData]);

  // Export JSON
  const handleExportJSON = useCallback(() => {
    const jsonContent = JSON.stringify(normalizedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporting-tendances-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [normalizedData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Tendances mensuelles</h1>
          <p className="text-slate-400 text-sm">Évolution sur 12 derniers mois pour pilotage CODIR</p>
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
      </div>

      {normalizedData.length > 0 && (
        <>
          <ChartContainer title="Évolution Production & Facturation (12 mois)">
            <AreaChart
              data={normalizedData}
              series={[
                { key: 'production_ht', label: 'Production réalisée', color: '#10b981' },
                { key: 'facture_ht', label: 'Factures émises', color: '#3b82f6' },
                { key: 'encaisse_ht', label: 'Encaissements', color: '#8b5cf6' },
              ]}
            />
          </ChartContainer>

          <ChartContainer title="Reste à Produire & Reste à Facturer (12 mois)">
            <AreaChart
              data={normalizedData}
              series={[
                { key: 'rap_ht', label: 'RAP (Reste à Produire)', color: '#f59e0b' },
                { key: 'raf_ht', label: 'RàF (Reste à Facturer)', color: '#ec4899' },
              ]}
            />
          </ChartContainer>
        </>
      )}

      {normalizedData.length === 0 && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
          <p className="text-slate-400">Aucune donnée de tendances disponible</p>
        </div>
      )}
    </div>
  );
}

export default ReportingTrendsPage;
