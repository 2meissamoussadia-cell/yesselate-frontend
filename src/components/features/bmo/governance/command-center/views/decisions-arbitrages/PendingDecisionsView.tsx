/**
 * Décisions & Arbitrages > Décisions en attente
 * Liste décisions à prendre, Contexte/enjeux pour chacune, Propositions de résolution, Urgence et impact
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  AlertCircle,
  Scale,
  ArrowUpRight,
  Calendar,
  User,
} from 'lucide-react';

export function PendingDecisionsView() {
  const decisions = [
    {
      id: '1',
      ref: 'DEC-2024-089',
      title: 'Validation avenant budget lot 3 - Projet Alpha',
      context: 'Dépassement budgétaire de 450K€ nécessitant validation direction',
      proposal: 'Approuver avenant avec réduction périmètre lot 4',
      urgency: 'high',
      impact: 'high',
      deadline: '12/01/2025',
      holder: 'J. Martin',
      type: 'budget',
    },
    {
      id: '2',
      ref: 'DEC-2024-090',
      title: 'Prolongation délai phase 2 - Projet Beta',
      context: 'Retard de 15 jours dû à conditions météo défavorables',
      proposal: 'Accepter prolongation avec pénalités réduites',
      urgency: 'medium',
      impact: 'medium',
      deadline: '14/01/2025',
      holder: 'M. Dupont',
      type: 'planning',
    },
    {
      id: '3',
      ref: 'DEC-2024-091',
      title: 'Remplacement sous-traitant électricité',
      context: 'Sous-traitant actuel en faillite, nécessité remplacement urgent',
      proposal: 'Valider nouveau sous-traitant proposé par équipe projet',
      urgency: 'critical',
      impact: 'high',
      deadline: '15/01/2025',
      holder: 'S. Bernard',
      type: 'contract',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Décisions en attente</h2>
        <p className="text-sm text-slate-400 mt-1">
          Liste décisions à prendre, contexte/enjeux, propositions de résolution, urgence et impact
        </p>
      </div>

      <div className="space-y-4">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-slate-400">{decision.ref}</span>
                  <Badge
                    variant={decision.urgency === 'critical' ? 'destructive' : decision.urgency === 'high' ? 'warning' : 'default'}
                    className="text-xs"
                  >
                    {decision.urgency === 'critical' ? 'Urgent' : decision.urgency === 'high' ? 'Élevé' : 'Moyen'}
                  </Badge>
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {decision.type}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-2">{decision.title}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400 font-medium">Contexte:</p>
                    <p className="text-slate-300">{decision.context}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Proposition:</p>
                    <p className="text-slate-300">{decision.proposal}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Échéance: {decision.deadline}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{decision.holder}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Impact: {decision.impact === 'high' ? 'Élevé' : 'Moyen'}</span>
                </div>
              </div>
              <Button variant="default" size="sm" className="border-slate-700 text-slate-400">
                Voir dossier
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

