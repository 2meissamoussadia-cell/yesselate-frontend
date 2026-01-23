/**
 * Escalades & Risques > Blocages critiques
 * Blocages impactant jalons contrats, Blocages inter-projets, Dépendances critiques non respectées, Actions correctives proposées
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Link2, Target } from 'lucide-react';

export function CriticalBlockagesView() {
  const blockages = [
    {
      id: '1',
      title: 'Blocage validation BC lot 4',
      contractMilestone: 'Jalon J5 - Projet Alpha',
      impact: 'Retard jalon contractuel, pénalités possibles',
      type: 'contract',
      correctiveActions: ['Escalade direction', 'Processus accéléré', 'Négociation client'],
    },
    {
      id: '2',
      title: 'Conflit ressources inter-projets',
      contractMilestone: 'Phase 2 - Projet Beta',
      impact: 'Blocage projet Beta, impact projet Gamma',
      type: 'inter-project',
      correctiveActions: ['Arbitrage allocation', 'Réallocation équipe', 'Ajustement planning'],
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Blocages critiques</h2>
        <p className="text-sm text-slate-400 mt-1">
          Blocages impactant jalons contrats, blocages inter-projets, dépendances critiques, actions correctives
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
                  <h3 className="text-base font-semibold text-slate-200">{blockage.title}</h3>
                  <Badge variant="destructive" className="text-xs">
                    Critique
                  </Badge>
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {blockage.type === 'contract' ? 'Contrat' : 'Inter-projets'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-400">Jalon impacté:</span>
                    <span className="text-slate-300">{blockage.contractMilestone}</span>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Impact:</p>
                    <p className="text-slate-300">{blockage.impact}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 font-medium mb-2">Actions correctives proposées:</p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {blockage.correctiveActions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

