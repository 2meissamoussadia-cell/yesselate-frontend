/**
 * Instances & Coordination > Instances programmées
 * Calendrier instances (CSPS, comités, réunions stratégiques), Prochaines instances détail, Participants attendus
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, ArrowUpRight } from 'lucide-react';

export function ScheduledInstancesView() {
  const instances = [
    {
      id: '1',
      title: 'CSPS - Comité Stratégique Projets Sensibles',
      date: '20/01/2025',
      time: '14:00',
      type: 'CSPS',
      participants: ['DG', 'DBMO', 'Chef de projet Alpha', 'Chef de projet Beta'],
      agenda: ['Point projets sensibles', 'Décisions budgétaires', 'Arbitrages ressources'],
    },
    {
      id: '2',
      title: 'Comité de Pilotage Mensuel',
      date: '25/01/2025',
      time: '10:00',
      type: 'Comité',
      participants: ['DBMO', 'Chefs de projet', 'Direction Finance'],
      agenda: ['Bilan mensuel', 'KPIs', 'Points bloquants'],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Instances programmées</h2>
        <p className="text-sm text-slate-400 mt-1">
          Calendrier instances (CSPS, comités, réunions stratégiques), prochaines instances, participants attendus
        </p>
      </div>

      <div className="space-y-4">
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {instance.type}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-3">{instance.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-300">{instance.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Heure:</span>
                    <span className="text-slate-300">{instance.time}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-slate-400 font-medium mb-2">Participants attendus:</p>
                  <div className="flex flex-wrap gap-2">
                    {instance.participants.map((participant, idx) => (
                      <Badge key={idx} variant="default" className="text-xs border-slate-700 text-slate-400">
                        <Users className="h-3 w-3 mr-1" />
                        {participant}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 font-medium mb-2">Ordre du jour:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {instance.agenda.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end pt-3 border-t border-slate-700/30">
              <Button variant="default" size="sm" className="border-slate-700 text-slate-400">
                Voir calendrier
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

