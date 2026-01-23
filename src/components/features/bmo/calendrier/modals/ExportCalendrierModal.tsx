/**
 * Modal d'export pour Calendrier
 * Supporte iCal (.ics) et Excel (.xlsx)
 */

'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendrierDomain, CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';

interface ExportCalendrierModalProps {
  open: boolean;
  onClose: () => void;
  domain?: CalendrierDomain;
  section?: CalendrierSection | null;
  period?: 'week' | 'month' | 'quarter';
  onExport?: (format: 'ical' | 'excel', config: ExportConfig) => Promise<void>;
}

interface ExportConfig {
  format: 'ical' | 'excel';
  period: 'week' | 'month' | 'quarter';
  includeDetails: boolean;
  includeAbsences: boolean;
  includeMeetings: boolean;
  includeMilestones: boolean;
}

export function ExportCalendrierModal({
  open,
  onClose,
  domain = 'overview',
  section,
  period = 'month',
  onExport,
}: ExportCalendrierModalProps) {
  const [format, setFormat] = useState<'ical' | 'excel'>('ical');
  const [config, setConfig] = useState<Omit<ExportConfig, 'format'>>({
    period,
    includeDetails: true,
    includeAbsences: true,
    includeMeetings: true,
    includeMilestones: true,
  });
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      if (onExport) {
        await onExport(format, { ...config, format });
      } else {
        // Mock export
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Simuler le téléchargement
        const filename = `calendrier-export-${new Date().toISOString().split('T')[0]}.${format === 'ical' ? 'ics' : 'xlsx'}`;
        console.log(`Export ${format.toUpperCase()} vers ${filename}`);
        
        // TODO: Implémenter le vrai export
        // Pour iCal: générer fichier .ics
        // Pour Excel: utiliser une librairie comme xlsx
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setExporting(false);
    }
  };

  const periodLabel = period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Trimestre';

  return (
    <FluentModal open={open} onClose={onClose} title="Exporter le calendrier" maxWidth="2xl" dark>
      <div className="space-y-6">
        {/* Format selection */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">Format d'export</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('ical')}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                format === 'ical'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className={cn('h-5 w-5', format === 'ical' ? 'text-blue-400' : 'text-slate-400')} />
                <span className={cn('font-medium', format === 'ical' ? 'text-blue-400' : 'text-slate-300')}>
                  iCal (.ics)
                </span>
              </div>
              <p className="text-xs text-slate-500">Outlook, Google Calendar, Apple Calendar</p>
            </button>

            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                format === 'excel'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <FileSpreadsheet className={cn('h-5 w-5', format === 'excel' ? 'text-emerald-400' : 'text-slate-400')} />
                <span className={cn('font-medium', format === 'excel' ? 'text-emerald-400' : 'text-slate-300')}>
                  Excel (.xlsx)
                </span>
              </div>
              <p className="text-xs text-slate-500">Microsoft Excel, Google Sheets</p>
            </button>
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">Options d'export</label>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <div>
                <div className="text-sm text-slate-200">Période</div>
                <div className="text-xs text-slate-500">{periodLabel} en cours</div>
              </div>
              <Badge variant="gray">{periodLabel}</Badge>
            </div>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="text-sm text-slate-200">Inclure les détails</div>
                <div className="text-xs text-slate-500">Descriptions, participants, etc.</div>
              </div>
              <input
                type="checkbox"
                checked={config.includeDetails}
                onChange={(e) => setConfig({ ...config, includeDetails: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="text-sm text-slate-200">Inclure les absences</div>
                <div className="text-xs text-slate-500">Congés et absences des équipes</div>
              </div>
              <input
                type="checkbox"
                checked={config.includeAbsences}
                onChange={(e) => setConfig({ ...config, includeAbsences: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="text-sm text-slate-200">Inclure les réunions</div>
                <div className="text-xs text-slate-500">Instances et réunions de chantier</div>
              </div>
              <input
                type="checkbox"
                checked={config.includeMeetings}
                onChange={(e) => setConfig({ ...config, includeMeetings: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors">
              <div>
                <div className="text-sm text-slate-200">Inclure les jalons</div>
                <div className="text-xs text-slate-500">Jalons critiques et contrats</div>
              </div>
              <input
                type="checkbox"
                checked={config.includeMilestones}
                onChange={(e) => setConfig({ ...config, includeMilestones: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || success}
            className="min-w-32"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Exporté !
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </>
            )}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}

