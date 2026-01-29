/**
 * Bouton "Exporter PDF" réutilisable pour les pages du dashboard.
 * À passer en action d'une DashboardSection : action={<ExportPDFButton />}
 */

'use client';

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardExport } from '../../hooks/useDashboardExport';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Format = 'pdf' | 'excel';

export interface ExportPDFButtonProps {
  /** Afficher uniquement PDF (défaut: pdf + excel en dropdown) */
  pdfOnly?: boolean;
  /** Label du bouton */
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportPDFButton({
  pdfOnly = false,
  label = 'Exporter PDF',
  className,
  variant = 'outline',
  size = 'sm',
}: ExportPDFButtonProps) {
  const { exportData } = useDashboardExport();
  const [exporting, setExporting] = useState<Format | null>(null);

  const handleExport = async (format: Format) => {
    setExporting(format);
    try {
      await exportData(format === 'excel' ? 'excel' : 'pdf');
      toast.success(format === 'pdf' ? 'Export PDF téléchargé' : 'Export Excel téléchargé');
    } catch (e) {
      toast.error(format === 'pdf' ? 'Erreur export PDF' : 'Erreur export Excel');
    } finally {
      setExporting(null);
    }
  };

  if (pdfOnly) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
        onClick={() => handleExport('pdf')}
        disabled={!!exporting}
      >
        <FileText className="h-4 w-4" />
        {exporting === 'pdf' ? 'Export…' : label}
      </Button>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant={variant}
        size={size}
        className="gap-2"
        onClick={() => handleExport('pdf')}
        disabled={!!exporting}
      >
        <FileText className="h-4 w-4" />
        {exporting === 'pdf' ? '…' : 'PDF'}
      </Button>
      <Button
        variant={variant}
        size={size}
        className="gap-2"
        onClick={() => handleExport('excel')}
        disabled={!!exporting}
      >
        <FileSpreadsheet className="h-4 w-4" />
        {exporting === 'excel' ? '…' : 'Excel'}
      </Button>
    </div>
  );
}
