'use client';

/**
 * DailyReportModal — Modal rapport journalier (DPR) avec DailyReportForm.
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DailyReportForm } from './DailyReportForm';
import type { DailyReportFormData, DailyReportRow } from './types';

export interface DailyReportModalProps {
  open: boolean;
  onClose: () => void;
  /** Rapport existant (lecture/édition) ou null pour nouveau */
  report?: DailyReportRow | null;
  chantierPreselection?: { code: string; nom: string };
  onSave?: (data: DailyReportFormData) => void;
}

const emptyForm: DailyReportFormData = {
  date: new Date().toISOString().slice(0, 10),
  impactMeteo: 'Aucun',
};

export function DailyReportModal({
  open,
  onClose,
  report,
  chantierPreselection,
  onSave,
}: DailyReportModalProps) {
  const [formData, setFormData] = useState<DailyReportFormData>(() => {
    if (report) {
      return {
        id: report.id,
        chantierCode: report.chantierCode,
        chantierNom: report.chantierNom,
        date: report.date,
        numeroRapport: report.numeroRapport,
        chefChantier: report.chefChantier,
        entreprisePrincipale: report.entreprisePrincipale,
      };
    }
    return {
      ...emptyForm,
      chantierCode: chantierPreselection?.code ?? '',
      chantierNom: chantierPreselection?.nom ?? '',
    };
  });

  React.useEffect(() => {
    if (report) {
      setFormData({
        id: report.id,
        chantierCode: report.chantierCode,
        chantierNom: report.chantierNom,
        date: report.date,
        numeroRapport: report.numeroRapport,
        chefChantier: report.chefChantier,
        entreprisePrincipale: report.entreprisePrincipale,
      });
    } else {
      setFormData({
        ...emptyForm,
        chantierCode: chantierPreselection?.code ?? '',
        chantierNom: chantierPreselection?.nom ?? '',
      });
    }
  }, [report, chantierPreselection]);

  const handleSave = useCallback(() => {
    onSave?.(formData);
    onClose();
  }, [formData, onSave, onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-slate-100">
            {report ? `Rapport journalier — ${report.chantierNom} (${report.date})` : 'Nouveau rapport journalier (DPR)'}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto min-h-0 flex-1 pr-1 -mr-1">
          <DailyReportForm
            data={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            onCancel={onClose}
            readOnly={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
