'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, User, FileText, CheckCircle, RefreshCw, MessageSquare, AlertTriangle, Users, Calendar } from 'lucide-react';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface BMOResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, data: any) => void;
  blocker: {
    id: string;
    type: 'blocked' | 'contract' | 'payment' | 'other';
    severity: 'critical' | 'high' | 'medium';
    title: string;
    description: string;
    bureau?: string;
    project?: string;
    supplier?: string;
    situation?: string;
    daysBlocked?: number;
  };
}

export function BMOResolveModal({
  isOpen,
  onClose,
  onAction,
  blocker,
}: BMOResolveModalProps) {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, openSubstitutionModal } = useBMOStore();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [justification, setJustification] = useState('');

  // Historique du blocage (simulé)
  const history = [
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'), action: 'Blocage initial', user: 'BF', details: 'Document manquant' },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'), action: 'Relance', user: 'BM', details: 'Document toujours manquant' },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'), action: 'Escalade', user: 'BM', details: 'Escalade vers BMO' },
  ];

  // Causes probables
  const probableCauses = [
    'Document manquant ou incomplet',
    'Validation en attente',
    'Ressource indisponible',
    'Conflit de planning',
  ];

  const handleAction = (actionType: string) => {
    setSelectedAction(actionType);

    switch (actionType) {
      case 'relaunch':
        if (!justification.trim()) {
          addToast('Veuillez ajouter une justification', 'error');
          return;
        }
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général (BMO)',
          action: 'modification',
          module: 'calendar',
          targetId: blocker.id,
          targetType: 'Blocker',
          targetLabel: blocker.title,
          bureau: blocker.bureau,
          details: `Relance bureau ${blocker.bureau}: ${justification}`,
        });
        onAction('relaunch', { justification, bureau: blocker.bureau });
        addToast(`Relance envoyée au bureau ${blocker.bureau}`, 'success');
        onClose();
        break;

      case 'reschedule':
        onAction('reschedule', { blocker });
        addToast('Redirection vers le calendrier...', 'info');
        onClose();
        break;

      case 'substitute':
        onAction('substitute', { blocker });
        addToast('Ouverture de la modal de substitution...', 'info');
        onClose();
        break;

      case 'resolve':
        if (!note.trim()) {
          addToast('Veuillez ajouter une note de résolution', 'error');
          return;
        }
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général (BMO)',
          action: 'validation',
          module: 'alerts',
          targetId: blocker.id,
          targetType: 'Blocker',
          targetLabel: blocker.title,
          bureau: blocker.bureau,
          details: `Résolu par BMO: ${note}`,
        });
        onAction('resolve', { note });
        addToast('Blocage marqué comme résolu', 'success');
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
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Résoudre le blocage - Vue BMO
              </h2>
              <p className="text-sm text-slate-400 mt-1">{blocker.title}</p>
            </div>
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

          {/* Informations du blocage */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">Priorité</p>
                <Badge
                  variant={blocker.severity === 'critical' ? 'urgent' : blocker.severity === 'high' ? 'warning' : 'info'}
                  className="text-xs"
                >
                  {blocker.severity}
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">Bureau émetteur</p>
                {blocker.bureau ? <BureauTag bureau={blocker.bureau} /> : <span className="text-xs">N/A</span>}
              </div>
            </div>

            {blocker.project && (
              <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">Projet</p>
                <p className="text-sm font-semibold">{blocker.project}</p>
              </div>
            )}

            {blocker.daysBlocked && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  <p className="text-sm font-semibold text-red-400">
                    Bloqué depuis {blocker.daysBlocked} jour(s)
                  </p>
                </div>
              </div>
            )}

            {/* Historique */}
            <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historique du blocage
              </h3>
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-slate-400 min-w-[80px]">{entry.date}</span>
                    <Badge variant="default" className="text-[9px]">{entry.action}</Badge>
                    <span className="text-slate-400">par {entry.user}</span>
                    <span className="text-slate-400">• {entry.details}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Causes probables */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <h3 className="text-sm font-semibold mb-2 text-amber-400">Causes probables</h3>
              <ul className="space-y-1">
                {probableCauses.map((cause, i) => (
                  <li key={i} className="text-xs flex items-center gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions BMO */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold">Actions possibles pour le BMO</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => handleAction('relaunch')}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Relancer le bureau
              </Button>
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => handleAction('reschedule')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Replanifier activité
              </Button>
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => handleAction('substitute')}
              >
                <Users className="w-4 h-4 mr-2" />
                Demander substitution
              </Button>
              <Button
                variant="success"
                className="justify-start"
                onClick={() => handleAction('resolve')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marquer comme résolu
              </Button>
            </div>

            {/* Justification pour relance */}
            {selectedAction === 'relaunch' && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <label className="block text-xs font-semibold mb-2">Justification de la relance</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Expliquez pourquoi vous relancez le bureau..."
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm border resize-none',
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-slate-200'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="warning"
                  className="mt-2 w-full"
                  onClick={() => handleAction('relaunch')}
                >
                  Envoyer la relance
                </Button>
              </div>
            )}

            {/* Note de résolution */}
            {selectedAction === 'resolve' && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <label className="block text-xs font-semibold mb-2">Note de résolution (obligatoire)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Expliquez comment le blocage a été résolu..."
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm border resize-none',
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-slate-200'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="success"
                  className="mt-2 w-full"
                  onClick={() => handleAction('resolve')}
                >
                  Marquer comme résolu
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-slate-700/30">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

