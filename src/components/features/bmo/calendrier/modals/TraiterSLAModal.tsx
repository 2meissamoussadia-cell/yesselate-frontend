'use client';

/**
 * Modale de traitement SLA
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SLA } from '@/lib/types/calendrier.types';

interface TraiterSLAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    action: 'traiter' | 'replanifier' | 'escalader';
    commentaire?: string;
    nouvelleDate?: string;
  }) => void;
  sla: SLA;
}

export function TraiterSLAModal({
  isOpen,
  onClose,
  onSave,
  sla,
}: TraiterSLAModalProps) {
  const [action, setAction] = useState<'traiter' | 'replanifier' | 'escalader'>('traiter');
  const [commentaire, setCommentaire] = useState('');
  const [nouvelleDate, setNouvelleDate] = useState('');

  const handleSave = () => {
    onSave({
      action,
      commentaire: commentaire.trim() || undefined,
      nouvelleDate: action === 'replanifier' ? nouvelleDate : undefined,
    });
    // Reset
    setAction('traiter');
    setCommentaire('');
    setNouvelleDate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-200">Traiter SLA</DialogTitle>
          <DialogDescription className="text-slate-400">
            {sla.elementLabel}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-slate-300">Module source</Label>
            <div className="mt-1 text-sm text-slate-400">{sla.moduleSource}</div>
          </div>
          <div>
            <Label className="text-slate-300">Échéance prévue</Label>
            <div className="mt-1 text-sm text-slate-400">
              {new Date(sla.echeancePrevue).toLocaleString('fr-FR')}
            </div>
            {sla.retard && (
              <div className="mt-1 text-sm text-rose-400">
                Retard: {sla.retard} jour{sla.retard > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="action" className="text-slate-300">Action *</Label>
            <Select value={action} onValueChange={(v: any) => setAction(v)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="traiter">Traiter maintenant</SelectItem>
                <SelectItem value="replanifier">Replanifier</SelectItem>
                <SelectItem value="escalader">Escalader</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {action === 'replanifier' && (
            <div>
              <Label htmlFor="nouvelleDate" className="text-slate-300">Nouvelle date *</Label>
              <Input
                id="nouvelleDate"
                type="datetime-local"
                value={nouvelleDate}
                onChange={(e) => setNouvelleDate(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>
          )}
          <div>
            <Label htmlFor="commentaire" className="text-slate-300">Commentaire</Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire sur le traitement"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={action === 'replanifier' && !nouvelleDate.trim()}
          >
            {action === 'traiter' && 'Traiter'}
            {action === 'replanifier' && 'Replanifier'}
            {action === 'escalader' && 'Escalader'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

