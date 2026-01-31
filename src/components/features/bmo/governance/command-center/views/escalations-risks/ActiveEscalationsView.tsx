/**
 * Escalades & Risques > Escalades en cours
 * Escalades actives (par niveau), Délai depuis escalade, En attente de résolution, Alertes délai de résolution
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, User, Calendar } from 'lucide-react';

export function ActiveEscalationsView() {
  const escalations = [
    {
      id: '1',
      ref: 'ESC-2024-045',
      title: 'Dépassement budget lot 4',
      level: 3,
      escalatedTo: 'Direction Générale',
      daysOpen: 12,
      deadline: '20/01/2025',
      status: 'in-progress',
      origin: 'Projet Alpha',
    },
    {
      id: '2',
      ref: 'ESC-2024-042',
      title: 'Ressource critique indisponible',
      level: 2,
      escalatedTo: 'Direction BMO',
      daysOpen: 8,
      deadline: '18/01/2025',
      status: 'acknowledged',
      origin: 'Projet Beta',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Escalades en cours</h2>
        <p className="text-sm text-slate-400 mt-1">
          Escalades actives par niveau, délai depuis escalade, en attente de résolution
        </p>
      </div>

      <div className="space-y-4">
        {escalations.map((escalation) => (
          <div
            key={escalation.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-mono text-slate-400">{escalation.ref}</span>
                  <Badge
                    variant={escalation.level === 3 ? 'destructive' : escalation.level === 2 ? 'warning' : 'default'}
                    className="text-xs"
                  >
                    Niveau {escalation.level}
                  </Badge>
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {escalation.origin}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-3">{escalation.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Escaladé à:</span>
                    <span className="text-slate-300">{escalation.escalatedTo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Ouvert depuis:</span>
                    <span className="text-slate-300">{escalation.daysOpen} jours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Échéance:</span>
                    <span className="text-slate-300">{escalation.deadline}</span>
                  </div>
                  <div>
                    <Badge
                      variant={escalation.status === 'in-progress' ? 'default' : 'gray'}
                      className="text-xs"
                    >
                      {escalation.status === 'in-progress' ? 'En cours' : 'Reconnu'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

