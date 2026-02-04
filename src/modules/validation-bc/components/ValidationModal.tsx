/**
 * Modal de validation pour Validation-BC
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DocumentValidation } from '../types/validationTypes';

interface ValidationModalProps {
  open: boolean;
  document: DocumentValidation | null;
  onClose: () => void;
  onConfirm: (comment?: string) => Promise<void>;
}

export function ValidationModal({
  open,
  document,
  onClose,
  onConfirm,
}: ValidationModalProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(comment || undefined);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Erreur de validation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Valider le document
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Vous allez valider le document <strong>{document.numero}</strong> - {document.titre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Document */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-400 mb-1">
                  Confirmation de validation
                </p>
                <p className="text-xs text-slate-400">
                  Ce document sera marqué comme validé et sera visible dans l'historique des
                  validations.
                </p>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-slate-300">
              Commentaire (optionnel)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter un commentaire à la validation..."
              className="min-h-[100px] bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500"
              disabled={loading}
            />
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
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? 'Validation...' : 'Confirmer la validation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

