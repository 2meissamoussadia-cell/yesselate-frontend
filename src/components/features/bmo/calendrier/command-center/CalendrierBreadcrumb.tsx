/**
 * Breadcrumb pour Calendrier
 * Affiche le chemin de navigation : Calendrier > Domaine > Section > Vue
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { CalendrierDomain, CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';
import { calendrierDomains } from './CalendrierCommandSidebar';
import { getSectionsForDomain } from './CalendrierSubNavigation';

interface CalendrierBreadcrumbProps {
  domain: CalendrierDomain;
  section: CalendrierSection | null;
  view: CalendrierView | null;
  onDomainClick?: (domain: CalendrierDomain) => void;
  onSectionClick?: (section: CalendrierSection) => void;
  className?: string;
}

export const CalendrierBreadcrumb = React.memo(function CalendrierBreadcrumb({
  domain,
  section,
  view,
  onDomainClick,
  onSectionClick,
  className,
}: CalendrierBreadcrumbProps) {
  const domainLabel = calendrierDomains.find(d => d.id === domain)?.label || 'Calendrier';
  const sections = getSectionsForDomain(domain);
  const sectionData = section ? sections.find(s => s.id === section) : null;
  const viewData = sectionData?.views?.find(v => v.id === view) || null;

  return (
    <div className={cn('flex items-center gap-2 px-4 py-2 text-sm', className)}>
      {/* Calendrier */}
      <span className="text-slate-400">Calendrier</span>
      
      {/* Domaine */}
      {domain && (
        <>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          {onDomainClick ? (
            <button
              onClick={() => onDomainClick(domain)}
              className="text-slate-300 font-medium hover:text-blue-400 transition-colors"
            >
              {domainLabel}
            </button>
          ) : (
            <span className="text-slate-300 font-medium">{domainLabel}</span>
          )}
        </>
      )}

      {/* Section */}
      {section && sectionData && (
        <>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          {onSectionClick ? (
            <button
              onClick={() => onSectionClick(section)}
              className="text-slate-400 hover:text-blue-400 transition-colors"
            >
              {sectionData.label}
            </button>
          ) : (
            <span className="text-slate-400">{sectionData.label}</span>
          )}
        </>
      )}

      {/* Vue */}
      {view && viewData && (
        <>
          <ChevronRight className="h-3 w-3 text-slate-600" />
          <span className="text-slate-400 text-xs">{viewData.label}</span>
        </>
      )}
    </div>
  );
});

