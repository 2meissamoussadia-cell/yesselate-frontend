/**
 * Modal de prise de décision
 * Workflow de validation avec impact et options
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Target,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  FolderKanban,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { logger } from '@/lib/utils/logger';

export function DecisionModal() {
  const { modal, closeModal } = useGovernanceCommandCenterStore();
  const [selectedOption, setSelectedOption] = useState<'approve' | 'reject' | 'defer' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only render for decision type
  if (!modal.isOpen || modal.type !== 'decision') return null;

  const data = modal.data || {};
  const isNew = data.isNew;

  const impactConfig = {
    high: { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Impact élevé' },
    medium: { icon: Minus, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Impact moyen' },
    low: { icon: TrendingDown, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Impact faible' },
  };

  const impact = impactConfig[data.impact as keyof typeof impactConfig] || impactConfig.medium;
  const ImpactIcon = impact.icon;

  const handleSubmit = async () => {
    if (!selectedOption) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/gouvernance/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option: selectedOption,
          comment: comment.trim() || undefined,
          data: { ...data, ref: data.ref },
        }),
      });
      const json = await res.json();
      if (json.success) {
        logger.debug('Decision submitted', { component: 'DecisionModal', option: selectedOption, id: json.id });
      } else {
        logger.warn('Decision API error', { component: 'DecisionModal', error: json.error });
      }
    } catch (err) {
      logger.error('Decision submit failed', err instanceof Error ? err : undefined, { component: 'DecisionModal' });
    } finally {
      setIsSubmitting(false);
      closeModal();
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-slate-900 border-slate-700 p-0 gap-0 max-w-2xl">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-200">
                  {isNew ? 'Nouvelle décision' : 'Décision à prendre'}
                </DialogTitle>
                {!isNew && data.ref && (
                  <p className="text-xs text-slate-400 mt-0.5">{data.ref}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400"
              onClick={closeModal}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title/Subject */}
          {isNew ? (
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Objet de la décision
              </label>
              <input
                type="text"
                placeholder="Titre de la décision..."
                className="mt-1 w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          ) : (
            <div>
              <h3 className="text-base font-medium text-slate-200">{data.title}</h3>
              {data.description && (
                <p className="text-sm text-slate-400 mt-2">{data.description}</p>
              )}
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={User}
              label="Demandeur"
              value={data.requestedBy || 'Non spécifié'}
            />
            <InfoCard
              icon={FolderKanban}
              label="Projet"
              value={data.project || 'Général'}
            />
            <InfoCard
              icon={Calendar}
              label="Échéance"
              value={data.deadline || 'Non définie'}
              highlight={!!data.deadline}
            />
            <InfoCard
              icon={ImpactIcon}
              label="Impact"
              value={impact.label}
              valueClass={impact.color}
            />
          </div>

          {/* Impact Details */}
          {data.impactDetails && (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <h4 className="text-xs font-medium text-slate-400 uppercase mb-2">
                Détail de l'impact
              </h4>
              <p className="text-sm text-slate-400">{data.impactDetails}</p>
            </div>
          )}

          {/* Decision Options */}
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              Votre décision
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <DecisionOption
                icon={CheckCircle2}
                label="Approuver"
                description="Valider la demande"
                color="emerald"
                selected={selectedOption === 'approve'}
                onClick={() => setSelectedOption('approve')}
              />
              <DecisionOption
                icon={XCircle}
                label="Rejeter"
                description="Refuser la demande"
                color="red"
                selected={selectedOption === 'reject'}
                onClick={() => setSelectedOption('reject')}
              />
              <DecisionOption
                icon={Clock}
                label="Reporter"
                description="Décider plus tard"
                color="amber"
                selected={selectedOption === 'defer'}
                onClick={() => setSelectedOption('defer')}
              />
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Commentaire {selectedOption === 'reject' && <span className="text-red-400">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                selectedOption === 'reject'
                  ? 'Motif du refus (obligatoire)...'
                  : 'Ajouter un commentaire (optionnel)...'
              }
              className="mt-1 w-full h-24 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-slate-700/50 bg-slate-900/80">
          <div className="text-xs text-slate-400">
            {data.pendingSince && `En attente depuis ${data.pendingSince}`}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-700" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              size="sm"
              className={cn(
                'transition-colors',
                selectedOption === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : selectedOption === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
              disabled={!selectedOption || (selectedOption === 'reject' && !comment.trim()) || isSubmitting}
              onClick={() => handleSubmit()}
            >
              {selectedOption === 'approve' ? 'Approuver' :
               selectedOption === 'reject' ? 'Rejeter' :
               selectedOption === 'defer' ? 'Reporter' : 'Soumettre'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  valueClass = '',
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClass?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 rounded-lg',
      highlight ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-800/30'
    )}>
      <Icon className="h-4 w-4 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={cn('text-sm truncate', valueClass || 'text-slate-300')}>{value}</p>
      </div>
    </div>
  );
}

function DecisionOption({
  icon: Icon,
  label,
  description,
  color,
  selected,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: 'emerald' | 'red' | 'amber';
  selected: boolean;
  onClick: () => void;
}) {
  const colorClasses = {
    emerald: {
      bg: selected ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:border-emerald-500/30',
      icon: selected ? 'text-emerald-400' : 'text-slate-400',
      text: selected ? 'text-emerald-400' : 'text-slate-400',
    },
    red: {
      bg: selected ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:border-red-500/30',
      icon: selected ? 'text-red-400' : 'text-slate-400',
      text: selected ? 'text-red-400' : 'text-slate-400',
    },
    amber: {
      bg: selected ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:border-amber-500/30',
      icon: selected ? 'text-amber-400' : 'text-slate-400',
      text: selected ? 'text-amber-400' : 'text-slate-400',
    },
  };

  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border transition-all text-left',
        colors.bg
      )}
    >
      <Icon className={cn('h-5 w-5 mb-2', colors.icon)} />
      <p className={cn('text-sm font-medium', colors.text)}>{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </button>
  );
}

