/**
 * AlertDetailModal
 * Modal détaillé pour gérer une alerte SLA de dossier bloqué
 * - Description et contexte
 * - Timeline des événements
 * - Actions : snooze, résoudre, escalader
 * - Historique complet
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  Bell,
  BellOff,
  ArrowUp,
  Send,
  Loader2,
  Info,
  Calendar,
  Building2,
  FileText,
} from 'lucide-react';

interface AlertDetailModalProps {
  open: boolean;
  onClose: () => void;
  alertData?: {
    dossierId: string;
    dossierSubject: string;
    impact: string;
    daysOverdue: number;
    bureau: string;
    assignedTo?: string;
    createdAt: string;
    slaTarget: number;
  };
}

interface TimelineEvent {
  id: string;
  action: string;
  actorName: string;
  timestamp: string;
  details: string;
}

export function AlertDetailModal({ open, onClose, alertData }: AlertDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'actions'>('overview');
  const [comment, setComment] = useState('');
  const [snoozeDuration, setSnoozeDuration] = useState(24);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (open && alertData) {
      // Charger la timeline
      setTimeline([
        {
          id: '1',
          action: 'created',
          actorName: 'Système',
          timestamp: alertData.createdAt,
          details: 'Alerte SLA créée automatiquement',
        },
        {
          id: '2',
          action: 'breach',
          actorName: 'Système',
          timestamp: new Date(Date.now() - alertData.daysOverdue * 24 * 60 * 60 * 1000).toISOString(),
          details: `SLA dépassé de ${alertData.daysOverdue} jours`,
        },
      ]);
    }
  }, [open, alertData]);

  if (!open || !alertData) return null;

  const handleSnooze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bmo/blocked/${alertData.dossierId}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: snoozeDuration }),
      });
      if (!res.ok) throw new Error();
      onClose();
    } catch {
      await new Promise((r) => setTimeout(r, 500));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bmo/blocked/${alertData.dossierId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'direct',
          comment: comment || 'Alerte résolue',
          actorId: 'current',
          actorName: 'Utilisateur',
          actorRole: 'BMO',
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
    } catch {
      await new Promise((r) => setTimeout(r, 500));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bmo/blocked/${alertData.dossierId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escalatedToId: 'daf',
          escalatedToName: 'DAF',
          reason: comment || 'Escalade alerte SLA',
          actorId: 'current',
          actorName: 'Utilisateur',
          actorRole: 'BMO',
        }),
      });
      if (!res.ok) throw new Error();
      onClose();
    } catch {
      await new Promise((r) => setTimeout(r, 500));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bmo/blocked/${alertData.dossierId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: comment,
          authorId: 'current',
          authorName: 'Utilisateur',
          authorRole: 'BMO',
        }),
      });
      if (!res.ok) throw new Error();
      setComment('');
    } finally {
      setLoading(false);
    }
  };

  const severityColor = alertData.daysOverdue > 14 
    ? 'text-red-400 bg-red-500/10 border-red-500/30'
    : alertData.daysOverdue > 7
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-blue-400 bg-blue-500/10 border-blue-500/30';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Alerte SLA Dépassé</h2>
              <p className="text-sm text-slate-400">Dossier : {alertData.dossierSubject}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'actions', label: 'Actions', icon: Send },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 border-b-2 transition-all',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Alert Info */}
              <div className={cn("p-4 rounded-xl border", severityColor)}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Criticité</span>
                  <Badge className={cn("border", severityColor)}>
                    {alertData.daysOverdue > 14 ? 'CRITIQUE' : alertData.daysOverdue > 7 ? 'ÉLEVÉE' : 'MOYENNE'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Retard</span>
                    <p className="font-semibold mt-1">{alertData.daysOverdue} jours</p>
                  </div>
                  <div>
                    <span className="text-slate-400">SLA cible</span>
                    <p className="font-semibold mt-1">{alertData.slaTarget} heures</p>
                  </div>
                </div>
              </div>

              {/* Dossier Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs">Bureau</span>
                  </div>
                  <p className="font-medium text-slate-200">{alertData.bureau}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Assigné à</span>
                  </div>
                  <p className="font-medium text-slate-200">{alertData.assignedTo || 'Non assigné'}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">Impact</span>
                  </div>
                  <p className={cn(
                    "font-medium capitalize",
                    alertData.impact === 'critical' && 'text-red-400',
                    alertData.impact === 'high' && 'text-amber-400',
                    alertData.impact === 'medium' && 'text-blue-400',
                    alertData.impact === 'low' && 'text-slate-400'
                  )}>
                    {alertData.impact}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Créé le</span>
                  </div>
                  <p className="font-medium text-slate-200">
                    {new Date(alertData.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Recommandations */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Recommandations
                </h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Contacter le bureau {alertData.bureau} immédiatement</li>
                  <li>• Vérifier les dépendances et blocages potentiels</li>
                  {alertData.daysOverdue > 14 && (
                    <li className="text-red-400">• Escalader à la hiérarchie supérieure</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                      index === 0 ? "border-blue-500 bg-blue-500/20" : "border-slate-600 bg-slate-800"
                    )}>
                      {event.action === 'breach' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {event.action === 'created' && <Bell className="w-4 h-4 text-blue-400" />}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-full min-h-[40px] bg-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200">{event.actorName}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(event.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{event.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={handleResolve}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 h-auto py-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Résoudre</span>
                </Button>

                <Button
                  onClick={handleEscalate}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 h-auto py-4 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400"
                >
                  <ArrowUp className="w-5 h-5" />
                  <span className="text-sm">Escalader</span>
                </Button>

                <Button
                  onClick={handleSnooze}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 h-auto py-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
                >
                  <BellOff className="w-5 h-5" />
                  <span className="text-sm">Snooze</span>
                </Button>
              </div>

              {/* Snooze Duration */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Durée du snooze
                </label>
                <Select value={String(snoozeDuration)} onValueChange={(v) => setSnoozeDuration(parseInt(v, 10))}>
                  <SelectTrigger className="w-full h-10 rounded-lg bg-slate-800 border-slate-700 text-slate-200 focus:ring-2 focus:ring-blue-500/50">
                    <SelectValue placeholder="Durée" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <SelectItem value="1">1 heure</SelectItem>
                    <SelectItem value="4">4 heures</SelectItem>
                    <SelectItem value="24">24 heures</SelectItem>
                    <SelectItem value="48">48 heures</SelectItem>
                    <SelectItem value="72">3 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Comment */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ajouter un commentaire
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Décrivez l'action prise ou la raison du snooze..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || loading}
                  className="mt-2 gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Envoyer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <FileText className="w-4 h-4" />
            <span>Dossier ID: {alertData.dossierId}</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

