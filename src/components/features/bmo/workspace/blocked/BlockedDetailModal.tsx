/**
 * Blocked Detail Modal
 * Pattern Modal Overlay pour module Blocked
 * 
 * MANQUANT dans BlockedContentRouter.tsx :
 * - Utilise openModal('decision-center') au lieu du pattern Modal Overlay
 * - Pas de navigation ← → entre dossiers
 * - Pas de hook useListNavigation
 */

'use client';

import React from 'react';
import { UniversalDetailModal, useListNavigation } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Building2,
  Clock,
  Calendar,
  FileText,
  User,
  DollarSign,
  TrendingUp,
  Scale,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { BlockedDossier } from '@/lib/types/bmo.types';

interface BlockedDetailModalProps {
  dossiers: BlockedDossier[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onResolve?: (id: string) => void;
  onEscalade?: (id: string) => void;
  onSubstitute?: (id: string) => void;
}

export function BlockedDetailModal({
  dossiers,
  selectedId,
  onClose,
  onPrevious,
  onNext,
  onResolve,
  onEscalade,
  onSubstitute,
}: BlockedDetailModalProps) {
  const dossier = dossiers.find((d) => d.id === selectedId);

  if (!dossier) return null;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'low':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getDelayColor = (delay: number) => {
    if (delay > 7) return 'text-rose-400';
    if (delay > 3) return 'text-amber-400';
    return 'text-slate-400';
  };

  const impactLabels: Record<string, string> = {
    critical: 'Critique',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
  };

  return (
    <UniversalDetailModal
      isOpen={!!selectedId}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      title={dossier.subject}
      subtitle={`${dossier.type} • ${dossier.bureau}`}
      headerColor="rose"
      width="xl"
      actions={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEscalade?.(dossier.id)}
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Escalader
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSubstitute?.(dossier.id)}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Scale className="w-4 h-4 mr-1" />
            Substitution
          </Button>
          <Button
            size="sm"
            onClick={() => onResolve?.(dossier.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Résoudre
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alert Banner */}
        <div className="p-4 bg-gradient-to-r from-rose-500/10 to-transparent rounded-xl border border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-100">Blocage {impactLabels[dossier.impact]}</div>
                <div className="text-sm text-slate-400 mt-1">
                  Bloqué depuis {dossier.delay} jour{dossier.delay > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getImpactColor(dossier.impact)}>
                {impactLabels[dossier.impact]}
              </Badge>
              <Badge className={cn('font-bold', getDelayColor(dossier.delay))}>
                +{dossier.delay}j
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <InfoCard
            icon={<FileText className="w-5 h-5 text-blue-400" />}
            label="Type"
            value={dossier.type}
          />
          <InfoCard
            icon={<Building2 className="w-5 h-5 text-purple-400" />}
            label="Bureau"
            value={dossier.bureau}
          />
          <InfoCard
            icon={<User className="w-5 h-5 text-cyan-400" />}
            label="Responsable"
            value={dossier.responsible}
          />
          <InfoCard
            icon={<Calendar className="w-5 h-5 text-emerald-400" />}
            label="Bloqué depuis"
            value={new Date(dossier.blockedSince).toLocaleDateString('fr-FR')}
          />
          <InfoCard
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            label="Délai"
            value={`${dossier.delay} jour${dossier.delay > 1 ? 's' : ''}`}
            badge={<span className={cn('text-xs font-bold', getDelayColor(dossier.delay))}>+{dossier.delay}j</span>}
          />
          {dossier.amount && (
            <InfoCard
              icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
              label="Montant"
              value={dossier.amount}
            />
          )}
          {dossier.project && (
            <InfoCard
              icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
              label="Projet"
              value={dossier.project}
              fullWidth
            />
          )}
        </div>

        {/* Raison du blocage */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Raison du blocage
          </h3>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-sm text-slate-300 leading-relaxed">{dossier.reason}</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Actions BMO
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <ActionCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              title="Résoudre"
              description="Marquer comme résolu"
              onClick={() => onResolve?.(dossier.id)}
              color="emerald"
            />
            <ActionCard
              icon={<AlertCircle className="w-5 h-5 text-orange-400" />}
              title="Escalader"
              description="Escalader au niveau supérieur"
              onClick={() => onEscalade?.(dossier.id)}
              color="orange"
            />
            <ActionCard
              icon={<Scale className="w-5 h-5 text-purple-400" />}
              title="Substitution"
              description="Utiliser le pouvoir de substitution"
              onClick={() => onSubstitute?.(dossier.id)}
              color="purple"
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </h3>
          <div className="space-y-3">
            <TimelineItem
              date={new Date(dossier.blockedSince).toLocaleString('fr-FR')}
              user={dossier.responsible}
              action="Dossier bloqué"
              status="error"
            />
            <TimelineItem
              date={new Date().toLocaleString('fr-FR')}
              user="BMO"
              action="Prise en charge par le BMO"
              status="warning"
            />
          </div>
        </div>
      </div>
    </UniversalDetailModal>
  );
}

// Helper Components
function InfoCard({
  icon,
  label,
  value,
  badge,
  fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        'p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:bg-slate-800/50 transition-colors',
        fullWidth && 'col-span-2'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-200">{value}</div>
        {badge}
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: 'emerald' | 'orange' | 'purple';
}) {
  const colorClasses = {
    emerald: 'border-emerald-500/30 hover:bg-emerald-500/10',
    orange: 'border-orange-500/30 hover:bg-orange-500/10',
    purple: 'border-purple-500/30 hover:bg-purple-500/10',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border bg-slate-800/30 transition-colors text-left',
        colorClasses[color]
      )}
    >
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-sm font-semibold text-slate-200 mb-1">{title}</div>
      <div className="text-xs text-slate-400">{description}</div>
    </button>
  );
}

function TimelineItem({
  date,
  user,
  action,
  status,
}: {
  date: string;
  user: string;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error';
}) {
  const colors = {
    info: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
        <div className="w-px h-full bg-slate-700/50 mt-1" />
      </div>
      <div className="flex-1 pb-4">
        <div className="text-sm font-medium text-slate-200">{action}</div>
        <div className="text-xs text-slate-400 mt-1">
          {user} • {date}
        </div>
      </div>
    </div>
  );
}

// Hook pour utiliser dans BlockedContentRouter
export function useBlockedListNavigation(dossiers: BlockedDossier[]) {
  return useListNavigation(dossiers, (dossier) => dossier.id);
}

