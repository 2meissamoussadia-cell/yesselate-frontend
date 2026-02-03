'use client';

/**
 * Modale de replanification
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReplanifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    nouvelleDate: string;
    nouvelleHeure?: string;
    justification: string;
  }) => void;
  elementLabel: string;
  dateActuelle: string;
}

export function ReplanifierModal({
  isOpen,
  onClose,
  onSave,
  elementLabel,
  dateActuelle,
}: ReplanifierModalProps) {
  const [nouvelleDate, setNouvelleDate] = useState('');
  const [nouvelleHeure, setNouvelleHeure] = useState('');
  const [justification, setJustification] = useState('');

  const handleSave = () => {
    if (!nouvelleDate.trim() || !justification.trim()) return;
    onSave({ nouvelleDate, nouvelleHeure, justification });
    // Reset
    setNouvelleDate('');
    setNouvelleHeure('');
    setJustification('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-200">Replanifier</DialogTitle>
          <DialogDescription className="text-slate-400">
            {elementLabel}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-slate-300">Date actuelle</Label>
            <Input
              value={new Date(dateActuelle).toLocaleString('fr-FR')}
              disabled
              className="bg-slate-800 border-slate-700 text-slate-400 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nouvelleDate" className="text-slate-300">Nouvelle date *</Label>
              <Input
                id="nouvelleDate"
                type="date"
                value={nouvelleDate}
                onChange={(e) => setNouvelleDate(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="nouvelleHeure" className="text-slate-300">Nouvelle heure</Label>
              <Input
                id="nouvelleHeure"
                type="time"
                value={nouvelleHeure}
                onChange={(e) => setNouvelleHeure(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="justification" className="text-slate-300">Justification *</Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Raison de la replanification"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!nouvelleDate.trim() || !justification.trim()}>
            Replanifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

