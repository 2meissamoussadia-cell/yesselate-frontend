/**
 * AlertDetailModal.tsx
 * ====================
 * 
 * Modal détaillé pour afficher et gérer une alerte spécifique
 * - Description complète et contexte
 * - Timeline des événements
 * - Actions (assigner, commenter, résoudre, snooze, escalader)
 * - Impact et recommandations
 * - Historique des actions
 */

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, Clock, User, MessageSquare, CheckCircle2,
  XCircle, Bell, BellOff, ArrowUp, Target, TrendingDown,
  Send, Paperclip, MoreHorizontal, ExternalLink, Loader2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { useAlertDetail } from '@/lib/api/hooks/useAnalytics';
import type { Alert } from '@/domain/analytics/schemas/AlertSchema';

interface AlertDetailModalProps {
  open: boolean;
  onClose: () => void;
  alertId: string | null;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'commented' | 'status_changed' | 'escalated';
  user: string;
  timestamp: string;
  message: string;
  data?: any;
}

// Type étendu pour inclure les propriétés optionnelles utilisées dans le modal
type ExtendedAlert = Alert & {
  message?: string;
  kpiName?: string;
  bureauName?: string;
  timeline?: TimelineEvent[];
  comments?: Array<{
    id: string;
    user: string;
    message: string;
    timestamp: string;
  }>;
}

export function AlertDetailModal({ open, onClose, alertId }: AlertDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments'>('details');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState('');

  // Fetch alert details
  const { data: alertResponse, isLoading, error: fetchError } = useAlertDetail(alertId || '');
  const alert = useMemo((): ExtendedAlert | null => {
    // Use API data if available
    if (alertResponse?.alert) {
      // Map API response to ExtendedAlert format
      const apiAlert = alertResponse.alert as any; // Temporary any for mapping
      return {
        id: apiAlert.id || alertId || '',
        title: apiAlert.title || '',
        message: apiAlert.message || apiAlert.description || '',
        description: apiAlert.description || apiAlert.message || '',
        severity: apiAlert.severity === 'warning' ? 'medium' : apiAlert.severity === 'info' ? 'low' : (apiAlert.severity || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        type: apiAlert.type || '',
        category: apiAlert.category || 'general',
        status: apiAlert.status || 'active',
        priority: apiAlert.priority || 'medium',
        createdAt: apiAlert.createdAt || apiAlert.triggeredAt || new Date().toISOString(),
        resolvedAt: apiAlert.resolvedAt,
        assignedTo: apiAlert.assignedTo || null,
        kpiId: apiAlert.kpiId,
        kpiName: apiAlert.kpiName,
        bureauId: apiAlert.bureauId,
        bureauName: apiAlert.bureauName,
        affectedBureaux: apiAlert.affectedBureaux || [],
        metric: apiAlert.metric || '',
        currentValue: apiAlert.currentValue,
        targetValue: apiAlert.targetValue,
        unit: apiAlert.unit || '',
        recommendation: apiAlert.recommendation,
        impact: apiAlert.impact,
        timeline: apiAlert.timeline || [],
        comments: apiAlert.comments || [],
      } as ExtendedAlert;
    }
    
    // Fallback to mock data for development
    if (!alertId) return null;

    return {
      id: alertId,
      title: 'Taux de validation sous objectif',
      message: 'Le taux de validation (85%) est inférieur à l\'objectif fixé (90%). Cette situation persiste depuis 3 jours et affecte principalement le bureau BJ.',
      severity: 'critical' as const,
      type: 'threshold',
      category: 'performance',
      status: 'active' as const,
      priority: 'high' as const,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      assignedTo: 'Marie Dubois',
      kpiId: 'kpi-1',
      kpiName: 'Taux de validation',
      bureauId: 'bj',
      bureauName: 'Bureau Juridique',
      affectedBureaux: ['BJ', 'DSI'],
      metric: 'Taux de validation',
      currentValue: 85,
      targetValue: 90,
      unit: '%',
      recommendation: 'Analyser les causes de rejet et former les équipes. Envisager une revue des processus de validation.',
      impact: 'Impact moyen sur les délais de traitement. Risque de non-respect des SLA si la situation perdure.',
      timeline: [
        {
          id: 't1',
          type: 'created',
          user: 'Système',
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          message: 'Alerte créée automatiquement'
        },
        {
          id: 't2',
          type: 'assigned',
          user: 'Jean Dupont',
          timestamp: new Date(Date.now() - 86400000 * 2.5).toISOString(),
          message: 'Alerte assignée à Marie Dubois'
        },
        {
          id: 't3',
          type: 'commented',
          user: 'Marie Dubois',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          message: 'Analyse en cours. Contact avec le bureau BJ pour investigation.'
        },
        {
          id: 't4',
          type: 'status_changed',
          user: 'Marie Dubois',
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
          message: 'Statut changé: En cours de traitement'
        },
      ],
      comments: [
        {
          id: 'c1',
          user: 'Marie Dubois',
          message: 'J\'ai identifié que le problème vient d\'un manque de formation sur les nouveaux critères de validation.',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'c2',
          user: 'Pierre Durant',
          message: 'J\'ai observé la même chose au bureau DSI. Formation planifiée pour la semaine prochaine.',
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
      ],
    };
  }, [alertId, alertResponse]);

  // Hooks must be called before any conditional returns
  const commentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (commentTimerRef.current) {
        clearTimeout(commentTimerRef.current);
      }
      if (resolveTimerRef.current) {
        clearTimeout(resolveTimerRef.current);
      }
    };
  }, []);

  if (!open || !alertId) return null;

  if (isLoading) {
    return (
      <FluentModal open={open} onClose={onClose} title="Chargement..." maxWidth="xl" dark>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </FluentModal>
    );
  }

  if (fetchError || !alert) {
    return (
      <FluentModal open={open} onClose={onClose} title="Erreur" maxWidth="xl" dark>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-slate-400">
            Impossible de charger les détails de l'alerte
          </p>
        </div>
      </FluentModal>
    );
  }

  const severityConfig = {
    low: { color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300', icon: Info },
    medium: { color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300', icon: AlertTriangle },
    high: { color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300', icon: AlertTriangle },
    critical: { color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300', icon: XCircle },
  }[alert.severity] || {
    color: 'bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300',
    icon: Info,
  };

  const SeverityIcon = severityConfig.icon;
  
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    
    // Nettoyer le timer précédent si présent
    if (commentTimerRef.current) {
      clearTimeout(commentTimerRef.current);
    }
    
    // Simuler API call
    commentTimerRef.current = setTimeout(() => {
      logger.debug('Comment added', { component: 'AlertDetailModal', commentLength: comment.length });
      setComment('');
      setIsSubmitting(false);
      commentTimerRef.current = null;
    }, 1000);
  };
  
  const handleResolve = async () => {
    if (!resolution.trim()) return;
    setIsSubmitting(true);

    // Nettoyer le timer précédent si présent
    if (resolveTimerRef.current) {
      clearTimeout(resolveTimerRef.current);
    }

    // Simuler API call
    resolveTimerRef.current = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Alert resolved:', resolution);
      }
      setShowResolveDialog(false);
      setResolution('');
      setIsSubmitting(false);
      onClose();
      resolveTimerRef.current = null;
    }, 1000);
  };

  const handleSnooze = () => {
    logger.debug('Alert snoozed', { component: 'AlertDetailModal' });
  };

  const handleEscalate = () => {
    logger.debug('Alert escalated', { component: 'AlertDetailModal' });
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', severityConfig.color)}>
            <SeverityIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-200">{alert.title}</h2>
              <Badge variant={
                alert.severity === 'critical' ? 'urgent' :
                alert.severity === 'high' ? 'warning' :
                'default'
              }>
                {alert.severity}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Alerte #{alert.id} • Créée {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      }
      maxWidth="5xl"
      dark
    >
      <div className="space-y-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-slate-400">Statut</p>
              <Badge variant={
                alert.status === 'resolved' ? 'success' :
                alert.status === 'snoozed' ? 'default' :
                'warning'
              } className="mt-1">
                {alert.status === 'resolved' ? 'Résolue' :
                 alert.status === 'snoozed' ? 'En pause' :
                 'Active'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400">Assignée à</p>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{alert.assignedTo || 'Non assignée'}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">Bureau affecté</p>
              <span className="text-sm font-medium">{alert.bureauName}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Priorité</p>
              <Badge variant={
                alert.priority === 'high' ? 'urgent' :
                alert.priority === 'medium' ? 'warning' :
                'default'
              } className="mt-1">
                {alert.priority}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <FluentButton variant="secondary" size="sm" onClick={handleSnooze}>
              <BellOff className="w-4 h-4" />
            </FluentButton>
            <FluentButton variant="secondary" size="sm" onClick={handleEscalate}>
              <ArrowUp className="w-4 h-4" />
            </FluentButton>
            <FluentButton variant="secondary" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </FluentButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'details', label: 'Détails', icon: Info },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'comments', label: `Commentaires (${alert.comments?.length || 0})`, icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Message */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {alert.message}
                </p>
              </div>

              {/* Métriques */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-400 mb-1">Valeur actuelle</p>
                  <p className="text-2xl font-bold text-red-600">
                    {alert.currentValue}{alert.unit}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-400 mb-1">Objectif</p>
                  <p className="text-2xl font-bold text-green-600">
                    {alert.targetValue}{alert.unit}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-400 mb-1">Écart</p>
                  <p className="text-2xl font-bold text-orange-600">
                    -{alert.targetValue - alert.currentValue}{alert.unit}
                  </p>
                </div>
              </div>

              {/* KPI lié */}
              {alert.kpiId && (
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-400">KPI concerné</p>
                        <p className="font-semibold">{alert.kpiName}</p>
                      </div>
                    </div>
                    <FluentButton variant="secondary" size="sm">
                      <ExternalLink className="w-4 h-4" />
                      Voir le KPI
                    </FluentButton>
                  </div>
                </div>
              )}

              {/* Impact */}
              {alert.impact && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <TrendingDown className="w-4 h-4" />
                    Impact
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {alert.impact}
                  </p>
                </div>
              )}

              {/* Recommandations */}
              {alert.recommendation && (
                <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Recommandations
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {alert.recommendation}
                  </p>
                </div>
              )}

              {/* Bureaux affectés */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold mb-3">Bureaux affectés</h4>
                <div className="flex flex-wrap gap-2">
                  {alert.affectedBureaux.map((bureau) => (
                    <Badge key={bureau} variant="default">
                      {bureau}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {alert.timeline && alert.timeline.length > 0 ? (
                alert.timeline.map((event, idx) => (
                  <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      event.type === 'created' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      event.type === 'assigned' ? 'bg-purple-100 dark:bg-purple-900/20' :
                      event.type === 'commented' ? 'bg-green-100 dark:bg-green-900/20' :
                      event.type === 'status_changed' ? 'bg-orange-100 dark:bg-orange-900/20' :
                      'bg-red-100 dark:bg-red-900/20'
                    )}>
                      {event.type === 'created' && <Bell className="w-5 h-5 text-blue-600" />}
                      {event.type === 'assigned' && <User className="w-5 h-5 text-purple-600" />}
                      {event.type === 'commented' && <MessageSquare className="w-5 h-5 text-green-600" />}
                      {event.type === 'status_changed' && <CheckCircle2 className="w-5 h-5 text-orange-600" />}
                      {event.type === 'escalated' && <ArrowUp className="w-5 h-5 text-red-600" />}
                    </div>
                    {idx < (alert.timeline?.length || 0) - 1 && (
                      <div className="w-0.5 h-full min-h-[40px] bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">{event.user}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(event.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {event.message}
                    </p>
                  </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun événement dans la timeline</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Liste des commentaires */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {alert.comments && alert.comments.length > 0 ? (
                  alert.comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm">{comment.user}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(comment.timestamp).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 ml-10">
                      {comment.message}
                    </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun commentaire</p>
                  </div>
                )}
              </div>

              {/* Ajouter commentaire */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/50">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-700/50 bg-slate-900 text-slate-200 text-sm resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <FluentButton variant="secondary" size="sm">
                    <Paperclip className="w-4 h-4" />
                    Joindre fichier
                  </FluentButton>
                  <FluentButton
                    variant="primary"
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!comment.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Envoyer
                  </FluentButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {!showResolveDialog ? (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <FluentButton variant="secondary">
                Assigner à...
              </FluentButton>
              <FluentButton variant="secondary">
                <BellOff className="w-4 h-4" />
                Snooze (24h)
              </FluentButton>
            </div>

            <div className="flex items-center gap-3">
              <FluentButton variant="secondary" onClick={onClose}>
                Fermer
              </FluentButton>
              <FluentButton
                variant="primary"
                onClick={() => setShowResolveDialog(true)}
              >
                <CheckCircle2 className="w-4 h-4" />
                Résoudre l'alerte
              </FluentButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Description de la résolution
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Décrivez comment l'alerte a été résolue..."
                className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-900 text-white text-sm resize-none placeholder:text-slate-400"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <FluentButton
                variant="secondary"
                onClick={() => {
                  setShowResolveDialog(false);
                  setResolution('');
                }}
              >
                Annuler
              </FluentButton>
              <FluentButton
                variant="primary"
                onClick={handleResolve}
                disabled={!resolution.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Résolution en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmer la résolution
                  </>
                )}
              </FluentButton>
            </div>
          </div>
        )}
      </div>
    </FluentModal>
  );
}

