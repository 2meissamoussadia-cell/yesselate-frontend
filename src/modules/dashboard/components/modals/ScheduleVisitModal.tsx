/**
 * Modal Planifier visite — déclenché par "✅ Planifier visite" (Phase 4).
 * Calendrier, type de visite, participants, checklist.
 */

'use client';

import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';

export interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  chantierNumero: string;
}

export function ScheduleVisitModal({ isOpen, onClose, chantierNumero }: ScheduleVisitModalProps) {
  const [date, setDate] = useState('');
  const [typeVisite, setTypeVisite] = useState<'technique' | 'administrative'>('technique');
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTrimmed = date.trim();
    if (!dateTrimmed) {
      setDateError('Veuillez sélectionner une date pour la visite.');
      return;
    }
    setDateError(null);
    setLoading(true);
    setTimeout(() => {
      showToast({ type: 'success', title: 'Visite planifiée', message: `Visite ${typeVisite} le ${date || 'à définir'}` });
      setDate('');
      setLoading(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="visit-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h2 id="visit-title" className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            Planifier une visite
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-slate-400">Chantier <span className="text-slate-200">{chantierNumero}</span></p>

          <div>
            <label htmlFor="visit-date" className="block text-xs font-medium text-slate-400 mb-1">Date proposée</label>
            <input
              id="visit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn('w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200')}
            />
          </div>

          <div>
            <label htmlFor="visit-type" className="block text-xs font-medium text-slate-400 mb-1">Type de visite</label>
            <Select value={typeVisite} onValueChange={(v) => setTypeVisite(v as 'technique' | 'administrative')}>
              <SelectTrigger id="visit-type" className={cn('w-full rounded-xl border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200')}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectItem value="technique">Technique</SelectItem>
                <SelectItem value="administrative">Administrative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-slate-400">Participants et checklist : à préparer avant la visite.</p>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
              {loading ? 'Enregistrement…' : 'Planifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
