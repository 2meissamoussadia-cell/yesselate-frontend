/**
 * Conformité & Performance > Taux utilisation ressources
 * % allocation équipes (sur-allocation/sous-utilisation), Taux productivité par équipe, Équipes critiques en risque, Recommandations réallocation
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ResourceUtilizationView() {
  const teams = [
    {
      id: '1',
      name: 'Équipe Chantier Alpha',
      allocation: 95,
      productivity: 88,
      status: 'over-allocated',
      risk: 'high',
      recommendation: 'Réallouer 2 ressources vers équipe Beta',
    },
    {
      id: '2',
      name: 'Équipe Chantier Beta',
      allocation: 65,
      productivity: 75,
      status: 'under-utilized',
      risk: 'low',
      recommendation: 'Augmenter allocation projets',
    },
    {
      id: '3',
      name: 'Équipe Support',
      allocation: 82,
      productivity: 92,
      status: 'optimal',
      risk: 'low',
      recommendation: 'Maintenir allocation actuelle',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Taux utilisation ressources</h2>
        <p className="text-sm text-slate-400 mt-1">
          % allocation équipes, taux productivité, équipes critiques en risque, recommandations réallocation
        </p>
      </div>

      {/* Vue globale */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Allocation moyenne</span>
          </div>
          <div className="text-2xl font-bold text-slate-200">81%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Productivité moyenne</span>
          </div>
          <div className="text-2xl font-bold text-slate-200">85%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-slate-400">Équipes en risque</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">2</div>
        </div>
      </div>

      {/* Liste équipes */}
      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-blue-400" />
                  <h3 className="text-base font-semibold text-slate-200">{team.name}</h3>
                  <Badge
                    variant={team.status === 'optimal' ? 'default' : team.status === 'over-allocated' ? 'destructive' : 'warning'}
                    className={cn(
                      'text-xs',
                      team.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      team.status === 'over-allocated' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    )}
                  >
                    {team.status === 'optimal' ? 'Optimal' : team.status === 'over-allocated' ? 'Sur-allocation' : 'Sous-utilisation'}
                  </Badge>
                  {team.risk === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      Risque élevé
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Allocation:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-900/50 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full',
                            team.allocation <= 75 ? 'bg-emerald-500' :
                            team.allocation <= 90 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${team.allocation}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{team.allocation}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Productivité:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-900/50 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full',
                            team.productivity >= 85 ? 'bg-emerald-500' :
                            team.productivity >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${team.productivity}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{team.productivity}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium mb-1">Recommandation:</p>
                  <p className="text-sm text-slate-300">{team.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

