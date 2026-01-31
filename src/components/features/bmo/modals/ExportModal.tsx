'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { exportDemands, type Queue } from '@/lib/api/demandesClient';
import { 
  Download, FileSpreadsheet, FileJson, CheckCircle2, 
  AlertTriangle, Loader2, FileDown
} from 'lucide-react';

const QUEUES: { value: Queue; label: string; description: string }[] = [
  { value: 'pending', label: 'À traiter', description: 'Demandes en attente de traitement' },
  { value: 'urgent', label: 'Urgentes', description: 'Demandes prioritaires urgentes' },
  { value: 'overdue', label: 'En retard', description: 'Demandes dépassant le SLA' },
  { value: 'validated', label: 'Validées', description: 'Demandes validées (historique)' },
  { value: 'rejected', label: 'Rejetées', description: 'Demandes rejetées (historique)' },
  { value: 'all', label: 'Toutes', description: 'Export complet de toutes les demandes' },
];

const FORMATS = [
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Compatible Excel, Calc' },
  { value: 'json', label: 'JSON', icon: FileJson, description: 'Format structuré pour développeurs' },
] as const;

export function ExportModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [queue, setQueue] = useState<Queue>('pending');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const download = async () => {
    setLoading(true);
    setErr(null);
    setSuccess(false);
    
    try {
      const blob = await exportDemands(queue, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demandes_${queue}_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      setSuccess(true);
      // Auto-reset success after 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setErr((e as Error)?.message ?? 'Export impossible');
    } finally {
      setLoading(false);
    }
  };

  const selectedQueue = QUEUES.find(q => q.value === queue);
  const selectedFormat = FORMATS.find(f => f.value === format);

  return (
    <FluentModal open={open} onClose={() => onOpenChange(false)} title="Exporter les demandes">
      <div className="space-y-5">
        {/* Sélection de la file */}
        <div>
          <label className="block text-sm font-medium mb-2">Sélectionner la file à exporter</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUEUES.map((q) => (
              <button
                key={q.value}
                onClick={() => setQueue(q.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  queue === q.value
                    ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <div className="font-medium text-sm">{q.label}</div>
                <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{q.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sélection du format */}
        <div>
          <label className="block text-sm font-medium mb-2">Format de fichier</label>
          <div className="grid grid-cols-2 gap-3">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    format === f.value
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-6 h-6 text-slate-400 flex-none mt-0.5" />
                  <div>
                    <div className="font-medium">{f.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{f.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aperçu du fichier */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
          <FileDown className="w-8 h-8 text-slate-400" />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-sm truncate">
              demandes_{queue}_{new Date().toISOString().slice(0, 10)}.{format}
            </div>
            <div className="text-xs text-slate-400">
              {selectedQueue?.label} • Format {selectedFormat?.label}
            </div>
          </div>
        </div>

        {/* Messages de feedback */}
        {err && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 flex-none" />
            <span className="text-sm">{err}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-none" />
            <span className="text-sm">Export téléchargé avec succès !</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Annuler
          </button>
          <button
            onClick={download}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Télécharger
              </>
            )}
          </button>
        </div>
      </div>
    </FluentModal>
  );
}
