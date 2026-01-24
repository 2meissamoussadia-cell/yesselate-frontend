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

const mapTone = (c?: KPICardData['color']): 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate' => {
  switch (c) {
    case 'blue':
      return 'blue';
    case 'emerald':
      return 'emerald';
    case 'amber':
      return 'amber';
    case 'purple':
      return 'purple';
    case 'rose':
      return 'red';
    case 'cyan':
      return 'blue';
    default:
      return 'slate';
  }
};

export const KPICard = memo(function KPICard({ kpi, size = 'md', className }: KPICardProps) {
  const trendLabel =
    typeof kpi.trend === 'number'
      ? `${kpi.trend > 0 ? '+' : kpi.trend < 0 ? '-' : ''}${Math.abs(kpi.trend)}%`
      : undefined;

  const dir = kpi.trendType === 'up' ? 'up' : kpi.trendType === 'down' ? 'down' : 'flat';
  const sentiment = kpi.trendType === 'up' ? 'good' : kpi.trendType === 'down' ? 'bad' : 'neutral';

  return (
    <KpiStatCard
      label={kpi.label}
      value={kpi.value}
      icon={kpi.icon}
      tone={mapTone(kpi.color)}
      description={kpi.description}
      trendLabel={trendLabel}
      trendDirection={dir}
      trendSentiment={sentiment}
      sparkline={kpi.sparkline}
      size={size}
      onClick={kpi.onClick}
      className={className}
    />
  );
});
