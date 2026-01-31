/**
 * Content Router pour Calendrier
 * Route vers la bonne vue selon domain/section/view
 */

'use client';

import React from 'react';
import type { CalendrierDomain, CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';

// Import des vues existantes
import { VueEnsembleView } from '../views/VueEnsembleView';
import { SLARetardsView } from '../views/SLARetardsView';
import { JalonsProjetsView } from '../views/JalonsProjetsView';
import { RHAbsencesView } from '../views/RHAbsencesView';
import { InstancesReunionsView } from '../views/InstancesReunionsView';

interface CalendrierContentRouterProps {
  domain: CalendrierDomain;
  section: CalendrierSection | null;
  view: CalendrierView | null;
}

export const CalendrierContentRouter = React.memo(function CalendrierContentRouter({
  domain,
  section,
  view,
}: CalendrierContentRouterProps) {
  // Si section ou view sont null, afficher un message de chargement
  if (!section || !view) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-300 mb-2">
            Chargement...
          </p>
          <p className="text-slate-400">Sélection d'une section en cours</p>
        </div>
      </div>
    );
  }

  // Vue d'ensemble
  if (domain === 'overview') {
    // Passer section et view pour adapter l'affichage
    return <VueEnsembleView section={section} view={view} />;
  }

  // Jalons & Contrats
  if (domain === 'milestones') {
    if (section === 'timeline') {
      // Timeline jalons critiques
      return <JalonsProjetsView view={view} />;
    }
    if (section === 'alerts') {
      // Alertes SLA
      return <SLARetardsView filterType="alerts" view={view} />;
    }
    if (section === 'retards') {
      // Retards détectés
      return <SLARetardsView filterType="retards" view={view} />;
    }
    // Par défaut, afficher les jalons
    return <JalonsProjetsView view={view} />;
  }

  // Absences & Congés
  if (domain === 'absences') {
    if (section === 'calendar') {
      // Calendrier absences/congés
      return <RHAbsencesView view={view} />;
    }
    if (section === 'impact') {
      // Impact disponibilité ressources
      return <RHAbsencesView view={view} showImpact={true} />;
    }
    return <RHAbsencesView view={view} />;
  }

  // Événements & Réunions
  if (domain === 'events') {
    if (section === 'instances') {
      // Instances programmées
      return <InstancesReunionsView filterType="instances" view={view} />;
    }
    if (section === 'reunions') {
      // Réunions de chantier
      return <InstancesReunionsView filterType="reunions" view={view} />;
    }
    return <InstancesReunionsView view={view} />;
  }

  // Fallback
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-300 mb-2">
          {domain} - {section || 'Aucune section'} - {view || 'Aucune vue'}
        </p>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

