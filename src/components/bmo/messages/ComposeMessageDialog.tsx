'use client';

/**
 * ComposeMessageDialog — Stub pour composition de message (à compléter).
 * Exporté par @/components/bmo pour éviter les imports cassés.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ComposeMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onSend?: (payload: { to?: string; subject?: string; body?: string }) => void;
}

export function ComposeMessageDialog({
  open,
  onClose,
  onSend,
}: ComposeMessageDialogProps) {
  const handleSend = () => {
    onSend?.({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau message</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm py-4">
          Formulaire de composition à compléter.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSend}>Envoyer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
