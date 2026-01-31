/**
 * Fallback de chargement premium (Procore-style)
 * Squelettes animés + barre de progression pour les vues dashboard
 * Utilisé par DashboardViewRouter et DashboardContentSwitch
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ContentLoadingSkeleton } from '../ContentLoadingSkeleton';
import { Progress } from '@/components/ui/progress';

interface DashboardLoadingFallbackProps {
  /** Afficher une barre de progression (indéterminée ou simulée) */
  showProgress?: boolean;
  /** Nombre de cartes KPI à afficher dans le skeleton */
  kpiCount?: number;
  /** Nombre de graphiques */
  chartCount?: number;
  /** Afficher le tableau dans le skeleton */
  showTable?: boolean;
  /** Message sous la barre de progression */
  message?: string;
  className?: string;
}

/**
 * Barre de progression simulée (0 → ~90 %) pour feedback visuel Procore-style
 */
function IndeterminateProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let value = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const step = () => {
      if (cancelled) return;
      value = Math.min(92, value + Math.random() * 10 + 2);
      setProgress(value);
      if (value < 92) {
        timeoutId = setTimeout(step, 180 + Math.random() * 120);
      }
    };
    timeoutId = setTimeout(step, 80);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <Progress value={progress} className="h-2" />
      <p className="text-center text-xs text-slate-400">Chargement des données…</p>
    </div>
  );
}

export function DashboardLoadingFallback({
  showProgress = true,
  kpiCount = 4,
  chartCount = 2,
  showTable = false,
  message,
  className,
}: DashboardLoadingFallbackProps = {}) {
  return (
    <div
      className={cn('space-y-6 animate-fadeIn', className)}
      role="status"
      aria-live="polite"
      aria-label="Chargement des données en cours"
    >
      <span className="sr-only">Chargement des données en cours</span>
      {/* Barre de progression en tête (Procore-style) */}
      {showProgress && (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
          <IndeterminateProgress />
          {message && (
            <p className="text-center text-sm text-slate-400 mt-2">{message}</p>
          )}
        </div>
      )}

      {/* Squelettes KPI + charts (+ optionnel table) */}
      <ContentLoadingSkeleton
        showKPIBar
        kpiCount={kpiCount}
        showCharts
        chartCount={chartCount}
        showTable={showTable}
        tableRows={5}
      />
    </div>
  );
}
