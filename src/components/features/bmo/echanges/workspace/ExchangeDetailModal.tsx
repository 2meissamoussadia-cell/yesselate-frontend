/**
 * Modal de détail d'un échange inter-bureaux
 * Pattern Modal Overlay - 5 onglets: Détails, Timeline, Discussion, Documents, Actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  MessageSquare,
  Clock,
  FileText,
  Paperclip,
  Send,
  ArrowUp,
  Archive,
  Download,
  User,
  Building2,
  Calendar,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRightLeft,
  Briefcase,
} from 'lucide-react';
import { getExchangeById, formatFileSize, type ExchangeDetail } from '@/lib/mocks/echangesMockData';

interface ExchangeDetailModalProps {
  open: boolean;
  onClose: () => void;
  exchangeId: string | null;
}

export function ExchangeDetailModal({ open, onClose, exchangeId }: ExchangeDetailModalProps) {
  const [exchange, setExchange] = useState<ExchangeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (open && exchangeId) {
      setLoading(true);
      // Simuler le chargement depuis l'API
      setTimeout(() => {
        const data = getExchangeById(exchangeId);
        setExchange(data || null);
        setLoading(false);
      }, 300);
    } else if (!open) {
      setExchange(null);
      setActiveTab('details');
      setNewMessage('');
    }
  }, [open, exchangeId]);

  const handleSendMessage = () => {
    if (!exchange || !newMessage.trim()) return;
    // TODO: Implémenter l'envoi de message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  if (!open) return null;

  const priorityColors = {
    urgent: 'text-red-400 bg-red-500/10 border-red-500/30',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    normal: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  const statusColors = {
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    escalated: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const priorityIcons = {
    urgent: Zap,
    high: ArrowUp,
    normal: Clock,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : exchange ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono text-sm text-slate-400">{exchange.ref}</span>
                    <Badge className={priorityColors[exchange.priority]}>
                      {(() => {
                        const Icon = priorityIcons[exchange.priority];
                        return (
                          <>
                            <Icon className="w-3 h-3 mr-1" />
                            {exchange.priority === 'urgent' ? 'Urgent' : exchange.priority === 'high' ? 'Haute' : 'Normale'}
                          </>
                        );
                      })()}
                    </Badge>
                    <Badge className={statusColors[exchange.status]}>
                      {exchange.status === 'pending' ? 'En attente' : exchange.status === 'resolved' ? 'Résolu' : 'Escaladé'}
                    </Badge>
                    {exchange.metadata.type && (
                      <Badge variant="default" className="text-xs">
                        {exchange.metadata.type === 'demande' ? 'Demande' : exchange.metadata.type === 'information' ? 'Information' : exchange.metadata.type === 'validation' ? 'Validation' : 'Escalade'}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">{exchange.sujet}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors ml-4"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="px-6 pt-4 bg-transparent border-b border-slate-800">
                <TabsTrigger value="details" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-400">
                  Détails
                </TabsTrigger>
                <TabsTrigger value="timeline" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-400">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="discussion" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-400">
                  Discussion ({exchange.responses.length})
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-400">
                  Documents ({exchange.attachments.length})
                </TabsTrigger>
                <TabsTrigger value="actions" className="data-[state=active]:border-b-2 data-[state=active]:border-violet-400">
                  Actions
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                {/* Onglet Détails */}
                <TabsContent value="details" className="p-6 space-y-6 mt-0">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                      <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        De
                      </p>
                      <p className="text-sm font-medium text-slate-200">{exchange.bureauFrom.name}</p>
                      <p className="text-xs text-slate-500">{exchange.bureauFrom.code}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                      <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Vers
                      </p>
                      <p className="text-sm font-medium text-slate-200">{exchange.bureauTo.name}</p>
                      <p className="text-xs text-slate-500">{exchange.bureauTo.code}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                      <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Auteur
                      </p>
                      <p className="text-sm font-medium text-slate-200">{exchange.auteur.name}</p>
                      <p className="text-xs text-slate-500">{exchange.auteur.email}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
                      <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Créé le
                      </p>
                      <p className="text-sm font-medium text-slate-200">
                        {new Date(exchange.dateCreation).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(exchange.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Projet lié */}
                  {exchange.project && (
                    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-semibold text-slate-300">Projet lié</h3>
                      </div>
                      <p className="text-sm text-slate-200">{exchange.project.name}</p>
                      <p className="text-xs text-slate-500 mt-1">Code: {exchange.project.code}</p>
                    </div>
                  )}

                  {/* Message */}
                  <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Message</h3>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap">{exchange.message}</p>
                  </div>

                  {/* Tags */}
                  {exchange.metadata.tags.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                      <h3 className="text-sm font-semibold text-slate-300 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {exchange.metadata.tags.map(tag => (
                          <Badge key={tag} variant="default" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Onglet Timeline */}
                <TabsContent value="timeline" className="p-6 mt-0">
                  <div className="space-y-4">
                    {exchange.timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            event.type === 'created' ? 'bg-violet-500/20 text-violet-400' :
                            event.type === 'escalated' ? 'bg-red-500/20 text-red-400' :
                            event.type === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                            event.type === 'responded' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-700/50 text-slate-400'
                          )}>
                            {event.type === 'created' && <MessageSquare className="w-4 h-4" />}
                            {event.type === 'escalated' && <ArrowUp className="w-4 h-4" />}
                            {event.type === 'resolved' && <CheckCircle className="w-4 h-4" />}
                            {event.type === 'responded' && <MessageSquare className="w-4 h-4" />}
                            {event.type === 'attachment_added' && <Paperclip className="w-4 h-4" />}
                            {event.type === 'updated' && <FileText className="w-4 h-4" />}
                            {!['created', 'escalated', 'resolved', 'responded', 'attachment_added', 'updated'].includes(event.type) && <Clock className="w-4 h-4" />}
                          </div>
                          {index < exchange.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-700/50 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-200">{event.user.name}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(event.timestamp).toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Onglet Discussion */}
                <TabsContent value="discussion" className="p-6 mt-0 flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                    {exchange.responses.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Aucune réponse pour le moment</p>
                      </div>
                    ) : (
                      exchange.responses.map(response => (
                        <div
                          key={response.id}
                          className={cn(
                            'p-4 rounded-xl border',
                            response.isInternal
                              ? 'bg-slate-800/50 border-slate-700/50 ml-8'
                              : 'bg-violet-500/10 border-violet-500/30 mr-8'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-medium">
                              {response.author.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">{response.author.name}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(response.createdAt).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap mb-2">{response.content}</p>
                          {response.attachments && response.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {response.attachments.map(att => (
                                <div key={att.id} className="flex items-center gap-2 text-xs text-slate-400">
                                  <Paperclip className="w-3 h-3" />
                                  <span>{att.name}</span>
                                  <span className="text-slate-600">({formatFileSize(att.size)})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Formulaire de réponse */}
                  <div className="border-t border-slate-800 pt-4">
                    <div className="flex gap-2">
                      <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Écrire une réponse..."
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                        rows={3}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Documents */}
                <TabsContent value="documents" className="p-6 mt-0">
                  <div className="space-y-3">
                    {exchange.attachments.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Aucun document</p>
                      </div>
                    ) : (
                      exchange.attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-200 truncate">{attachment.name}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>{formatFileSize(attachment.size)}</span>
                                <span>•</span>
                                <span>{new Date(attachment.uploadedAt).toLocaleDateString('fr-FR')}</span>
                                <span>•</span>
                                <span>{attachment.uploadedBy.name}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Onglet Actions */}
                <TabsContent value="actions" className="p-6 mt-0">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">Actions rapides</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="default" className="justify-start">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Répondre
                        </Button>
                        <Button variant="default" className="justify-start">
                          <ArrowUp className="w-4 h-4 mr-2" />
                          Escalader
                        </Button>
                        <Button variant="default" className="justify-start">
                          <Archive className="w-4 h-4 mr-2" />
                          Archiver
                        </Button>
                        <Button variant="default" className="justify-start">
                          <Download className="w-4 h-4 mr-2" />
                          Exporter
                        </Button>
                      </div>
                    </div>

                    {exchange.status === 'pending' && (
                      <div className="p-4 rounded-xl border border-emerald-700/50 bg-emerald-500/10">
                        <h3 className="text-sm font-semibold text-emerald-400 mb-2">Marquer comme résolu</h3>
                        <p className="text-xs text-slate-400 mb-3">
                          Clôturer cet échange une fois le traitement terminé
                        </p>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Résoudre
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Échange non trouvé
          </div>
        )}
      </div>
    </div>
  );
}

