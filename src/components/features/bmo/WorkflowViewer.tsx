'use client';
import { useState, useEffect } from 'react';
import { workflowService, type WorkflowInstance, type WorkflowStep } from '@lib-root/services/workflowService';
import { CheckCircle, XCircle, Clock, User, MessageSquare, ArrowRight, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  instanceId: string;
  onComplete?: () => void;
  className?: string;
}

export function WorkflowViewer({ instanceId, onComplete, className }: Props) {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [showCommentForm, setShowCommentForm] = useState<'approve' | 'reject' | 'changes' | null>(null);

  useEffect(() => {
    loadInstance();
  }, [instanceId]);

  const loadInstance = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getInstance(instanceId);
      setInstance(data);
    } catch (e) {
      console.error('Erreur chargement workflow:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!instance) return;
    
    const etapeActuelle = instance.etapes[instance.etapeActuelle];
    if (!etapeActuelle) return;

    try {
      setActionLoading(true);
      await workflowService.approveStep(
        instanceId,
        etapeActuelle.id,
        'current-user-id',
        'Utilisateur Actuel',
        commentaire || undefined
      );

      setCommentaire('');
      setShowCommentForm(null);
      await loadInstance();

      if (onComplete) onComplete();
    } catch (e) {
      console.error('Erreur approbation:', e);
      alert('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!instance || !commentaire.trim()) {
      alert('Veuillez fournir un commentaire de rejet');
      return;
    }

    const etapeActuelle = instance.etapes[instance.etapeActuelle];
    if (!etapeActuelle) return;

    try {
      setActionLoading(true);
      await workflowService.rejectStep(
        instanceId,
        etapeActuelle.id,
        'current-user-id',
        'Utilisateur Actuel',
        commentaire
      );

      setCommentaire('');
      setShowCommentForm(null);
      await loadInstance();

      if (onComplete) onComplete();
    } catch (e) {
      console.error('Erreur rejet:', e);
      alert('Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!instance || !commentaire.trim()) {
      alert('Veuillez décrire les modifications attendues');
      return;
    }

    const etapeActuelle = instance.etapes[instance.etapeActuelle];
    if (!etapeActuelle) return;

    try {
      setActionLoading(true);
      await workflowService.requestChanges(
        instanceId,
        etapeActuelle.id,
        'current-user-id',
        'Utilisateur Actuel',
        commentaire
      );

      setCommentaire('');
      setShowCommentForm(null);
      await loadInstance();

      if (onComplete) onComplete();
    } catch (e) {
      console.error('Erreur demande modifications:', e);
      alert('Erreur lors de la demande de modifications');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="h-32 rounded-xl bg-slate-800/30" />
        <div className="h-64 rounded-xl bg-slate-800/30" />
      </div>
    );
  }

  if (!instance) {
    return (
      <div className={cn('p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center', className)}>
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-400">Workflow non trouvé</p>
      </div>
    );
  }

  const etapeActuelle = instance.etapes[instance.etapeActuelle];
  const progression = (instance.etapes.filter((e) => e.status === 'approved').length / instance.etapes.length) * 100;

  return (
    <div className={cn('space-y-6', className)}>
      {/* En-tête */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Workflow de Validation</h3>
            <p className="text-sm text-slate-400 mt-1">
              {instance.entityType} · {instance.entityId}
            </p>
          </div>

          <div className={cn(
            'px-4 py-2 rounded-lg font-semibold text-sm',
            instance.status === 'approved' && 'bg-green-500/20 text-green-400',
            instance.status === 'rejected' && 'bg-red-500/20 text-red-400',
            instance.status === 'pending' && 'bg-blue-500/20 text-blue-400',
            instance.status === 'cancelled' && 'bg-slate-500/20 text-slate-400'
          )}>
            {instance.status === 'approved' ? 'Approuvé' : instance.status === 'rejected' ? 'Rejeté' : instance.status === 'pending' ? 'En cours' : 'Annulé'}
          </div>
        </div>

        {/* Barre de progression */}
        <div>
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Progression</span>
            <span>{Math.round(progression)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                instance.status === 'approved' ? 'bg-green-500' : instance.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
              )}
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>
      </div>

      {/* Étapes du workflow */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-200 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Étapes de validation
        </h4>

        <div className="space-y-3">
          {instance.etapes.map((etape, index) => (
            <div key={etape.id}>
              <WorkflowStepCard
                etape={etape}
                isActive={index === instance.etapeActuelle && instance.status === 'pending'}
                isCurrent={index === instance.etapeActuelle}
              />

              {/* Flèche entre les étapes */}
              {index < instance.etapes.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions (si étape actuelle et en attente) */}
      {instance.status === 'pending' && etapeActuelle && (
        <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <h4 className="font-semibold text-slate-200 mb-4">Actions</h4>

          {!showCommentForm ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowCommentForm('approve')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Approuver
              </button>

              <button
                onClick={() => setShowCommentForm('changes')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Demander modifications
              </button>

              <button
                onClick={() => setShowCommentForm('reject')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Rejeter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {showCommentForm === 'approve' ? 'Commentaire (optionnel)' : 'Commentaire (requis)'}
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder={
                    showCommentForm === 'approve'
                      ? 'Ajouter un commentaire...'
                      : showCommentForm === 'reject'
                      ? 'Expliquer le motif du rejet...'
                      : 'Décrire les modifications attendues...'
                  }
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={
                    showCommentForm === 'approve'
                      ? handleApprove
                      : showCommentForm === 'reject'
                      ? handleReject
                      : handleRequestChanges
                  }
                  disabled={actionLoading || (showCommentForm !== 'approve' && !commentaire.trim())}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                    showCommentForm === 'approve' && 'bg-green-500 text-white hover:bg-green-600',
                    showCommentForm === 'reject' && 'bg-red-500 text-white hover:bg-red-600',
                    showCommentForm === 'changes' && 'bg-amber-500 text-white hover:bg-amber-600'
                  )}
                >
                  <Send className="w-4 h-4" />
                  {actionLoading ? 'Envoi...' : 'Confirmer'}
                </button>

                <button
                  onClick={() => {
                    setShowCommentForm(null);
                    setCommentaire('');
                  }}
                  disabled={actionLoading}
                  className="px-4 py-3 rounded-xl bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historique */}
      {instance.historique.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-200">Historique</h4>

          <div className="space-y-2">
            {instance.historique.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {entry.acteurNom.charAt(0)}
                    </div>

                    <div>
                      <p className="font-medium text-slate-200">{entry.acteurNom}</p>
                      <p className="text-sm text-slate-400">
                        {entry.action === 'approve' && '✅ A approuvé'}
                        {entry.action === 'reject' && '❌ A rejeté'}
                        {entry.action === 'delegate' && '👉 A délégué'}
                        {entry.action === 'request_changes' && '📝 A demandé des modifications'}
                      </p>
                      {entry.commentaire && (
                        <p className="text-sm text-slate-300 mt-2 italic">
                          "{entry.commentaire}"
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(entry.date).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant carte d'étape
function WorkflowStepCard({
  etape,
  isActive,
  isCurrent,
}: {
  etape: WorkflowStep;
  isActive: boolean;
  isCurrent: boolean;
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        etape.status === 'approved' && 'bg-green-500/10 border-green-500/30',
        etape.status === 'rejected' && 'bg-red-500/10 border-red-500/30',
        etape.status === 'pending' && isCurrent && 'bg-blue-500/10 border-blue-500/30',
        etape.status === 'pending' && !isCurrent && 'bg-slate-800/20 border-slate-700/30',
        isActive && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Icône de statut */}
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            etape.status === 'approved' && 'bg-green-500/20',
            etape.status === 'rejected' && 'bg-red-500/20',
            etape.status === 'pending' && 'bg-slate-700/50'
          )}>
            {etape.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-400" />}
            {etape.status === 'rejected' && <XCircle className="w-5 h-5 text-red-400" />}
            {etape.status === 'pending' && <Clock className="w-5 h-5 text-slate-400" />}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h5 className="font-semibold text-slate-200">{etape.titre}</h5>
              <span className="text-xs text-slate-400">Étape {etape.ordre}</span>
            </div>

            {etape.description && (
              <p className="text-sm text-slate-400 mt-1">{etape.description}</p>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {etape.approbateurRole}
              </span>

              {etape.delaiMax && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {etape.delaiMax}h max
                </span>
              )}
            </div>

            {etape.commentaire && (
              <p className="text-sm text-slate-300 mt-3 p-3 rounded-lg bg-slate-700/30 italic">
                "{etape.commentaire}"
              </p>
            )}

            {etape.dateAction && (
              <p className="text-xs text-slate-400 mt-2">
                {new Date(etape.dateAction).toLocaleString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

