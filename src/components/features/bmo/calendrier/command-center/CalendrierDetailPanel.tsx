/**
 * Panel de détail latéral pour Calendrier
 * Affiche les détails d'un SLA, Conflit, Jalon, Absence ou Instance sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Clock, AlertTriangle, Calendar, Users, Bell } from 'lucide-react';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import type { CalendrierDetailPanelType } from '@/lib/types/calendrier-modal.types';

export function CalendrierDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useCalendrierStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    if (type === 'sla') {
      openModal('sla-detail', { sla: data });
      closeDetailPanel();
    } else if (type === 'conflit') {
      openModal('conflit-detail', { conflit: data });
      closeDetailPanel();
    } else if (type === 'jalon') {
      openModal('jalon-detail', { jalon: data });
      closeDetailPanel();
    } else if (type === 'absence') {
      openModal('absence-detail', { absence: data });
      closeDetailPanel();
    } else if (type === 'instance') {
      // TODO: Créer modale instance
      closeDetailPanel();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={closeDetailPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            {type === 'sla' && <Clock className="h-4 w-4 text-amber-400" />}
            {type === 'conflit' && <AlertTriangle className="h-4 w-4 text-red-400" />}
            {type === 'jalon' && <Calendar className="h-4 w-4 text-indigo-400" />}
            {type === 'absence' && <Users className="h-4 w-4 text-purple-400" />}
            {type === 'instance' && <Bell className="h-4 w-4 text-cyan-400" />}
            <h3 className="text-sm font-medium text-slate-200">
              {type === 'sla' && 'Détail SLA'}
              {type === 'conflit' && 'Détail Conflit'}
              {type === 'jalon' && 'Détail Jalon'}
              {type === 'absence' && 'Détail Absence'}
              {type === 'instance' && 'Détail Instance'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDetailPanel}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Données selon le type */}
          {type === 'sla' && (
            <>
              <div>
                <p className="text-xs text-slate-400 mb-1">Élément</p>
                <p className="text-sm text-slate-200 font-medium">{data.elementLabel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Statut</p>
                <Badge variant={data.statut === 'en-retard' ? 'destructive' : 'default'}>
                  {data.statut || 'N/A'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Échéance</p>
                <p className="text-sm text-slate-200">
                  {data.echeancePrevue ? new Date(data.echeancePrevue).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
              {data.retard && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Retard</p>
                  <p className="text-sm text-amber-400">{data.retard} jours</p>
                </div>
              )}
            </>
          )}

          {type === 'conflit' && (
            <>
              <div>
                <p className="text-xs text-slate-400 mb-1">Type</p>
                <p className="text-sm text-slate-200 font-medium">{data.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Impact</p>
                <Badge variant={data.impact === 'critique' ? 'destructive' : 'default'}>
                  {data.impact || 'N/A'}
                </Badge>
              </div>
            </>
          )}

          {type === 'jalon' && (
            <>
              <div>
                <p className="text-xs text-slate-400 mb-1">Projet</p>
                <p className="text-sm text-slate-200 font-medium">{data.projetLabel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Jalon</p>
                <p className="text-sm text-slate-200">{data.jalonLabel || 'N/A'}</p>
              </div>
            </>
          )}

          {type === 'absence' && (
            <>
              <div>
                <p className="text-xs text-slate-400 mb-1">Employé</p>
                <p className="text-sm text-slate-200 font-medium">{data.employeNom || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Type</p>
                <p className="text-sm text-slate-200">{data.type || 'N/A'}</p>
              </div>
            </>
          )}

          {type === 'instance' && (
            <>
              <div>
                <p className="text-xs text-slate-400 mb-1">Titre</p>
                <p className="text-sm text-slate-200 font-medium">{data.titre || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Date</p>
                <p className="text-sm text-slate-200">
                  {data.date ? new Date(data.date).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/50 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenFullModal}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir les détails complets
          </Button>
        </div>
      </div>
    </>
  );
}

