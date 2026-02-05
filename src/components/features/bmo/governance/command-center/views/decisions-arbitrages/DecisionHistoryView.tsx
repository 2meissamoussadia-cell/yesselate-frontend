/**
 * Décisions & Arbitrages > Historique décisions
 * Toutes décisions prises (derniers 3 mois), Qui a décidé, quand, pourquoi, Implémentation de la décision, Suivi des effets
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  TrendingUp,
} from 'lucide-react';

export function DecisionHistoryView() {
  const decisions = [
    {
      id: '1',
      ref: 'DEC-2024-085',
      title: 'Validation avenant budget lot 2',
      decision: 'approved',
      decidedBy: 'J. Martin',
      decidedAt: '05/01/2025',
      reason: 'Dépassement justifié par conditions météo',
      implementation: 'En cours',
      effects: 'Budget ajusté, projet débloqué',
    },
    {
      id: '2',
      ref: 'DEC-2024-082',
      title: 'Prolongation délai phase 1',
      decision: 'approved',
      decidedBy: 'M. Dupont',
      decidedAt: '28/12/2024',
      reason: 'Retard acceptable compte tenu des contraintes',
      implementation: 'Terminé',
      effects: 'Délai prolongé de 10 jours, pénalités réduites',
    },
    {
      id: '3',
      ref: 'DEC-2024-078',
      title: 'Changement périmètre projet',
      decision: 'rejected',
      decidedBy: 'S. Bernard',
      decidedAt: '20/12/2024',
      reason: 'Impact budgétaire trop important',
      implementation: 'N/A',
      effects: 'Projet maintenu dans périmètre initial',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-200">Historique décisions</h2>
        <p className="text-sm text-slate-400 mt-1">
          Toutes décisions prises (derniers 3 mois), qui a décidé, quand, pourquoi, implémentation, suivi des effets
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
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-mono text-slate-400">{decision.ref}</span>
                  <Badge
                    variant={decision.decision === 'approved' ? 'default' : 'destructive'}
                    className={cn(
                      'text-xs',
                      decision.decision === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''
                    )}
                  >
                    {decision.decision === 'approved' ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approuvé
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejeté
                      </>
                    )}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-3">{decision.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Décidé par:</p>
                    <div className="flex items-center gap-1 text-slate-300">
                      <User className="h-3 w-3" />
                      <span>{decision.decidedBy}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Date:</p>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Calendar className="h-3 w-3" />
                      <span>{decision.decidedAt}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-400 font-medium mb-1">Raison:</p>
                    <p className="text-slate-300">{decision.reason}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-400 font-medium mb-1">Implémentation:</p>
                    <p className="text-slate-300">{decision.implementation}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-400 font-medium mb-1">Effets:</p>
                    <p className="text-slate-300">{decision.effects}</p>
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

