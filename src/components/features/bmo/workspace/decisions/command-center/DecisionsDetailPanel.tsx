/**
 * Panel de détail latéral pour Decisions
 * Affiche les détails d'une décision sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  Gavel,
  Clock,
  User,
  Users,
  DollarSign,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useDecisionsCommandCenterStore } from '@/lib/stores/decisionsCommandCenterStore';
import { decisionsApiService, type Decision } from '@/lib/services/decisionsApiService';
import { useState, useEffect } from 'react';

export function DecisionsDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useDecisionsCommandCenterStore();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (detailPanel.isOpen && detailPanel.entityId) {
      setLoading(true);
      decisionsApiService
        .getById(detailPanel.entityId)
        .then((data) => {
          setDecision(data || null);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setDecision(null);
    }
  }, [detailPanel.isOpen, detailPanel.entityId]);

  if (!detailPanel.isOpen) return null;

  const handleOpenFullModal = () => {
    if (detailPanel.entityId) {
      openModal('decision-detail', { decisionId: detailPanel.entityId });
    }
    closeDetailPanel();
  };

  const statusColors = {
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    executed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const impactColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
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
            <Gavel className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-medium text-slate-200">Détail Décision</h3>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400" />
            </div>
          ) : decision ? (
            <>
              {/* Reference & Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-semibold text-slate-300">
                    {decision.ref}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs', statusColors[decision.status])}
                  >
                    {decisionsApiService.getStatusLabel(decision.status)}
                  </Badge>
                </div>
                <h4 className="text-base font-semibold text-slate-200">{decision.titre}</h4>
              </div>

              {/* Description */}
              {decision.description && (
                <div>
                  <p className="text-sm text-slate-400">{decision.description}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-3 w-3 text-rose-400" />
                    <span className="text-xs text-slate-400">Impact</span>
                  </div>
                  <Badge variant="outline" className={cn('text-xs', impactColors[decision.impact])}>
                    {decision.impact}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-slate-400">Type</span>
                  </div>
                  <span className="text-xs text-slate-300">
                    {decisionsApiService.getTypeLabel(decision.type)}
                  </span>
                </div>

                {decision.montantImpact && (
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-3 w-3 text-emerald-400" />
                      <span className="text-xs text-slate-400">Montant</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">
                      {decisionsApiService.formatMontant(decision.montantImpact)}
                    </span>
                  </div>
                )}
              </div>

              {/* Auteur */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3 w-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Auteur</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{decision.auteur.name}</p>
                  <p className="text-xs text-slate-400">{decision.auteur.role}</p>
                </div>
              </div>

              {/* Approbateurs */}
              {decision.approbateurs.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">
                      Approbateurs ({decision.approbateurs.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {decision.approbateurs.map((approbateur, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">{approbateur.name}</span>
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            approbateur.status === 'approved'
                              ? 'bg-emerald-500'
                              : approbateur.status === 'rejected'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Dates</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Création</span>
                    <span className="text-slate-300">
                      {new Date(decision.dateCreation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {decision.dateDecision && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Décision</span>
                      <span className="text-slate-300">
                        {new Date(decision.dateDecision).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {decision.dateExecution && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exécution</span>
                      <span className="text-slate-300">
                        {new Date(decision.dateExecution).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Décision non trouvée</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white"
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

