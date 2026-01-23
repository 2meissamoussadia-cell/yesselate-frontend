/**
 * Formulaire d'Édition d'Élément BTP
 * Permet de modifier les informations d'un élément
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ElementEditFormData {
  nom?: string;
  statut?: string;
  responsable?: string;
  localisation?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  description?: string;
}

interface BTPElementEditFormProps {
  elementId: string;
  elementType: string;
  initialData: ElementEditFormData;
  onSave: (data: ElementEditFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BTPElementEditForm({
  elementId,
  elementType,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: BTPElementEditFormProps) {
  const [formData, setFormData] = useState<ElementEditFormData>(initialData);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (field: keyof ElementEditFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving element:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const statutOptions = ['En cours', 'Terminé', 'En attente', 'Annulé', 'Planifié'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations générales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Informations générales</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nom" className="text-sm text-slate-400">
              Nom
            </Label>
            <Input
              id="nom"
              value={formData.nom || ''}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              className="mt-1 bg-slate-900/50 border-slate-700 text-slate-300"
              required
            />
          </div>

          <div>
            <Label htmlFor="statut" className="text-sm text-slate-400">
              Statut
            </Label>
            <Select
              value={formData.statut || ''}
              onValueChange={(value) => handleInputChange('statut', value)}
            >
              <SelectTrigger className="mt-1 bg-slate-900/50 border-slate-700 text-slate-300">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {statutOptions.map((statut) => (
                  <SelectItem key={statut} value={statut}>
                    {statut}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="responsable" className="text-sm text-slate-400">
              Responsable
            </Label>
            <Input
              id="responsable"
              value={formData.responsable || ''}
              onChange={(e) => handleInputChange('responsable', e.target.value)}
              className="mt-1 bg-slate-900/50 border-slate-700 text-slate-300"
            />
          </div>

          <div>
            <Label htmlFor="localisation" className="text-sm text-slate-400">
              Localisation
            </Label>
            <Input
              id="localisation"
              value={formData.localisation || ''}
              onChange={(e) => handleInputChange('localisation', e.target.value)}
              className="mt-1 bg-slate-900/50 border-slate-700 text-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm text-slate-400">
              Date de début
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="mt-1 bg-slate-900/50 border-slate-700 text-slate-300"
            />
          </div>

          <div>
            <Label htmlFor="endDate" className="text-sm text-slate-400">
              Date de fin
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="mt-1 bg-slate-900/50 border-slate-700 text-slate-300"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm text-slate-400">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="mt-1 bg-slate-900/50 border-slate-700 text-slate-300"
            rows={4}
          />
        </div>

        {/* Tags */}
        <div>
          <Label className="text-sm text-slate-400">Tags</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {formData.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="bg-slate-800 text-slate-300 border-slate-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Ajouter un tag"
              className="bg-slate-900/50 border-slate-700 text-slate-300"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="default"
              size="sm"
            >
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <Button
          type="button"
          variant="default"
          onClick={onCancel}
          disabled={isSaving || isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSaving || isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}

