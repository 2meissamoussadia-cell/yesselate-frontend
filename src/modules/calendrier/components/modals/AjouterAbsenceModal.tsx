/**
 * Modale d'ajout d'absence
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalendrierData } from '../../hooks/useCalendrierData';
import { useCalendrierFilters } from '../../hooks/useCalendrierFilters';

interface AjouterAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    user_id: number;
    type: 'CONGÉ' | 'MISSION' | 'ABSENCE';
    date_debut: string;
    date_fin: string;
    motif?: string;
    chantier_id?: number;
  }) => void;
}

export function AjouterAbsenceModal({
  isOpen,
  onClose,
  onSave,
}: AjouterAbsenceModalProps) {
  const { data } = useCalendrierData();
  const { chantierId } = useCalendrierFilters();
  const [user_id, setUser_id] = useState<number>(0);
  const [type, setType] = useState<'CONGÉ' | 'MISSION' | 'ABSENCE'>('CONGÉ');
  const [date_debut, setDate_debut] = useState(new Date().toISOString().split('T')[0]);
  const [date_fin, setDate_fin] = useState(new Date().toISOString().split('T')[0]);
  const [motif, setMotif] = useState('');
  const [chantier_id, setChantier_id] = useState<number | undefined>(chantierId || undefined);

  useEffect(() => {
    if (chantierId) {
      setChantier_id(chantierId);
    }
  }, [chantierId]);

  const handleSave = () => {
    if (!user_id || !date_debut || !date_fin) return;
    
    onSave({
      user_id,
      type,
      date_debut,
      date_fin,
      motif: motif || undefined,
      chantier_id,
    });
    
    // Reset
    setUser_id(0);
    setType('CONGÉ');
    setDate_debut(new Date().toISOString().split('T')[0]);
    setDate_fin(new Date().toISOString().split('T')[0]);
    setMotif('');
    setChantier_id(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-200">Ajouter une absence</DialogTitle>
          <DialogDescription className="text-slate-400">
            Enregistrer une absence ou un congé
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="user_id" className="text-slate-300">Employé ID *</Label>
            <Input
              id="user_id"
              type="number"
              value={user_id || ''}
              onChange={(e) => setUser_id(parseInt(e.target.value) || 0)}
              placeholder="ID de l'employé"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-slate-300">Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="CONGÉ">Congé</SelectItem>
                <SelectItem value="MISSION">Mission</SelectItem>
                <SelectItem value="ABSENCE">Absence</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_debut" className="text-slate-300">Date début *</Label>
              <Input
                id="date_debut"
                type="date"
                value={date_debut}
                onChange={(e) => setDate_debut(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date_fin" className="text-slate-300">Date fin *</Label>
              <Input
                id="date_fin"
                type="date"
                value={date_fin}
                onChange={(e) => setDate_fin(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="chantier_id" className="text-slate-300">Chantier (optionnel)</Label>
            <Select 
              value={chantier_id?.toString() || ''} 
              onValueChange={(v) => setChantier_id(v ? parseInt(v) : undefined)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue placeholder="Sélectionner un chantier" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">Aucun</SelectItem>
                {data?.chantiers?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="motif" className="text-slate-300">Motif</Label>
            <Textarea
              id="motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Motif de l'absence"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!user_id || !date_debut || !date_fin}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

