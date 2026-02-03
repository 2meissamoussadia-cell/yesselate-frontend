/**
 * Modal de confirmation pour les actions groupées
 * Affiche un formulaire selon le type d'action
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, TrendingUp, XCircle } from 'lucide-react';

export type BulkActionType = 'validate' | 'reject' | 'escalate';

interface BulkActionsConfirmModalProps {
  open: boolean;
  action: BulkActionType;
  count: number;
  onConfirm: (note: string, escalateTo?: string) => void;
  onCancel: () => void;
}

export function BulkActionsConfirmModal({
  open,
  action,
  count,
  onConfirm,
  onCancel,
}: BulkActionsConfirmModalProps) {
  const [note, setNote] = useState('');
  const [escalateTo, setEscalateTo] = useState('');

  const handleConfirm = () => {
    if (action === 'reject' && (!note || note.trim().length < 10)) {
      alert('La raison du rejet doit contenir au moins 10 caractères');
      return;
    }
    
    if (action === 'escalate') {
      if (!escalateTo) {
        alert('Veuillez sélectionner un destinataire');
        return;
      }
      if (!note || note.trim().length < 10) {
        alert('La raison de l\'escalade doit contenir au moins 10 caractères');
        return;
      }
    }

    onConfirm(note, escalateTo);
    setNote('');
    setEscalateTo('');
  };

  const handleCancel = () => {
    setNote('');
    setEscalateTo('');
    onCancel();
  };

  const config = {
    validate: {
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      title: `Valider ${count} contrat${count > 1 ? 's' : ''} ?`,
      description: 'Cette action validera tous les contrats sélectionnés.',
      noteLabel: 'Note commune (optionnel)',
      notePlaceholder: 'Ajouter une note pour tous les contrats...',
      confirmLabel: 'Valider tous',
      confirmClass: 'bg-emerald-500 hover:bg-emerald-600',
    },
    reject: {
      icon: XCircle,
      iconColor: 'text-red-500',
      title: `Rejeter ${count} contrat${count > 1 ? 's' : ''} ?`,
      description: 'Cette action rejettera tous les contrats sélectionnés.',
      noteLabel: 'Raison du rejet *',
      notePlaceholder: 'Indiquez la raison du rejet (minimum 10 caractères)...',
      confirmLabel: 'Rejeter tous',
      confirmClass: 'bg-red-500 hover:bg-red-600',
    },
    escalate: {
      icon: TrendingUp,
      iconColor: 'text-orange-500',
      title: `Escalader ${count} contrat${count > 1 ? 's' : ''} ?`,
      description: 'Cette action escalader tous les contrats sélectionnés.',
      noteLabel: 'Raison de l\'escalade *',
      notePlaceholder: 'Indiquez la raison de l\'escalade (minimum 10 caractères)...',
      confirmLabel: 'Escalader tous',
      confirmClass: 'bg-orange-500 hover:bg-orange-600',
    },
  };

  const { icon: Icon, iconColor, title, description, noteLabel, notePlaceholder, confirmLabel, confirmClass } = config[action];

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <DialogTitle className="text-slate-200">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {action === 'escalate' && (
            <div className="space-y-2">
              <Label className="text-slate-300">Escalader vers *</Label>
              <Select value={escalateTo || '__none__'} onValueChange={(value: string) => setEscalateTo(value === '__none__' ? '' : value)}>
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 rounded-md px-3 py-2">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sélectionner...</SelectItem>
                  <SelectItem value="direction">Direction</SelectItem>
                  <SelectItem value="dg">Directeur Général</SelectItem>
                  <SelectItem value="comite">Comité de Direction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-slate-300">{noteLabel}</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              className="bg-slate-800 border-slate-700 text-slate-200 min-h-[100px]"
            />
            {note.length > 0 && note.length < 10 && action !== 'validate' && (
              <p className="text-xs text-red-400">
                Minimum 10 caractères ({note.length}/10)
              </p>
            )}
          </div>

          {action === 'reject' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-400">
                Attention : Cette action est irréversible et tous les contrats sélectionnés seront rejetés.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-slate-700 text-slate-400"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className={`text-white ${confirmClass}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

