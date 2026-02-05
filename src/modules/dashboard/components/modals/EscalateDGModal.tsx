/**
 * Modal Escalade DG — déclenché par "🔔 Escalade au DG" (Phase 4).
 * Justification, priorité, documents joints, délai d'action.
 */

'use client';

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';

export interface EscalateDGModalProps {
  isOpen: boolean;
  onClose: () => void;
  chantierNumero: string;
  problemePrincipal?: string;
}

export function EscalateDGModal({
  isOpen,
  onClose,
  chantierNumero,
  problemePrincipal = 'Problème à escalader',
}: EscalateDGModalProps) {
  const [justification, setJustification] = useState('');
  const [priorite, setPriorite] = useState<'haute' | 'critique'>('haute');
  const [delaiJours, setDelaiJours] = useState(3);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ justification?: string; delai?: string }>({});
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { justification?: string; delai?: string } = {};
    const justificationTrimmed = justification.trim();
    if (justificationTrimmed.length < 10) {
      nextErrors.justification = 'La justification doit contenir au moins 10 caractères.';
    }
    const d = Number(delaiJours);
    if (Number.isNaN(d) || d < 1 || d > 30) {
      nextErrors.delai = 'Le délai doit être entre 1 et 30 jours.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      showToast({ type: 'warning', title: 'Escalade envoyée', message: 'La demande a été transmise au DG.' });
      toast.success('Escalade créée', {
        description: `Notification envoyée au DG · Priorité: ${priorite.toUpperCase()} - Chantier ${chantierNumero}`,
        duration: 4000,
      });
      setJustification('');
      setLoading(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="escalade-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <h2 id="escalade-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Escalade au DG
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-slate-400">Chantier <span className="text-slate-200">{chantierNumero}</span> — {problemePrincipal}</p>

          <div>
            <label htmlFor="escalade-priorite" className="block text-xs font-medium text-slate-400 mb-1">Priorité</label>
            <Select value={priorite} onValueChange={(v) => setPriorite(v as 'haute' | 'critique')}>
              <SelectTrigger id="escalade-priorite" className={cn('w-full rounded-xl border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200')}>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="critique">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="escalade-delai" className="block text-xs font-medium text-slate-400 mb-1">Délai d&apos;action requis (jours)</label>
            <input
              id="escalade-delai"
              type="number"
              min={1}
              max={30}
              value={delaiJours}
              onChange={(e) => {
                setDelaiJours(Number(e.target.value));
                if (errors.delai) setErrors((prev) => ({ ...prev, delai: undefined }));
              }}
              aria-invalid={Boolean(errors.delai)}
              aria-describedby={errors.delai ? 'escalade-delai-error' : undefined}
              className={cn('w-full rounded-lg border px-3 py-2 text-sm text-slate-200', errors.delai ? 'border-red-500 bg-slate-800' : 'border-slate-700 bg-slate-800')}
            />
            {errors.delai && (
              <p id="escalade-delai-error" className="mt-1 text-xs text-red-400" role="alert">{errors.delai}</p>
            )}
          </div>

          <div>
            <label htmlFor="escalade-justification" className="block text-xs font-medium text-slate-400 mb-1">Justification <span className="text-red-400">*</span></label>
            <textarea
              id="escalade-justification"
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (errors.justification) setErrors((prev) => ({ ...prev, justification: undefined }));
              }}
              placeholder="Pourquoi cette escalade (min. 10 caractères)..."
              rows={3}
              aria-invalid={Boolean(errors.justification)}
              aria-describedby={errors.justification ? 'escalade-justification-error' : undefined}
              className={cn('w-full rounded-lg border px-3 py-2 text-sm text-slate-200 placeholder:text-slate-400', errors.justification ? 'border-red-500 bg-slate-800' : 'border-slate-700 bg-slate-800')}
            />
            {errors.justification && (
              <p id="escalade-justification-error" className="mt-1 text-xs text-red-400" role="alert">{errors.justification}</p>
            )}
          </div>

          <p className="text-xs text-slate-400">Documents joints : à implémenter (upload).</p>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50">
              {loading ? 'Envoi…' : 'Envoyer au DG'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
