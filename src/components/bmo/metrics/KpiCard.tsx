'use client';

/**
 * KpiCard BMO — Wrapper autour du KPICard dashboard (API simple : label, value, trend, variant).
 */

import React, { memo } from 'react';
import { BarChart2 } from 'lucide-react';
import { KPICard as DashboardKPICard } from '@/modules/dashboard/components/shared/KPICard';
import type { KPICardData } from '@/modules/dashboard/components/shared/KPICard';

export type KpiCardVariant = 'default' | 'success' | 'warning' | 'danger';

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend: string;
  variant?: KpiCardVariant;
  className?: string;
}

const variantToColor: Record<KpiCardVariant, KPICardData['color']> = {
  default: 'blue',
  success: 'emerald',
  warning: 'amber',
  danger: 'rose',
};

export const KpiCard = memo(function KpiCard({
  label,
  value,
  trend,
  variant = 'default',
  className,
}: KpiCardProps) {
  const kpi: KPICardData = {
    id: label.replace(/\s+/g, '-').toLowerCase(),
    label,
    value,
    icon: BarChart2,
    color: variantToColor[variant],
    description: trend,
  };
  return <DashboardKPICard kpi={kpi} size="md" className={className} />;
});
