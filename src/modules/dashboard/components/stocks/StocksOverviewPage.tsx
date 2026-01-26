/**
 * Page Vue d'ensemble Stocks
 * Vue principale des indicateurs de performance des stocks
 */

'use client';

import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { KPICard } from '../shared';
import { toneToColor } from '@lib-root/dashboard/kpi';

export function StocksOverviewPage({ data }: any) {
  const kpis = [
    {
      id: 'nb',
      label: 'Articles',
      value: data?.nb_articles ?? 0,
      color: toneToColor('info'),
      icon: Package,
    },
    {
      id: 'rupt',
      label: 'Ruptures',
      value: data?.ruptures ?? 0,
      color: toneToColor('crit'),
      icon: AlertTriangle,
    },
    {
      id: 'taux',
      label: 'Taux rupture',
      value: `${Math.round((data?.rupture_ratio ?? 0) * 100)}%`,
      color: toneToColor('warn'),
      icon: TrendingUp,
    },
    {
      id: 'val',
      label: 'Valeur stock',
      value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
        data?.valeur_stock_ht ?? 0
      ),
      color: toneToColor('info'),
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <KPICard key={k.id} kpi={{ id: k.id, label: k.label, value: k.value, color: k.color, icon: k.icon }} size="md" />
      ))}
    </div>
  );
}
