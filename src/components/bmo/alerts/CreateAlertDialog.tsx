'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateAlerte } from '@/hooks/alerts';
import type { AlerteBTP } from '@/lib/types/alerts-btp.types';

export interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: string;
}

export function CreateAlertDialog({ open, onOpenChange, type = 'technique' }: CreateAlertDialogProps) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const createMutation = useCreateAlerte();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;

    createMutation.mutate(
      {
        titre: titre.trim(),
        description: description.trim(),
        niveau: 'normal',
        statut: 'non-traite',
        categorie: type as AlerteBTP['categorie'],
        priorite: 'moyenne',
        urgent: false,
        chantier: { id: '', nom: '—', code: '' },
        emetteur: { id: '', nom: '—', role: '—' },
        dateCreation: new Date(),
        dateModification: new Date(),
        pieceJointes: [],
        commentaires: [],
        historique: [],
        archived: false,
        deleted: false,
        version: 1,
      },
      {
        onSuccess: () => {
          setTitre('');
          setDescription('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle alerte</DialogTitle>
          <DialogDescription>
            Créer une alerte de type {type}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titre">Titre *</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de l'alerte"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !titre.trim()}>
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
