/**
 * Décisions & Arbitrages > Points de blocage à trancher
 * Blocages sur projets critiques, Éléments attendus pour débloquer, Impact si non résolution, Propositions d'arbitrage
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowUpRight, Clock, DollarSign } from 'lucide-react';

export function BlockingPointsView() {
  const blockages = [
    {
      id: '1',
      project: 'Projet Alpha',
      title: 'Blocage validation BC lot 4',
      blockingFor: '12j',
      expectedItems: ['Validation financière', 'Approbation direction'],
      impact: '450K€ bloqués, retard jalon J5',
      proposal: 'Valider BC avec réduction périmètre',
      priority: 'critical',
    },
    {
      id: '2',
      project: 'Projet Beta',
      title: 'Conflit ressources entre projets',
      blockingFor: '8j',
      expectedItems: ['Arbitrage allocation ressources', 'Réallocation équipe'],
      impact: '120K€, retard phase 2',
      proposal: 'Réallouer 2 ressources du projet Gamma',
      priority: 'high',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Points de blocage à trancher</h2>
        <p className="text-sm text-slate-400 mt-1">
          Blocages sur projets critiques, éléments attendus, impact, propositions d'arbitrage
        </p>
      </div>

      <div className="space-y-4">
        {blockages.map((blockage) => (
          <div
            key={blockage.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {blockage.project}
                  </Badge>
                  <Badge
                    variant={blockage.priority === 'critical' ? 'destructive' : 'warning'}
                    className="text-xs"
                  >
                    {blockage.priority === 'critical' ? 'Critique' : 'Élevé'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>Bloqué depuis {blockage.blockingFor}</span>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-3">{blockage.title}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Éléments attendus:</p>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {blockage.expectedItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Impact si non résolution:</p>
                    <p className="text-slate-300">{blockage.impact}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Proposition d'arbitrage:</p>
                    <p className="text-slate-300">{blockage.proposal}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end pt-3 border-t border-slate-700/30">
              <Button variant="default" size="sm" className="border-slate-700 text-slate-400">
                Voir projet
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

