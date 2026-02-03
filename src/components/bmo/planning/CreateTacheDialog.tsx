'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface CreateTacheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date | null;
}

export function CreateTacheDialog({
  open,
  onOpenChange,
  defaultDate,
}: CreateTacheDialogProps) {
  const [titre, setTitre] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [journeeComplete, setJourneeComplete] = useState(false);

  useEffect(() => {
    if (open && defaultDate) {
      const d = defaultDate instanceof Date ? defaultDate : new Date(defaultDate);
      const iso = d.toISOString().slice(0, 16);
      setDateDebut(iso);
      const end = new Date(d);
      end.setHours(end.getHours() + 1);
      setDateFin(end.toISOString().slice(0, 16));
    } else if (open) {
      const now = new Date();
      const iso = now.toISOString().slice(0, 16);
      setDateDebut(iso);
      const end = new Date(now);
      end.setHours(end.getHours() + 1);
      setDateFin(end.toISOString().slice(0, 16));
    }
  }, [open, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: mutation create tache
    onOpenChange(false);
    setTitre('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titre">Titre</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Intitulé de la tâche"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut">Début</Label>
              <Input
                id="dateDebut"
                type="datetime-local"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateFin">Fin</Label>
              <Input
                id="dateFin"
                type="datetime-local"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {defaultDate && (
            <p className="text-xs text-slate-500">
              Création le {format(defaultDate, 'EEEE d MMMM', { locale: fr })} à{' '}
              {format(defaultDate, 'HH:mm', { locale: fr })}
            </p>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="journeeComplete"
              checked={journeeComplete}
              onChange={(e) => setJourneeComplete(e.target.checked)}
              className="rounded border-slate-300"
            />
            <Label htmlFor="journeeComplete" className="font-normal cursor-pointer">
              Journée complète
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
