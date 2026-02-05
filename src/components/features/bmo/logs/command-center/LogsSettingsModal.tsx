/**
 * Modal de paramètres pour Logs
 * Configuration des préférences de la page logs
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  X,
  Settings,
  RefreshCw,
  Bell,
  BellOff,
  Clock,
} from 'lucide-react';
import { useLogsCommandCenterStore } from '@/lib/stores/logsCommandCenterStore';

interface LogsSettingsModalProps {
  onClose: () => void;
}

export function LogsSettingsModal({ onClose }: LogsSettingsModalProps) {
  const { kpiConfig, setKPIConfig } = useLogsCommandCenterStore();
  const [settings, setSettings] = useState({
    autoRefresh: kpiConfig.autoRefresh,
    refreshInterval: kpiConfig.refreshInterval,
    kpiVisible: kpiConfig.visible,
    kpiCollapsed: kpiConfig.collapsed,
  });

  const handleSave = () => {
    setKPIConfig({
      visible: settings.kpiVisible,
      collapsed: settings.kpiCollapsed,
      autoRefresh: settings.autoRefresh,
      refreshInterval: settings.refreshInterval,
    });
    onClose();
  };

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
            <Settings className="h-5 w-5 text-blue-400" />
            Paramètres Logs
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Actualisation automatique */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualisation automatique
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) =>
                    setSettings({ ...settings, autoRefresh: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-300">Activer l'actualisation automatique</span>
              </label>
              {settings.autoRefresh && (
                <div className="ml-7">
                  <label className="block text-slate-400 mb-2 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Intervalle (secondes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={settings.refreshInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        refreshInterval: parseInt(e.target.value) || 10,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Les logs seront rafraîchis automatiquement toutes les {settings.refreshInterval} secondes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Affichage KPIs */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
              {settings.kpiVisible ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Affichage des KPIs
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.kpiVisible}
                  onChange={(e) =>
                    setSettings({ ...settings, kpiVisible: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-300">Afficher la barre de KPIs</span>
              </label>
              {settings.kpiVisible && (
                <label className="flex items-center gap-3 cursor-pointer ml-7">
                  <input
                    type="checkbox"
                    checked={settings.kpiCollapsed}
                    onChange={(e) =>
                      setSettings({ ...settings, kpiCollapsed: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-300">Réduire par défaut</span>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

