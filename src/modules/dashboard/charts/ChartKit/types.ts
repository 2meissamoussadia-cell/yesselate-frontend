/**
 * Types pour le ChartKit
 */

import { ReactNode } from 'react';
import { Margin } from 'recharts';
import { chartHeights, chartMargins } from './chartTheme';

// ============================================
// PROPS DU CHART CONTAINER
// ============================================

export interface ChartContainerProps {
  /**
   * Contenu du chart (composants Recharts)
   */
  children: ReactNode;

  /**
   * Titre du chart (optionnel)
   */
  title?: string;

  /**
   * Description du chart (optionnel)
   */
  description?: string;

  /**
   * État de chargement
   */
  isLoading?: boolean;

  /**
   * Erreur (string, Error, ou null)
   */
  error?: string | Error | null;

  /**
   * Hauteur du chart (nombre ou string CSS)
   * @default 300
   */
  height?: number | string;

  /**
   * Classes CSS additionnelles
   */
  className?: string;

  /**
   * Message affiché quand il n'y a pas de données
   * @default "Aucune donnée disponible"
   */
  emptyMessage?: string;

  /**
   * Indique si des données sont présentes
   * @default true
   */
  hasData?: boolean;

  /**
   * Afficher la légende (pour usage futur)
   * @default false
   */
  showLegend?: boolean;

  /**
   * Marges du chart (Recharts Margin)
   * @default chartMargins.default
   */
  margin?: Margin;

  /**
   * Activer le lazy loading (Suspense)
   * @default false
   */
  lazy?: boolean;

  /**
   * Skeleton personnalisé (remplace le skeleton par défaut)
   */
  skeleton?: ReactNode;
}

// ============================================
// TYPES DE CHART
// ============================================

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'composed';

// ============================================
// DONNÉES DE CHART GÉNÉRIQUES
// ============================================

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined;
}

export type ChartData = ChartDataPoint[];

// ============================================
// CONFIGURATION DE SÉRIE
// ============================================

export interface ChartSeries {
  /**
   * Clé de données (dataKey)
   */
  dataKey: string;

  /**
   * Nom de la série (pour légende)
   */
  name?: string;

  /**
   * Couleur (hex, rgb, ou nom de couleur du thème)
   */
  color?: string;

  /**
   * Type de série (pour charts composés)
   */
  type?: 'line' | 'bar' | 'area';

  /**
   * Opacité (0-1)
   */
  opacity?: number;

  /**
   * Afficher les points
   */
  showDots?: boolean;

  /**
   * Afficher la ligne de tendance
   */
  showTrend?: boolean;
}

// ============================================
// CONFIGURATION D'AXE
// ============================================

export interface ChartAxisConfig {
  /**
   * Clé de données pour l'axe
   */
  dataKey?: string;

  /**
   * Label de l'axe
   */
  label?: string;

  /**
   * Formatter pour les valeurs
   */
  formatter?: (value: any) => string;

  /**
   * Afficher l'axe
   */
  show?: boolean;

  /**
   * Orientation (left, right, top, bottom)
   */
  orientation?: 'left' | 'right' | 'top' | 'bottom';
}

// ============================================
// CONFIGURATION DE TOOLTIP
// ============================================

export interface ChartTooltipConfig {
  /**
   * Activer le tooltip
   */
  enabled?: boolean;

  /**
   * Formatter personnalisé
   */
  formatter?: (value: any, name: string) => [string, string];

  /**
   * Label formatter personnalisé
   */
  labelFormatter?: (label: string) => string;
}

// ============================================
// CONFIGURATION COMPLÈTE DE CHART
// ============================================

export interface ChartConfig {
  /**
   * Type de chart
   */
  type: ChartType;

  /**
   * Données
   */
  data: ChartData;

  /**
   * Séries
   */
  series: ChartSeries[];

  /**
   * Configuration de l'axe X
   */
  xAxis?: ChartAxisConfig;

  /**
   * Configuration de l'axe Y
   */
  yAxis?: ChartAxisConfig;

  /**
   * Configuration du tooltip
   */
  tooltip?: ChartTooltipConfig;

  /**
   * Afficher la légende
   */
  showLegend?: boolean;

  /**
   * Hauteur
   */
  height?: number;

  /**
   * Marges
   */
  margin?: Margin;
}
