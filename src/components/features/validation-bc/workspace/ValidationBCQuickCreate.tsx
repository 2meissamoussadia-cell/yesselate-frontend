'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Plus, FileText, Receipt, FileEdit, Calendar, DollarSign, User, Building2 } from 'lucide-react';
import { createDocument } from '@/lib/services/validation-bc-api';

interface ValidationBCQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (document: any) => void;
}

export function ValidationBCQuickCreateModal({ open, onClose, onSuccess }: ValidationBCQuickCreateModalProps) {
  const [type, setType] = useState<'bc' | 'facture' | 'avenant' | null>(null);
  const [formData, setFormData] = useState({
    fournisseur: '',
    montant: '',
    objet: '',
    bureau: '',
    projet: '',
    dateEcheance: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!type) return;

    // Validation
    if (!formData.fournisseur || !formData.montant || !formData.objet || !formData.bureau) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createDocument({
        type,
        fournisseur: formData.fournisseur,
        montant: Number(formData.montant),
        objet: formData.objet,
        bureau: formData.bureau,
        projet: formData.projet || undefined,
        dateEcheance: formData.dateEcheance || undefined,
      });

      onSuccess(response.document);
      onClose();
      
      // Reset
      setType(null);
      setFormData({
        fournisseur: '',
        montant: '',
        objet: '',
        bureau: '',
        projet: '',
        dateEcheance: '',
      });
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Erreur lors de la création du document: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FluentModal open={open} title="Création rapide" onClose={onClose}>
      <div className="space-y-4">
        {!type ? (
          <>
            <div className="text-sm text-slate-400 mb-4">
              Sélectionnez le type de document à créer
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => setType('bc')}
                className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left flex items-start gap-3"
              >
                <FileText className="w-6 h-6 text-blue-500 flex-none" />
                <div>
                  <div className="font-semibold">Bon de commande</div>
                  <div className="text-sm text-slate-400">Créer un nouveau BC</div>
                </div>
              </button>

              <button
                onClick={() => setType('facture')}
                className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left flex items-start gap-3"
              >
                <Receipt className="w-6 h-6 text-emerald-500 flex-none" />
                <div>
                  <div className="font-semibold">Facture</div>
                  <div className="text-sm text-slate-400">Enregistrer une facture</div>
                </div>
              </button>

              <button
                onClick={() => setType('avenant')}
                className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left flex items-start gap-3"
              >
                <FileEdit className="w-6 h-6 text-purple-500 flex-none" />
                <div>
                  <div className="font-semibold">Avenant</div>
                  <div className="text-sm text-slate-400">Modifier un contrat existant</div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/10">
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Type: {type === 'bc' ? 'Bon de commande' : type === 'facture' ? 'Facture' : 'Avenant'}
              </div>
            </div>

            <div className="space-y-3">
              {/* Fournisseur */}
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Fournisseur
                </label>
                <input
                  type="text"
                  value={formData.fournisseur}
                  onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                  placeholder="Nom du fournisseur..."
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>

              {/* Objet */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Objet</label>
                <textarea
                  value={formData.objet}
                  onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                  placeholder="Description de la demande..."
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white resize-none"
                  rows={3}
                />
              </div>

              {/* Bureau */}
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Bureau émetteur
                </label>
                <select
                  value={formData.bureau}
                  onChange={(e) => setFormData({ ...formData, bureau: e.target.value })}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option value="DRE">DRE</option>
                  <option value="DAAF">DAAF</option>
                  <option value="DSI">DSI</option>
                  <option value="DG">DG</option>
                </select>
              </div>

              {/* Date échéance */}
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={formData.dateEcheance}
                  onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <FluentButton size="sm" variant="secondary" onClick={() => setType(null)} disabled={submitting}>
                Retour
              </FluentButton>
              <div className="flex gap-2">
                <FluentButton size="sm" variant="secondary" onClick={onClose} disabled={submitting}>
                  Annuler
                </FluentButton>
                <FluentButton size="sm" variant="primary" onClick={handleSubmit} disabled={submitting}>
                  <Plus className="w-4 h-4 mr-2" />
                  {submitting ? 'Création...' : 'Créer'}
                </FluentButton>
              </div>
            </div>
          </>
        )}
      </div>
    </FluentModal>
  );
}

