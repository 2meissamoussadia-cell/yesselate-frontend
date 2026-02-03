'use client';

/**
 * OpportunityDetailModal — Fiche opportunité complète (4 onglets) en lecture ou édition.
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OpportunityForm } from './OpportunityForm';
import { rowToFormData, formDataToRow } from './opportunityFormUtils';
import type { OpportunityRow, OpportunityFormData } from './types';
import { Pencil } from 'lucide-react';

export interface OpportunityDetailModalProps {
  open: boolean;
  onClose: () => void;
  opportunity: OpportunityRow | null;
  onSave?: (row: OpportunityRow) => void;
}

export function OpportunityDetailModal({
  open,
  onClose,
  opportunity,
  onSave,
}: OpportunityDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<OpportunityFormData>({});

  React.useEffect(() => {
    if (opportunity) {
      setFormData(rowToFormData(opportunity));
      setEditing(false);
    }
  }, [opportunity]);

  const handleSave = useCallback(() => {
    if (!opportunity) return;
    const row = formDataToRow(formData, opportunity.id);
    onSave?.(row);
    setEditing(false);
    onClose();
  }, [opportunity, formData, onSave, onClose]);

  const handleCancelEdit = useCallback(() => {
    if (opportunity) setFormData(rowToFormData(opportunity));
    setEditing(false);
  }, [opportunity]);

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader className="flex flex-row items-center justify-between gap-2">
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {opportunity.projet} — {opportunity.code}
          </DialogTitle>
          {!editing && onSave && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Modifier
            </Button>
          )}
        </DialogHeader>
        <div className="overflow-y-auto min-h-0 flex-1 pr-2 -mr-2">
          <OpportunityForm
            data={formData}
            onChange={setFormData}
            onSubmit={editing ? handleSave : undefined}
            onCancel={editing ? handleCancelEdit : undefined}
            submitLabel="Enregistrer"
            readOnly={!editing}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
