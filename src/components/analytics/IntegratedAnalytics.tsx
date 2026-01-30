'use client';

/**
 * IntegratedAnalytics — Analytics intégrés (Power BI, SAP, Qlik, etc.).
 * KPIs financiers, supply chain, métiers en temps réel ; drill-downs.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

export interface IntegratedAnalyticsProps {
  /** URL du rapport BI (iframe). Si absent, affiche un placeholder. */
  embedUrl?: string;
  /** Hauteur du conteneur (iframe ou placeholder) */
  height?: number;
  className?: string;
}

export function IntegratedAnalytics({
  embedUrl,
  height = 400,
  className,
}: IntegratedAnalyticsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-slate-100">
        Analytics intégrés
      </h3>
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 overflow-hidden">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full border-none"
            style={{ height: `${height}px` }}
            title="Analytics intégrés (BI)"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-3 text-slate-500 text-sm"
            style={{ minHeight: `${height}px` }}
            aria-hidden
          >
            <BarChart3 className="h-12 w-12 text-slate-600/60" />
            <p className="font-medium text-slate-400">
              Analytics intégrés (Power BI, SAP Analytics Cloud, Qlik…)
            </p>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Configurez l’URL du rapport BI pour afficher les dashboards dynamiques, KPIs financiers et supply chain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
