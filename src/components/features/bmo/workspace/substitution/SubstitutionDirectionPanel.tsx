/**
 * ====================================================================
 * PANEL: Direction Substitution
 * Panneau latéral avec actions rapides et informations contextuelles
 * ====================================================================
 */

'use client';

import { useState } from 'react';
import { X, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSubstitutionWorkspaceStore } from '@/lib/stores/substitutionWorkspaceStore';

interface DirectionPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SubstitutionDirectionPanel({ open, onClose }: DirectionPanelProps) {
  const { watchlist, selectedIds } = useSubstitutionWorkspaceStore();

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-700 shadow-2xl z-40 transform transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="font-semibold text-white">Actions & Direction</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
        {/* Quick Stats */}
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">Vue rapide</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Sélectionnés</span>
              </div>
              <span className="font-semibold text-white">{selectedIds.size}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300">Surveillés</span>
              </div>
              <span className="font-semibold text-white">{watchlist.length}</span>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">Actions rapides</h4>
          <div className="space-y-2">
            <button className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-left flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Assigner un substitut</span>
            </button>
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-left flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Créer une absence</span>
            </button>
            <button className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-left flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Escalader</span>
            </button>
          </div>
        </div>

        {/* Alertes */}
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">Alertes actives</h4>
          <div className="space-y-2">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">3 Critiques</span>
              </div>
              <p className="text-xs text-slate-400">Nécessitent une action immédiate</p>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">12 En attente</span>
              </div>
              <p className="text-xs text-slate-400">Sans substitut assigné</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">15 Complétées</span>
              </div>
              <p className="text-xs text-slate-400">Cette semaine</p>
            </div>
          </div>
        </div>

        {/* Raccourcis */}
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">Raccourcis clavier</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Palette de commandes</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">⌘K</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nouvelle substitution</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">⌘N</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recherche</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">⌘F</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Actualiser</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs">⌘R</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
