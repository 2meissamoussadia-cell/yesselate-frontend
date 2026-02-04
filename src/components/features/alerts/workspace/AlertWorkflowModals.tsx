/**
 * Modales de workflow pour les alertes
 * - AcknowledgeModal : Acquitter une alerte
 * - ResolveModal : Résoudre une alerte
 * - EscalateModal : Escalader une alerte
 * - AlertDetailModal : Détail complet d'une alerte
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Shield,
  AlertCircle,
  Send,
  X,
  ChevronRight,
  History,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { TemplatePicker } from '@/components/features/bmo/alerts/TemplatePicker';

// ================================
// TYPES
// ================================

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  source: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  escalatedTo?: string;
  relatedItem?: string;
}

// ================================
// ACKNOWLEDGE MODAL
// ================================

interface AcknowledgeModalProps {
  open: boolean;
  onClose: () => void;
  alert: Alert | null;
  onConfirm: (note: string) => void;
}

export function AcknowledgeModal({ open, onClose, alert, onConfirm }: AcknowledgeModalProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500)); // Simulate API call
    onConfirm(note);
    setNote('');
    setIsSubmitting(false);
    onClose();
  };

  if (!alert) return null;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Acquitter l'alerte"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Alert Preview */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              alert.type === 'critical' ? 'bg-rose-500/10' : 'bg-amber-500/10'
            )}>
              <AlertTriangle className={cn(
                'w-5 h-5',
                alert.type === 'critical' ? 'text-rose-400' : 'text-amber-400'
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                <Badge variant={alert.type === 'critical' ? 'destructive' : 'warning'}>
                  {alert.type}
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-slate-200">{alert.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{alert.description}</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">Qu'est-ce que l'acquittement ?</p>
              <p className="text-xs text-slate-400 mt-1">
                Acquitter une alerte signifie que vous en avez pris connaissance et que vous vous engagez 
                à la traiter. L'alerte restera visible mais sera marquée comme "prise en charge".
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Note d'acquittement (optionnel)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajoutez une note pour expliquer la prise en charge..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Acquittement...' : 'Acquitter l\'alerte'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

// ================================
// RESOLVE MODAL
// ================================

interface ResolveModalProps {
  open: boolean;
  onClose: () => void;
  alert: Alert | null;
  onConfirm: (resolution: { type: string; note: string; proof?: string }) => void;
}

export function ResolveModal({ open, onClose, alert, onConfirm }: ResolveModalProps) {
  const [resolutionType, setResolutionType] = useState<string>('fixed');
  const [note, setNote] = useState('');
  const [proof, setProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const resolutionTypes = [
    { id: 'fixed', label: 'Problème corrigé', icon: CheckCircle, color: 'emerald' },
    { id: 'false_positive', label: 'Faux positif', icon: X, color: 'slate' },
    { id: 'workaround', label: 'Contournement appliqué', icon: Shield, color: 'blue' },
    { id: 'accepted', label: 'Risque accepté', icon: AlertCircle, color: 'amber' },
  ];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm({ type: resolutionType, note, proof });
    setNote('');
    setProof('');
    setResolutionType('fixed');
    setIsSubmitting(false);
    onClose();
  };

  if (!alert) return null;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Résoudre l'alerte"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Alert Preview */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-400">{alert.id}</span>
            <Badge variant={alert.type === 'critical' ? 'destructive' : 'warning'}>
              {alert.type}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-slate-200">{alert.title}</h3>
        </div>

        {/* Resolution Type */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            Type de résolution
          </label>
          <div className="grid grid-cols-2 gap-3">
            {resolutionTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = resolutionType === type.id;
              const colorClasses = {
                emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                slate: 'border-slate-600 bg-slate-800/50 text-slate-300',
                blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
                amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
              }[type.color];

              return (
                <button
                  key={type.id}
                  onClick={() => setResolutionType(type.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all',
                    isSelected ? colorClasses : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Template Picker */}
        {showTemplatePicker && alert && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Templates de résolution</span>
              </div>
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <TemplatePicker
              alert={{
                type: alert.type,
                severity: alert.type === 'critical' ? 'critical' : 'warning',
                title: alert.title,
                description: alert.description,
              }}
              onSelect={(template, values) => {
                // Appliquer le template
                let content = template.template;
                Object.entries(values).forEach(([key, value]) => {
                  content = content.replace(new RegExp(`{${key}}`, 'g'), value);
                });
                setNote(content);
                setShowTemplatePicker(false);
              }}
              onCancel={() => setShowTemplatePicker(false)}
            />
          </div>
        )}

        {/* Note */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">
              Description de la résolution *
            </label>
            {!showTemplatePicker && (
              <FluentButton
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplatePicker(true)}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Utiliser un template
              </FluentButton>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Décrivez les actions effectuées pour résoudre cette alerte..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            💡 Cliquez sur "Utiliser un template" pour gagner du temps avec des réponses prédéfinies
          </p>
        </div>

        {/* Proof / Reference */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Référence ou preuve (optionnel)
          </label>
          <div className="flex gap-2">
            <Input
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Ticket, document, lien..."
              className="flex-1 bg-slate-800/50 border-slate-700"
            />
            <FluentButton variant="ghost">
              <Upload className="w-4 h-4" />
            </FluentButton>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting || !note.trim()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Résolution...' : 'Marquer comme résolu'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

// ================================
// ESCALATE MODAL
// ================================

interface EscalateModalProps {
  open: boolean;
  onClose: () => void;
  alert: Alert | null;
  onConfirm: (escalation: { to: string; reason: string; priority: string }) => void;
}

export function EscalateModal({ open, onClose, alert, onConfirm }: EscalateModalProps) {
  const [escalateTo, setEscalateTo] = useState<string>('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<string>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const escalationTargets = [
    { id: 'n1_manager', label: 'Manager N+1', role: 'Chef de département' },
    { id: 'direction', label: 'Direction', role: 'Direction Générale' },
    { id: 'comite', label: 'Comité de pilotage', role: 'Instance décisionnelle' },
    { id: 'dsi', label: 'DSI', role: 'Direction Systèmes d\'Information' },
  ];

  const priorities = [
    { id: 'critical', label: 'Critique', color: 'rose' },
    { id: 'high', label: 'Haute', color: 'amber' },
    { id: 'medium', label: 'Moyenne', color: 'blue' },
  ];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm({ to: escalateTo, reason, priority });
    setEscalateTo('');
    setReason('');
    setPriority('high');
    setIsSubmitting(false);
    onClose();
  };

  if (!alert) return null;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Escalader l'alerte"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Alert Preview */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-400">{alert.id}</span>
            <Badge variant={alert.type === 'critical' ? 'destructive' : 'warning'}>
              {alert.type}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-slate-200">{alert.title}</h3>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <ArrowUpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Escalade vers N+1</p>
              <p className="text-xs text-slate-400 mt-1">
                L'escalade notifiera immédiatement le destinataire et marquera cette alerte 
                comme nécessitant une intervention hiérarchique.
              </p>
            </div>
          </div>
        </div>

        {/* Escalation Target */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            Escalader vers
          </label>
          <div className="space-y-2">
            {escalationTargets.map((target) => (
              <button
                key={target.id}
                onClick={() => setEscalateTo(target.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                  escalateTo === target.id
                    ? 'border-amber-500/30 bg-amber-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <User className={cn(
                    'w-5 h-5',
                    escalateTo === target.id ? 'text-amber-400' : 'text-slate-400'
                  )} />
                  <div className="text-left">
                    <p className={cn(
                      'text-sm font-medium',
                      escalateTo === target.id ? 'text-amber-300' : 'text-slate-300'
                    )}>
                      {target.label}
                    </p>
                    <p className="text-xs text-slate-400">{target.role}</p>
                  </div>
                </div>
                {escalateTo === target.id && (
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            Priorité de l'escalade
          </label>
          <div className="flex gap-2">
            {priorities.map((p) => {
              const colorClasses = {
                rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
                amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
              }[p.color];

              return (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all',
                    priority === p.id ? colorClasses : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Motif de l'escalade *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Expliquez pourquoi cette alerte nécessite une escalade..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting || !escalateTo || !reason.trim()}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Escalade...' : 'Confirmer l\'escalade'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

// ================================
// ALERT DETAIL MODAL
// ================================

interface AlertDetailModalProps {
  open: boolean;
  onClose: () => void;
  alert: Alert | null;
  onAcknowledge: () => void;
  onResolve: () => void;
  onEscalate: () => void;
}

export function AlertDetailModal({
  open,
  onClose,
  alert,
  onAcknowledge,
  onResolve,
  onEscalate,
}: AlertDetailModalProps) {
  if (!alert) return null;

  const timeline = [
    { time: alert.createdAt, action: 'Alerte créée', icon: AlertTriangle, color: 'amber' },
    ...(alert.acknowledgedAt
      ? [{ time: alert.acknowledgedAt, action: `Acquittée par ${alert.acknowledgedBy}`, icon: CheckCircle, color: 'blue' }]
      : []),
    ...(alert.escalatedTo
      ? [{ time: new Date().toISOString(), action: `Escaladée vers ${alert.escalatedTo}`, icon: ArrowUpCircle, color: 'amber' }]
      : []),
    ...(alert.resolvedAt
      ? [{ time: alert.resolvedAt, action: `Résolue par ${alert.resolvedBy}`, icon: Shield, color: 'emerald' }]
      : []),
  ];

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Détail de l'alerte"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn(
            'p-3 rounded-xl',
            alert.type === 'critical' ? 'bg-rose-500/10' : 'bg-amber-500/10'
          )}>
            <AlertTriangle className={cn(
              'w-6 h-6',
              alert.type === 'critical' ? 'text-rose-400' : 'text-amber-400'
            )} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-400">{alert.id}</span>
              <Badge variant={alert.type === 'critical' ? 'destructive' : 'warning'}>
                {alert.type.toUpperCase()}
              </Badge>
              {alert.acknowledgedAt && (
                <Badge variant="default">Acquittée</Badge>
              )}
              {alert.resolvedAt && (
                <Badge variant="success">Résolue</Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-200">{alert.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs">Source</span>
            </div>
            <p className="text-sm font-medium text-slate-200">{alert.source}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Créée le</span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Âge</span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              {Math.floor((Date.now() - new Date(alert.createdAt).getTime()) / (1000 * 60 * 60))}h
            </p>
          </div>
        </div>

        {/* Related Item */}
        {alert.relatedItem && (
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Élément lié:</span>
                <span className="text-sm font-mono text-blue-400">{alert.relatedItem}</span>
              </div>
              <FluentButton variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </FluentButton>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Historique
          </h4>
          <div className="space-y-2">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const colorClass = {
                amber: 'bg-amber-500/10 text-amber-400',
                blue: 'bg-blue-500/10 text-blue-400',
                emerald: 'bg-emerald-500/10 text-emerald-400',
              }[item.color] || 'bg-slate-700 text-slate-400';

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={cn('p-1.5 rounded-lg', colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{item.action}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.time).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {!alert.resolvedAt && (
          <div className="flex gap-2 pt-2 border-t border-slate-700/50">
            {!alert.acknowledgedAt && (
              <FluentButton
                variant="secondary"
                onClick={() => {
                  onClose();
                  onAcknowledge();
                }}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Acquitter
              </FluentButton>
            )}
            <FluentButton
              variant="primary"
              onClick={() => {
                onClose();
                onResolve();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Résoudre
            </FluentButton>
            <FluentButton
              variant="secondary"
              onClick={() => {
                onClose();
                onEscalate();
              }}
              className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Escalader
            </FluentButton>
          </div>
        )}
      </div>
    </FluentModal>
  );
}

