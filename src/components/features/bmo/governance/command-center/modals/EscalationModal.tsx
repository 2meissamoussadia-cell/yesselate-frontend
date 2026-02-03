/**
 * Modal d'escalade
 * Formulaire pour escalader un problème à un niveau supérieur
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
  ArrowUpRight,
  X,
  AlertTriangle,
  User,
  Users,
  Building2,
  Clock,
  FolderKanban,
  FileText,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { logger } from '@/lib/utils/logger';

export function EscalationModal() {
  const { modal, closeModal } = useGovernanceCommandCenterStore();
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [urgency, setUrgency] = useState<'normal' | 'high' | 'critical'>('normal');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only render for escalation type
  if (!modal.isOpen || modal.type !== 'escalation') return null;

  const data = modal.data || {};
  const source = data.source;
  const isNew = data.isNew;

  const levels = [
    {
      level: 1 as const,
      label: 'Niveau 1',
      description: 'Chef de projet / Manager',
      icon: User,
      recipients: ['Jean Dupont (Chef de projet)', 'Marie Martin (Manager)'],
    },
    {
      level: 2 as const,
      label: 'Niveau 2',
      description: 'Direction Opérationnelle',
      icon: Users,
      recipients: ['Pierre Bernard (Dir. Ops)', 'Sophie Durand (Dir. Tech)'],
    },
    {
      level: 3 as const,
      label: 'Niveau 3',
      description: 'Direction Générale',
      icon: Building2,
      recipients: ['Thomas Martin (DG)', 'Claire Petit (DGA)'],
    },
  ];

  const urgencies = [
    { id: 'normal' as const, label: 'Normal', description: 'Traitement sous 48h', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    { id: 'high' as const, label: 'Urgent', description: 'Traitement sous 24h', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'critical' as const, label: 'Critique', description: 'Traitement immédiat', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ];

  const currentLevel = levels.find(l => l.level === selectedLevel)!;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/gouvernance/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: selectedLevel,
          recipient: selectedRecipient,
          urgency,
          description: description.trim(),
          source: data?.source,
        }),
      });
      const json = await res.json();
      if (json.success) {
        logger.debug('Escalation submitted', { component: 'EscalationModal', id: json.id });
      } else {
        logger.warn('Escalation API error', { component: 'EscalationModal', error: json.error });
      }
    } catch (err) {
      logger.error('Escalation submit failed', err instanceof Error ? err : undefined, { component: 'EscalationModal' });
    } finally {
      setIsSubmitting(false);
      closeModal();
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-0 gap-0 max-w-2xl">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-200">
                  {isNew ? 'Nouvelle escalade' : 'Escalader le problème'}
                </DialogTitle>
                {source && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Source: {source.reference || source.designation}
                  </p>
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
        <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Source Info (if from existing item) */}
          {source && (
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center gap-2 mb-2">
                <FolderKanban className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400">Élément source</span>
              </div>
              <p className="text-sm text-slate-300">{source.designation}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="text-xs bg-slate-700/50 text-slate-400 border-slate-600">
                  {source.reference}
                </Badge>
                {source.project && (
                  <span className="text-xs text-slate-400">{source.project}</span>
                )}
              </div>
            </div>
          )}

          {/* Subject (if new) */}
          {isNew && (
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Objet de l'escalade
              </label>
              <input
                type="text"
                placeholder="Titre du problème..."
                className="mt-1 w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
          )}

          {/* Escalation Level */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">
              Niveau d'escalade
            </label>
            <div className="grid grid-cols-3 gap-3">
              {levels.map((level) => {
                const Icon = level.icon;
                const isSelected = selectedLevel === level.level;
                return (
                  <button
                    key={level.level}
                    onClick={() => {
                      setSelectedLevel(level.level);
                      setSelectedRecipient('');
                    }}
                    className={cn(
                      'p-3 rounded-lg border transition-all text-left',
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50'
                        : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('h-4 w-4', isSelected ? 'text-amber-400' : 'text-slate-400')} />
                      <span className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-amber-400' : 'text-slate-400'
                      )}>
                        {level.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{level.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">
              Destinataire
            </label>
            <div className="space-y-2">
              {currentLevel.recipients.map((recipient) => (
                <button
                  key={recipient}
                  onClick={() => setSelectedRecipient(recipient)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                    selectedRecipient === recipient
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      selectedRecipient === recipient ? 'bg-blue-500/30' : 'bg-slate-700'
                    )}>
                      <User className={cn(
                        'h-4 w-4',
                        selectedRecipient === recipient ? 'text-blue-400' : 'text-slate-400'
                      )} />
                    </div>
                    <span className={cn(
                      'text-sm',
                      selectedRecipient === recipient ? 'text-slate-200' : 'text-slate-400'
                    )}>
                      {recipient}
                    </span>
                  </div>
                  {selectedRecipient === recipient && (
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">
              Urgence
            </label>
            <div className="flex gap-2">
              {urgencies.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setUrgency(u.id)}
                  className={cn(
                    'flex-1 p-2 rounded-lg border text-center transition-all',
                    urgency === u.id ? u.color : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                  )}
                >
                  <p className="text-sm font-medium">{u.label}</p>
                  <p className="text-xs opacity-70">{u.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Description du problème <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème et les actions déjà entreprises..."
              className="mt-1 w-full h-28 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-slate-700/50 bg-slate-900/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            L'escalade notifiera automatiquement le destinataire
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="border-slate-700" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!selectedRecipient || !description.trim() || isSubmitting}
              onClick={() => handleSubmit()}
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Escalader
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

