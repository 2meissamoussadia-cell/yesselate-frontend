/**
 * Modale d'activation d'alerte
 */

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ActiverAlerteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: string;
    conditions: Record<string, any>;
  }) => void;
}

export function ActiverAlerteModal({
  isOpen,
  onClose,
  onSave,
}: ActiverAlerteModalProps) {
  const [type, setType] = useState('retard');
  const [seuil, setSeuil] = useState('');

  const handleSave = () => {
    if (!type) return;
    
    onSave({
      type,
      conditions: {
        seuil: seuil ? parseInt(seuil) : undefined,
      },
    });
    
    // Reset
    setType('retard');
    setSeuil('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-200">Activer une alerte</DialogTitle>
          <DialogDescription className="text-slate-400">
            Configurer une alerte pour le calendrier
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="type" className="text-slate-300">Type d'alerte *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="retard">Retard de jalon</SelectItem>
                <SelectItem value="sla_risque">Jalon SLA à risque</SelectItem>
                <SelectItem value="sur_allocation">Sur-allocation ressource</SelectItem>
                <SelectItem value="conflit">Conflit de planning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="seuil" className="text-slate-300">Seuil (jours)</Label>
            <Input
              id="seuil"
              type="number"
              value={seuil}
              onChange={(e) => setSeuil(e.target.value)}
              placeholder="Nombre de jours"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!type}>
            Activer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

