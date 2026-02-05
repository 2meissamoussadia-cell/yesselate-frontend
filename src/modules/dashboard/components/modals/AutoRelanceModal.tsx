/**
 * Modal Relance automatique — déclenché par "📧 Relance automatique" (Phase 4).
 * Prévisualisation email, destinataires, templates, "Envoyer maintenant".
 */

'use client';

import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';

export interface AutoRelanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  chantierNumero: string;
  entreprise?: { nom: string; email: string };
}

export function AutoRelanceModal({
  isOpen,
  onClose,
  chantierNumero,
  entreprise = { nom: 'Entreprise', email: 'contact@exemple.sn' },
}: AutoRelanceModalProps) {
  const [template, setTemplate] = useState('relance_1');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast({ type: 'success', title: 'Relance envoyée', message: `Email envoyé à ${entreprise.email}` });
      toast.success('Email de relance envoyé', {
        description: `À: ${entreprise.email} · Objet: Relance avancement lot peinture`,
        duration: 4000,
      });
      setLoading(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="relance-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <h2 id="relance-title" className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-400" />
            Relance automatique
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-4 space-y-4">
          <div className="text-sm">
            <p className="text-slate-400">Destinataire : <span className="text-slate-200">{entreprise.email}</span></p>
            <p className="text-slate-400">Chantier : <span className="text-slate-200">{chantierNumero}</span></p>
          </div>

          <div>
            <label htmlFor="relance-template" className="block text-xs font-medium text-slate-400 mb-1">Modèle d&apos;email</label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger id="relance-template" className={cn('w-full rounded-xl border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200')}>
                <SelectValue placeholder="Modèle" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectItem value="relance_1">Relance 1 — Rappel échéance</SelectItem>
                <SelectItem value="relance_2">Relance 2 — Relance courtoise</SelectItem>
                <SelectItem value="relance_3">Relance 3 — Dernière relance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400 max-h-32 overflow-y-auto">
            Aperçu : Email de relance pour le chantier {chantierNumero}. Merci de nous contacter sous 48 h…
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50">
              {loading ? 'Envoi…' : 'Envoyer maintenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
