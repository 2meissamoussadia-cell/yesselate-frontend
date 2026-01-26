/**
 * Page Tendances Stocks
 * Évolution des mouvements de stock sur 30 jours
 */

'use client';

import { ChartContainer } from '@/modules/dashboard/charts/ChartKit/ChartContainer';
import { AreaChartLazy } from '@/modules/dashboard/charts/ChartKit/AreaChart';

export function StocksTrendsPage({ data }: any) {
  return (
    <ChartContainer title="Flux stock (30 jours)">
      <AreaChartLazy
        data={data}
        series={[
          { key: 'entree_qte', label: 'Entrées', color: '#10b981' },
          { key: 'sortie_qte', label: 'Sorties', color: '#ef4444' },
        ]}
      />
    </ChartContainer>
  );
}
