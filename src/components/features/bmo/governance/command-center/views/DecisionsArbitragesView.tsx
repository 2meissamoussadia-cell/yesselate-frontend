/**
 * Décisions & Arbitrages - Onglet 2
 * Centralise toutes les décisions stratégiques en attente, les arbitrages à fort impact
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  ArrowUpRight,
  MessageSquare,
  ChevronRight,
  Play,
  MoreHorizontal,
  FileText,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données mock pour la démo
const strategicDecisions = [
  {
    id: '1',
    ref: 'DEC-2024-089',
    title: 'Validation avenant budget lot 3 - Projet Alpha',
    type: 'budget',
    impact: 'high' as const,
    status: 'pending' as const,
    deadline: '12/01/2025',
    holder: 'J. Martin',
    createdAt: '08/01/2025',
  },
  {
    id: '2',
    ref: 'DEC-2024-090',
    title: 'Prolongation délai phase 2 - Projet Beta',
    type: 'planning',
    impact: 'medium' as const,
    status: 'pending' as const,
    deadline: '14/01/2025',
    holder: 'M. Dupont',
    createdAt: '09/01/2025',
  },
  {
    id: '3',
    ref: 'DEC-2024-091',
    title: 'Remplacement sous-traitant électricité',
    type: 'contract',
    impact: 'high' as const,
    status: 'pending' as const,
    deadline: '15/01/2025',
    holder: 'S. Bernard',
    createdAt: '10/01/2025',
  },
];

const blockedDecisions = [
  {
    id: '4',
    ref: 'DEC-2024-085',
    title: 'Approbation devis travaux supplémentaires',
    type: 'budget',
    impact: 'high' as const,
    blockingTime: '12j',
    blockingReason: 'En attente validation financière',
    estimatedImpact: '450K€',
  },
  {
    id: '5',
    ref: 'DEC-2024-082',
    title: 'Validation changement périmètre projet',
    type: 'scope',
    impact: 'medium' as const,
    blockingTime: '8j',
    blockingReason: 'Conflit avec autre décision',
    estimatedImpact: '120K€',
  },
];

const highImpactArbitrations = [
  {
    id: '1',
    ref: 'ARB-2024-045',
    title: 'Arbitrage goulot d\'étranglement - Ressources',
    financialImpact: '850K€',
    operationalImpact: 'Critique',
    priority: 'high' as const,
    module: 'arbitrages',
    createdAt: '11/01/2025',
  },
  {
    id: '2',
    ref: 'ARB-2024-042',
    title: 'Arbitrage budget - Projet Gamma',
    financialImpact: '1.2M€',
    operationalImpact: 'Majeur',
    priority: 'high' as const,
    module: 'arbitrages',
    createdAt: '10/01/2025',
  },
];

const criticalValidations = [
  {
    id: '1',
    ref: 'VAL-2024-123',
    title: 'Validation BC #2847 - Projet Alpha',
    amount: '450K€',
    type: 'bc',
    validator: 'DG',
    validatedAt: '05/01/2025',
    impact: 'Débloqué situation critique',
  },
  {
    id: '2',
    ref: 'VAL-2024-118',
    title: 'Validation avenant - Projet Beta',
    amount: '680K€',
    type: 'avenant',
    validator: 'BMO',
    validatedAt: '03/01/2025',
    impact: 'Généré escalade',
  },
];

export function DecisionsArbitragesView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();
  const [selectedTab, setSelectedTab] = useState<'decisions' | 'blocked' | 'arbitrages' | 'history'>(
    'decisions'
  );

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/50">
        <button
          onClick={() => setSelectedTab('decisions')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'decisions'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          Décisions stratégiques
          {strategicDecisions.length > 0 && (
            <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
              {strategicDecisions.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setSelectedTab('blocked')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'blocked'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          Décisions bloquées
          {blockedDecisions.length > 0 && (
            <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {blockedDecisions.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setSelectedTab('arbitrages')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'arbitrages'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          Arbitrages à fort impact
          {highImpactArbitrations.length > 0 && (
            <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              {highImpactArbitrations.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'history'
              ? 'border-slate-500 text-slate-300'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          Historique validations critiques
        </button>
      </div>

      {/* Contenu selon l'onglet sélectionné */}
      {selectedTab === 'decisions' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-300">Décisions stratégiques</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Décision
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Impact
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Échéance
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">
                    Porteur
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {strategicDecisions.map((decision) => (
                  <tr
                    key={decision.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => openModal('decision', decision)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-slate-300">{decision.title}</p>
                        <span className="text-xs text-slate-400">{decision.ref}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="default"
                        className="bg-slate-800/50 text-slate-400 border-slate-700 text-xs"
                      >
                        {decision.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          decision.impact === 'high'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        )}
                      >
                        {decision.impact === 'high' ? 'Élevé' : 'Moyen'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{decision.deadline}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{decision.holder}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('decision', { ...decision, action: 'validate' });
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('decision', { ...decision, action: 'refuse' });
                          }}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-slate-400 hover:text-slate-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('decision', decision);
                          }}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'blocked' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-slate-300">Décisions bloquées</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {blockedDecisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('decision', decision)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-1 h-12 rounded-full bg-red-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{decision.title}</p>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Bloqué {decision.blockingTime}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{decision.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{decision.blockingReason}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-red-400">Impact: {decision.estimatedImpact}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('decision', { ...decision, action: 'unblock' });
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Débloquer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'arbitrages' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-medium text-slate-300">Arbitrages à fort impact</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {highImpactArbitrations.map((arbitration) => (
              <div
                key={arbitration.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('decision', arbitration)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                    <Scale className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300">{arbitration.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{arbitration.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-amber-400">
                        Impact financier: {arbitration.financialImpact}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        Impact opérationnel: {arbitration.operationalImpact}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('decision', { ...arbitration, action: 'validate' });
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Valider
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'history' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-medium text-slate-300">
                Historique des validations critiques
              </h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {criticalValidations.map((validation) => (
              <div
                key={validation.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('validation-detail', validation)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300">{validation.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{validation.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-emerald-400">Montant: {validation.amount}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">
                        Validé par: {validation.validator}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{validation.validatedAt}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-amber-400">{validation.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
