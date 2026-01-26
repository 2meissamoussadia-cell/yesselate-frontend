'use client';

import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { KpiStatCard } from './KpiStatCard';

export interface KPICardProps {
  kpi: KPICardData;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  trend?: number;
  trendType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  description?: string;
  onClick?: () => void;
  sparkline?: number[];
}

const mapTone = (c?: KPICardData['color']): 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' => {
  switch (c) {
    case 'blue':
      return 'blue';
    case 'emerald':
      return 'emerald';
    case 'amber':
      return 'amber';
    case 'purple':
      return 'violet';
    case 'rose':
      return 'rose';
    case 'cyan':
      return 'cyan';
    default:
      return 'slate';
  }
};

export const KPICard = memo(function KPICard({ kpi, size = 'md', className }: KPICardProps) {
  // Convertir trend en nombre pour KpiStatCard
  const trend = typeof kpi.trend === 'number' ? kpi.trend : 0;
  
  // Calculer trendDirection : utiliser trendType si fourni, sinon déduire du trend
  const trendDirection: 'up' | 'down' | 'neutral' = (() => {
    if (kpi.trendType) {
      return kpi.trendType === 'up' ? 'up' : kpi.trendType === 'down' ? 'down' : 'neutral';
    }
    // Déduire du trend si trendType n'est pas fourni
    if (trend > 0) return 'up';
    if (trend < 0) return 'down';
    return 'neutral';
  })();

  // S'assurer que tone est valide
  const tone = mapTone(kpi.color);

  return (
    <KpiStatCard
      title={kpi.label}
      value={kpi.value}
      subtitle={kpi.description}
      icon={kpi.icon}
      tone={tone}
      trend={trend}
      trendDirection={trendDirection}
      tooltip={kpi.description}
      onClick={kpi.onClick}
      className={className}
    />
  );
});
