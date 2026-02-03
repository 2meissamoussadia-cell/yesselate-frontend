/**
 * Router de modals pour le module Demandes
 * Utilise le store pour gérer l'état des modals
 * 100% COMPLET - Toutes les modals implémentées
 */

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Keyboard, BarChart3, Settings, HelpCircle, AlertTriangle } from 'lucide-react';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { DemandeDetailModal } from './DemandeDetailModal';
import { DemandesFiltersModal } from './DemandesFiltersModal';
import { DemandesExportModal } from './DemandesExportModal';
import { useDemandesData } from '../hooks';
import { useValidateDemande, useRejectDemande, useRequestComplement } from '../hooks/useDemandesMutations';
import { StatsPage } from '../pages/overview/StatsPage';

export function DemandesModals() {
  const { activeModal, modalData, closeModal } = useDemandesCommandCenterStore();

  // Récupérer les demandes si nécessaire pour la modal de détail
  const { data: allDemandes } = useDemandesData();

  // Mutations
  const { mutate: validateDemande } = useValidateDemande({
    onSuccess: () => closeModal(),
  });

  const { mutate: rejectDemande } = useRejectDemande({
    onSuccess: () => closeModal(),
  });

  const { mutate: requestComplement } = useRequestComplement({
    onSuccess: () => closeModal(),
  });

  // Trouver la demande sélectionnée
  const selectedDemandeId = modalData?.demandeId as string | undefined;
  const selectedDemande = allDemandes?.find((d) => d.id === selectedDemandeId) || null;

  // Navigation prev/next pour la modal de détail
  const currentIndex = selectedDemande && allDemandes
    ? allDemandes.findIndex((d) => d.id === selectedDemande.id)
    : -1;

  const hasPrevious = currentIndex > 0 && allDemandes !== undefined;
  const hasNext = currentIndex >= 0 && allDemandes !== undefined && currentIndex < (allDemandes.length - 1);

  const handlePrevious = () => {
    if (hasPrevious && allDemandes) {
      const prevDemande = allDemandes[currentIndex - 1];
      useDemandesCommandCenterStore.getState().openModal(activeModal || 'detail', { demandeId: prevDemande.id });
    }
  };

  const handleNext = () => {
    if (hasNext && allDemandes) {
      const nextDemande = allDemandes[currentIndex + 1];
      useDemandesCommandCenterStore.getState().openModal(activeModal || 'detail', { demandeId: nextDemande.id });
    }
  };

  const handleValidate = (id: string, comment?: string) => {
    validateDemande({ id, comment });
  };

  const handleReject = (id: string, reason: string) => {
    rejectDemande({ id, reason });
  };

  const handleRequestComplement = (id: string, message: string) => {
    requestComplement({ id, message });
  };

  // Detail Modal
  if (activeModal === 'detail' && selectedDemande) {
    return (
      <DemandeDetailModal
        isOpen={true}
        demande={selectedDemande}
        onClose={closeModal}
        onValidate={handleValidate}
        onReject={handleReject}
        onRequestComplement={handleRequestComplement}
        onPrevious={hasPrevious ? handlePrevious : undefined}
        onNext={hasNext ? handleNext : undefined}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        allDemandes={allDemandes}
      />
    );
  }

  // Filters Modal
  if (activeModal === 'filters') {
    return (
      <DemandesFiltersModal
        isOpen={true}
        onClose={closeModal}
      />
    );
  }

  // Export Modal
  if (activeModal === 'export') {
    const exportData = (modalData?.data as any[]) || allDemandes || [];
    return (
      <DemandesExportModal
        isOpen={true}
        onClose={closeModal}
        data={exportData}
      />
    );
  }

  // Stats Modal
  if (activeModal === 'stats') {
    return <StatsModal onClose={closeModal} />;
  }

  // Shortcuts Modal
  if (activeModal === 'shortcuts') {
    return <ShortcutsModal onClose={closeModal} />;
  }

  // Settings Modal
  if (activeModal === 'settings') {
    return <SettingsModal onClose={closeModal} />;
  }

  // Help Modal
  if (activeModal === 'help') {
    return <HelpModal onClose={closeModal} />;
  }

  // Confirm Modal
  if (activeModal === 'confirm') {
    return <ConfirmModal onClose={closeModal} data={modalData} />;
  }

  return null;
}

// ================================
// Stats Modal
// ================================
function StatsModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-lg font-semibold text-slate-200">Statistiques détaillées</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-1">
          <StatsPage />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Shortcuts Modal
// ================================
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Afficher/Masquer sidebar' },
    { key: '⌘F', label: 'Filtres avancés' },
    { key: '⌘E', label: 'Exporter' },
    { key: '⌘I', label: 'Statistiques' },
    { key: '⌘R', label: 'Rafraîchir' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Alt+←', label: 'Retour' },
    { key: 'Esc', label: 'Fermer les modales' },
    { key: '?', label: 'Aide (cette fenêtre)' },
    { key: '← →', label: 'Navigation prev/next dans modale' },
    { key: 'Ctrl+Tab', label: 'Navigation entre onglets' },
  ];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-purple-400" />
              <DialogTitle className="text-lg font-semibold text-slate-200">Raccourcis clavier</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {shortcuts.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-300">{label}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs text-slate-300 border border-slate-700/50">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Settings Modal
// ================================
function SettingsModal({ onClose }: { onClose: () => void }) {
  const { tableConfig, setTableConfig, autoRefresh, refreshInterval, setAutoRefresh } = useDemandesCommandCenterStore();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-lg font-semibold text-slate-200">Paramètres</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Page Size */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Taille de page</label>
            <Select
              value={String(tableConfig.pageSize)}
              onValueChange={(v) => setTableConfig({ pageSize: parseInt(v, 10) })}
            >
              <SelectTrigger className="w-full h-10 bg-slate-800/50 border-slate-700/50 rounded-lg text-sm text-slate-200">
                <SelectValue placeholder="Par page" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectItem value="10">10 par page</SelectItem>
                <SelectItem value="25">25 par page</SelectItem>
                <SelectItem value="50">50 par page</SelectItem>
                <SelectItem value="100">100 par page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto Refresh */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Actualisation automatique</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-500"
              />
            </div>
            {autoRefresh && (
              <Select
                value={String(refreshInterval)}
                onValueChange={(v) => useDemandesCommandCenterStore.setState({ refreshInterval: Number(v) })}
              >
                <SelectTrigger className="w-full h-10 mt-2 bg-slate-800/50 border-slate-700/50 rounded-lg text-sm text-slate-200">
                  <SelectValue placeholder="Intervalle" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  <SelectItem value="30000">30 secondes</SelectItem>
                  <SelectItem value="60000">1 minute</SelectItem>
                  <SelectItem value="300000">5 minutes</SelectItem>
                  <SelectItem value="600000">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-slate-400 mt-2">
              Actualise automatiquement les données toutes les {refreshInterval / 1000} secondes
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" onClick={onClose}>
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Help Modal
// ================================
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-lg font-semibold text-slate-200">Aide - Demandes</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4 text-sm text-slate-300">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Navigation</h3>
            <p className="text-slate-400">
              Utilisez la sidebar pour naviguer entre les catégories (Vue d'ensemble, Par statut, Actions prioritaires, Services).
              Les KPIs en haut affichent les statistiques en temps réel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Détails d'une demande</h3>
            <p className="text-slate-400">
              Cliquez sur une demande pour ouvrir la modal de détail avec tous les onglets (Détails, Documents, Historique, Commentaires).
              Utilisez les flèches ← → pour naviguer entre les demandes dans la modal.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Actions</h3>
            <p className="text-slate-400">
              Vous pouvez valider, rejeter ou demander un complément directement depuis la modal de détail.
              Utilisez les checkboxes pour sélectionner plusieurs demandes et effectuer des actions groupées.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Filtres</h3>
            <p className="text-slate-400">
              Utilisez les filtres avancés (⌘F) pour affiner votre recherche par statut, priorité, service ou date.
              Les filtres peuvent être combinés pour des recherches précises.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Export</h3>
            <p className="text-slate-400">
              Exportez les demandes sélectionnées ou filtrées au format Excel, CSV, PDF ou JSON via le menu Actions (⌘E).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Raccourcis</h3>
            <p className="text-slate-400">
              Appuyez sur ⌘K pour ouvrir la palette de commandes, ou ? pour voir tous les raccourcis clavier disponibles.
            </p>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-700/50">
          <Button size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Confirm Modal
// ================================
interface ConfirmModalData {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning';
  onConfirm?: () => void;
}

function ConfirmModal({ onClose, data }: { onClose: () => void; data?: Record<string, unknown> }) {
  const confirmData = (data as ConfirmModalData) || {};
  const {
    title = 'Confirmer l\'action',
    message = 'Êtes-vous sûr de vouloir continuer ?',
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'default',
    onConfirm,
  } = confirmData;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const variantStyles = {
    default: 'bg-blue-600 hover:bg-blue-700',
    destructive: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === 'destructive' && <AlertTriangle className="h-5 w-5 text-red-400" />}
            {variant === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
            <DialogTitle className="text-lg font-semibold text-slate-200">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button size="sm" onClick={handleConfirm} className={variantStyles[variant]}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
