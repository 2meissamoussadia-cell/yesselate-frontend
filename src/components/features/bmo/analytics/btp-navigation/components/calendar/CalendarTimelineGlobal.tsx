/**
 * Timeline Globale
 * Vue temporelle complète de tous les événements, échéances, jalons
 */

'use client';

import React from 'react';
import { History as TimelineIcon, X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { BTPIntelligentModal } from '../BTPIntelligentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarTimelineGlobalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarTimelineGlobal({ isOpen, onClose }: CalendarTimelineGlobalProps) {
  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Timeline Globale"
      description="Vue temporelle complète de tous les événements, échéances, jalons projets, validations et réunions"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TimelineIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-slate-400">Vue temporelle synchronisée</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
          <div className="space-y-4">
            {/* Exemple de timeline */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-slate-800" />
                <div className="w-0.5 h-16 bg-slate-700 mt-1" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="text-xs">Aujourd'hui</Badge>
                  <span className="text-sm font-medium text-slate-200">Validation BC #1234</span>
                </div>
                <p className="text-xs text-slate-400">Échéance critique - Demande urgente</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span className="text-xs text-slate-500">SLA: 2h restantes</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-800" />
                <div className="w-0.5 h-16 bg-slate-700 mt-1" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="text-xs bg-emerald-500/20 text-emerald-400">Demain</Badge>
                  <span className="text-sm font-medium text-slate-200">Jalon Projet Alpha</span>
                </div>
                <p className="text-xs text-slate-400">Livrable critique - Phase 2</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-rose-400 border-2 border-slate-800" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="text-xs bg-rose-500/20 text-rose-400">Semaine prochaine</Badge>
                  <span className="text-sm font-medium text-slate-200">Conférence décisionnelle</span>
                </div>
                <p className="text-xs text-slate-400">Réunion stratégique - Budget 2025</p>
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  <span className="text-xs text-slate-500">Conflit détecté avec réunion RH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button variant="default" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="default" size="sm">
            Exporter Timeline
          </Button>
        </div>
      </div>
    </BTPIntelligentModal>
  );
}

