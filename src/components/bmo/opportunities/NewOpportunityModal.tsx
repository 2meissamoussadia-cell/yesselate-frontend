'use client';

/**
 * NewOpportunityModal — Fiche complète nouvelle opportunité (4 onglets).
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OpportunityForm } from './OpportunityForm';
import { formDataToRow } from './opportunityFormUtils';
import type { OpportunityFormData, OpportunityRow } from './types';

export interface NewOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  /** Reçoit la ligne complète (avec id) à ajouter à la liste */
  onSave?: (data: OpportunityRow) => void;
  nextId?: string;
}

const emptyFormData: OpportunityFormData = {
  code: '',
  projet: '',
  phase: 0,
  statutPipeline: 'En étude',
  proba: 50,
  devise: 'FCFA',
  pays: 'Sénégal',
};

export function NewOpportunityModal({
  open,
  onClose,
  onSave,
  nextId = '1',
}: NewOpportunityModalProps) {
  const [data, setData] = useState<OpportunityFormData>(emptyFormData);

  const handleSubmit = useCallback(() => {
    const row = formDataToRow(data, nextId);
    onSave?.(row);
    setData(emptyFormData);
    onClose();
  }, [data, nextId, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setData(emptyFormData);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-slate-100">
            Nouvelle opportunité
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto min-h-0 flex-1 pr-2 -mr-2">
          <OpportunityForm
            data={data}
            onChange={setData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Créer l'opportunité"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
