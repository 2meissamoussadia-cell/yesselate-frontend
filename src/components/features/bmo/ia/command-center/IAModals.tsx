/**
 * Modales du IA Command Center
 * Toutes les modales : export, settings, help, shortcuts, confirm
 */

'use client';

import React from 'react';
import { useIACommandCenterStore } from '@/lib/stores/iaCommandCenterStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Settings, HelpCircle, Keyboard, AlertTriangle } from 'lucide-react';

export function IAModals() {
  const { modal, closeModal } = useIACommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Export Modal
  if (modal.type === 'export') {
    return (
      <Dialog open={modal.isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-200">
              <Download className="h-5 w-5 text-blue-400" />
              Exporter les données IA
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Exporter les modules et l'historique dans différents formats
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-xs text-slate-300">CSV</div>
                </button>
                <button className="p-3 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 text-center">
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-xs text-slate-300">JSON</div>
                </button>
                <button className="p-3 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 text-center">
                  <div className="text-2xl mb-1">📑</div>
                  <div className="text-xs text-slate-300">Excel</div>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Contenu</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-slate-300">Modules</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-slate-300">Historique des analyses</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/50 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-slate-300">Métriques de précision</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button onClick={() => {
                // TODO: Implémenter export
                closeModal();
              }}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return (
      <Dialog open={modal.isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-200">
              <Settings className="h-5 w-5 text-purple-400" />
              Paramètres IA
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configuration globale des modules d'intelligence artificielle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-400">Paramètres en cours de développement</p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={closeModal}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Help Modal
  if (modal.type === 'help') {
    return (
      <Dialog open={modal.isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-200">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              Aide - Intelligence IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Vue d'ensemble</h3>
              <p className="text-sm text-slate-400">
                La plateforme d'intelligence artificielle vous permet de gérer et suivre tous vos modules IA.
                Chaque analyse conserve ses inputs comme preuve et génère un hash SHA3-256 pour garantir l'intégrité des résultats.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Modules</h3>
              <p className="text-sm text-slate-400 mb-2">Les modules peuvent être de différents types :</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 ml-4">
                <li>📊 Analyse - Analyse de données et détection de patterns</li>
                <li>🔮 Prédiction - Prévisions et projections</li>
                <li>🚨 Anomalie - Détection d'anomalies</li>
                <li>📝 Rapport - Génération automatique de rapports</li>
                <li>💡 Recommandation - Suggestions et recommandations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Statuts</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Actif</Badge>
                  <span className="text-sm text-slate-400">Module en fonctionnement normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Formation</Badge>
                  <span className="text-sm text-slate-400">Module en cours d'entraînement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Désactivé</Badge>
                  <span className="text-sm text-slate-400">Module désactivé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="urgent">Erreur</Badge>
                  <span className="text-sm text-slate-400">Module en erreur</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Traçabilité</h3>
              <p className="text-sm text-slate-400">
                Chaque analyse conserve ses inputs (sources de données) et génère un hash SHA3-256 du résultat.
                Cela garantit l'intégrité et permet la vérification des résultats.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={closeModal}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    const shortcuts = [
      { key: '⌘K', label: 'Ouvrir la palette de commandes' },
      { key: '⌘B', label: 'Basculer la sidebar' },
      { key: 'F11', label: 'Plein écran' },
      { key: 'Alt+←', label: 'Retour' },
      { key: 'ESC', label: 'Fermer la modal' },
      { key: '← →', label: 'Navigation prev/next (dans modals)' },
    ];

    return (
      <Dialog open={modal.isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-200">
              <Keyboard className="h-5 w-5 text-amber-400" />
              Raccourcis clavier
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-sm text-slate-300">{shortcut.label}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-700 border border-slate-600 rounded text-slate-300">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={closeModal}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirm Modal (for destructive actions)
  if (modal.type === 'confirm') {
    const { title = 'Confirmer l\'action', message = 'Êtes-vous sûr ?', onConfirm } = modal.data || {};

    return (
      <Dialog open={modal.isOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-200">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              {title as string}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {message as string}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (typeof onConfirm === 'function') {
                  onConfirm();
                }
                closeModal();
              }}
            >
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}

