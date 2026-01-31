/**
 * Panel de détail latéral pour Missions
 * Affiche les détails d'une mission sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Plane, MapPin, User, Calendar, DollarSign } from 'lucide-react';
import { useMissionsCommandCenterStore } from '@/lib/stores/missionsCommandCenterStore';

export function MissionsDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useMissionsCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    if (type === 'mission') {
      openModal('mission-detail', { missionId: detailPanel.entityId });
    }
    closeDetailPanel();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={closeDetailPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-medium text-slate-200">Détail Mission</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullModal}
              className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Voir plus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDetailPanel}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'mission' && <MissionDetailContent data={data} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir en modal complète
          </Button>
          <Button
            variant="outline"
            onClick={closeDetailPanel}
            className="w-full border-slate-700 text-slate-400 hover:text-slate-200"
            size="sm"
          >
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Mission Detail Content
// ================================
function MissionDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-slate-400 uppercase mb-2">Informations générales</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Plane className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">{(data.id as string) || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">{(data.destination as string) || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">{(data.agent as string) || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">
              {data.dateDepart && data.dateRetour
                ? `${new Date(data.dateDepart as string).toLocaleDateString('fr-FR')} → ${new Date(data.dateRetour as string).toLocaleDateString('fr-FR')}`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300">{(data.budgetPrevu as string) || 'N/A'}</span>
          </div>
        </div>
      </div>

      {data.objet ? (
        <div>
          <h4 className="text-xs font-medium text-slate-400 uppercase mb-2">Objet</h4>
          <p className="text-sm text-slate-300">{data.objet as string}</p>
        </div>
      ) : null}
    </div>
  );
}
