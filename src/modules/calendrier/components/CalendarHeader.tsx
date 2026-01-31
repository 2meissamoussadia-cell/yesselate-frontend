/**
 * Header du module Calendrier avec titre, breadcrumb, filtres période
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { CalendarViewSwitcher } from './CalendarViewSwitcher';
import { PeriodSelector } from './PeriodSelector';

interface CalendarHeaderProps {
  title?: string;
  breadcrumb?: string[];
  showViewSwitcher?: boolean;
  showPeriodSelector?: boolean;
}

export function CalendarHeader({
  title = 'Calendrier & Planification v3.0',
  breadcrumb,
  showViewSwitcher = true,
  showPeriodSelector = true,
}: CalendarHeaderProps) {
  const pathname = usePathname();

  // Générer le breadcrumb automatiquement depuis le pathname si non fourni
  const autoBreadcrumb = React.useMemo(() => {
    if (breadcrumb) return breadcrumb;
    const parts = pathname?.split('/').filter(Boolean) || [];
    const breadcrumbParts: string[] = ['Calendrier'];
    
    // Mapping des segments de route vers des labels lisibles
    const routeLabels: Record<string, string> = {
      'vue-ensemble': 'Vue d\'ensemble',
      'global': 'Global',
      'chantier': 'Par chantier',
      'gantt': 'Gantt',
      'timeline': 'Timeline',
      'jalons': 'Jalons & Contrats',
      'sla-risque': 'Jalons SLA à risque',
      'retards': 'Jalons en retard',
      'a-venir': 'Jalons à venir',
      'absences': 'Absences & Congés',
      'equipe': 'Par équipe',
      'evenements': 'Événements & Réunions',
      'internes': 'Événements internes',
      'reunions-projets': 'Réunions projets / chantiers',
      'reunions-decisionnelles': 'Réunions décisionnelles',
    };

    parts.forEach((part) => {
      if (part !== 'maitre-ouvrage' && part !== 'calendrier') {
        breadcrumbParts.push(routeLabels[part] || part);
      }
    });

    return breadcrumbParts;
  }, [pathname, breadcrumb]);

  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
      <div className="flex items-center gap-4 flex-1">
        {/* Icon + Title */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-blue-400" />
          <h1 className="text-xl font-semibold text-slate-200">{title}</h1>
        </div>

        {/* Breadcrumb */}
        {autoBreadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            {autoBreadcrumb.map((part, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
                <span
                  className={cn(
                    index === autoBreadcrumb.length - 1
                      ? 'text-slate-200 font-medium'
                      : 'text-slate-400'
                  )}
                >
                  {part}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {showPeriodSelector && <PeriodSelector />}
        {showViewSwitcher && <CalendarViewSwitcher />}
      </div>
    </header>
  );
}

