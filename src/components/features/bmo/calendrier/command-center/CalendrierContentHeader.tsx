/**
 * Header de contenu pour Calendrier
 * Contient le breadcrumb, les sélecteurs de vue et période
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { CalendrierBreadcrumb } from './CalendrierBreadcrumb';
import type { CalendrierDomain, CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';
import { getSectionsForDomain } from './CalendrierSubNavigation';

interface CalendrierContentHeaderProps {
  domain: CalendrierDomain;
  section: CalendrierSection | null;
  view: CalendrierView | null;
  period?: 'week' | 'month' | 'quarter';
  onDomainClick?: (domain: CalendrierDomain) => void;
  onSectionClick?: (section: CalendrierSection) => void;
  onViewChange?: (view: CalendrierView) => void;
  onPeriodChange?: (period: 'week' | 'month' | 'quarter') => void;
  className?: string;
}

export const CalendrierContentHeader = React.memo(function CalendrierContentHeader({
  domain,
  section,
  view,
  period = 'month',
  onDomainClick,
  onSectionClick,
  onViewChange,
  onPeriodChange,
  className,
}: CalendrierContentHeaderProps) {
  const sections = getSectionsForDomain(domain);
  const sectionData = section ? sections.find(s => s.id === section) : null;
  const availableViews = sectionData?.views || [];
  const hasViews = availableViews.length > 0 && onViewChange;
  const hasPeriod = onPeriodChange;

  return (
    <div className={cn('bg-slate-900/60 border-b border-slate-700/50', className)}>
      {/* Breadcrumb */}
      <CalendrierBreadcrumb
        domain={domain}
        section={section}
        view={view}
        onDomainClick={onDomainClick}
        onSectionClick={onSectionClick}
      />

      {/* View & Period Selectors */}
      {(hasViews || hasPeriod) && (
        <div className="flex items-center justify-between gap-4 px-4 py-2 bg-slate-800/30 border-t border-slate-800/50">
          {/* Views */}
          {hasViews && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <span className="text-xs text-slate-400 mr-2 whitespace-nowrap">Vue:</span>
              {availableViews.map((viewOption) => {
                const isActive = view === viewOption.id;

                return (
                  <button
                    key={viewOption.id}
                    onClick={() => onViewChange!(viewOption.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                        : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
                    )}
                  >
                    <span>{viewOption.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Period Selector */}
          {hasPeriod && (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-slate-400 mr-2 whitespace-nowrap">Période:</span>
              {(['week', 'month', 'quarter'] as const).map((periodOption) => {
                const isActive = period === periodOption;

                return (
                  <button
                    key={periodOption}
                    onClick={() => onPeriodChange!(periodOption)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
                    )}
                  >
                    <span>
                      {periodOption === 'week' ? 'Semaine' : periodOption === 'month' ? 'Mois' : 'Trimestre'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

