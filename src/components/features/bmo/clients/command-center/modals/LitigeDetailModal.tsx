/**
 * Litige Detail Modal - Gestion complète des litiges
 * View, Actions Timeline, Resolution
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Send,
  FileText,
  Calendar,
  Target,
  Flag,
} from 'lucide-react';
import { Litige } from '@/lib/data/clientsMockData';

interface LitigeDetailModalProps {
  open: boolean;
  onClose: () => void;
  litige: Litige | null;
  onResolve?: (resolution: string) => void;
  onEscalate?: () => void;
  onAddAction?: (action: string, comment?: string) => void;
}

export function LitigeDetailModal({
  open,
  onClose,
  litige,
  onResolve,
  onEscalate,
  onAddAction,
}: LitigeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'resolution'>('details');
  const [newComment, setNewComment] = useState('');
  const [resolutionText, setResolutionText] = useState('');

  if (!open || !litige) return null;

  const isHighSeverity = litige.severity === 'high';
  const isResolved = litige.status === 'resolved';
  const isOpen = litige.status === 'open';

  const handleAddAction = () => {
    if (newComment.trim()) {
      onAddAction?.(newComment, newComment);
      setNewComment('');
    }
  };

  const handleResolve = () => {
    if (resolutionText.trim()) {
      onResolve?.(resolutionText);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[800px] md:max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className={cn(
          'p-6 border-b',
          isHighSeverity ? 'border-rose-500/30 bg-gradient-to-r from-rose-500/10 to-transparent' :
          litige.severity === 'medium' ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent' :
          'border-slate-700/50'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center border',
                isHighSeverity ? 'bg-rose-500/20 border-rose-500/30 animate-pulse' :
                litige.severity === 'medium' ? 'bg-amber-500/20 border-amber-500/30' :
                'bg-slate-800 border-slate-700/50'
              )}>
                <AlertTriangle className={cn(
                  'w-6 h-6',
                  isHighSeverity ? 'text-rose-400' :
                  litige.severity === 'medium' ? 'text-amber-400' :
                  'text-slate-400'
                )} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-slate-100">{litige.subject}</h2>
                  <Badge className={cn(
                    'text-xs',
                    litige.status === 'open' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    litige.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    litige.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  )}>
                    {litige.status === 'open' ? 'Ouvert' :
                     litige.status === 'in_progress' ? 'En cours' :
                     litige.status === 'resolved' ? 'Résolu' :
                     'Escaladé'}
                  </Badge>
                  <Badge className={cn(
                    'text-xs',
                    isHighSeverity ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    litige.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  )}>
                    Priorité {litige.priority}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {litige.client}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Ouvert le {new Date(litige.date).toLocaleDateString('fr-FR')}
                  </span>
                  {litige.daysOpen > 0 && (
                    <span className={cn(
                      'flex items-center gap-1 font-medium',
                      litige.daysOpen > 7 ? 'text-rose-400' :
                      litige.daysOpen > 3 ? 'text-amber-400' :
                      'text-slate-400'
                    )}>
                      <Clock className="w-4 h-4" />
                      {litige.daysOpen} jour(s)
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-bold text-rose-400">
                    <DollarSign className="w-4 h-4" />
                    {litige.amount}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {!isResolved && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setActiveTab('resolution')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Résoudre
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEscalate}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Escalader
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Rapport
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800/50">
          {[
            { id: 'details', label: 'Détails', icon: AlertCircle },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'resolution', label: 'Résolution', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  isActive
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
                <p className="text-slate-400 leading-relaxed">{litige.description}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <div className="text-xs text-slate-400 mb-1">Catégorie</div>
                  <div className="text-slate-200 font-medium">{litige.category}</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <div className="text-xs text-slate-400 mb-1">Assigné à</div>
                  <div className="text-slate-200 font-medium">{litige.assignedTo || 'Non assigné'}</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <div className="text-xs text-slate-400 mb-1">Montant</div>
                  <div className="text-rose-400 font-bold text-lg">{litige.amount}</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <div className="text-xs text-slate-400 mb-1">Priorité</div>
                  <div className="flex items-center gap-2">
                    <Flag className={cn(
                      'w-4 h-4',
                      litige.priority === 1 ? 'text-rose-400' :
                      litige.priority === 2 ? 'text-amber-400' :
                      'text-slate-400'
                    )} />
                    <span className="text-slate-200 font-medium">P{litige.priority}</span>
                  </div>
                </div>
              </div>

              {/* Resolution (if resolved) */}
              {isResolved && litige.resolution && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-emerald-400">Résolution</h3>
                  </div>
                  <p className="text-slate-300">{litige.resolution}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {/* Add Comment */}
              {!isResolved && (
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <div className="flex gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire ou une action..."
                      rows={2}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-400 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <Button
                      onClick={handleAddAction}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700 self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700/50" />

                {/* Actions */}
                <div className="space-y-6">
                  {litige.actions.map((action, idx) => (
                    <div key={action.id} className="relative flex gap-4">
                      {/* Dot */}
                      <div className="relative z-10 w-12 h-12 rounded-full bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-200">{action.action}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(action.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">Par {action.user}</div>
                        {action.comment && (
                          <div className="mt-2 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-sm text-slate-300">
                            {action.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resolution' && (
            <div className="space-y-6">
              {isResolved ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-200 mb-2">Litige résolu</h3>
                  <p className="text-slate-400 mb-4">
                    Ce litige a été résolu le {new Date(litige.date).toLocaleDateString('fr-FR')}
                  </p>
                  {litige.resolution && (
                    <div className="max-w-md mx-auto p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                      <p className="text-slate-300">{litige.resolution}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-200">
                        <p className="font-medium mb-1">Avant de résoudre ce litige</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-300/80">
                          <li>Assurez-vous que le client est satisfait de la solution</li>
                          <li>Documentez les actions entreprises</li>
                          <li>Vérifiez que tous les engagements sont tenus</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description de la résolution *
                    </label>
                    <textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Expliquez comment le litige a été résolu, les actions entreprises, et le résultat..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-400 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('details')}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleResolve}
                      disabled={!resolutionText.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Marquer comme résolu
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/60">
          <div className="text-sm text-slate-400">
            Litige #{litige.id}
          </div>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

