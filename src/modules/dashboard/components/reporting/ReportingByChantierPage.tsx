/**
 * Page Reporting par Chantier (Phase P7)
 * Consolidation analytique mensuelle par chantier
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { ExportButton } from '../shared/ExportButton';
import { DashboardPanel } from '../shared';
import { ChartContainer, AreaChart } from '@/modules/dashboard/charts/ChartKit';
import type { ReportingByChantierMonthlyData } from '../../types/dashboard.readmodels';

interface ReportingByChantierPageProps {
  data?: ReportingByChantierMonthlyData[] | Array<{
    chantierCode?: string;
    mois?: string;
    productionHt?: number;
  }>;
}

export function ReportingByChantierPage({ data }: ReportingByChantierPageProps = {}) {
  // Normaliser les données
  const normalizedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((d: any) => ({
      chantier_code: d.chantierCode ?? d.chantier_code ?? '',
      mois: d.mois ?? '',
      production_ht: d.productionHt ?? d.production_ht ?? 0,
    }));
  }, [data]);

  // Grouper par chantier pour l'affichage
  const groupedByChantier = useMemo(() => {
    const grouped = new Map<string, Array<{ mois: string; production_ht: number }>>();
    
    normalizedData.forEach((d) => {
      if (!grouped.has(d.chantier_code)) {
        grouped.set(d.chantier_code, []);
      }
      grouped.get(d.chantier_code)!.push({ mois: d.mois, production_ht: d.production_ht });
    });

    return Array.from(grouped.entries()).map(([chantier_code, months]) => ({
      chantier_code,
      months: months.sort((a, b) => a.mois.localeCompare(b.mois)),
      total: months.reduce((sum, m) => sum + m.production_ht, 0),
    }));
  }, [normalizedData]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const csvContent = [
      ['Chantier', 'Mois', 'Production (€)'].join(','),
      ...normalizedData.map((d) =>
        [
          d.chantier_code,
          d.mois,
          d.production_ht,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporting-chantiers-${new Date().toISOString().split('T')[0]}.csv`;
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
    link.download = `reporting-chantiers-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [normalizedData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Consolidation par Chantier</h1>
          <p className="text-slate-400 text-sm">KPIs mensuels agrégés par chantier pour analyse détaillée</p>
        </div>
        <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groupedByChantier.map((chantier) => (
          <DashboardPanel key={chantier.chantier_code} padding="md">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-white truncate">{chantier.chantier_code}</h3>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Total</p>
                  <p className="text-lg font-semibold text-white">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(chantier.total)}
                  </p>
                </div>
              </div>

              {chantier.months.length > 0 && (
                <ChartContainer title={`Production mensuelle - ${chantier.chantier_code}`}>
                  <AreaChart
                    data={chantier.months}
                    series={[
                      { key: 'production_ht', label: 'Production (€)', color: '#10b981' },
                    ]}
                  />
                </ChartContainer>
              )}
            </div>
          </DashboardPanel>
        ))}
      </div>

      {groupedByChantier.length === 0 && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
          <p className="text-slate-400">Aucune donnée par chantier disponible</p>
        </div>
      )}
    </div>
  );
}

export default ReportingByChantierPage;
