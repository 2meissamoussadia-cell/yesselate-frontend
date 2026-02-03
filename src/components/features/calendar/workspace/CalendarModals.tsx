/**
 * Calendar Modals - Architecture harmonisée
 * Modales pour le module Calendrier
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X,
  Download,
  Keyboard,
  Settings,
  Loader2,
  CheckCircle,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
} from 'lucide-react';

// ================================
// Types
// ================================
export type CalendarModalType =
  | 'export'
  | 'settings'
  | 'shortcuts'
  | 'confirm';

interface ModalState {
  isOpen: boolean;
  type: CalendarModalType | null;
  data?: any;
}

interface CalendarModalsProps {
  modal: ModalState;
  onClose: () => void;
}

export function CalendarModals({ modal, onClose }: CalendarModalsProps) {
  if (!modal.isOpen || !modal.type) return null;

  if (modal.type === 'export') {
    return <CalendarExportModal onClose={onClose} data={modal.data} />;
  }

  if (modal.type === 'settings') {
    return <CalendarSettingsModal onClose={onClose} />;
  }

  if (modal.type === 'shortcuts') {
    return <CalendarShortcutsModal onClose={onClose} />;
  }

  if (modal.type === 'confirm') {
    return <CalendarConfirmModal onClose={onClose} data={modal.data} />;
  }

  return null;
}

// ================================
// Export Modal
// ================================
function CalendarExportModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'ical' | 'csv' | 'json' | 'pdf' | null>(null);

  const exportFormats = [
    { format: 'ical' as const, desc: 'Calendrier iCalendar (.ics)', icon: '📅' },
    { format: 'csv' as const, desc: 'Fichier tableur CSV', icon: '📊' },
    { format: 'json' as const, desc: 'Données JSON structurées', icon: '📄' },
    { format: 'pdf' as const, desc: 'Rapport PDF avec graphiques', icon: '📑' },
  ];

  const handleExport = async (format: 'ical' | 'csv' | 'json' | 'pdf') => {
    setExporting(true);
    setSelectedFormat(format);
    
    try {
      // Mock export - en production, appeler l'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const filename = `calendar-export-${new Date().toISOString().split('T')[0]}.${format}`;
      console.log(`Exporting to ${filename}`);
      
      onClose();
      data?.onSuccess?.(`Export ${format.toUpperCase()} terminé`);
    } catch (error) {
      console.error('Export failed:', error);
      data?.onError?.('Erreur lors de l\'export');
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <ModalContainer 
      onClose={onClose} 
      title="Exporter le calendrier" 
      icon={<Download className="w-5 h-5 text-purple-400" />}
    >
      <div className="space-y-3">
        {exportFormats.map(({ format, desc, icon }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            disabled={exporting}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
              exporting && selectedFormat === format
                ? "border-purple-500/50 bg-purple-500/10"
                : "border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50",
              exporting && selectedFormat !== format && "opacity-50"
            )}
          >
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <p className="font-medium text-slate-200">{format.toUpperCase()}</p>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
            {exporting && selectedFormat === format && (
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-3 rounded-lg bg-slate-800/50">
        <p className="text-xs text-slate-400">
          💡 L'export inclut tous les événements de la période sélectionnée.
        </p>
      </div>
    </ModalContainer>
  );
}

// ================================
// Settings Modal
// ================================
function CalendarSettingsModal({ onClose }: { onClose: () => void }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [showWeekends, setShowWeekends] = useState(true);
  const [defaultView, setDefaultView] = useState<'day' | 'week' | 'month'>('week');
  const [conflictAlerts, setConflictAlerts] = useState(true);

  return (
    <ModalContainer 
      onClose={onClose} 
      title="Paramètres du calendrier" 
      icon={<Settings className="w-5 h-5 text-slate-400" />}
    >
      <div className="space-y-6">
        {/* Auto-refresh */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Actualisation automatique</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
            />
          </div>
          {autoRefresh && (
            <div>
              <label className="text-xs text-slate-400">Intervalle (secondes)</label>
              <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                min="30"
                max="300"
              />
            </div>
          )}
        </div>

        {/* Default View */}
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-2">Vue par défaut</label>
          <Select value={defaultView} onValueChange={(v) => setDefaultView(v as 'day' | 'week' | 'month')}>
            <SelectTrigger className="w-full h-10 bg-slate-800 border-slate-700 rounded-lg text-sm text-slate-200">
              <SelectValue placeholder="Vue" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              <SelectItem value="day">Jour</SelectItem>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show Weekends */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Afficher les week-ends</label>
          <input
            type="checkbox"
            checked={showWeekends}
            onChange={(e) => setShowWeekends(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Conflict Alerts */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Alertes de conflits</label>
          <input
            type="checkbox"
            checked={conflictAlerts}
            onChange={(e) => setConflictAlerts(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          Enregistrer
        </Button>
      </div>
    </ModalContainer>
  );
}

// ================================
// Shortcuts Modal
// ================================
function CalendarShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘N', label: 'Nouvel événement' },
    { key: 'Ctrl+1', label: 'Événements aujourd\'hui' },
    { key: 'Ctrl+2', label: 'Cette semaine' },
    { key: 'Ctrl+3', label: 'En retard SLA' },
    { key: 'Ctrl+4', label: 'Conflits' },
    { key: '⌘I', label: 'Statistiques' },
    { key: '⌘E', label: 'Exporter' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Esc', label: 'Fermer les modales' },
    { key: '?', label: 'Cette aide' },
  ];

  return (
    <ModalContainer 
      onClose={onClose} 
      title="Raccourcis clavier" 
      icon={<Keyboard className="w-5 h-5 text-slate-400" />}
    >
      <div className="space-y-3">
        {shortcuts.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-400">{label}</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs text-slate-300 border border-slate-700">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </ModalContainer>
  );
}

// ================================
// Confirm Modal
// ================================
function CalendarConfirmModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await data?.onConfirm?.();
      onClose();
    } catch (error) {
      console.error('Confirmation failed:', error);
    } finally {
      setConfirming(false);
    }
  };

  const variant = data?.variant || 'warning';
  const iconColor = variant === 'danger' ? 'text-red-400' : variant === 'warning' ? 'text-amber-400' : 'text-blue-400';
  const buttonColor = variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600';

  return (
    <ModalContainer 
      onClose={onClose} 
      title={data?.title || 'Confirmation'} 
      icon={<AlertTriangle className={cn('w-5 h-5', iconColor)} />}
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-300">
          {data?.message || 'Êtes-vous sûr de vouloir continuer ?'}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-700"
            disabled={confirming}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn('flex-1', buttonColor)}
            disabled={confirming}
          >
            {confirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmation...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}

// ================================
// Helper Components
// ================================
function ModalContainer({
  onClose,
  title,
  icon,
  children,
}: {
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            {icon}
            {title}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

