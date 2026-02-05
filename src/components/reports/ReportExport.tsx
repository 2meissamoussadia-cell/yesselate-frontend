'use client';

/**
 * ReportExport — Rapports et exports (Excel, PDF) pour prise de décision.
 * Catalogue prédéfinis DG, MOA, MOE, OPC ; planification et envoi par email.
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { AccessibleButton } from '@/components/ui/AccessibleButton';
import { FileSpreadsheet, FileText } from 'lucide-react';

export interface ReportExportProps {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  /** Afficher les deux boutons (défaut true) */
  showExcel?: boolean;
  showPdf?: boolean;
  className?: string;
}

export function ReportExport({
  onExportExcel,
  onExportPdf,
  showExcel = true,
  showPdf = true,
  className,
}: ReportExportProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {showExcel && (
        <AccessibleButton
          onClick={onExportExcel ?? (() => {})}
          ariaLabel="Exporter en Excel"
          variant="default"
          className="inline-flex items-center gap-2"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden />
          Exporter en Excel
        </AccessibleButton>
      )}
      {showPdf && (
        <AccessibleButton
          onClick={onExportPdf ?? (() => {})}
          ariaLabel="Exporter en PDF"
          variant="default"
          className="inline-flex items-center gap-2"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden />
          Exporter en PDF
        </AccessibleButton>
      )}
    </div>
  );
}
