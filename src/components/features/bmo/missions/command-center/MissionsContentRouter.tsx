/**
 * ContentRouter pour Missions
 * Route le contenu en fonction de la catégorie et sous-catégorie active
 * Architecture cohérente avec Governance et Analytics
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Compass, Loader2, AlertTriangle, FileText, Calendar, MapPin } from 'lucide-react';
import { MissionsWorkspaceContent } from '@/components/features/bmo/workspace/missions/MissionsWorkspaceContent';

interface MissionsContentRouterProps {
  category: string;
  subCategory: string | null;
}

export function MissionsContentRouter({ category, subCategory }: MissionsContentRouterProps) {
  // Pour l'instant, on utilise le contenu workspace existant qui fonctionne avec l'ancien store
  // TODO: Migrer vers le nouveau store missionsCommandCenterStore pour une architecture complètement cohérente
  
  // Vue Overview - Tableau de bord
  if (category === 'overview') {
    return (
      <div className="p-4">
        <MissionsWorkspaceContent />
      </div>
    );
  }

  // Vue Planned - Missions planifiées
  if (category === 'planned') {
    return (
      <div className="p-4">
        <MissionsWorkspaceContent />
      </div>
    );
  }

  // Vue In Progress - Missions en cours
  if (category === 'in-progress') {
    return (
      <div className="p-4">
        <MissionsWorkspaceContent />
      </div>
    );
  }

  // Vue On Site - Missions sur site
  if (category === 'on-site') {
    return (
      <div className="p-4">
        <MissionsWorkspaceContent />
      </div>
    );
  }

  // Vue Delayed - Missions en retard
  if (category === 'delayed') {
    return (
      <div className="p-4">
        <MissionsWorkspaceContent />
      </div>
    );
  }

  // Vue Completed - Missions terminées
  if (category === 'completed') {
    return (
      <div className="p-4">
        <MissionsWorkspaceContent />
      </div>
    );
  }

  // Vue Canceled - Missions annulées
  if (category === 'canceled') {
    return (
      <div className="p-4">
        <MissionsWorkspaceContent />
      </div>
    );
  }

  // Vue By Region - Par région
  if (category === 'by-region') {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Vue par région</h3>
            <p className="text-slate-400">Contenu en cours de développement</p>
          </div>
        </div>
      </div>
    );
  }

  // Vue Analytics - Statistiques
  if (category === 'analytics') {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <Compass className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Analytics Missions</h3>
            <p className="text-slate-400">Statistiques en cours de développement</p>
          </div>
        </div>
      </div>
    );
  }

  // Vue Archive - Archives
  if (category === 'archive') {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Archives Missions</h3>
            <p className="text-slate-400">Historique en cours de développement</p>
          </div>
        </div>
      </div>
    );
  }

  // Vue par défaut
  return (
    <div className="p-4">
      <MissionsWorkspaceContent />
    </div>
  );
}
