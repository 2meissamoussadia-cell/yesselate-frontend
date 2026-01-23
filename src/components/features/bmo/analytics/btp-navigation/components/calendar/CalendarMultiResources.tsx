/**
 * Calendrier Multi-Ressources
 * Gestion des conflits de ressources, réunions, validations
 */

'use client';

import React from 'react';
import { Users, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { BTPIntelligentModal } from '../BTPIntelligentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarMultiResourcesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarMultiResources({ isOpen, onClose }: CalendarMultiResourcesProps) {
  const conflicts = [
    {
      id: '1',
      type: 'resource',
      title: 'Conflit de ressource - Équipe Alpha',
      description: '2 réunions simultanées nécessitant la même équipe',
      time: '14:00 - 15:30',
      date: '2025-01-15',
      events: ['Réunion Projet Alpha', 'Validation BC #1234'],
      severity: 'high',
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Conflit de réunion - Salle A',
      description: '2 réunions planifiées dans la même salle',
      time: '10:00 - 11:00',
      date: '2025-01-16',
      events: ['Conférence décisionnelle', 'Réunion RH'],
      severity: 'medium',
    },
    {
      id: '3',
      type: 'validation',
      title: 'Conflit de validation - Responsable',
      description: 'Même responsable requis pour 2 validations simultanées',
      time: '09:00 - 10:00',
      date: '2025-01-17',
      events: ['Validation Contrat #567', 'Validation Paiement #890'],
      severity: 'critical',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Calendrier Multi-Ressources"
      description="Gestion des conflits de ressources, réunions, validations et jalons projets"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-slate-400">{conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Résoudre tous
            </Button>
          </div>
        </div>

        {/* Liste des conflits */}
        <div className="space-y-3">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`bg-slate-900/50 rounded-lg p-4 border ${getSeverityColor(conflict.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className="text-xs">
                      {conflict.type === 'resource' ? 'Ressource' : conflict.type === 'meeting' ? 'Réunion' : 'Validation'}
                    </Badge>
                    <span className="text-sm font-medium text-slate-200">{conflict.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{conflict.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {conflict.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {conflict.time}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-500 mb-2">Événements en conflit :</div>
                <div className="flex flex-wrap gap-2">
                  {conflict.events.map((event, idx) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button variant="default" size="sm" className="flex-1">
                  Déplacer
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Fusionner
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Arbitrer
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button variant="default" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="default" size="sm">
            Exporter Conflits
          </Button>
        </div>
      </div>
    </BTPIntelligentModal>
  );
}

