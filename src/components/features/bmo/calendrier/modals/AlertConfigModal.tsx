/**
 * Modal de configuration d'alerte pour Calendrier
 * Permet de créer des alertes personnalisées
 */

'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface AlertConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (config: AlertConfig) => Promise<void>;
}

interface AlertConfig {
  name: string;
  type: 'sla-risk' | 'retard' | 'sur-allocation' | 'reunion-manquee' | 'custom';
  threshold: number;
  daysBefore: number;
  enabled: boolean;
  notificationChannels: ('email' | 'in-app' | 'sms')[];
  conditions: {
    domain?: string;
    section?: string;
    severity?: 'warning' | 'critical';
  };
}

export function AlertConfigModal({
  open,
  onClose,
  onSave,
}: AlertConfigModalProps) {
  const [config, setConfig] = useState<AlertConfig>({
    name: '',
    type: 'sla-risk',
    threshold: 7,
    daysBefore: 7,
    enabled: true,
    notificationChannels: ['in-app'],
    conditions: {},
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const alertTypes = [
    { value: 'sla-risk', label: 'Jalons SLA à risque', icon: AlertTriangle, color: 'amber' },
    { value: 'retard', label: 'Retards détectés', icon: Clock, color: 'red' },
    { value: 'sur-allocation', label: 'Sur-allocation ressources', icon: Bell, color: 'orange' },
    { value: 'reunion-manquee', label: 'Réunion critique manquée', icon: X, color: 'red' },
    { value: 'custom', label: 'Alerte personnalisée', icon: Bell, color: 'blue' },
  ];

  const handleSave = async () => {
    if (!config.name.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (onSave) {
        await onSave(config);
      } else {
        // Mock save
        await new Promise((resolve) => setTimeout(resolve, 1000));
        logger.debug('Configuration alerte sauvegardée', { component: 'AlertConfigModal', config: config.name });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset config
        setConfig({
          name: '',
          type: 'sla-risk',
          threshold: 7,
          daysBefore: 7,
          enabled: true,
          notificationChannels: ['in-app'],
          conditions: {},
        });
      }, 1500);
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde', error instanceof Error ? error : undefined, { component: 'AlertConfigModal' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FluentModal open={open} onClose={onClose} title="Configurer une alerte" maxWidth="2xl" dark>
      <div className="space-y-6">
        {/* Nom de l'alerte */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Nom de l'alerte
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="Ex: Alerte SLA critique J-7"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type d'alerte */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">Type d'alerte</label>
          <div className="grid grid-cols-2 gap-2">
            {alertTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = config.type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setConfig({ ...config, type: type.value as any })}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-500/10`
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', isSelected ? `text-${type.color}-400` : 'text-slate-400')} />
                    <span className={cn('text-sm font-medium', isSelected ? `text-${type.color}-400` : 'text-slate-300')}>
                      {type.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seuils */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Seuil (nombre)
            </label>
            <input
              type="number"
              value={config.threshold}
              onChange={(e) => setConfig({ ...config, threshold: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Jours avant (J-X)
            </label>
            <input
              type="number"
              value={config.daysBefore}
              onChange={(e) => setConfig({ ...config, daysBefore: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Canaux de notification */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">Canaux de notification</label>
          <div className="space-y-2">
            {(['email', 'in-app', 'sms'] as const).map((channel) => (
              <label
                key={channel}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors"
              >
                <span className="text-sm text-slate-200 capitalize">{channel === 'in-app' ? 'Dans l\'application' : channel}</span>
                <input
                  type="checkbox"
                  checked={config.notificationChannels.includes(channel)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        notificationChannels: [...config.notificationChannels, channel],
                      });
                    } else {
                      setConfig({
                        ...config,
                        notificationChannels: config.notificationChannels.filter((c) => c !== channel),
                      });
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Activer/Désactiver */}
        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 cursor-pointer hover:bg-slate-800/70 transition-colors">
          <div>
            <div className="text-sm text-slate-200">Activer l'alerte</div>
            <div className="text-xs text-slate-400">L'alerte sera active immédiatement après sauvegarde</div>
          </div>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
          />
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || success || !config.name.trim()}
            className="min-w-32"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Sauvegardé !
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}

