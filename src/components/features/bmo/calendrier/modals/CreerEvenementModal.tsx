'use client';

/**
 * Modale de création d'événement
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreerEvenementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    titre: string;
    date: string;
    heure: string;
    type: string;
    description?: string;
    bureau?: string;
  }) => void;
  dateInitiale?: Date;
}

export function CreerEvenementModal({
  isOpen,
  onClose,
  onSave,
  dateInitiale,
}: CreerEvenementModalProps) {
  const [titre, setTitre] = useState('');
  const [date, setDate] = useState(
    dateInitiale ? dateInitiale.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [heure, setHeure] = useState('09:00');
  const [type, setType] = useState('meeting');
  const [description, setDescription] = useState('');
  const [bureau, setBureau] = useState('');

  const handleSave = () => {
    if (!titre.trim()) return;
    onSave({ titre, date, heure, type, description, bureau });
    // Reset
    setTitre('');
    setDate(new Date().toISOString().split('T')[0]);
    setHeure('09:00');
    setType('meeting');
    setDescription('');
    setBureau('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-200">Créer un nouvel événement</DialogTitle>
          <DialogDescription className="text-slate-400">
            Ajouter un événement au calendrier
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="titre" className="text-slate-300">Titre *</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de l'événement"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-slate-300">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heure" className="text-slate-300">Heure *</Label>
              <Input
                id="heure"
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="type" className="text-slate-300">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="meeting">Réunion</SelectItem>
                <SelectItem value="deadline">Échéance</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="mission">Mission</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bureau" className="text-slate-300">Bureau</Label>
            <Select value={bureau} onValueChange={setBureau}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue placeholder="Sélectionner un bureau" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="BMO">BMO</SelectItem>
                <SelectItem value="BF">BF</SelectItem>
                <SelectItem value="BJ">BJ</SelectItem>
                <SelectItem value="BD">BD</SelectItem>
                <SelectItem value="BA">BA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'événement"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!titre.trim()}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

