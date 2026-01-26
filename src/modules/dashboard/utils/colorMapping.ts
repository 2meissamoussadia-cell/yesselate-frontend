/**
 * Utilitaires de mapping de couleurs pour les KPIs
 * Centralise la logique de conversion des couleurs vers les tons KpiStatCard
 * 
 * DESIGN SYSTEM DATA - Source de vérité unique pour les KPIs
 */

import { formatCurrency as formatCurrencyUtil } from '@/application/utils/formatUtils';

export type KPICardColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan' | 'red' | 'orange' | 'slate';
export type KpiStatCardTone = 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';

/**
 * Type pour les tonalités KPI (ok, warn, crit, info)
 */
export type KPITone = 'ok' | 'warn' | 'crit' | 'info';

/**
 * Type pour les directions de tendance
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Convertit une couleur KPI vers un ton KpiStatCard
 * Gère tous les cas de mapping (orange -> amber, red -> rose, purple -> violet, etc.)
 */
export function mapColorToTone(color?: KPICardColor): KpiStatCardTone {
  switch (color) {
    case 'blue':
      return 'blue';
    case 'emerald':
      return 'emerald';
    case 'cyan':
      return 'cyan';
    case 'amber':
      return 'amber';
    case 'orange':
      return 'amber';
    case 'red':
      return 'rose';
    case 'rose':
      return 'rose';
    case 'purple':
      return 'violet';
    case 'slate':
      return 'slate';
    default:
      return 'slate';
  }
}

/**
 * Convertit une tonalité KPI (ok, warn, crit, info) vers une couleur KpiStatCard
 * Mapping centralisé pour cohérence visuelle
 */
export function mapToneToColor(tone?: KPITone): KpiStatCardTone {
  switch (tone) {
    case 'ok':
      return 'emerald';
    case 'warn':
      return 'amber';
    case 'crit':
      return 'rose';
    case 'info':
    default:
      return 'blue';
  }
}

/**
 * Convertit un trend string (ex: "+12%", "-5%", "—") en nombre
 * Gère tous les formats possibles de tendance
 */
export function parseTrendPercent(trend?: string | number): number {
  if (typeof trend === 'number') return trend;
  if (!trend) return 0;
  
  const cleaned = String(trend)
    .replace('%', '')
    .replace(/\s/g, '')
    .replace('—', '0')
    .replace('+', '');
  
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Détermine la direction d'une tendance à partir d'une valeur
 */
export function getTrendDirection(value: number): TrendDirection {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'neutral';
}

/**
 * Formate une valeur monétaire (FCFA par défaut)
 * Utilise le formatCurrency centralisé de formatUtils
 */
export function formatMoneyXOF(amount: number | null | undefined): string {
  return formatCurrencyUtil(amount, 'FCFA');
}

/**
 * Formate une valeur monétaire en EUR
 */
export function formatMoneyEUR(amount: number | null | undefined): string {
  return formatCurrencyUtil(amount, 'EUR');
}

/**
 * Formate une valeur monétaire avec devise personnalisée
 */
export function formatMoney(amount: number | null | undefined, currency: 'XOF' | 'EUR' | 'FCFA' = 'FCFA'): string {
  return formatCurrencyUtil(amount, currency);
}

/**
 * Formate une valeur monétaire compacte (ex: "1.5M", "250K")
 */
export function formatMoneyCompact(amount: number | null | undefined, currency: string = 'FCFA'): string {
  if (amount == null || isNaN(amount)) return '—';
  
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1_000_000) {
    return `${sign}${(absAmount / 1_000_000).toFixed(1)}M ${currency}`;
  }
  if (absAmount >= 1_000) {
    return `${sign}${Math.round(absAmount / 1_000)}K ${currency}`;
  }
  return `${sign}${Math.round(absAmount)} ${currency}`;
}
