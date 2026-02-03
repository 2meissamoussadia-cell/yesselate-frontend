/**
 * Modale de liaison d'événement à un chantier
 */

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCalendrierData } from '../../hooks/useCalendrierData';

interface LierChantierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    event_id: number;
    chantier_id: number;
  }) => void;
}

export function LierChantierModal({
  isOpen,
  onClose,
  onSave,
}: LierChantierModalProps) {
  const { data } = useCalendrierData();
  const [event_id, setEvent_id] = useState<number>(0);
  const [chantier_id, setChantier_id] = useState<number>(0);

  const handleSave = () => {
    if (!event_id || !chantier_id) return;
    
    onSave({
      event_id,
      chantier_id,
    });
    
    // Reset
    setEvent_id(0);
    setChantier_id(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-200">Lier un événement à un chantier</DialogTitle>
          <DialogDescription className="text-slate-400">
            Associer un événement existant à un chantier
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="event_id" className="text-slate-300">Événement ID *</Label>
            <Input
              id="event_id"
              type="number"
              value={event_id || ''}
              onChange={(e) => setEvent_id(parseInt(e.target.value) || 0)}
              placeholder="ID de l'événement"
              className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
            />
          </div>
          <div>
            <Label htmlFor="chantier_id" className="text-slate-300">Chantier *</Label>
            <Select 
              value={chantier_id.toString()} 
              onValueChange={(v) => setChantier_id(parseInt(v))}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 mt-1">
                <SelectValue placeholder="Sélectionner un chantier" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {data?.chantiers?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={!event_id || !chantier_id}>
            Lier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

