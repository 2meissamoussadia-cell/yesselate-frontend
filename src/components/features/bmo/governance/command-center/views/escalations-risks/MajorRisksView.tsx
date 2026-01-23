/**
 * Escalades & Risques > Risques majeurs & exposition
 * Matrice risques (probabilité/impact), Exposition financière, Risques par type, Plan d'atténuation par risque
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export function MajorRisksView() {
  const risks = [
    {
      id: '1',
      title: 'Dépassement budget lot 4',
      probability: 'high',
      impact: 'high',
      financialExposure: '450K€',
      type: 'budget',
      mitigation: 'Réduction périmètre lot 5, négociation fournisseurs',
    },
    {
      id: '2',
      title: 'Retard validation BC',
      probability: 'medium',
      impact: 'high',
      financialExposure: '1.2M€',
      type: 'contract',
      mitigation: 'Escalade direction, processus accéléré',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Risques majeurs & exposition</h2>
        <p className="text-sm text-slate-400 mt-1">
          Matrice risques, exposition financière, risques par type, plan d'atténuation
        </p>
      </div>

      {/* Exposition financière globale */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">Exposition financière globale</h3>
        </div>
        <div className="text-3xl font-bold text-red-400">1.65M€</div>
        <p className="text-sm text-slate-400 mt-1">Risques critiques identifiés</p>
      </div>

      {/* Matrice risques */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Matrice risques</h3>
        <div className="space-y-4">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="bg-slate-900/50 rounded p-4 border border-slate-700/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <h4 className="text-base font-semibold text-slate-200">{risk.title}</h4>
                    <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                      {risk.type}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-slate-400 mb-1">Probabilité:</p>
                      <Badge
                        variant={risk.probability === 'high' ? 'destructive' : 'warning'}
                        className="text-xs"
                      >
                        {risk.probability === 'high' ? 'Élevée' : 'Moyenne'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Impact:</p>
                      <Badge
                        variant={risk.impact === 'high' ? 'destructive' : 'warning'}
                        className="text-xs"
                      >
                        {risk.impact === 'high' ? 'Élevé' : 'Moyen'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-slate-400 font-medium mb-1">Exposition financière:</p>
                    <p className="text-lg font-semibold text-red-400">{risk.financialExposure}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Plan d'atténuation:</p>
                    <p className="text-slate-300">{risk.mitigation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

