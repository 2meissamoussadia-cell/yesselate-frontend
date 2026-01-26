/**
 * Page Overview Achats/Contrats (Phase P5)
 * Vue d'ensemble avec KPIs principaux et graphique de tendances
 */

'use client';

import React from 'react';
import { ChartContainer, AreaChart } from '@/modules/dashboard/charts/ChartKit';
import { KPICard } from '../shared';
import { parseTrendPercent, toneToColor } from '@/lib/dashboard/kpi';
import type { KpisAchatsData } from '../../types/dashboard.readmodels';

interface AchatsOverviewPageProps {
  data?: KpisAchatsData | {
    lead_time_j?: number | null;
    conformite_ratio?: number;
    price_variance_ratio?: number;
    spend_30d_ht?: number;
    trends?: Array<{ date: string; bc_emis?: number; bl_recus?: number; spend_ht?: number; bcEmis?: number; blRecus?: number; spendHt?: number }>;
  };
}

export function AchatsOverviewPage({ data }: AchatsOverviewPageProps = {}) {
  // Normaliser les données (support camelCase et snake_case)
  const normalizedData = React.useMemo(() => {
    if (!data) return null;

    // Si c'est déjà KpisAchatsData (camelCase)
    if ('leadTimeJours' in data || 'conformiteRatio' in data) {
      const d = data as KpisAchatsData;
      return {
        lead_time_j: d.leadTimeJours ?? null,
        conformite_ratio: d.conformiteRatio ?? 0,
        price_variance_ratio: d.priceVarianceRatio ?? 0,
        spend_30d_ht: d.spend30dHt ?? 0,
        trends: d.trends?.map(t => ({
          date: t.date,
          bc_emis: t.bcEmis ?? 0,
          bl_recus: t.blRecus ?? 0,
          spend_ht: t.spendHt ?? 0,
        })) ?? [],
      };
    }

    // Sinon, utiliser tel quel (snake_case depuis API)
    const snakeCaseData = data as Extract<typeof data, { lead_time_j?: number | null }>;
    return {
      lead_time_j: snakeCaseData.lead_time_j ?? null,
      conformite_ratio: snakeCaseData.conformite_ratio ?? 0,
      price_variance_ratio: snakeCaseData.price_variance_ratio ?? 0,
      spend_30d_ht: snakeCaseData.spend_30d_ht ?? 0,
      trends: snakeCaseData.trends ?? [],
    };
  }, [data]);

  const kpis = React.useMemo(() => [
    {
      id: 'lt',
      label: 'Lead time moyen (j)',
      value: normalizedData?.lead_time_j ?? '—',
      trend: 0,
      color: toneToColor('info'),
    },
    {
      id: 'otif',
      label: 'Conformité (OTIF)',
      value: `${Math.round((normalizedData?.conformite_ratio ?? 0) * 100)}%`,
      trend: 0,
      color: toneToColor('ok'),
    },
    {
      id: 'var',
      label: 'Variance prix',
      value: `${Math.round((normalizedData?.price_variance_ratio ?? 0) * 100)}%`,
      trend: 0,
      color: toneToColor('warn'),
    },
    {
      id: 'spend',
      label: 'Dépenses 30j',
      value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(normalizedData?.spend_30d_ht ?? 0),
      trend: 0,
      color: toneToColor('info'),
    },
  ], [normalizedData]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KPICard
            key={k.id}
            kpi={{
              id: k.id,
              label: k.label,
              value: k.value,
              trend: parseTrendPercent(k.trend),
              trendType: 'neutral',
              color: k.color,
            }}
            size="md"
          />
        ))}
      </div>

      {normalizedData?.trends && normalizedData.trends.length > 0 && (
        <ChartContainer title="Tendances Achats (30 jours)">
          <AreaChart
            data={normalizedData.trends}
            series={[
              { key: 'bc_emis', label: 'BC émis', color: '#3b82f6' },
              { key: 'bl_recus', label: 'BL reçus', color: '#10b981' },
              { key: 'spend_ht', label: 'Dépenses', color: '#f59e0b' },
            ]}
          />
        </ChartContainer>
      )}
    </div>
  );
}

export default AchatsOverviewPage;
