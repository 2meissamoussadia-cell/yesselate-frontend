/**
 * ChartKit - Système unifié de graphiques pour le dashboard
 * 
 * Design System standardisé :
 * - ChartContainer : Container avec états (loading, error, empty)
 * - chartTheme : Couleurs, styles, marges standardisés
 * - Types : Interfaces TypeScript complètes
 * 
 * @example
 * ```tsx
 * import { ChartContainer, chartStyles, chartColors } from '@/modules/dashboard/charts/ChartKit';
 * 
 * <ChartContainer title="Évolution" height={300}>
 *   <LineChart data={data}>
 *     <CartesianGrid {...chartStyles.grid} />
 *     <XAxis {...chartStyles.axis} />
 *     <YAxis {...chartStyles.axis} />
 *     <Tooltip {...chartStyles.tooltip} />
 *     <Line dataKey="value" stroke={chartColors.primary.main} />
 *   </LineChart>
 * </ChartContainer>
 * ```
 */

// ============================================
// COMPOSANTS
// ============================================

export { ChartContainer } from './ChartContainer';
export type { ChartContainerProps } from './ChartContainer';

// ============================================
// CHARTS LAZY LOADED
// ============================================

export { LineChart, LineChartLazy } from './LineChart';
export type { LineChartProps } from './LineChart';

export { BarChart } from './BarChart';
export type { BarChartProps } from './BarChart';

export { AreaChartLazy as AreaChart } from './AreaChart';
export type { AreaChartProps } from './AreaChart';

export { PieChart } from './PieChart';
export type { PieChartProps } from './PieChart';

// ============================================
// THÈME & STYLES
// ============================================

export {
  chartColors,
  chartUI,
  chartStyles,
  chartMargins,
  chartHeights,
  getPaletteColor,
  getSemanticColor,
} from './chartTheme';

// ============================================
// TYPES
// ============================================

export type {
  ChartType,
  ChartData,
  ChartDataPoint,
  ChartSeries,
  ChartAxisConfig,
  ChartTooltipConfig,
  ChartConfig,
} from './types';
