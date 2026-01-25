/**
 * ====================================================================
 * TAB: Détail de Substitution
 * Vue détaillée complète d'une substitution avec timeline, documents, etc.
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  User, Calendar, AlertTriangle, FileText, MessageSquare, Clock, 
  Paperclip, TrendingUp, CheckCircle, XCircle, Loader2, Upload 
} from 'lucide-react';
import type { Substitution, TimelineEvent, Document, Comment } from '@/lib/types/substitution.types';

interface SubstitutionDetailTabProps {
  substitutionId: string;
}

export function SubstitutionDetailTab({ substitutionId }: SubstitutionDetailTabProps) {
  const [loading, setLoading] = useState(true);
  const [substitution, setSubstitution] = useState<Substitution | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'timeline' | 'documents' | 'comments'>('overview');

  useEffect(() => {
    loadSubstitutionDetails();
  }, [substitutionId]);

  const loadSubstitutionDetails = async () => {
    setLoading(true);
    try {
      // Load substitution
      const { substitutionApiService } = await import('@/lib/services/substitutionApiService');
      const sub = await substitutionApiService.getById(substitutionId);
      
      // Load timeline
      const { getTimelineByEntity } = await import('@/lib/data/timeline-documents-mock-data');
      const timelineData = getTimelineByEntity('substitution', substitutionId);
      
      // Load documents
      const { getDocumentsByEntity } = await import('@/lib/data/timeline-documents-mock-data');
      const docsData = getDocumentsByEntity('substitution', substitutionId);
      
      // Load comments
      const { getCommentsByEntity } = await import('@/lib/data/comments-mock-data');
      const commentsData = getCommentsByEntity('substitution', substitutionId);
      
      setSubstitution((sub ?? null) as Substitution | null);
      setTimeline(timelineData);
      setDocuments(docsData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-slate-400">Chargement des détails...</span>
      </div>
    );
  }

  if (!substitution) {
    return (
      <div className="text-center py-12 text-slate-400">
        Substitution non trouvée
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'En attente' },
      completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Terminée' },
      expired: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Expirée' },
    };
    const c = config[status as keyof typeof config] || config.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const config = {
      critical: { bg: 'bg-red-500', text: 'text-white', label: 'Critique' },
      high: { bg: 'bg-orange-500', text: 'text-white', label: 'Haute' },
      medium: { bg: 'bg-yellow-500', text: 'text-white', label: 'Moyenne' },
      low: { bg: 'bg-green-500', text: 'text-white', label: 'Basse' },
    };
    const c = config[urgency as keyof typeof config] || config.medium;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-slate-900 border-b border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{substitution.ref}</h1>
            <p className="text-slate-300">{substitution.description}</p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(substitution.status)}
            {getUrgencyBadge(substitution.urgency)}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400">Bureau</div>
            <div className="text-lg font-semibold text-white">{substitution.bureau}</div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400">Retard</div>
            <div className="text-lg font-semibold text-orange-400">{substitution.delay} jours</div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400">Montant</div>
            <div className="text-lg font-semibold text-green-400">
              {substitution.amount ? `${(substitution.amount / 1000000).toFixed(1)}M FCFA` : 'N/A'}
            </div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400">Motif</div>
            <div className="text-lg font-semibold text-white capitalize">{substitution.reason}</div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex-shrink-0 border-b border-slate-700 bg-slate-900">
        <div className="flex gap-1 p-2">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Clock, count: timeline.length },
            { id: 'documents', label: 'Documents', icon: Paperclip, count: documents.length },
            { id: 'comments', label: 'Commentaires', icon: MessageSquare, count: comments.length },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
                {section.count !== undefined && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeSection === section.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {section.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* People */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personnes impliquées
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Titulaire</div>
                  <div className="font-medium text-white">{substitution.titulaire.name}</div>
                  <div className="text-sm text-slate-400">{substitution.titulaire.bureau}</div>
                </div>
                {substitution.substitut && (
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400 mb-2">Substitut</div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white">{substitution.substitut.name}</div>
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                        Score: {substitution.substitut.score}%
                      </span>
                    </div>
                    <div className="text-sm text-slate-400">{substitution.substitut.bureau}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Période
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Date de début</div>
                  <div className="font-medium text-white">
                    {new Date(substitution.dateDebut).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                {substitution.dateFin && (
                  <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="text-sm text-slate-400 mb-2">Date de fin</div>
                    <div className="font-medium text-white">
                      {new Date(substitution.dateFin).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Linked Projects */}
            {substitution.linkedProjects && substitution.linkedProjects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Projets liés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {substitution.linkedProjects.map((projectId) => (
                    <span
                      key={projectId}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300"
                    >
                      {projectId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'timeline' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Historique des événements</h3>
            {timeline.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucun événement enregistré
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />
                
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={index} className="relative flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${event.color || 'bg-slate-700'} relative z-10`}>
                        {event.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-white">{event.description ?? '—'}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(event.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-slate-400">{event.description}</p>
                        )}
                        {event.user && (
                          <p className="text-xs text-slate-500 mt-1">Par {event.user.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Documents attachés</h3>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Ajouter un document
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucun document attaché
              </div>
            ) : (
              <div className="grid gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white">{doc.name}</div>
                        <div className="text-sm text-slate-400">
                          {(doc.size / 1024).toFixed(0)} KB • 
                          {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors">
                        Télécharger
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'comments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Discussion</h3>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucun commentaire
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {comment.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{comment.user.name}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

