/**
 * Demandes Command Center - Modals
 * Modales centralisées pour le module Demandes
 */

'use client';

import React from 'react';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Download,
  Keyboard,
  Settings,
  X,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export function DemandesModals() {
  const { activeModal, modalData, closeModal, liveStats } = useDemandesCommandCenterStore();

  return (
    <>
      {/* Stats Modal */}
      <FluentModal
        open={activeModal === 'stats'}
        onClose={closeModal}
        title="Statistiques Demandes"
        maxWidth="2xl"
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-200">{liveStats.total || 453}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-slate-400 mb-1">En attente</p>
              <p className="text-2xl font-bold text-amber-400">{liveStats.pending || 45}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-slate-400 mb-1">Validées</p>
              <p className="text-2xl font-bold text-emerald-400">{liveStats.validated || 378}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-xs text-slate-400 mb-1">Urgentes</p>
              <p className="text-2xl font-bold text-rose-400">{liveStats.urgent || 12}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Rejetées</p>
              <p className="text-2xl font-bold text-slate-400">{liveStats.rejected || 15}</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-slate-400 mb-1">En retard</p>
              <p className="text-2xl font-bold text-orange-400">{liveStats.overdue || 8}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Délai moyen de traitement</span>
              <span className="font-medium text-slate-200">{liveStats.avgDelay || 2.3} jours</span>
            </div>
          </div>
        </div>
      </FluentModal>

      {/* Export Modal */}
      <FluentModal
        open={activeModal === 'export'}
        onClose={closeModal}
        title="Exporter les données"
        maxWidth="lg"
      >
        <div className="p-6 space-y-4">
          {[
            { format: 'Excel', desc: 'Fichier .xlsx avec toutes les colonnes', icon: '📊' },
            { format: 'CSV', desc: 'Format tabulé pour import', icon: '📋' },
            { format: 'PDF', desc: 'Rapport formaté avec graphiques', icon: '📄' },
            { format: 'JSON', desc: 'Données brutes structurées', icon: '🔧' },
          ].map((item) => (
            <button
              key={item.format}
              onClick={() => {
                // Handle export
                closeModal();
              }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium text-slate-200">{item.format}</p>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </FluentModal>

      {/* Shortcuts Modal */}
      <FluentModal
        open={activeModal === 'shortcuts'}
        onClose={closeModal}
        title="Raccourcis clavier"
        maxWidth="lg"
      >
        <div className="p-6 space-y-4">
          {[
            { key: '⌘K', action: 'Palette de commandes' },
            { key: '⌘1', action: 'Demandes en attente' },
            { key: '⌘2', action: 'Demandes urgentes' },
            { key: '⌘3', action: 'Demandes validées' },
            { key: '⌘I', action: 'Statistiques' },
            { key: '⌘E', action: 'Exporter' },
            { key: '⌘R', action: 'Rafraîchir' },
            { key: 'Alt+←', action: 'Retour' },
            { key: 'F11', action: 'Plein écran' },
            { key: '?', action: 'Cette aide' },
            { key: 'Esc', action: 'Fermer les modales' },
          ].map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{action}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </FluentModal>

      {/* Settings Modal */}
      <FluentModal
        open={activeModal === 'settings'}
        onClose={closeModal}
        title="Paramètres"
        maxWidth="lg"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Affichage</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Éléments par page</span>
              <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200">
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Auto-refresh</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <Button onClick={closeModal} className="w-full">
              Enregistrer
            </Button>
          </div>
        </div>
      </FluentModal>

      {/* Demande Detail Modal */}
      <FluentModal
        open={activeModal === 'demande-detail'}
        onClose={closeModal}
        title={`Détail - ${(modalData as any)?.demandeId || ''}`}
        maxWidth="2xl"
      >
        <div className="p-6 space-y-6">
          {/* Mock detail content */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-800/50">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-200">
                BC Fournitures Bureau
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Demande de bon de commande pour fournitures de bureau
              </p>
            </div>
            <Badge variant="warning">En attente</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Montant</p>
              <p className="text-lg font-semibold text-slate-200">2 500 000 FCFA</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Bureau émetteur</p>
              <p className="text-lg font-semibold text-slate-200">Service Achats</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Date de création</p>
              <p className="text-lg font-semibold text-slate-200">05/01/2024</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-1">Délai</p>
              <p className="text-lg font-semibold text-rose-400">5 jours</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700/50">
            <Button
              onClick={closeModal}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider
            </Button>
            <Button
              onClick={closeModal}
              variant="outline"
              className="flex-1 border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeter
            </Button>
            <Button
              onClick={closeModal}
              variant="outline"
              className="border-slate-700 text-slate-400"
            >
              <Clock className="w-4 h-4 mr-2" />
              Reporter
            </Button>
          </div>
        </div>
      </FluentModal>
    </>
  );
}


