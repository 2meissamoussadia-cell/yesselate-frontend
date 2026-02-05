/**
 * Instances & Coordination > Comptes-rendus & suivi décisions
 * CR dernières instances, Points de décision abordés, Suivi des décisions antérieures, Actions assignées et statut
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, Clock, Calendar } from 'lucide-react';

export function MinutesFollowupView() {
  const minutes = [
    {
      id: '1',
      instance: 'CSPS - 15/12/2024',
      date: '15/12/2024',
      decisions: [
        { id: '1', point: 'Validation avenant budget lot 3', status: 'approved', assignee: 'J. Martin', deadline: '20/12/2024' },
        { id: '2', point: 'Prolongation délai phase 1', status: 'in-progress', assignee: 'M. Dupont', deadline: '25/12/2024' },
      ],
    },
    {
      id: '2',
      instance: 'Comité de Pilotage - 10/12/2024',
      date: '10/12/2024',
      decisions: [
        { id: '3', point: 'Réallocation ressources', status: 'completed', assignee: 'S. Bernard', deadline: '15/12/2024' },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Comptes-rendus & suivi décisions</h2>
        <p className="text-sm text-slate-400 mt-1">
          CR dernières instances, points de décision, suivi décisions antérieures, actions assignées
        </p>
      </div>

      <div className="space-y-4">
        {minutes.map((minute) => (
          <div
            key={minute.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold text-slate-200">{minute.instance}</h3>
              <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                <Calendar className="h-3 w-3 mr-1" />
                {minute.date}
              </Badge>
            </div>
            <div className="space-y-3">
              {minute.decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="bg-slate-900/50 rounded p-3 border border-slate-700/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-slate-200">{decision.point}</p>
                    <Badge
                      variant={
                        decision.status === 'completed' ? 'default' :
                        decision.status === 'approved' ? 'default' :
                        'warning'
                      }
                      className={cn(
                        'text-xs',
                        decision.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        decision.status === 'approved' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      )}
                    >
                      {decision.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Terminé
                        </>
                      ) : decision.status === 'approved' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approuvé
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          En cours
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Assigné à: {decision.assignee}</span>
                    <span>•</span>
                    <span>Échéance: {decision.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

