'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, User, FileText, CheckCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { BlockedDossier } from '@/lib/types/bmo.types';

interface ResolveAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (action: string, data: any) => void;
  alert: {
    id: string;
    title: string;
    description: string;
    bureau?: string;
    type: 'blocked' | 'payment' | 'contract' | 'system';
    data?: BlockedDossier | unknown;
  };
}

export function ResolveAlertModal({
  isOpen,
  onClose,
  onResolve,
  alert,
}: ResolveAlertModalProps) {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, openSubstitutionModal } = useBMOStore();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const dossier = alert.type === 'blocked' ? (alert.data as BlockedDossier) : null;

  const handleAction = (actionType: string) => {
    setSelectedAction(actionType);
    
    switch (actionType) {
      case 'substitute':
        if (dossier) {
          openSubstitutionModal(dossier);
          onClose();
        }
        break;
      case 'reschedule':
        addToast('Redirection vers le calendrier...', 'info');
        // Navigation vers calendrier avec filtre
        break;
      case 'resolve':
        if (!note.trim()) {
          addToast('Veuillez ajouter une note de résolution', 'error');
          return;
        }
        
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'validation',
          module: 'alerts',
          targetId: alert.id,
          targetType: alert.type,
          targetLabel: alert.title,
          details: `Résolu: ${note}`,
        });
        
        onResolve('resolve', { note });
        addToast('Alerte marquée comme résolue', 'success');
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101]',
          'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          darkMode ? 'bg-slate-900' : 'bg-white',
          'rounded-xl shadow-2xl border'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Résoudre l'alerte</h2>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert Info */}
          <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="warning" className="text-[9px]">{alert.id}</Badge>
              {alert.bureau && <BureauTag bureau={alert.bureau} />}
            </div>
            <p className="text-sm font-semibold mb-1">{alert.title}</p>
            <p className="text-xs text-slate-400">{alert.description}</p>
          </div>

          {/* Historique du blocage */}
          {dossier && (
            <div className="mb-4 p-4 rounded-lg bg-slate-700/30 border border-slate-600">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historique du blocage
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Blocé depuis</span>
                  <span className="font-mono text-red-400">J+{dossier.delay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Responsable</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {dossier.responsible}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Date de blocage</span>
                  <span>{dossier.blockedSince}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <span className="text-slate-400 text-[10px]">Raison</span>
                  <p className="text-xs mt-1">{dossier.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Causes probables */}
          {dossier && (
            <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h3 className="text-sm font-semibold mb-2">Causes probables</h3>
              <ul className="space-y-1 text-xs">
                <li>• {dossier.reason}</li>
                {dossier.impact === 'critical' && (
                  <li>• Absence prolongée du responsable</li>
                )}
                {dossier.delay >= 7 && (
                  <li>• Délai de traitement dépassé</li>
                )}
                <li>• Blocage dans la chaîne de validation</li>
              </ul>
            </div>
          )}

          {/* Actions recommandées */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-3">Actions recommandées</h3>
            <div className="grid grid-cols-2 gap-3">
              {dossier && (
                <Button
                  variant="warning"
                  className="w-full justify-start"
                  onClick={() => handleAction('substitute')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Substituer un responsable
                </Button>
              )}
              
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  addToast('Notification envoyée au bureau', 'info');
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Relancer le bureau
              </Button>

              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => handleAction('reschedule')}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Replanifier
              </Button>

              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setSelectedAction('note')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Ajouter une note
              </Button>
            </div>
          </div>

          {/* Note de résolution */}
          {(selectedAction === 'resolve' || selectedAction === 'note') && (
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2">
                Note de résolution {(selectedAction as string) === 'resolve' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border text-sm',
                  darkMode
                    ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                    : 'bg-white border-gray-300 text-gray-700'
                )}
                placeholder="Décrivez la résolution..."
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-700/30">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={() => handleAction('resolve')}
              variant="success"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Marquer comme résolu
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

