/**
 * Composant ContratCard pour afficher un contrat
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ChevronRight, Calendar } from 'lucide-react';
import type { Contrat } from '../types/contratsTypes';

interface ContratCardProps {
  contrat: Contrat;
  onView?: (id: string) => void;
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export function ContratCard({ contrat, onView, onSelect, selected }: ContratCardProps) {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'EN_ATTENTE':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'VALIDE':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'REJETE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'NEGOCIATION':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div
      className={cn(
        'bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors',
        selected && 'border-purple-500/50 bg-purple-500/5'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect?.(contrat.id)}
              className="rounded border-slate-600"
            />
            <span className="text-sm font-medium text-slate-200">{contrat.numero}</span>
            <Badge className={cn('text-xs', getPrioriteColor(contrat.priorite))}>
              {contrat.priorite}
            </Badge>
            <Badge className={cn('text-xs', getStatusColor(contrat.statut))}>
              {contrat.statut.replace('_', ' ')}
            </Badge>
          </div>

          <div className="text-sm text-slate-300 mb-1">{contrat.type.replace('_', ' ')}</div>
          <div className="text-base font-medium text-slate-200 mb-2">{contrat.titre}</div>
          <div className="text-sm text-slate-400 mb-3">{contrat.description}</div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{contrat.entreprise}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Échéance: {new Date(contrat.dateEcheance).toLocaleDateString('fr-FR')} ({contrat.dureeMois} mois)
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-lg font-bold text-slate-200">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0,
            }).format(contrat.montant)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(contrat.id)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

