'use client';

import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface CreateFoncierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: FoncierFormData) => void | Promise<void>;
}

export interface FoncierFormData {
  titre: string;
  description: string;
  type: 'acquisition' | 'cession' | 'location' | 'servitude';
  localisation: string;
  surface?: number;
}

export function CreateFoncierDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateFoncierDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FoncierFormData>({
    titre: '',
    description: '',
    type: 'acquisition',
    localisation: '',
    surface: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.localisation) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
      // Reset form
      setFormData({
        titre: '',
        description: '',
        type: 'acquisition',
        localisation: '',
        surface: undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur création dossier foncier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              Nouveau dossier foncier
            </DialogTitle>
            <DialogDescription>
              Créer un nouveau dossier de gestion foncière (acquisition, cession, location, servitude)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titre">
                Titre du dossier <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Acquisition terrain rue des Lilas"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type d'opération <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: FoncierFormData['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acquisition">🏗️ Acquisition</SelectItem>
                    <SelectItem value="cession">📤 Cession</SelectItem>
                    <SelectItem value="location">🏘️ Location</SelectItem>
                    <SelectItem value="servitude">⚖️ Servitude</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surface">Surface (m²)</Label>
                <Input
                  id="surface"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.surface ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      surface: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="1500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localisation">
                Localisation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="localisation"
                value={formData.localisation}
                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                placeholder="Ex: Dakar, Parcelles Assainies"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails du dossier foncier..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.titre || !formData.localisation}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le dossier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
