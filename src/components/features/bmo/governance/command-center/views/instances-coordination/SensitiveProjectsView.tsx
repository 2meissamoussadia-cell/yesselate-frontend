/**
 * Instances & Coordination > Projets sensibles & priorités
 * Liste projets sensibles (critiques pour la MOA), Critères de sensibilité, Priorités stratégiques, Statut et enjeux par projet
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Target, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

export function SensitiveProjectsView() {
  const projects = [
    {
      id: '1',
      name: 'Projet Alpha',
      sensitivity: 'VIP/Image',
      priority: 'critical',
      status: 'at-risk',
      criteria: ['Projet VIP', 'Budget > 10M€', 'Retard > 15j'],
      stakes: 'Projet phare, impact image entreprise',
      budget: '18.7M€',
      delay: '15 jours',
    },
    {
      id: '2',
      name: 'Projet Beta',
      sensitivity: 'Budget',
      priority: 'high',
      status: 'on-track',
      criteria: ['Dépassement budget > 5%'],
      stakes: 'Dépassement budgétaire significatif',
      budget: '12.3M€',
      delay: '0 jour',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Projets sensibles & priorités</h2>
        <p className="text-sm text-slate-400 mt-1">
          Liste projets sensibles, critères de sensibilité, priorités stratégiques, statut et enjeux
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <h3 className="text-base font-semibold text-slate-200">{project.name}</h3>
                  <Badge
                    variant={project.priority === 'critical' ? 'destructive' : 'warning'}
                    className="text-xs"
                  >
                    {project.priority === 'critical' ? 'Critique' : 'Élevé'}
                  </Badge>
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {project.sensitivity}
                  </Badge>
                  <Badge
                    variant={project.status === 'on-track' ? 'default' : 'warning'}
                    className={cn(
                      'text-xs',
                      project.status === 'on-track' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''
                    )}
                  >
                    {project.status === 'on-track' ? 'On-track' : 'At-risk'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Critères de sensibilité:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.criteria.map((criterion, idx) => (
                        <Badge key={idx} variant="default" className="text-xs border-slate-700 text-slate-400">
                          {criterion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Enjeux:</p>
                    <p className="text-slate-300">{project.stakes}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Budget:</span>
                    <span className="text-slate-300">{project.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400">Retard:</span>
                    <span className={cn(
                      'text-slate-300',
                      project.delay !== '0 jour' && 'text-amber-400'
                    )}>
                      {project.delay}
                    </span>
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

