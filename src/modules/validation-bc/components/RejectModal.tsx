/**
 * Modal de rejet pour Validation-BC
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DocumentValidation } from '../types/validationTypes';

interface RejectModalProps {
  open: boolean;
  document: DocumentValidation | null;
  onClose: () => void;
  onConfirm: (reason: string, comment?: string) => Promise<void>;
}

const REJECTION_REASONS = [
  { value: 'budget', label: 'Budget insuffisant' },
  { value: 'pieces', label: 'Pièces justificatives manquantes' },
  { value: 'montant', label: 'Montant incorrect ou incohérent' },
  { value: 'fournisseur', label: 'Fournisseur non agréé' },
  { value: 'procedure', label: 'Non-respect de la procédure' },
  { value: 'conformite', label: 'Non-conformité réglementaire' },
  { value: 'autre', label: 'Autre (préciser)' },
];

export function RejectModal({
  open,
  document,
  onClose,
  onConfirm,
}: RejectModalProps) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason || (reason === 'autre' && !comment.trim())) {
      return;
    }

    setLoading(true);
    try {
      const rejectionReason =
        reason === 'autre'
          ? comment
          : REJECTION_REASONS.find((r) => r.value === reason)?.label || reason;
      await onConfirm(rejectionReason, comment || undefined);
      setReason('');
      setComment('');
      onClose();
    } catch (error) {
      console.error('Erreur de rejet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

  const isCommentRequired = reason === 'autre';
  const canSubmit = reason && (!isCommentRequired || comment.trim().length >= 10);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-200">
            <XCircle className="h-5 w-5 text-red-400" />
            Rejeter le document
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Vous allez rejeter le document <strong>{document.numero}</strong> - {document.titre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400 mb-1">Attention</p>
                <p className="text-xs text-slate-400">
                  Le rejet de ce document nécessite un motif. Cette action sera enregistrée dans
                  l'historique.
                </p>
              </div>
            </div>
          </div>

          {/* Reason Select */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
              Motif du rejet <span className="text-red-400">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason} disabled={loading}>
              <SelectTrigger
                id="reason"
                className="bg-slate-800 border-slate-700 text-slate-200"
              >
                <SelectValue placeholder="Sélectionner un motif" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {REJECTION_REASONS.map((r) => (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    className="text-slate-200 hover:bg-slate-700"
                  >
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-slate-300">
              Commentaire {isCommentRequired && <span className="text-red-400">*</span>}
              {!isCommentRequired && <span className="text-slate-400">(optionnel)</span>}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isCommentRequired
                  ? 'Veuillez préciser le motif du rejet (minimum 10 caractères)...'
                  : 'Ajouter des détails sur le rejet...'
              }
              className={cn(
                'min-h-[100px] bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500',
                isCommentRequired && !comment.trim() && 'border-red-500/50'
              )}
              disabled={loading}
            />
            {isCommentRequired && comment.trim().length > 0 && comment.trim().length < 10 && (
              <p className="text-xs text-red-400">
                Le commentaire doit contenir au moins 10 caractères ({comment.trim().length}/10)
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit || loading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {loading ? 'Rejet en cours...' : 'Confirmer le rejet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
