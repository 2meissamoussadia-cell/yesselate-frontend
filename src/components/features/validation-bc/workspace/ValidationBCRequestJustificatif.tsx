'use client';

import React, { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Paperclip,
  Mail,
  History,
  PlusCircle,
  Filter,
  Search,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface JustificatifRequest {
  id: string;
  documentRef: string;
  documentType: 'bc' | 'facture' | 'avenant';
  category: string;
  message: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'received' | 'rejected' | 'overdue';
  targetPerson?: string;
  targetEmail?: string;
  deadline?: string;
  response?: {
    message?: string;
    receivedAt?: string;
    attachments?: string[];
  };
}

interface ValidationBCRequestJustificatifProps {
  open: boolean;
  onClose: () => void;
  documentRef?: string;
  documentType?: 'bc' | 'facture' | 'avenant';
}

// ============================================
// Constants
// ============================================
const CATEGORY_OPTIONS = [
  { value: 'devis', label: 'Devis fournisseur' },
  { value: 'facture', label: 'Facture originale' },
  { value: 'bon_livraison', label: 'Bon de livraison' },
  { value: 'pv_reception', label: 'PV de réception' },
  { value: 'contrat', label: 'Contrat / Avenant' },
  { value: 'attestation', label: 'Attestation fiscale' },
  { value: 'rib', label: 'RIB fournisseur' },
  { value: 'autre', label: 'Autre document' },
];

const STATUS_CONFIG = {
  pending: { 
    label: 'En attente', 
    color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
    icon: Clock 
  },
  received: { 
    label: 'Reçu', 
    color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle 
  },
  rejected: { 
    label: 'Rejeté', 
    color: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
    icon: XCircle 
  },
  overdue: { 
    label: 'En retard', 
    color: 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700',
    text: 'text-red-700 dark:text-red-300',
    icon: AlertTriangle 
  },
};

// ============================================
// Component
// ============================================
export function ValidationBCRequestJustificatif({
  open,
  onClose,
  documentRef,
  documentType,
}: ValidationBCRequestJustificatifProps) {
  const [view, setView] = useState<'list' | 'new'>('list');
  const [filter, setFilter] = useState<'all' | 'pending' | 'received' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [newCategory, setNewCategory] = useState('devis');
  const [newMessage, setNewMessage] = useState('');
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetEmail, setNewTargetEmail] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  // Mock data
  const requests: JustificatifRequest[] = useMemo(() => [
    {
      id: 'REQ-001',
      documentRef: 'BC-2026-0042',
      documentType: 'bc',
      category: 'Devis fournisseur',
      message: 'Veuillez fournir le devis original signé avec le cachet du fournisseur.',
      requestedBy: 'Jean Dupont',
      requestedAt: '2026-01-08T10:00:00',
      status: 'received',
      targetPerson: 'Tech Solutions SARL',
      targetEmail: 'contact@techsolutions.sn',
      deadline: '2026-01-10',
      response: {
        message: 'Voici le devis demandé.',
        receivedAt: '2026-01-09T14:30:00',
        attachments: ['Devis_TS_2026_001.pdf'],
      },
    },
    {
      id: 'REQ-002',
      documentRef: 'FA-2026-0089',
      documentType: 'facture',
      category: 'Bon de livraison',
      message: 'Le bon de livraison est manquant pour le rapprochement 3-way.',
      requestedBy: 'Sarah Martin',
      requestedAt: '2026-01-09T11:00:00',
      status: 'pending',
      targetPerson: 'Service Logistique',
      deadline: '2026-01-12',
    },
    {
      id: 'REQ-003',
      documentRef: 'BC-2026-0038',
      documentType: 'bc',
      category: 'Attestation fiscale',
      message: 'Attestation fiscale du fournisseur expirée, veuillez demander la nouvelle version.',
      requestedBy: 'Thomas Dubois',
      requestedAt: '2026-01-06T09:00:00',
      status: 'overdue',
      targetPerson: 'Fournisseur ABC',
      targetEmail: 'admin@abc.sn',
      deadline: '2026-01-08',
    },
    {
      id: 'REQ-004',
      documentRef: 'AV-2026-0012',
      documentType: 'avenant',
      category: 'Contrat / Avenant',
      message: 'Document incorrect - pages manquantes.',
      requestedBy: 'Nadia Bensaid',
      requestedAt: '2026-01-05T16:00:00',
      status: 'rejected',
      targetPerson: 'Service Juridique',
      response: {
        message: 'Le document a été rejeté car les pages 3-5 sont manquantes.',
      },
    },
  ], []);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesFilter = filter === 'all' || req.status === filter;
      const matchesSearch = searchQuery === '' ||
        req.documentRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.targetPerson?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDoc = !documentRef || req.documentRef === documentRef;
      return matchesFilter && matchesSearch && matchesDoc;
    });
  }, [requests, filter, searchQuery, documentRef]);

  const stats = useMemo(() => ({
    pending: requests.filter(r => r.status === 'pending').length,
    received: requests.filter(r => r.status === 'received').length,
    overdue: requests.filter(r => r.status === 'overdue').length,
  }), [requests]);

  const handleSubmit = () => {
    console.log('New request:', {
      documentRef,
      documentType,
      category: newCategory,
      message: newMessage,
      targetName: newTargetName,
      targetEmail: newTargetEmail,
      deadline: newDeadline,
    });
    // Reset form
    setNewCategory('devis');
    setNewMessage('');
    setNewTargetName('');
    setNewTargetEmail('');
    setNewDeadline('');
    setView('list');
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Demandes de pièces justificatives"
      size="xl"
    >
      <div className="space-y-6">
        {view === 'list' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setFilter('pending')}
                className={cn(
                  'p-4 rounded-xl border transition-all text-left',
                  filter === 'pending' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-400">En attente</span>
                </div>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </button>

              <button
                onClick={() => setFilter('received')}
                className={cn(
                  'p-4 rounded-xl border transition-all text-left',
                  filter === 'received' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-slate-400">Reçus</span>
                </div>
                <p className="text-2xl font-bold">{stats.received}</p>
              </button>

              <button
                onClick={() => setFilter('overdue')}
                className={cn(
                  'p-4 rounded-xl border transition-all text-left',
                  filter === 'overdue' ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-slate-400">En retard</span>
                </div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </button>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filter === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                )}
              >
                Tous
              </button>
              <button
                onClick={() => setView('new')}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Nouvelle demande
              </button>
            </div>

            {/* Requests list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredRequests.map((req) => {
                const config = STATUS_CONFIG[req.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={req.id}
                    className={cn('p-4 rounded-xl border transition-all', config.color)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-blue-500">{req.documentRef}</span>
                          <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', config.text)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="font-medium">{req.category}</p>
                      </div>
                      {req.deadline && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Échéance</p>
                          <p className={cn('text-sm font-medium', req.status === 'overdue' && 'text-red-600')}>
                            {new Date(req.deadline).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{req.message}</p>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {req.targetPerson}
                        </span>
                        {req.targetEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {req.targetEmail}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(req.requestedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Response */}
                    {req.response && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <p className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Réponse
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{req.response.message}</p>
                        {req.response.attachments && req.response.attachments.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            {req.response.attachments.map((att, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-slate-800 text-xs border">
                                <Paperclip className="w-3 h-3" />
                                {att}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucune demande trouvée</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* New Request Form */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nouvelle demande de pièce</h3>
              <button
                onClick={() => setView('list')}
                className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ← Retour à la liste
              </button>
            </div>

            {documentRef && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Document : <strong>{documentRef}</strong>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Type de document demandé *</label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-purple-500/30">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  {CATEGORY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message de demande *</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
                placeholder="Décrivez précisément le document attendu..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Destinataire</label>
                <input
                  type="text"
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm outline-none"
                  placeholder="Nom / Service"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newTargetEmail}
                  onChange={(e) => setNewTargetEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Échéance</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newMessage.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer la demande
              </button>
            </div>
          </div>
        )}
      </div>
    </FluentModal>
  );
}

