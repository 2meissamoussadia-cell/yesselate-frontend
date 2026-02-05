'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Send, FileText } from 'lucide-react';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface EscalateToBMOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEscalate: (message: string, attachments?: string[]) => void;
  alert: {
    id: string;
    title: string;
    description: string;
    bureau?: string;
    type?: string;
  };
}

export function EscalateToBMOModal({
  isOpen,
  onClose,
  onEscalate,
  alert,
}: EscalateToBMOModalProps) {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  
  // Focus trap pour accessibilité
  const modalRef = useFocusTrap(isOpen);

  // Initialiser le message au montage si vide
  React.useEffect(() => {
    if (isOpen && !message) {
      const defaultMessage = `Alerte ${alert.id} - ${alert.title}

${alert.description}

Cette alerte nécessite une intervention du BMO.

Bureau concerné: ${alert.bureau || 'N/A'}
Type: ${alert.type || 'N/A'}

Justification:
`;
      setMessage(defaultMessage);
    }
  }, [isOpen, alert.id, alert.title, alert.description, alert.bureau, alert.type, message]);

  const handleEscalate = () => {
    if (!message.trim()) {
      addToast('Veuillez ajouter un message', 'error');
      return;
    }

    // Enregistrer l'escalade
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'modification',
      module: 'alerts',
      targetId: alert.id,
      targetType: 'Alerte',
      targetLabel: alert.title,
      details: `Escaladée au BMO: ${message.substring(0, 100)}...`,
    });

    onEscalate(message, attachments);
    addToast('Alerte escaladée au BMO', 'success');
    onClose();
    setMessage('');
    setAttachments([]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      <div
        ref={modalRef as React.RefObject<HTMLDivElement>}
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101]',
          'w-full max-w-xl',
          darkMode ? 'bg-slate-900' : 'bg-white',
          'rounded-xl shadow-2xl border'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="escalate-modal-title"
        aria-describedby="escalate-modal-description"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h2 id="escalate-modal-title" className="text-xl font-bold">Escalade vers BMO</h2>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
              aria-label="Fermer la modale d'escalade"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Box - Destinataire fixe */}
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" className="text-[9px]">Destinataire</Badge>
              <BureauTag bureau="BMO" />
            </div>
            <p className="text-xs text-slate-400">
              Toute escalade doit obligatoirement remonter vers le BMO, autorité opérationnelle suprême.
            </p>
          </div>

          {/* Alert Info */}
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="warning" className="text-[9px]">{alert.id}</Badge>
              {alert.bureau && <BureauTag bureau={alert.bureau} />}
            </div>
            <p className="text-sm font-semibold mb-1">{alert.title}</p>
            <p className="text-xs text-slate-400">{alert.description}</p>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2">
              Message <span className="text-red-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className={cn(
                'w-full px-3 py-2 rounded-lg border text-sm font-mono',
                darkMode
                  ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                  : 'bg-white border-gray-300 text-gray-700'
              )}
              placeholder="Justification de l'escalade..."
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Le message sera envoyé au BMO avec les informations de l'alerte.
            </p>
          </div>

          {/* Pièces jointes (simulé) */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pièces jointes
            </label>
            <div className="space-y-2">
              {attachments.length > 0 ? (
                attachments.map((att, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg text-xs',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    )}
                  >
                    <span>{att}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Aucune pièce jointe</p>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  // Simulation d'ajout de pièce jointe
                  const fileName = `document_${alert.id}_${Date.now()}.pdf`;
                  setAttachments([...attachments, fileName]);
                  addToast('Pièce jointe ajoutée', 'info');
                }}
              >
                + Ajouter une pièce jointe
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-700/30">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleEscalate}
              variant="warning"
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Escalader au BMO
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

