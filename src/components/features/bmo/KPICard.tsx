'use client';

/**
 * KPICard — Ré-export du composant KPICard principal pour compatibilité.
 * @deprecated Utiliser directement '@/modules/dashboard/components/shared/KPICard'
 */

import { memo } from 'react';
import { KPICard as DashboardKPICard, type KPICardData, type KPICardProps as DashboardKPICardProps, sanitizeKpiValue } from '@/modules/dashboard/components/shared/KPICard';

// Ré-exports pour compatibilité
export { DashboardKPICard as KPICardShared, sanitizeKpiValue };
export type { KPICardData, DashboardKPICardProps };

// Interface legacy pour compatibilité avec les anciens usages
interface LegacyKPICardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  up?: boolean;
  color: string;
  sub?: string;
  onClick?: () => void;
  className?: string;
}

const colorMap: Record<string, KPICardData['color']> = {
  '#10b981': 'emerald',
  '#3b82f6': 'blue',
  '#f59e0b': 'amber',
  '#ef4444': 'rose',
  '#8b5cf6': 'purple',
  '#06b6d4': 'cyan',
};

/**
 * @deprecated Utiliser KPICardShared avec l'interface KPICardData
 */
export const KPICard = memo(function KPICard({
  icon,
  label,
  value,
  trend,
  up,
  color,
  sub,
  onClick,
  className,
}: LegacyKPICardProps) {
  // Convertir en format KPICardData
  const kpi: KPICardData = {
    id: label.replace(/\s+/g, '-').toLowerCase(),
    label,
    value,
    trend: trend ? (up ? 5 : -5) : undefined,
    trendType: up === true ? 'up' : up === false ? 'down' : 'neutral',
    color: colorMap[color] ?? 'blue',
    description: sub ?? trend,
    onClick,
  };

  return <DashboardKPICard kpi={kpi} size="md" className={className} />;
});
