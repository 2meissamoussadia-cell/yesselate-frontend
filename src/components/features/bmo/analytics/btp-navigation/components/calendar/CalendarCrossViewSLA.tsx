/**
 * Vue Croisée SLA / Retards / Conflits
 * Analyse combinée des SLA, retards et conflits
 */

'use client';

import React from 'react';
import { AlertTriangle, Clock, TrendingDown, CheckCircle2 } from 'lucide-react';
import { BTPIntelligentModal } from '../BTPIntelligentModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarCrossViewSLAProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarCrossViewSLA({ isOpen, onClose }: CalendarCrossViewSLAProps) {
  const slaItems = [
    {
      id: '1',
      title: 'Validation BC #1234',
      type: 'validation',
      deadline: '2025-01-15 14:00',
      status: 'overdue',
      delay: '2h 30min',
      priority: 'critical',
      relatedConflicts: 1,
    },
    {
      id: '2',
      title: 'Validation Contrat #567',
      type: 'validation',
      deadline: '2025-01-15 16:00',
      status: 'at-risk',
      delay: null,
      priority: 'high',
      relatedConflicts: 0,
    },
    {
      id: '3',
      title: 'Jalon Projet Alpha',
      type: 'milestone',
      deadline: '2025-01-16 09:00',
      status: 'on-time',
      delay: null,
      priority: 'medium',
      relatedConflicts: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'at-risk':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'on-time':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Vue Croisée SLA / Retards / Conflits"
      description="Analyse combinée des échéances SLA, retards détectés et conflits associés"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            <span className="text-sm text-slate-400">
              {slaItems.filter(i => i.status === 'overdue').length} en retard •{' '}
              {slaItems.filter(i => i.status === 'at-risk').length} en risque
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              <TrendingDown className="h-4 w-4 mr-2" />
              Prioriser
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-500 mb-1">En retard</div>
            <div className="text-2xl font-bold text-rose-400">
              {slaItems.filter(i => i.status === 'overdue').length}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-500 mb-1">En risque</div>
            <div className="text-2xl font-bold text-amber-400">
              {slaItems.filter(i => i.status === 'at-risk').length}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-500 mb-1">À l'heure</div>
            <div className="text-2xl font-bold text-emerald-400">
              {slaItems.filter(i => i.status === 'on-time').length}
            </div>
          </div>
        </div>

        {/* Liste des SLA */}
        <div className="space-y-3">
          {slaItems.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900/50 rounded-lg p-4 border ${getStatusColor(item.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className="text-xs">
                      {item.type === 'validation' ? 'Validation' : 'Jalon'}
                    </Badge>
                    <span className="text-sm font-medium text-slate-200">{item.title}</span>
                    {item.relatedConflicts > 0 && (
                      <Badge variant="default" className="text-xs bg-rose-500/20 text-rose-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {item.relatedConflicts} conflit{item.relatedConflicts > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.deadline}
                    </div>
                    {item.delay && (
                      <div className="text-rose-400 font-medium">Retard: {item.delay}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button variant="default" size="sm" className="flex-1">
                  Traiter
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Réassigner
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Escalader
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
            Exporter Rapport
          </Button>
        </div>
      </div>
    </BTPIntelligentModal>
  );
}

