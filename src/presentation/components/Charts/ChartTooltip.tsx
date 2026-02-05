/**
 * ChartTooltip Component
 * Tooltip personnalisé pour les charts avec dark mode
 */

'use client';

import { TooltipProps } from 'recharts';
import { cn } from '@/lib/cn';
import { formatNumber, formatCurrency, formatPercent, formatDate } from '@/application/utils';

interface CustomTooltipProps extends TooltipProps<unknown, string> {
  payload?: Array<{ name?: string; value?: unknown; color?: string; [k: string]: unknown }>;
  label?: string | number;
  formatter?: (value: unknown) => string;
  labelFormatter?: (label: unknown) => string;
  showLabel?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  showLabel = true,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter
    ? labelFormatter(label)
    : typeof label === 'string' || typeof label === 'number'
    ? String(label)
    : formatDate(label as any);

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800 p-3 shadow-lg">
      {showLabel && formattedLabel && (
        <p className="text-sm font-semibold text-slate-200 mb-2 border-b border-slate-700/50 pb-2">
          {formattedLabel}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry: { name?: string; value?: unknown; color?: string; [k: string]: unknown }, index: number) => {
          const value = formatter
            ? formatter(entry.value)
            : typeof entry.value === 'number'
            ? formatNumber(entry.value)
            : String(entry.value);

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-slate-400">{entry.name}:</span>
              <span className="text-sm font-semibold text-slate-200">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tooltip formatters prédéfinis
 */
export const tooltipFormatters = {
  currency: (value: number) => formatCurrency(value),
  percent: (value: number) => formatPercent(value),
  number: (value: number, decimals: number = 0) => formatNumber(value, decimals),
  date: (value: string | Date) => formatDate(value, 'dd/MM/yyyy'),
  datetime: (value: string | Date) => formatDate(value, 'dd/MM/yyyy HH:mm'),
};

