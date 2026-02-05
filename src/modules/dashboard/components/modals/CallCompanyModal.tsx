/**
 * Modal Appel entreprise — déclenché par "📞 Appeler entreprise" (Phase 4).
 * Nom/téléphone entreprise, historique relances, formulaire compte-rendu, "Marquer comme contacté".
 */

'use client';

import React, { useState } from 'react';
import { X, Phone, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import type { Contact } from '../../types/dashboardDomain';

export interface CallCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  chantierNumero: string;
  entreprise?: { nom: string; telephone: string; email: string };
  problemePrincipal?: string;
  /** Historique des contacts (appels, emails, visites) — affiché si fourni et non vide */
  historique_contacts?: Contact[];
}

const defaultEntreprise = { nom: 'Entreprise non renseignée', telephone: '+221 77 123 45 67', email: 'contact@exemple.sn' };

export function CallCompanyModal({
  isOpen,
  onClose,
  chantierNumero,
  entreprise = defaultEntreprise,
  problemePrincipal = 'Lot peinture non démarré',
  historique_contacts = [],
}: CallCompanyModalProps) {
  const NOTES_MAX_LENGTH = 2000;
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState<'repondu' | 'messagerie' | 'injoignable'>('repondu');
  const [loading, setLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.length > NOTES_MAX_LENGTH) {
      setNotesError(`Le compte-rendu ne doit pas dépasser ${NOTES_MAX_LENGTH} caractères (actuellement ${notes.length}).`);
      return;
    }
    setNotesError(null);
    setLoading(true);
    setTimeout(() => {
      showToast({ type: 'success', title: 'Contact enregistré', message: 'Compte-rendu d\'appel enregistré avec succès.' });
      toast.success('Appel préparé', {
        description: `Chef de chantier ${chantierNumero}: ${entreprise.telephone}`,
        duration: 5000,
      });
      setNotes('');
      setLoading(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-company-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <h2 id="call-company-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Phone className="h-5 w-5 text-sky-400" />
            Appeler l&apos;entreprise
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-1 text-sm">
            <p className="font-medium text-slate-200">{entreprise.nom}</p>
            <p className="text-slate-400">Chantier : <span className="text-slate-200">{chantierNumero}</span></p>
            <p className="text-slate-400">Téléphone : <span className="text-sky-300">{entreprise.telephone}</span></p>
            <p className="text-slate-400">Problème : <span className="text-amber-300">{problemePrincipal}</span></p>
          </div>

          {historique_contacts.length > 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">Historique des contacts</h4>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {historique_contacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="shrink-0 mt-0.5" aria-hidden>
                      {contact.type === 'appel' ? <Phone className="h-3 w-3 text-sky-400" /> : contact.type === 'email' ? <Mail className="h-3 w-3 text-amber-400" /> : <Users className="h-3 w-3 text-emerald-400" />}
                    </span>
                    <div className="min-w-0">
                      <span className="text-slate-300">{new Date(contact.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      {contact.auteur && <span className="text-slate-400"> · {contact.auteur}</span>}
                      {contact.notes && <p className="text-slate-400 truncate mt-0.5">{contact.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="call-outcome" className="block text-xs font-medium text-slate-400 mb-1">Résultat de l&apos;appel</label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as typeof outcome)}>
              <SelectTrigger id="call-outcome" className="w-full rounded-xl border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">
                <SelectValue placeholder="Résultat" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectItem value="repondu">Répondu</SelectItem>
                <SelectItem value="messagerie">Messagerie</SelectItem>
                <SelectItem value="injoignable">Injoignable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="call-notes" className="block text-xs font-medium text-slate-400 mb-1">
              Compte-rendu <span className="text-slate-400">(max. {NOTES_MAX_LENGTH} caractères)</span>
            </label>
            <textarea
              id="call-notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value.slice(0, NOTES_MAX_LENGTH));
                if (notesError) setNotesError(null);
              }}
              placeholder="Notes de l'appel..."
              rows={3}
              maxLength={NOTES_MAX_LENGTH}
              aria-invalid={Boolean(notesError)}
              aria-describedby={notesError ? 'call-notes-error' : undefined}
              className={cn('w-full rounded-lg border px-3 py-2 text-sm text-slate-200 placeholder:text-slate-400', notesError ? 'border-red-500 bg-slate-800' : 'border-slate-700 bg-slate-800')}
            />
            {notesError && (
              <p id="call-notes-error" className="mt-1 text-xs text-red-400" role="alert">{notesError}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-50">
              {loading ? 'Enregistrement…' : 'Marquer comme contacté'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
