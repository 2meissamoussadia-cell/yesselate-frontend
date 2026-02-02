/**
 * Header du module Gouvernance
 * Affiche le titre, breadcrumb et contrôles principaux
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Download, Settings, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGouvernanceFilters } from '../hooks/useGouvernanceFilters';
import { PeriodSelector } from './PeriodSelector';
import { ViewSelector } from './ViewSelector';

interface GouvernanceHeaderProps {
  title: string;
  subtitle?: string;
  onExport?: () => void;
  onRefresh?: () => void;
  onSettings?: () => void;
  className?: string;
}

export function GouvernanceHeader({
  title,
  subtitle,
  onExport,
  onRefresh,
  onSettings,
  className,
}: GouvernanceHeaderProps) {
  const pathname = usePathname();
  const { periode } = useGouvernanceFilters();

  // Générer le breadcrumb depuis le pathname
  const breadcrumb = pathname
    ?.split('/')
    .filter(Boolean)
    .slice(1) // Enlever le premier élément vide
    .map((segment, index, array) => ({
      label: segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      isLast: index === array.length - 1,
    }));

  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              <span className={item.isLast ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
                {item.label}
              </span>
              {!item.isLast && <span>/</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header principal */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          )}
          {periode && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Période : {periode === 'week' ? 'Semaine' : periode === 'month' ? 'Mois' : 'Trimestre'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <PeriodSelector />
          <ViewSelector />
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Actualiser les données"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 min-h-[44px] min-w-[44px] text-xs font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Actualiser
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              aria-label="Exporter"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 min-h-[44px] min-w-[44px] text-xs font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exporter
            </button>
          )}
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              aria-label="Paramètres"
              className="inline-flex items-center justify-center rounded-xl bg-white/5 px-3 py-2 min-h-[44px] min-w-[44px] text-xs font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/10 transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Settings className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

