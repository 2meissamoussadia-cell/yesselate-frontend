/**
 * Composant Card Alerte pour le module Alertes & Risques
 * Conforme au design system avec border left coloré
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  User,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  AlertCircle,
  Ban,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import type { Alerte } from '../types/alertesTypes';

export interface AlerteCardProps {
  alerte: Alerte;
  onClick?: () => void;
  onAction?: () => void;
  className?: string;
}

const typeConfig: Record<string, { color: string; bg: string; border: string; icon: LucideIcon }> = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/5',
    border: 'border-red-500',
    icon: AlertTriangle,
  },
  warning: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500',
    icon: AlertCircle,
  },
  info: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500',
    icon: AlertCircle,
  },
  success: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500',
    icon: CheckCircle2,
  },
};

const getDaysSince = (date: Date) => {
  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export function AlerteCard({ alerte, onClick, onAction, className }: AlerteCardProps) {
  const config = typeConfig[alerte.severite] || typeConfig.info;
  const daysSince = getDaysSince(alerte.dateCreation);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card
      className={cn(
        'min-h-[140px] cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md',
        config.bg,
        'border-l-4',
        config.border,
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold text-slate-200 line-clamp-2 flex-1">
            {alerte.titre}
          </CardTitle>
          <Badge
            variant={alerte.severite === 'critical' ? 'urgent' : alerte.severite === 'warning' ? 'warning' : 'info'}
            className="shrink-0"
          >
            {alerte.severite === 'critical' ? 'Critique' : alerte.severite === 'warning' ? 'Avertissement' : 'Info'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400 line-clamp-2">{alerte.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          {alerte.bureau && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">{alerte.bureau}</span>
            </div>
          )}
          {alerte.responsable && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">{alerte.responsable}</span>
            </div>
          )}
          {alerte.montant && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span className="text-slate-400">
                {alerte.montant.toLocaleString('fr-FR')} {alerte.devise || 'XOF'}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-400">{daysSince} jour{daysSince > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">Créé le {formatDate(alerte.dateCreation)}</p>
          {onAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              className="h-7 text-xs"
            >
              Traiter maintenant
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

