'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Zap, Calendar, Pause, Play, Trash2, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { executeBatchAction } from '@/lib/services/validation-bc-api';

interface Document {
  id: string;
  type: 'bc' | 'facture' | 'avenant';
  title: string;
  amount?: number;
  status: string;
}

interface ValidationBCBatchActionsProps {
  open: boolean;
  documents: Document[];
  onClose: () => void;
  onComplete: () => void;
}

export function ValidationBCBatchActions({ open, documents, onClose, onComplete }: ValidationBCBatchActionsProps) {
  const [action, setAction] = useState<'validate' | 'reject' | 'suspend' | 'reactivate' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [reason, setReason] = useState('');

  const handleExecute = async () => {
    if (!action) return;

    setProcessing(true);
    try {
      const documentIds = documents.map((d) => d.id);
      const response = await executeBatchAction({
        action,
        documentIds,
        reason: reason || undefined,
      });

      alert(`Succès: ${response.success} | Échecs: ${response.failed}\n\n${response.message}`);

      onComplete();
      onClose();
      setAction(null);
      setReason('');
    } catch (error) {
      console.error('Batch action failed:', error);
      alert('Erreur lors de l\'exécution: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <FluentModal open={open} title={`Actions en masse — ${documents.length} document(s)`} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
          <div className="text-sm text-blue-900 dark:text-blue-200 font-semibold">
            Appliquer une action à {documents.length} document(s) sélectionné(s)
          </div>
          <div className="text-xs text-blue-800/90 dark:text-blue-200/90 mt-1">
            Les actions en masse sont auditées et traçables.
          </div>
        </div>

        {!action ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction('validate')}
              className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left"
            >
              <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
              <div className="font-semibold text-sm">Valider tout</div>
              <div className="text-xs text-slate-400">Validation en masse</div>
            </button>

            <button
              onClick={() => setAction('reject')}
              className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left"
            >
              <X className="w-6 h-6 text-rose-500 mb-2" />
              <div className="font-semibold text-sm">Rejeter tout</div>
              <div className="text-xs text-slate-400">Rejet en masse</div>
            </button>

            <button
              onClick={() => setAction('suspend')}
              className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
            >
              <Pause className="w-6 h-6 text-amber-500 mb-2" />
              <div className="font-semibold text-sm">Suspendre</div>
              <div className="text-xs text-slate-400">Suspension temporaire</div>
            </button>

            <button
              onClick={() => setAction('reactivate')}
              className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
            >
              <Play className="w-6 h-6 text-blue-500 mb-2" />
              <div className="font-semibold text-sm">Réactiver</div>
              <div className="text-xs text-slate-400">Reprise du traitement</div>
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="font-semibold mb-2">
                Action: <span className="text-purple-600">{action}</span>
              </div>
              <div className="text-sm text-slate-400 mb-3">
                {documents.length} document(s) seront traités
              </div>

              <label className="block text-sm font-medium mb-2">Motif (optionnel)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Raison de l'action en masse..."
                className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-3 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <FluentButton size="sm" variant="secondary" onClick={() => setAction(null)} disabled={processing}>
                Retour
              </FluentButton>
              <div className="flex gap-2">
                <FluentButton size="sm" variant="secondary" onClick={onClose} disabled={processing}>
                  Annuler
                </FluentButton>
                <FluentButton size="sm" variant="primary" onClick={handleExecute} disabled={processing}>
                  <Zap className="w-4 h-4 mr-2" />
                  {processing ? 'Traitement...' : 'Exécuter'}
                </FluentButton>
              </div>
            </div>
          </>
        )}
      </div>
    </FluentModal>
  );
}

