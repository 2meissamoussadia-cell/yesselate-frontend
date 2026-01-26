/**
 * Page KPIs Stocks
 * Vue détaillée des indicateurs de performance des stocks
 */

'use client';

import React, { memo } from 'react';
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import type { KpisStocksData } from '../../types/dashboard.readmodels';
import { DashboardPageLayout, DashboardSection, DashboardGrid, DashboardPanel, KPICard } from '../shared';
import { formatKPICurrency, formatKPIPercentage } from '../../utils/kpi';
import { LineChartLazy } from '../../charts/ChartKit/LineChart';
import { ChartContainer } from '../../charts/ChartKit/ChartContainer';
import type { ChartData } from '../../charts/ChartKit/types';

interface StocksKpiPageProps {
  data?: KpisStocksData;
}

export const StocksKpiPage = memo(function StocksKpiPage({ data }: StocksKpiPageProps = {}) {
  const stocksData = data ?? {
    nbArticles: 0,
    ruptures: 0,
    ruptureRatio: 0,
    valeurStockHt: 0,
    trends: [],
  };

  const kpis: Array<{
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'emerald' | 'amber' | 'red';
    trend?: string;
  }> = [
    {
      label: 'Articles en stock',
      value: stocksData.nbArticles,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Ruptures',
      value: stocksData.ruptures,
      icon: AlertTriangle,
      color: stocksData.ruptures > 0 ? 'red' : 'emerald',
    },
    {
      label: 'Taux de rupture',
      value: formatKPIPercentage(stocksData.ruptureRatio),
      icon: TrendingUp,
      color: stocksData.ruptureRatio > 0.1 ? 'red' : stocksData.ruptureRatio > 0.05 ? 'amber' : 'emerald',
    },
    {
      label: 'Valeur stock HT',
      value: formatKPICurrency(stocksData.valeurStockHt),
      icon: DollarSign,
      color: 'blue',
    },
  ];

  return (
    <DashboardPageLayout title="KPIs Stocks" description="Indicateurs de performance des stocks">
      <DashboardSection>
        <DashboardGrid cols={4}>
          {kpis.map((kpi, idx) => (
            <KPICard
              key={idx}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              trend={kpi.trend}
            />
          ))}
        </DashboardGrid>
      </DashboardSection>

      {stocksData.trends && stocksData.trends.length > 0 && (
        <DashboardSection>
          <DashboardPanel>
            <ChartContainer title="Évolution des mouvements (30 derniers jours)">
              <LineChartLazy
                data={stocksData.trends.map(t => ({
                  date: t.date,
                  entree_qte: t.entree_qte,
                  sortie_qte: t.sortie_qte,
                })) as unknown as ChartData}
              />
            </ChartContainer>
          </DashboardPanel>
        </DashboardSection>
      )}
    </DashboardPageLayout>
  );
});
