'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { employees } from '@/lib/data';
import type { SubstitutionActionType } from '@/lib/types/bmo.types';

export function SubstitutionModal() {
  const { darkMode } = useAppStore();
  const {
    substitutionModalData,
    closeSubstitutionModal,
    updateSubstitutionAction,
    addToast,
    addActionLog,
  } = useBMOStore();

  const { isOpen, dossier, action } = substitutionModalData;

  // État local du formulaire
  const [selectedAction, setSelectedAction] = useState<SubstitutionActionType>('instruire');
  const [selectedTraitant, setSelectedTraitant] = useState('');
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');

  if (!isOpen || !dossier) return null;

  // Types d'actions disponibles
  const actionTypes: { value: SubstitutionActionType; label: string; icon: string; desc: string }[] = [
    { value: 'instruire', label: 'Instruire le dossier', icon: '📋', desc: 'Traiter et analyser le dossier' },
    { value: 'valider', label: 'Valider à la place', icon: '✅', desc: 'Approuver en substitution' },
    { value: 'rejeter', label: 'Rejeter la demande', icon: '❌', desc: 'Refuser avec motif' },
    { value: 'annuler', label: 'Annuler la demande', icon: '🗑️', desc: 'Clôturer sans suite' },
    { value: 'deleguer', label: 'Déléguer', icon: '🔑', desc: 'Transférer à un autre agent' },
    { value: 'demander_info', label: 'Demander informations', icon: '❓', desc: 'Compléments requis' },
  ];

  // Filtrer les employés disponibles
  const availableEmployees = employees.filter(
    (e) => e.status === 'active' && e.bureau !== 'BMO'
  );

  const handleSubmit = () => {
    if (!selectedTraitant && selectedAction !== 'annuler' && selectedAction !== 'rejeter') {
      addToast('Veuillez sélectionner un traitant', 'error');
      return;
    }
    if (!deadline && selectedAction !== 'annuler') {
      addToast('Veuillez définir une deadline', 'error');
      return;
    }

    // Log de l'action
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'substitution',
      module: 'substitution',
      targetId: dossier.id,
      targetType: dossier.type,
      targetLabel: `Substitution: ${dossier.subject}`,
      details: `Action: ${selectedAction}, Traitant: ${selectedTraitant || 'N/A'}, Deadline: ${deadline}`,
      bureau: dossier.bureau,
    });

    addToast(`Substitution ${dossier.id} effectuée avec succès`, 'success');
    closeSubstitutionModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeSubstitutionModal}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl',
          darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 p-4 border-b border-slate-700 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <h2 className="font-bold text-lg">Substitution</h2>
                <p className="text-xs text-slate-400">
                  Intervenir sur un dossier bloqué
                </p>
              </div>
            </div>
            <button
              onClick={closeSubstitutionModal}
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-4">
          {/* Info dossier */}
          <div className={cn(
            'p-4 rounded-lg border-l-4 border-l-amber-500',
            darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
          )}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-orange-400">{dossier.id}</span>
                  <BureauTag bureau={dossier.bureau} />
                  <Badge variant="urgent">J+{dossier.delay}</Badge>
                </div>
                <h3 className="font-bold">{dossier.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Type: {dossier.type} • Projet: {dossier.project}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg text-amber-400">{dossier.amount}</p>
                <p className="text-[10px] text-slate-400">FCFA</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-600">
              <p className="text-xs">
                <span className="text-slate-400">Responsable initial:</span>{' '}
                <span className="font-medium">{dossier.responsible}</span>
              </p>
              <p className="text-xs mt-1">
                <span className="text-slate-400">Raison du blocage:</span>{' '}
                <span className="text-red-400">{dossier.reason}</span>
              </p>
            </div>
          </div>

          {/* Type d'action */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Type d&apos;action <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {actionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedAction(type.value)}
                  className={cn(
                    'p-3 rounded-lg text-left transition-all border',
                    selectedAction === type.value
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-600 hover:border-slate-500',
                    darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sélection du traitant */}
          {selectedAction !== 'annuler' && selectedAction !== 'rejeter' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Désigner un traitant <span className="text-red-400">*</span>
              </label>
              <Select value={selectedTraitant || '__none__'} onValueChange={(v) => setSelectedTraitant(v === '__none__' ? '' : v)}>
                <SelectTrigger className={cn(
                  'w-full p-3 rounded-lg border text-sm h-11',
                  darkMode
                    ? 'bg-slate-700 border-slate-600'
                    : 'bg-white border-gray-300'
                )}>
                  <SelectValue placeholder="Sélectionner un agent..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sélectionner un agent...</SelectItem>
                  {availableEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.role} ({emp.bureau})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Deadline */}
          {selectedAction !== 'annuler' && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Deadline <span className="text-red-400">*</span>
              </label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          )}

          {/* Instructions */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Instructions / Commentaires
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ajoutez des instructions pour le traitement de ce dossier..."
              className={cn(
                'w-full p-3 rounded-lg border text-sm h-24 resize-none',
                darkMode
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-white border-gray-300'
              )}
            />
          </div>

          {/* Avertissement */}
          <div className={cn(
            'p-3 rounded-lg border',
            darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
          )}>
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-xs font-medium text-amber-400">
                  Action de substitution
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cette action sera tracée avec horodatage. Le responsable initial 
                  ({dossier.responsible}) sera notifié automatiquement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-slate-700 bg-slate-800/90 backdrop-blur flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={closeSubstitutionModal}>
            Annuler
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500" onClick={handleSubmit}>
            ⚡ Confirmer la substitution
          </Button>
        </div>
      </div>
    </div>
  );
}
