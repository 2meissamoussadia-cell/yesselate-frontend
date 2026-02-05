/**
 * Modales du Conferences Command Center
 * Toutes les modales : create, detail, export, filters, settings, shortcuts, help, confirm
 * Pattern overlay comme Analytics
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { useConferencesCommandCenterStore } from '@/lib/stores/conferencesCommandCenterStore';
import { X, Keyboard, HelpCircle, Settings, Download, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ConferencesModals() {
  const { modal, closeModal } = useConferencesCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Create Modal
  if (modal.type === 'create') {
    return <CreateConferenceModal onClose={closeModal} />;
  }

  // Detail Modal
  if (modal.type === 'detail') {
    return <ConferenceDetailModal onClose={closeModal} conferenceId={modal.data?.conferenceId} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <ExportModal onClose={closeModal} />;
  }

  // Filters Modal - Utilise le FiltersPanel
  // Note: Le FiltersPanel est géré directement dans la page pour le pattern overlay
  // Cette modal n'est pas utilisée, on garde pour cohérence
  if (modal.type === 'filters') {
    return null; // Géré par ConferencesFiltersPanel dans la page
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <SettingsModal onClose={closeModal} />;
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal onClose={closeModal} />;
  }

  // Help Modal
  if (modal.type === 'help') {
    return <HelpModal onClose={closeModal} />;
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <ConfirmModal onClose={closeModal} data={modal.data} />;
  }

  return null;
}

// ================================
// Create Conference Modal
// ================================
function CreateConferenceModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Video className="h-5 w-5 text-purple-400" />
            Créer une conférence
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-slate-400 mb-4">Formulaire de création à implémenter</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button>Créer</Button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Conference Detail Modal
// ================================
function ConferenceDetailModal({
  onClose,
  conferenceId,
}: {
  onClose: () => void;
  conferenceId?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100">Détails de la conférence</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-slate-400">Détails complets de la conférence {conferenceId}</p>
        <p className="text-slate-400 text-sm mt-4">Contenu détaillé à implémenter</p>
      </div>
    </div>
  );
}

// ================================
// Export Modal
// ================================
function ExportModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Download className="h-5 w-5 text-blue-400" />
            Exporter les données
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-slate-400 mb-4">Options d'export à implémenter</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button>Exporter</Button>
        </div>
      </div>
    </div>
  );
}


// ================================
// Settings Modal
// ================================
function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Settings className="h-5 w-5 text-slate-400" />
            Paramètres
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-slate-400">Paramètres à implémenter</p>
      </div>
    </div>
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
    { key: 'F11', label: 'Plein écran' },
    { key: 'Alt+←', label: 'Retour' },
    { key: 'Esc', label: 'Fermer les modales' },
    { key: '?', label: 'Cette aide' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Keyboard className="h-5 w-5 text-purple-400" />
            Raccourcis clavier
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          {shortcuts.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-slate-400">{label}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs text-slate-300">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <Button onClick={onClose} className="w-full mt-6">
          Fermer
        </Button>
      </div>
    </div>
  );
}

// ================================
// Help Modal
// ================================
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            Aide - Conférences
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Navigation</h3>
            <p className="text-slate-400">
              Utilisez la sidebar pour naviguer entre les différentes catégories de conférences. Les
              sous-onglets permettent d'affiner votre vue.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Création</h3>
            <p className="text-slate-400">
              Créez une nouvelle conférence depuis un dossier bloqué, un arbitrage ou un risque critique.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Compte-rendu</h3>
            <p className="text-slate-400">
              Les comptes-rendus sont générés automatiquement par IA après chaque conférence terminée.
            </p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-6">
          Fermer
        </Button>
      </div>
    </div>
  );
}

// ================================
// Confirm Modal
// ================================
function ConfirmModal({
  onClose,
  data,
}: {
  onClose: () => void;
  data: Record<string, unknown>;
}) {
  const [loading, setLoading] = React.useState(false);

  const title = (data.title as string) || "Confirmer l'action";
  const message = (data.message as string) || 'Êtes-vous sûr de vouloir continuer ?';
  const confirmText = (data.confirmText as string) || 'Confirmer';
  const cancelText = (data.cancelText as string) || 'Annuler';
  const onConfirm = data.onConfirm as (() => Promise<void> | void) | undefined;
  const variant = ((data.variant as 'danger' | 'warning' | 'default') || 'default') as
    | 'danger'
    | 'warning'
    | 'default';

  const handleConfirm = async () => {
    if (onConfirm) {
      setLoading(true);
      try {
        await onConfirm();
      } finally {
        setLoading(false);
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'flex-1',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? 'Traitement...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

