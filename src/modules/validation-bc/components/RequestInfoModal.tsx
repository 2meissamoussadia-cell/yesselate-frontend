/**
 * Modal pour demander des informations complémentaires sur un document
 */

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';
import type { DocumentValidation } from '../types/validationTypes';

interface RequestInfoModalProps {
  open: boolean;
  document: DocumentValidation | null;
  onClose: () => void;
  onConfirm: (message: string) => Promise<void> | void;
}

export function RequestInfoModal({
  open,
  document,
  onClose,
  onConfirm,
}: RequestInfoModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await onConfirm(message);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la demande:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <DialogTitle className="text-xl text-slate-200">
              Demander des informations complémentaires
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Document: <span className="font-mono text-slate-300">{document.numero}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-slate-300">
              Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Précisez les informations ou documents complémentaires nécessaires pour traiter ce document..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400"
              disabled={loading}
            />
            <p className="text-xs text-slate-400">
              Votre demande sera envoyée au demandeur pour obtenir les compléments nécessaires.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-700 text-slate-300"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!message.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

