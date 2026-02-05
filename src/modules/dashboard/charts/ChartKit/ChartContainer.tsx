/**
 * ChartContainer - Container standardisé pour tous les charts du dashboard
 * 
 * Version simplifiée avec support pour ResponsiveContainer dans les enfants.
 * Phase 2 #7 : export PNG/SVG optionnel via exportFilename.
 * 
 * @example
 * ```tsx
 * <ChartContainer title="Évolution des demandes" exportFilename="evolution-demandes">
 *   <ResponsiveContainer width="100%" height={300}>
 *     <LineChart data={data}>...</LineChart>
 *   </ResponsiveContainer>
 * </ChartContainer>
 * ```
 */

'use client';

import React, { useRef, useCallback } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { exportChartAsPng, exportChartAsSvg } from './chartExportUtils';

export interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Si fourni, affiche un bouton Export (PNG / SVG) */
  exportFilename?: string;
}

export function ChartContainer({
  title,
  children,
  className,
  exportFilename,
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExportPng = useCallback(() => {
    if (!containerRef.current || !exportFilename) return;
    exportChartAsPng(containerRef.current, exportFilename);
  }, [exportFilename]);

  const handleExportSvg = useCallback(() => {
    if (!containerRef.current || !exportFilename) return;
    exportChartAsSvg(containerRef.current, exportFilename);
  }, [exportFilename]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'chart-container rounded-xl p-6',
        'bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50',
        className
      )}
    >
      {(title || exportFilename) && (
        <div className="flex items-center justify-between gap-2 mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">{title}</h3>
          )}
          {exportFilename && (
            <div className={!title ? 'ml-auto' : undefined}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 shrink-0"
                  aria-label="Exporter le graphique"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPng}>
                  Télécharger en PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSvg}>
                  Télécharger en SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          )}
        </div>
      )}
      <div className="h-64 min-h-[256px]">{children}</div>
    </div>
  );
}

// ============================================
// EXPORTS DES STYLES POUR USAGE DIRECT
// ============================================

export { chartStyles, chartColors, chartUI, chartMargins, chartHeights } from './chartTheme';
export type { ChartContainerProps as ChartContainerPropsType } from './types';
