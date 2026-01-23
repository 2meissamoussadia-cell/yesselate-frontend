'use client';

import type { RefObject } from 'react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, FileJson, Image as ImageIcon, Link2 } from 'lucide-react';
import { downloadBlob, exportElementAsPdf, exportJsonFile, toCsv } from '@/lib/utils/export';

interface AdvancedExportProps {
  data: any;
  type: 'analytics' | 'comparison' | 'anomalies';
  fileName?: string;
  targetRef?: RefObject<HTMLElement | null>;
}

export function AdvancedExport({ data, type, fileName, targetRef }: AdvancedExportProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    addToast('Génération du PDF en cours...', 'info');

    try {
      const el = targetRef?.current;
      if (!el) {
        addToast("Impossible d'exporter en PDF : zone de capture non disponible.", 'error');
        return;
      }
      await exportElementAsPdf(el, `${fileName || 'export'}-${new Date().toISOString().split('T')[0]}.pdf`, {
        background: '#0f172a',
        scale: 2,
      });
      addToast('PDF exporté avec succès !', 'success');
    } catch {
      addToast("Erreur lors de l'export PDF.", 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToCsv = async () => {
    setExporting(true);
    addToast('Génération du CSV (Excel compatible) en cours...', 'info');

    try {
      const rows = Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [data as any];
      const csv = toCsv(rows, { delimiter: ';', withBom: true });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${fileName || 'export'}-${new Date().toISOString().split('T')[0]}.csv`);
      addToast('CSV exporté avec succès !', 'success');
    } catch {
      addToast("Erreur lors de l'export CSV.", 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToJson = async () => {
    setExporting(true);
    addToast('Génération du JSON en cours...', 'info');

    try {
      exportJsonFile(data, `${fileName || 'export'}-${new Date().toISOString().split('T')[0]}.json`);
      addToast('JSON exporté avec succès !', 'success');
    } catch {
      addToast("Erreur lors de l'export JSON.", 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportToPng = async () => {
    setExporting(true);
    addToast('Capture PNG en cours...', 'info');

    try {
      const el = targetRef?.current;
      if (!el) {
        addToast("Impossible d'exporter en PNG : zone de capture non disponible.", 'error');
        return;
      }
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        scrollX: 0,
        scrollY: -window.scrollY,
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          addToast("Erreur lors de la génération de l'image.", 'error');
          return;
        }
        downloadBlob(blob, `${fileName || 'export'}-${new Date().toISOString().split('T')[0]}.png`);
        addToast('PNG exporté avec succès !', 'success');
      }, 'image/png');
    } catch {
      addToast("Erreur lors de l'export PNG.", 'error');
    } finally {
      setExporting(false);
    }
  };

  const canCapture = Boolean(targetRef?.current);
  const title = useMemo(() => {
    if (type === 'comparison') return 'Export comparaisons';
    if (type === 'anomalies') return 'Export anomalies';
    return 'Export avancé';
  }, [type]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Lien copié (partage rapide)', 'success');
    } catch {
      addToast("Impossible de copier le lien (droits navigateur).", 'warning');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant="default"
            onClick={exportToPDF}
            disabled={exporting || !canCapture}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">PDF</span>
          </Button>
          <Button
            variant="default"
            onClick={exportToCsv}
            disabled={exporting}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-xs">CSV</span>
          </Button>
          <Button
            variant="default"
            onClick={exportToJson}
            disabled={exporting}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <FileJson className="w-5 h-5" />
            <span className="text-xs">JSON</span>
          </Button>
          <Button
            variant="default"
            onClick={exportToPng}
            disabled={exporting || !canCapture}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs">PNG</span>
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={copyLink} disabled={exporting} className="text-xs gap-2">
            <Link2 className="w-3.5 h-3.5" />
            Copier le lien
          </Button>
          {!canCapture && (
            <span className="text-[10px] text-slate-400">
              PDF/PNG : dispo quand la page fournit une zone de capture
            </span>
          )}
        </div>

        {exporting && (
          <div className="mt-3 text-center">
            <Badge variant="info" className="text-xs">
              ⏳ Export en cours...
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

