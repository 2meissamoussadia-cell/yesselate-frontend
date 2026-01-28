/**
 * Utilitaires pour les KPIs du Dashboard
 * Types et fonctions pour gérer les tendances, tons et couleurs
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Direction de la tendance d'un KPI
 */
export type TrendDir = 'up' | 'down' | 'neutral';

/**
 * Ton/état d'un KPI (pour déterminer la couleur d'affichage)
 */
export type Tone = 'ok' | 'warn' | 'crit' | 'info';

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/**
 * Parse un pourcentage de tendance depuis une chaîne ou un nombre
 * 
 * @param s - Valeur à parser (string formatée comme "+5%", "-10%", ou nombre)
 * @returns Nombre représentant le pourcentage (0 si invalide)
 * 
 * @example
 * parseTrendPercent("+5%") // => 5
 * parseTrendPercent("-10.5%") // => -10.5
 * parseTrendPercent(15) // => 15
 * parseTrendPercent(undefined) // => 0
 */
export function parseTrendPercent(s: string | number | undefined): number {
  if (typeof s === 'number') return s;
  if (!s) return 0;
  
  // Extraire uniquement les chiffres, points décimaux et signes
  const n = parseFloat(String(s).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Convertit un ton en couleur Tailwind CSS
 * 
 * @param t - Ton du KPI
 * @returns Nom de la couleur Tailwind correspondante
 * 
 * @example
 * toneToColor('ok') // => 'emerald'
 * toneToColor('warn') // => 'amber'
 * toneToColor('crit') // => 'rose'
 * toneToColor('info') // => 'blue'
 */
export function toneToColor(t: Tone): 'emerald' | 'amber' | 'rose' | 'blue' {
  switch (t) {
    case 'ok':
      return 'emerald';
    case 'warn':
      return 'amber';
    case 'crit':
      return 'rose';
    default:
      return 'blue';
  }
}

/**
 * Convertit une couleur Tailwind en ton KPI
 * Helper pour migration depuis les anciens systèmes utilisant des couleurs
 * 
 * @param color - Couleur Tailwind ('emerald', 'amber', 'red', 'blue', etc.)
 * @returns Ton KPI correspondant
 * 
 * @example
 * colorToTone('emerald') // => 'ok'
 * colorToTone('amber') // => 'warn'
 * colorToTone('red') // => 'crit'
 * colorToTone('blue') // => 'info'
 */
export function colorToTone(color: string): Tone {
  switch (color) {
    case 'emerald':
    case 'green':
      return 'ok';
    case 'amber':
    case 'orange':
    case 'yellow':
      return 'warn';
    case 'red':
    case 'rose':
      return 'crit';
    default:
      return 'info';
  }
}

/**
 * Normalise une couleur vers le type attendu par KPICardData ou KpiStatCard
 * Convertit les couleurs non standardisées (red -> rose, etc.)
 * 
 * @param color - Couleur à normaliser
 * @returns Couleur normalisée compatible avec KPICardData/KpiStatCard
 * 
 * @example
 * normalizeKPIColor('red') // => 'rose'
 * normalizeKPIColor('emerald') // => 'emerald'
 * normalizeKPIColor('orange') // => 'amber'
 * normalizeKPIColor('purple') // => 'violet' (pour KpiStatCard)
 */
export function normalizeKPIColor(
  color: string
): 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'slate' {
  switch (color) {
    case 'emerald':
    case 'green':
      return 'emerald';
    case 'amber':
    case 'orange':
    case 'yellow':
      return 'amber';
    case 'red':
    case 'rose':
      return 'rose';
    case 'purple':
    case 'violet':
      return 'violet';
    case 'cyan':
      return 'cyan';
    case 'slate':
      return 'slate';
    default:
      return 'blue';
  }
}

/**
 * Formate une valeur monétaire avec la devise spécifiée
 * 
 * @param value - Montant à formater
 * @param currency - Devise ('XOF' ou 'EUR', par défaut 'XOF')
 * @returns Chaîne formatée avec la devise
 * 
 * @example
 * formatCurrency(1000000, 'XOF') // => "1 000 000 FCFA"
 * formatCurrency(1500.50, 'EUR') // => "1 500,50 €"
 */
export function formatCurrency(value: number | null | undefined, currency: 'XOF' | 'EUR' = 'XOF'): string {
  if (value == null || isNaN(value)) return '—';
  
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'XOF' ? 0 : 2,
  }).format(value);
  
  // Remplacer XOF par FCFA pour cohérence avec le reste de l'application
  return currency === 'XOF' ? formatted.replace('XOF', 'FCFA') : formatted;
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
 * Formate une valeur monétaire compacte (ex: "1.5M FCFA", "250K FCFA")
 * 
 * @param amount - Montant à formater
 * @param currency - Devise (par défaut 'FCFA')
 * @returns Chaîne formatée compacte
 * 
 * @example
 * formatMoneyCompact(1500000, 'FCFA') // => "1.5M FCFA"
 * formatMoneyCompact(250000, 'FCFA') // => "250K FCFA"
 */
export function formatMoneyCompact(
  amount: number | null | undefined,
  currency: string = 'FCFA'
): string {
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
