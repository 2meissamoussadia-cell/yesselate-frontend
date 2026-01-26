/**
 * Helpers centralisés pour les KPIs du Dashboard
 * 
 * SOURCE DE VÉRITÉ UNIQUE pour :
 * - Formatage des valeurs KPI (monétaire, pourcentage, etc.)
 * - Parsing des trends
 * - Mapping des couleurs/tonalités
 * - Calculs de tendances
 */

import { formatCurrency as formatCurrencyUtil } from '@/application/utils/formatUtils';
import type { TrendDirection, KPICardColor, KpiStatCardTone, KPITone } from './colorMapping';
import { 
  parseTrendPercent, 
  getTrendDirection, 
  mapColorToTone, 
  mapToneToColor 
} from './colorMapping';

// ============================================================================
// Types KPI
// ============================================================================

/**
 * Structure d'un KPI standard
 */
export interface KPI {
  id: string;
  label: string;
  value: string | number;
  trend?: string | number;
  trendDirection?: TrendDirection;
  icon?: React.ComponentType<{ className?: string }>;
  color?: KPICardColor;
  tone?: KPITone;
  description?: string;
  unit?: string;
  sparkline?: number[];
}

/**
 * Données brutes d'un KPI avant formatage
 */
export interface RawKPI {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  trend?: string | number;
  unit?: 'currency' | 'percentage' | 'number' | 'days' | 'hours';
  currency?: 'XOF' | 'EUR' | 'FCFA';
  icon?: React.ComponentType<{ className?: string }>;
  color?: KPICardColor;
  tone?: KPITone;
  description?: string;
}

// ============================================================================
// Formatage des valeurs
// ============================================================================

/**
 * Formate une valeur monétaire selon la devise
 * 
 * @param amount - Montant à formater
 * @param currency - Devise (XOF/FCFA par défaut, EUR)
 * @returns Chaîne formatée (ex: "1 234 567 FCFA")
 */
export function formatKPICurrency(
  amount: number | null | undefined,
  currency: 'XOF' | 'EUR' | 'FCFA' = 'FCFA'
): string {
  return formatCurrencyUtil(amount, currency);
}

/**
 * Formate une valeur en pourcentage
 * 
 * @param value - Valeur entre 0 et 1 ou pourcentage
 * @param asDecimal - Si true, value est entre 0-1, sinon c'est déjà un pourcentage
 * @returns Chaîne formatée (ex: "67%")
 */
export function formatKPIPercentage(
  value: number | null | undefined,
  asDecimal: boolean = false
): string {
  if (value == null || isNaN(value)) return '—';
  const percent = asDecimal ? value * 100 : value;
  return `${Math.round(percent * 10) / 10}%`;
}

/**
 * Formate une valeur numérique avec unité
 * 
 * @param value - Valeur numérique
 * @param unit - Unité (jours, heures, etc.)
 * @param decimals - Nombre de décimales (défaut: 0)
 * @returns Chaîne formatée (ex: "3.5 jours")
 */
export function formatKPIValue(
  value: number | null | undefined,
  unit?: string,
  decimals: number = 0
): string {
  if (value == null || isNaN(value)) return '—';
  const formatted = decimals > 0 
    ? value.toFixed(decimals) 
    : Math.round(value).toString();
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Formate une valeur compacte (K, M, etc.)
 * 
 * @param value - Valeur numérique
 * @param unit - Unité optionnelle
 * @returns Chaîne formatée (ex: "1.5M", "250K")
 */
export function formatKPICompact(
  value: number | null | undefined,
  unit?: string
): string {
  if (value == null || isNaN(value)) return '—';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M${unit ? ` ${unit}` : ''}`;
  }
  if (absValue >= 1_000) {
    return `${sign}${Math.round(absValue / 1_000)}K${unit ? ` ${unit}` : ''}`;
  }
  return `${sign}${Math.round(absValue)}${unit ? ` ${unit}` : ''}`;
}

// ============================================================================
// Parsing et calcul des trends
// ============================================================================

/**
 * Parse un trend string en nombre
 * Gère les formats: "+12%", "-5%", "—", "+2", "-1.3j", etc.
 * 
 * @param trend - Trend à parser (string ou number)
 * @returns Nombre parsé (0 si invalide)
 */
export function parseKPITrend(trend?: string | number): number {
  return parseTrendPercent(trend);
}

/**
 * Calcule la direction d'une tendance à partir d'une valeur
 * 
 * @param value - Valeur numérique de la tendance
 * @returns Direction ('up', 'down', ou 'neutral')
 */
export function calculateTrendDirection(value: number): TrendDirection {
  return getTrendDirection(value);
}

/**
 * Calcule une tendance à partir de valeurs actuelles et précédentes
 * 
 * @param current - Valeur actuelle
 * @param previous - Valeur précédente
 * @param asPercentage - Si true, retourne en pourcentage, sinon valeur absolue
 * @returns Objet avec change, changePercent, et direction
 */
export function calculateTrend(
  current: number,
  previous: number,
  asPercentage: boolean = true
): {
  change: number;
  changePercent: number;
  direction: TrendDirection;
} {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  
  return {
    change: asPercentage ? changePercent : change,
    changePercent,
    direction: getTrendDirection(changePercent),
  };
}

/**
 * Formate un trend pour affichage
 * 
 * @param trend - Valeur du trend (number ou string)
 * @param showSign - Si true, affiche toujours le signe + pour les valeurs positives
 * @returns Chaîne formatée (ex: "+12%", "-5%", "—")
 */
export function formatKPITrend(
  trend?: string | number,
  showSign: boolean = true
): string {
  if (trend == null) return '—';
  
  const numTrend = parseKPITrend(trend);
  if (numTrend === 0) return '—';
  
  const sign = showSign && numTrend > 0 ? '+' : '';
  return `${sign}${Math.round(numTrend * 10) / 10}%`;
}

// ============================================================================
// Mapping des couleurs et tonalités
// ============================================================================

/**
 * Convertit une couleur KPI vers un ton KpiStatCard
 * 
 * @param color - Couleur KPI
 * @returns Ton KpiStatCard correspondant
 */
export function mapKPIColorToTone(color?: KPICardColor): KpiStatCardTone {
  return mapColorToTone(color);
}

/**
 * Convertit une tonalité KPI vers une couleur KpiStatCard
 * 
 * @param tone - Tonalité KPI (ok, warn, crit, info)
 * @returns Couleur KpiStatCard correspondante
 */
export function mapKPIToneToColor(tone?: KPITone): KpiStatCardTone {
  return mapToneToColor(tone);
}

/**
 * Détermine la tonalité d'un KPI à partir de sa valeur et seuils
 * 
 * @param value - Valeur du KPI
 * @param thresholds - Seuils { warn, crit } (optionnels)
 * @param higherIsBetter - Si true, valeurs élevées = ok, sinon inversé
 * @returns Tonalité ('ok', 'warn', 'crit', ou 'info')
 */
export function determineKPITone(
  value: number,
  thresholds?: { warn?: number; crit?: number },
  higherIsBetter: boolean = true
): KPITone {
  if (!thresholds) return 'info';
  
  const { warn, crit } = thresholds;
  
  if (higherIsBetter) {
    if (crit != null && value <= crit) return 'crit';
    if (warn != null && value <= warn) return 'warn';
    return 'ok';
  } else {
    if (crit != null && value >= crit) return 'crit';
    if (warn != null && value >= warn) return 'warn';
    return 'ok';
  }
}

// ============================================================================
// Transformation de KPIs bruts vers formatés
// ============================================================================

/**
 * Transforme un KPI brut en KPI formaté
 * 
 * @param raw - KPI brut
 * @returns KPI formaté prêt pour l'affichage
 */
export function formatRawKPI(raw: RawKPI): KPI {
  // Formater la valeur selon l'unité
  let formattedValue: string;
  switch (raw.unit) {
    case 'currency':
      formattedValue = formatKPICurrency(raw.value, raw.currency);
      break;
    case 'percentage':
      formattedValue = formatKPIPercentage(raw.value, true);
      break;
    case 'days':
      formattedValue = formatKPIValue(raw.value, 'j', 1);
      break;
    case 'hours':
      formattedValue = formatKPIValue(raw.value, 'h', 1);
      break;
    default:
      formattedValue = formatKPIValue(raw.value);
  }
  
  // Calculer le trend si nécessaire
  let trend: string | number | undefined = raw.trend;
  let trendDirection: TrendDirection | undefined;
  
  if (raw.previousValue != null && trend == null) {
    const calculated = calculateTrend(raw.value, raw.previousValue);
    trend = calculated.changePercent;
    trendDirection = calculated.direction;
  } else if (trend != null) {
    trendDirection = calculateTrendDirection(parseKPITrend(trend));
  }
  
  return {
    id: raw.id,
    label: raw.label,
    value: formattedValue,
    trend,
    trendDirection,
    icon: raw.icon,
    color: raw.color,
    tone: raw.tone,
    description: raw.description,
  };
}

// ============================================================================
// Helpers pour les KPIs métier BTP
// ============================================================================

/**
 * Calcule l'avancement moyen des chantiers
 * 
 * @param projets - Liste des projets avec leur avancement (0-100)
 * @returns Avancement moyen en pourcentage
 */
export function calculateAvancementMoyen(projets: Array<{ avancement: number }>): number {
  if (!projets || projets.length === 0) return 0;
  const total = projets.reduce((sum, p) => sum + p.avancement, 0);
  return total / projets.length;
}

/**
 * Calcule le pourcentage de budget consommé
 * 
 * @param consomme - Budget consommé
 * @param alloue - Budget alloué
 * @returns Pourcentage (0-100)
 */
export function calculateBudgetConsomme(consomme: number, alloue: number): number {
  if (!alloue || alloue === 0) return 0;
  return (consomme / alloue) * 100;
}

/**
 * Calcule le reste à engager
 * 
 * @param alloue - Budget alloué
 * @param consomme - Budget consommé
 * @param engage - Budget engagé
 * @returns Reste à engager
 */
export function calculateResteAEngager(
  alloue: number,
  consomme: number,
  engage: number
): number {
  return alloue - consomme - engage;
}

/**
 * Calcule la marge prévisionnelle
 * 
 * @param budget - Budget alloué
 * @param coutPrevu - Coût prévu
 * @returns Marge en pourcentage
 */
export function calculateMargePrevisionnelle(budget: number, coutPrevu: number): number {
  if (!budget || budget === 0) return 0;
  return ((budget - coutPrevu) / budget) * 100;
}

/**
 * Calcule le DSO (Days Sales Outstanding / Délai moyen de paiement)
 * 
 * @param creances - Montant des créances
 * @param chiffreAffaires - Chiffre d'affaires
 * @param periode - Période en jours (défaut: 30)
 * @returns DSO en jours
 */
export function calculateDSO(
  creances: number,
  chiffreAffaires: number,
  periode: number = 30
): number {
  if (!chiffreAffaires || chiffreAffaires === 0) return 0;
  return (creances / chiffreAffaires) * periode;
}
