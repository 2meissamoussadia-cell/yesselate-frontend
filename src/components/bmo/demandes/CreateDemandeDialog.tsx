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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDemande } from '@/modules/demandes/hooks/useDemandesMutations';
import type { DemandeService } from '@/modules/demandes/types/demandesTypes';

export interface CreateDemandeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: DemandeService;
}

const SERVICES: { value: DemandeService; label: string }[] = [
  { value: 'achats', label: 'Achats' },
  { value: 'finance', label: 'Finance' },
  { value: 'juridique', label: 'Juridique' },
  { value: 'rh', label: 'RH' },
  { value: 'autre', label: 'Autre' },
];

export function CreateDemandeDialog({
  open,
  onOpenChange,
  type = 'autre',
}: CreateDemandeDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [service, setService] = useState<DemandeService>(type);
  const createMutation = useCreateDemande();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        service,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setService(type);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle demande</DialogTitle>
          <DialogDescription>
            Créer une demande pour le service {service}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Objet de la demande"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails de la demande..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="service">Service</Label>
            <Select value={service} onValueChange={(v) => setService(v as DemandeService)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
