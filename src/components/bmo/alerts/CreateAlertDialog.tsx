'use client';

import React, { useState, useEffect } from 'react';
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
import { sanitizeTextForComment } from '@/lib/utils/sanitize';
import type { AlerteBTP } from '@/lib/types/alerts-btp.types';

const MAX_TITRE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

export interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: string;
}

const NIVEAUX: { id: AlerteBTP['niveau']; label: string }[] = [
  { id: 'faible', label: 'Faible' },
  { id: 'normal', label: 'Normal' },
  { id: 'important', label: 'Important' },
  { id: 'critique', label: 'Critique' },
];
const CATEGORIES: { id: AlerteBTP['categorie']; label: string }[] = [
  { id: 'technique', label: 'Technique' },
  { id: 'planning', label: 'Planning' },
  { id: 'qualite', label: 'Qualité' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'financier', label: 'Financier' },
  { id: 'budget', label: 'Budget' },
  { id: 'juridique', label: 'Juridique' },
];

export function CreateAlertDialog({ open, onOpenChange, type = 'technique' }: CreateAlertDialogProps) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [titreError, setTitreError] = useState(false);
  const [niveau, setNiveau] = useState<AlerteBTP['niveau']>('normal');
  const [categorie, setCategorie] = useState<AlerteBTP['categorie']>(type as AlerteBTP['categorie']);
  const createMutation = useCreateAlerte();

  useEffect(() => {
    if (open) setTitreError(false);
  }, [open]);

  const titreTrimmed = titre.trim();
  const isFormValid = titreTrimmed.length > 0 && titreTrimmed.length <= MAX_TITRE_LENGTH && description.length <= MAX_DESCRIPTION_LENGTH;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titreTrimmed) {
      setTitreError(true);
      return;
    }
    setTitreError(false);
    const safeTitre = sanitizeTextForComment(titreTrimmed).slice(0, MAX_TITRE_LENGTH);
    const safeDescription = sanitizeTextForComment(description.trim()).slice(0, MAX_DESCRIPTION_LENGTH);
    if (!safeTitre) {
      setTitreError(true);
      return;
    }

    createMutation.mutate(
      {
        titre: safeTitre,
        description: safeDescription,
        niveau,
        statut: 'non-traite',
        categorie,
        priorite: 'moyenne',
        urgent: niveau === 'critique' || niveau === 'important',
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
          setNiveau('normal');
          setCategorie(type as AlerteBTP['categorie']);
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
          {createMutation.isError && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {(createMutation.error as Error)?.message ?? 'Erreur lors de la création'}
            </div>
          )}
          <div>
            <Label htmlFor="titre">Titre *</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => {
                setTitre(e.target.value.slice(0, MAX_TITRE_LENGTH));
                setTitreError(false);
              }}
              onBlur={() => setTitreError((prev) => prev || !titre.trim())}
              placeholder="Titre de l'alerte"
              maxLength={MAX_TITRE_LENGTH}
              required
              aria-invalid={titreError}
              aria-describedby={titreError ? 'titre-error' : undefined}
              className={titreError ? 'border-red-500 dark:border-red-500' : ''}
            />
            {titreError && (
              <p id="titre-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                Le titre est obligatoire.
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              {titre.length} / {MAX_TITRE_LENGTH}
            </p>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
              placeholder="Description (max. 2000 caractères)"
              maxLength={MAX_DESCRIPTION_LENGTH}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y max-h-[200px] overflow-y-auto"
              aria-describedby="description-count"
            />
            <p id="description-count" className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
              {description.length} / {MAX_DESCRIPTION_LENGTH}
            </p>
          </div>
          <div>
            <Label htmlFor="niveau">Niveau</Label>
            <select
              id="niveau"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value as AlerteBTP['niveau'])}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {NIVEAUX.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="categorie">Catégorie</Label>
            <select
              id="categorie"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value as AlerteBTP['categorie'])}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !isFormValid}>
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
