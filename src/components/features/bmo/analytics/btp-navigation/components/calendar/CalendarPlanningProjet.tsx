/**
 * Planning Projet Intégré
 * Synchronisation avec Projets en cours : jalons, livrables, points de contrôle
 */

'use client';

import React from 'react';
import { Calendar, Target, Package, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BTPIntelligentModal } from '../BTPIntelligentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarPlanningProjetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarPlanningProjet({ isOpen, onClose }: CalendarPlanningProjetProps) {
  const milestones = [
    {
      id: '1',
      project: 'Projet Alpha',
      title: 'Jalon Phase 2 - Livrable A',
      type: 'milestone',
      date: '2025-01-20',
      status: 'on-track',
      deliverables: ['Documentation technique', 'Tests unitaires'],
      team: ['Équipe Alpha', 'Équipe Beta'],
    },
    {
      id: '2',
      project: 'Projet Beta',
      title: 'Point de contrôle - Budget',
      type: 'checkpoint',
      date: '2025-01-18',
      status: 'at-risk',
      deliverables: ['Rapport budgétaire'],
      team: ['Équipe Finance'],
    },
    {
      id: '3',
      project: 'Projet Gamma',
      title: 'Réunion de revue - Sprint 5',
      type: 'review',
      date: '2025-01-22',
      status: 'on-track',
      deliverables: ['Présentation résultats'],
      team: ['Équipe Gamma', 'Direction'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'at-risk':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'delayed':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return Target;
      case 'checkpoint':
        return CheckCircle2;
      case 'review':
        return Calendar;
      default:
        return Package;
    }
  };

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Planning Projet Intégré"
      description="Synchronisation avec Projets en cours : jalons critiques, livrables en retard, points de contrôle, réunions de revue"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <span className="text-sm text-slate-400">
              {milestones.length} jalon{milestones.length > 1 ? 's' : ''} synchronisé{milestones.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              Synchroniser
            </Button>
          </div>
        </div>

        {/* Liste des jalons */}
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const TypeIcon = getTypeIcon(milestone.type);
            return (
              <div
                key={milestone.id}
                className={`bg-slate-900/50 rounded-lg p-4 border ${getStatusColor(milestone.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeIcon className="h-4 w-4 text-indigo-400" />
                      <Badge variant="default" className="text-xs">
                        {milestone.type === 'milestone' ? 'Jalon' : milestone.type === 'checkpoint' ? 'Point contrôle' : 'Réunion'}
                      </Badge>
                      <span className="text-sm font-medium text-slate-200">{milestone.title}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">Projet: {milestone.project}</div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {milestone.date}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="text-xs text-slate-500 mb-2">Livrables :</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {milestone.deliverables.map((deliverable, idx) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        <Package className="h-3 w-3 mr-1" />
                        {deliverable}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 mb-1">Équipes :</div>
                  <div className="flex flex-wrap gap-2">
                    {milestone.team.map((team, idx) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        {team}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button variant="default" size="sm" className="flex-1">
                    Ouvrir Projet
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    Notifier Équipe
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    Replanifier
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button variant="default" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="default" size="sm">
            Exporter Planning
          </Button>
        </div>
      </div>
    </BTPIntelligentModal>
  );
}

