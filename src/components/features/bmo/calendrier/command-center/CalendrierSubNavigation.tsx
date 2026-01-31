/**
 * Navigation secondaire pour Calendrier
 * Breadcrumb et sous-domaines (Niveau 2) - inspiré de AnalyticsSubNavigation
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import type { CalendrierDomain, CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';

interface SubSection {
  id: string;
  label: string;
  hint?: string; // Description courte pour tooltip/aide
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  views?: ViewOption[];
}

interface ViewOption {
  id: string;
  label: string;
  icon?: string;
}

interface CalendrierSubNavigationProps {
  domain: CalendrierDomain;
  domainLabel: string;
  section: CalendrierSection;
  sections: SubSection[];
  onSectionChange: (section: CalendrierSection) => void;
  view?: CalendrierView;
  onViewChange?: (view: CalendrierView) => void;
  period?: 'week' | 'month' | 'quarter';
  onPeriodChange?: (period: 'week' | 'month' | 'quarter') => void;
}

// Configuration des sections par domaine
const domainSections: Record<CalendrierDomain, SubSection[]> = {
  overview: [
    {
      id: 'global',
      label: 'Calendrier global',
      hint: 'Multi-chantiers',
      views: [
        { id: 'gantt', label: 'Gantt' },
        { id: 'calendar', label: 'Calendrier' },
        { id: 'timeline', label: 'Timeline' },
      ],
    },
    {
      id: 'bychantier',
      label: 'Vue par chantier',
      hint: 'Chantier sélectionné',
      views: [
        { id: 'calendar', label: 'Calendrier' },
        { id: 'table', label: 'Tableau' },
      ],
    },
  ],
  milestones: [
    {
      id: 'timeline',
      label: 'Timeline jalons critiques',
      hint: 'Gantt jalons',
      badge: 3,
      badgeType: 'warning',
      views: [
        { id: 'gantt', label: 'Gantt' },
        { id: 'timeline', label: 'Timeline' },
      ],
    },
    {
      id: 'alerts',
      label: 'Alertes SLA',
      hint: 'Liste + timeline',
      badge: 5,
      badgeType: 'critical',
      views: [
        { id: 'list', label: 'Liste' },
        { id: 'table', label: 'Tableau' },
      ],
    },
    {
      id: 'retards',
      label: 'Retards détectés',
      hint: 'Liste + filtres',
      badge: 2,
      badgeType: 'critical',
      views: [
        { id: 'list', label: 'Liste' },
        { id: 'table', label: 'Tableau' },
      ],
    },
  ],
  absences: [
    {
      id: 'calendar',
      label: 'Calendrier absences/congés',
      hint: 'Semaine/Mois',
      views: [
        { id: 'calendar', label: 'Calendrier' },
        { id: 'gantt', label: 'Gantt' },
      ],
    },
    {
      id: 'impact',
      label: 'Impact disponibilité ressources',
      hint: 'Synthèse + KPI',
      views: [
        { id: 'table', label: 'Tableau' },
        { id: 'chart', label: 'Graphique' },
      ],
    },
  ],
  events: [
    {
      id: 'instances',
      label: 'Instances programmées',
      hint: 'Comités / CAO / CMP',
      views: [
        { id: 'calendar', label: 'Calendrier' },
        { id: 'list', label: 'Liste' },
      ],
    },
    {
      id: 'reunions',
      label: 'Réunions de chantier',
      hint: 'Planning réunions',
      views: [
        { id: 'calendar', label: 'Calendrier' },
        { id: 'list', label: 'Liste' },
      ],
    },
  ],
};

// Vérification que toutes les sections ont au moins une vue
Object.entries(domainSections).forEach(([domain, sections]) => {
  sections.forEach((section) => {
    if (!section.views || section.views.length === 0) {
      console.warn(`Section "${section.id}" du domaine "${domain}" n'a pas de vues définies`);
    }
  });
});

export const CalendrierSubNavigation = React.memo(function CalendrierSubNavigation({
  domain,
  domainLabel,
  section,
  sections,
  onSectionChange,
  view,
  onViewChange,
  period = 'month',
  onPeriodChange,
}: CalendrierSubNavigationProps) {
  const activeSection = sections.find(s => s.id === section);
  const activeView = activeSection?.views?.find(v => v.id === view);

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Calendrier</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{domainLabel}</span>
        {section && activeSection && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">{activeSection.label}</span>
          </>
        )}
        {view && activeView && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400 text-xs">{activeView.label}</span>
          </>
        )}
      </div>

      {/* Sub Sections (Niveau 2) */}
      <div className="flex items-center gap-1 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-hide">
        {sections.map((sub) => {
          const isActive = section === sub.id;

          return (
            <button
              key={sub.id}
              onClick={() => onSectionChange(sub.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-blue-500/15 text-slate-200 border border-blue-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent hover:scale-[1.02]'
              )}
            >
              <span>{sub.label}</span>
              {sub.badge && (
                <Badge
                  variant="gray"
                  className={cn(
                    'h-4 min-w-4 px-1 text-xs transition-all duration-200',
                    sub.badgeType === 'critical'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : sub.badgeType === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-600/40 text-slate-400 border-slate-600/50',
                    isActive && 'scale-110'
                  )}
                >
                  {sub.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Views & Period (Niveau 3) */}
      <div className="flex items-center justify-between gap-4 px-4 py-1.5 bg-slate-800/30 border-t border-slate-800/50">
        {/* Views */}
        {activeSection?.views && activeSection.views.length > 0 && onViewChange && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-slate-400 mr-2 whitespace-nowrap">Vue:</span>
            {activeSection.views.map((viewOption) => {
              const isActive = view === viewOption.id;

              return (
                <button
                  key={viewOption.id}
                  onClick={() => onViewChange(viewOption.id)}
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
        {onPeriodChange && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-slate-400 mr-2 whitespace-nowrap">Période:</span>
            {(['week', 'month', 'quarter'] as const).map((periodOption) => {
              const isActive = period === periodOption;

              return (
                <button
                  key={periodOption}
                  onClick={() => onPeriodChange(periodOption)}
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
    </div>
  );
});

// Helper function to get sections for a domain
export function getSectionsForDomain(domain: CalendrierDomain): SubSection[] {
  return domainSections[domain] || [];
}

export type { SubSection, ViewOption };

