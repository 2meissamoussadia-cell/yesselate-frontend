/**
 * AnalyticsAlertConfigModal.tsx
 * ==============================
 * 
 * Modal de configuration des alertes intelligentes Analytics
 * Permet de définir des seuils, canaux de notification, et règles personnalisées
 */

'use client';

import { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, BellOff, Mail, MessageSquare, Smartphone,
  Plus, Trash2, Save, AlertTriangle, TrendingDown,
  Target, DollarSign, Clock, Users, CheckCircle2, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsAlertConfigModalProps {
  open: boolean;
  onClose: () => void;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'above' | 'below' | 'equals' | 'change';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  channels: ('email' | 'sms' | 'push' | 'slack')[];
  enabled: boolean;
  lastTriggered?: string;
}

const METRIC_OPTIONS = [
  { id: 'validation_rate', label: 'Taux de validation', icon: <Target className="w-4 h-4" /> },
  { id: 'sla_compliance', label: 'Conformité SLA', icon: <Clock className="w-4 h-4" /> },
  { id: 'avg_delay', label: 'Délai moyen', icon: <Clock className="w-4 h-4" /> },
  { id: 'pending_count', label: 'Demandes en attente', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'overdue_count', label: 'Demandes en retard', icon: <TrendingDown className="w-4 h-4" /> },
  { id: 'budget_consumption', label: 'Consommation budget', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'bureau_score', label: 'Score bureau', icon: <Users className="w-4 h-4" /> },
];

const CONDITION_OPTIONS = [
  { id: 'above', label: 'Supérieur à' },
  { id: 'below', label: 'Inférieur à' },
  { id: 'equals', label: 'Égal à' },
  { id: 'change', label: 'Variation de' },
];

const SEVERITY_OPTIONS: { id: 'info' | 'warning' | 'critical'; label: string; color: string }[] = [
  { id: 'info', label: 'Info', color: 'bg-blue-500' },
  { id: 'warning', label: 'Warning', color: 'bg-amber-500' },
  { id: 'critical', label: 'Critique', color: 'bg-red-500' },
];

const CHANNEL_OPTIONS = [
  { id: 'email' as const, label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { id: 'sms' as const, label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'push' as const, label: 'Push', icon: <Bell className="w-4 h-4" /> },
  { id: 'slack' as const, label: 'Slack', icon: <MessageSquare className="w-4 h-4" /> },
];

const DEFAULT_RULES: AlertRule[] = [
  {
    id: 'rule-1',
    name: 'Taux de validation critique',
    metric: 'validation_rate',
    condition: 'below',
    threshold: 70,
    severity: 'critical',
    channels: ['email', 'push'],
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'SLA en danger',
    metric: 'sla_compliance',
    condition: 'below',
    threshold: 85,
    severity: 'warning',
    channels: ['email'],
    enabled: true,
  },
  {
    id: 'rule-3',
    name: 'Délai moyen élevé',
    metric: 'avg_delay',
    condition: 'above',
    threshold: 7,
    severity: 'warning',
    channels: ['push'],
    enabled: true,
  },
  {
    id: 'rule-4',
    name: 'Budget dépassé 80%',
    metric: 'budget_consumption',
    condition: 'above',
    threshold: 80,
    severity: 'warning',
    channels: ['email', 'slack'],
    enabled: false,
  },
];

export function AnalyticsAlertConfigModal({ open, onClose }: AnalyticsAlertConfigModalProps) {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_RULES);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Charger les règles depuis l'API
  useEffect(() => {
    if (open) {
      fetch('/api/analytics/alerts')
        .then(res => res.json())
        .then(data => {
          if (data.rules && Array.isArray(data.rules)) {
            setRules(data.rules);
          }
        })
        .catch(() => {
          // Garder les règles par défaut en cas d'erreur
        });
    }
  }, [open]);

  const toggleRuleEnabled = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const addNewRule = () => {
    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: 'Nouvelle alerte',
      metric: 'validation_rate',
      condition: 'below',
      threshold: 80,
      severity: 'warning',
      channels: ['email'],
      enabled: true,
    };
    setRules(prev => [...prev, newRule]);
    setEditingRule(newRule);
  };

  const updateEditingRule = (updates: Partial<AlertRule>) => {
    if (!editingRule) return;
    const updated = { ...editingRule, ...updates };
    setEditingRule(updated);
    setRules(prev => prev.map(rule => 
      rule.id === editingRule.id ? updated : rule
    ));
  };

  const toggleChannel = (channel: 'email' | 'sms' | 'push' | 'slack') => {
    if (!editingRule) return;
    const newChannels = editingRule.channels.includes(channel)
      ? editingRule.channels.filter(c => c !== channel)
      : [...editingRule.channels, channel];
    updateEditingRule({ channels: newChannels });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch('/api/analytics/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });

      if (response.ok) {
        setSaveResult({ success: true, message: 'Configuration des alertes sauvegardée avec succès!' });
        setEditingRule(null);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setSaveResult({ success: false, message: 'Erreur lors de la sauvegarde. Veuillez réessayer.' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeRulesCount = rules.filter(r => r.enabled).length;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="🔔 Configuration des alertes"
      maxWidth="4xl"
      dark
    >
      <div className="space-y-6">
        {/* Header stats */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Bell className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                {activeRulesCount} alerte(s) active(s)
              </p>
              <p className="text-xs text-slate-400">
                sur {rules.length} règle(s) configurée(s)
              </p>
            </div>
          </div>
          <FluentButton variant="secondary" onClick={addNewRule}>
            <Plus className="w-4 h-4" />
            Nouvelle alerte
          </FluentButton>
        </div>

        {/* Liste des règles */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                'p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/50 border-slate-700',
                editingRule?.id === rule.id
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'hover:border-slate-600 hover:bg-slate-800/50',
                !rule.enabled && 'opacity-60'
              )}
              onClick={() => setEditingRule(editingRule?.id === rule.id ? null : rule)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleRuleEnabled(rule.id); }}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      rule.enabled
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                    )}
                  >
                    {rule.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{rule.name}</h4>
                      <Badge 
                        variant={
                          rule.severity === 'critical' ? 'urgent' : 
                          rule.severity === 'warning' ? 'warning' : 'info'
                        }
                        className="text-[10px]"
                      >
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {METRIC_OPTIONS.find(m => m.id === rule.metric)?.label}{' '}
                      {CONDITION_OPTIONS.find(c => c.id === rule.condition)?.label?.toLowerCase()}{' '}
                      {rule.threshold}{rule.metric.includes('rate') || rule.metric.includes('compliance') || rule.metric.includes('consumption') ? '%' : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {rule.channels.map(channel => (
                        <span key={channel} className="p-1 rounded bg-slate-100 dark:bg-slate-700">
                          {CHANNEL_OPTIONS.find(c => c.id === channel)?.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteRule(rule.id); }}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Détails édition */}
              {editingRule?.id === rule.id && (
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                  {/* Nom */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Nom de l'alerte</label>
                    <input
                      type="text"
                      value={editingRule.name}
                      onChange={(e) => updateEditingRule({ name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm"
                    />
                  </div>

                  {/* Métrique et condition */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">Métrique</label>
                      <Select
                        value={editingRule.metric}
                        onValueChange={(v) => updateEditingRule({ metric: v })}
                      >
                        <SelectTrigger className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {METRIC_OPTIONS.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">Condition</label>
                      <Select
                        value={editingRule.condition}
                        onValueChange={(v) => updateEditingRule({ condition: v as AlertRule['condition'] })}
                      >
                        <SelectTrigger className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPTIONS.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">Seuil</label>
                      <input
                        type="number"
                        value={editingRule.threshold}
                        onChange={(e) => updateEditingRule({ threshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Sévérité */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-2 block">Sévérité</label>
                    <div className="flex gap-2">
                      {SEVERITY_OPTIONS.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateEditingRule({ severity: s.id })}
                          className={cn(
                            'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                            editingRule.severity === s.id
                              ? `${s.color} text-white border-transparent`
                              : 'border-slate-700 hover:bg-slate-800/50 text-slate-400'
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canaux */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-2 block">Canaux de notification</label>
                    <div className="flex gap-2">
                      {CHANNEL_OPTIONS.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleChannel(c.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
                            editingRule.channels.includes(c.id)
                              ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                              : 'border-slate-700 hover:bg-slate-800/50 text-slate-400'
                          )}
                        >
                          {c.icon}
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Résultat sauvegarde */}
        {saveResult && (
          <div className={cn(
            'p-4 rounded-xl border flex items-start gap-3',
            saveResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          )}>
            <CheckCircle2 className={cn(
              'w-5 h-5 flex-shrink-0',
              saveResult.success ? 'text-emerald-500' : 'text-red-500'
            )} />
            <p className={cn(
              'text-sm',
              saveResult.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
            )}>
              {saveResult.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <FluentButton variant="secondary" onClick={onClose}>
            Annuler
          </FluentButton>
          <FluentButton
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

