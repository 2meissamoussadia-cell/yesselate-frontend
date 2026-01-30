/**
 * Router de contenu pour le module Calendrier
 * Route vers les bonnes pages selon la navigation (niveaux 1, 2 et 3)
 */

'use client';

import React from 'react';
import type { CalendrierMainCategory } from '../types/calendrierNavigationTypes';
import { CalendrierOverviewPage } from '../pages/overview/CalendrierOverviewPage';
import { CalendrierGlobalView } from '../pages/overview/CalendrierGlobalView';
import { CalendrierByChantierView } from '../pages/overview/CalendrierByChantierView';
import { GanttGlobalView } from '../pages/gantt/GanttGlobalView';
import { GanttByChantierView } from '../pages/gantt/GanttByChantierView';
import { TimelineGlobalView } from '../pages/timeline/TimelineGlobalView';
import { TimelineByChantierView } from '../pages/timeline/TimelineByChantierView';
import { JalonsSlaRisquePage } from '../pages/jalons/JalonsSlaRisquePage';
import { JalonsRetardsPage } from '../pages/jalons/JalonsRetardsPage';
import { JalonsAVenirPage } from '../pages/jalons/JalonsAVenirPage';
import { AbsencesGlobalPage } from '../pages/absences/AbsencesGlobalPage';
import { AbsencesParEquipePage } from '../pages/absences/AbsencesParEquipePage';
import { AbsencesParChantierPage } from '../pages/absences/AbsencesParChantierPage';
import { EvenementsInternesPage } from '../pages/evenements/EvenementsInternesPage';
import { ReunionsProjetsPage } from '../pages/evenements/ReunionsProjetsPage';
import { ReunionsDecisionnellesPage } from '../pages/evenements/ReunionsDecisionnellesPage';
import { BMOCalendar } from '@/components/bmo/calendar/BMOCalendar';

interface CalendrierContentRouterProps {
  mainCategory: CalendrierMainCategory;
  subCategory?: string;
  subSubCategory?: string;
}

export function CalendrierContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: CalendrierContentRouterProps) {
  // Agenda BMO (FullCalendar vue mois)
  if (mainCategory === 'agenda') {
    return (
      <div className="p-4 h-full">
        <BMOCalendar />
      </div>
    );
  }

  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'global') {
      if (subSubCategory === 'summary' || !subSubCategory) {
        return <CalendrierGlobalView />;
      }
      return <CalendrierGlobalView />;
    }
    if (subCategory === 'chantier') {
      return <CalendrierByChantierView />;
    }
    return <CalendrierOverviewPage />;
  }

  // Gantt
  if (mainCategory === 'gantt') {
    if (subCategory === 'global') {
      return <GanttGlobalView />;
    }
    if (subCategory === 'chantier') {
      return <GanttByChantierView />;
    }
    return <GanttGlobalView />;
  }

  // Timeline
  if (mainCategory === 'timeline') {
    if (subCategory === 'global') {
      return <TimelineGlobalView />;
    }
    if (subCategory === 'chantier') {
      return <TimelineByChantierView />;
    }
    return <TimelineGlobalView />;
  }

  // Jalons
  if (mainCategory === 'jalons') {
    if (subCategory === 'sla-risque') {
      return <JalonsSlaRisquePage />;
    }
    if (subCategory === 'retards') {
      return <JalonsRetardsPage />;
    }
    if (subCategory === 'a-venir') {
      return <JalonsAVenirPage />;
    }
    return <JalonsSlaRisquePage />;
  }

  // Absences
  if (mainCategory === 'absences') {
    if (subCategory === 'global') {
      return <AbsencesGlobalPage />;
    }
    if (subCategory === 'equipe') {
      return <AbsencesParEquipePage />;
    }
    if (subCategory === 'chantier') {
      return <AbsencesParChantierPage />;
    }
    return <AbsencesGlobalPage />;
  }

  // Événements
  if (mainCategory === 'evenements') {
    if (subCategory === 'internes') {
      return <EvenementsInternesPage />;
    }
    if (subCategory === 'reunions-projets') {
      return <ReunionsProjetsPage />;
    }
    if (subCategory === 'reunions-decisionnelles') {
      return <ReunionsDecisionnellesPage />;
    }
    return <EvenementsInternesPage />;
  }

  // Par défaut
  return <CalendrierOverviewPage />;
}

