/**
 * Page Vue d'ensemble Matériel
 * Vue principale du parc matériel et maintenance
 */

'use client';

import { Wrench, AlertCircle, Wrench as BacklogIcon, CheckCircle2 } from 'lucide-react';
import { KPICard } from '../shared';
import { toneToColor } from '@/lib/dashboard/kpi';

export function MaterielOverviewPage({ data }: any) {
  const kpis = [
    {
      id: 'count',
      label: 'Matériel',
      value: data?.nb_materiel ?? 0,
      color: toneToColor('info'),
      icon: Wrench,
    },
    {
      id: 'maint',
      label: 'Maint. ouvertes',
      value: data?.maintenance_ouverte ?? 0,
      color: toneToColor('warn'),
      icon: AlertCircle,
    },
    {
      id: 'back',
      label: 'Backlog curatif',
      value: data?.backlog_curatif ?? 0,
      color: toneToColor('crit'),
      icon: BacklogIcon,
    },
    {
      id: 'dispo',
      label: 'Taux dispo',
      value: `${Math.round((data?.taux_dispo ?? 0) * 100)}%`,
      color: toneToColor('ok'),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <KPICard key={k.id} kpi={{ ...k, trend: 0 }} size="md" />
      ))}
    </div>
  );
}
