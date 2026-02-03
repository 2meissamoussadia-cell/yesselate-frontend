'use client';

/**
 * ExportDialog — Modal d'export (PDF, CSV, JSON)
 */

import React, { useState } from 'react';
import { ExportManager, ExportFormat, type AlerteExportRow } from '@/lib/export-import/export-manager';
import { Download, FileText, File, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

export interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AlerteExportRow[];
  type: 'alerts' | 'demandes' | 'chantiers';
}

export function ExportDialog({
  open,
  onOpenChange,
  data,
  type,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const handleExport = async () => {
    await ExportManager.exportAlertes(data, {
      format,
      includeMetadata,
    });
    onOpenChange(false);
  };

  const formatOptions: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'csv', label: 'CSV', icon: <FileSpreadsheet className="h-5 w-5" /> },
    { value: 'pdf', label: 'PDF', icon: <FileText className="h-5 w-5" /> },
    { value: 'json', label: 'JSON', icon: <File className="h-5 w-5" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporter les données</DialogTitle>
          <DialogDescription>
            {data.length} élément(s) sélectionné(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
            >
              {formatOptions.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label
                    htmlFor={opt.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {opt.icon}
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="metadata"
              checked={includeMetadata}
              onCheckedChange={(c) => setIncludeMetadata(c === true)}
            />
            <Label htmlFor="metadata" className="cursor-pointer">
              Inclure métadonnées
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
