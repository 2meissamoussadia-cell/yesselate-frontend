/**
 * Utilitaires de Transformation de Données Analytics
 * Transforme les données brutes en formats utilisables par les composants
 */

import type { TrendData } from '@/lib/services/analyticsDataService';

// ═══════════════════════════════════════════════════════════════════════════
// TRANSFORMATIONS DE DONNÉES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Transforme les données de tendance pour Recharts
 */
export function transformTrendDataForChart(
  data: TrendData[],
  valueKey: string = 'value',
  dateKey: string = 'date'
): Array<{ date: string; value: number; value_prev?: number; [key: string]: any }> {
  return data.map((item) => ({
    ...item,
    date: item[dateKey] ?? item.date ?? '',
    value: item[valueKey] ?? item.value ?? 0,
    value_prev: item.value_prev ?? item.previous ?? undefined,
  }));
}

/**
 * Transforme les données pour un graphique en donut/pie
 */
export function transformDataForDonut(
  data: Array<{ [key: string]: any }>,
  valueKey: string,
  labelKey: string
): Array<{ name: string; value: number }> {
  return data.map((item) => ({
    name: item[labelKey] || item.name || '',
    value: item[valueKey] || item.value || item.count || 0,
  }));
}

/**
 * Transforme les données pour un graphique en barres
 */
export function transformDataForBar(
  data: Array<{ [key: string]: any }>,
  xKey: string,
  yKey: string
): Array<{ name: string; value: number; [key: string]: any }> {
  return data.map((item) => ({
    name: item[xKey] || item.name || '',
    value: item[yKey] || item.value || 0,
    ...item,
  }));
}

/**
 * Agrège les données par période
 */
export function aggregateDataByPeriod(
  data: TrendData[],
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): TrendData[] {
  const grouped = new Map<string, { values: number[]; prevValues: number[] }>();

  data.forEach((item) => {
    const date = new Date(item.date);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped.has(key)) {
      grouped.set(key, { values: [], prevValues: [] });
    }

    const group = grouped.get(key)!;
    group.values.push(item.value || 0);
    if (item.value_prev !== undefined) {
      group.prevValues.push(item.value_prev);
    }
  });

  return Array.from(grouped.entries()).map(([key, group]) => ({
    date: key,
    value: group.values.reduce((a, b) => a + b, 0) / group.values.length,
    value_prev:
      group.prevValues.length > 0
        ? group.prevValues.reduce((a, b) => a + b, 0) / group.prevValues.length
        : undefined,
  }));
}

/**
 * Calcule les statistiques d'une série de données
 */
export function calculateStatistics(data: number[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
} {
  if (data.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return { mean, median, min, max, stdDev };
}

/**
 * Formate une valeur selon son type
 */
export function formatValue(value: number, unit?: string, decimals: number = 2): string {
  if (unit === 'FCFA' || unit === '€' || unit === '$') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: unit === 'FCFA' ? 'XOF' : unit === '€' ? 'EUR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (unit === '%') {
    return `${value.toFixed(decimals)}%`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }

  return value.toFixed(decimals);
}

/**
 * Calcule la tendance entre deux valeurs
 */
export function calculateTrend(current: number, previous: number): {
  value: number;
  isPositive: boolean;
  percentage: number;
} {
  if (previous === 0) {
    return { value: 0, isPositive: true, percentage: 0 };
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;
  const isPositive = diff >= 0;

  return {
    value: Math.abs(diff),
    isPositive,
    percentage: Math.abs(percentage),
  };
}

/**
 * Détermine le statut d'un KPI selon sa valeur et sa cible
 */
export function getKPIStatus(
  value: number,
  target?: number,
  thresholds?: { warning: number; critical: number }
): 'good' | 'warning' | 'critical' {
  if (!target) {
    return 'good';
  }

  const percentage = (value / target) * 100;
  const warningThreshold = thresholds?.warning || 80;
  const criticalThreshold = thresholds?.critical || 60;

  if (percentage >= warningThreshold) {
    return 'good';
  }
  if (percentage >= criticalThreshold) {
    return 'warning';
  }
  return 'critical';
}

/**
 * Filtre les données selon des critères
 */
export function filterData<T extends Record<string, any>>(
  data: T[],
  filters: Record<string, any>
): T[] {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }

      const itemValue = item[key];
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }

      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }

      return itemValue === value;
    });
  });
}

/**
 * Trie les données
 */
export function sortData<T extends Record<string, any>>(
  data: T[],
  sortKey: string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue === bValue) {
      return 0;
    }

    const comparison = aValue > bValue ? 1 : -1;
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Groupe les données par une clé
 */
export function groupDataBy<T extends Record<string, any>>(
  data: T[],
  key: string
): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const groupKey = String(item[key] || 'other');
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

