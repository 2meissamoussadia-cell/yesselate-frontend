'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShoppingCart,
  Building2,
  Scale,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Eye,
  Filter,
  SortAsc,
  MoreHorizontal,
  User,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  Receipt,
  FileEdit,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// ================================
// Types métier
// ================================
export type DocumentType = 'bc' | 'facture' | 'avenant';
export type ServiceSource = 'achats' | 'finance' | 'juridique';
export type DocumentStatus = 
  | 'draft' 
  | 'submitted' 
  | 'pending_validation' 
  | 'level1_approved' 
  | 'level2_approved' 
  | 'level3_approved'
  | 'rejected' 
  | 'revision_required'
  | 'completed';

export interface ValidationDocument {
  id: string;
  type: DocumentType;
  reference: string;
  title: string;
  amount: number;
  currency: string;
  supplier: string;
  supplierCode: string;
  service: ServiceSource;
  submittedBy: string;
  submittedAt: string;
  status: DocumentStatus;
  currentLevel: number;
  maxLevel: number;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  hasThreeWayMatch: boolean;
  threeWayStatus?: 'matched' | 'partial' | 'mismatch' | 'pending';
  linkedDocuments?: { type: string; ref: string }[];
  comments?: number;
  attachments?: number;
}

export interface ServiceQueue {
  service: ServiceSource;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  documents: {
    pending: number;
    validated: number;
    rejected: number;
    total: number;
  };
  avgProcessingTime: number;
  slaCompliance: number;
}

// ================================
// Mock data
// ================================
const mockQueues: ServiceQueue[] = [
  {
    service: 'achats',
    name: 'Service Achats',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    documents: { pending: 23, validated: 156, rejected: 8, total: 187 },
    avgProcessingTime: 3.5,
    slaCompliance: 94,
  },
  {
    service: 'finance',
    name: 'Service Finance',
    icon: Building2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
    documents: { pending: 15, validated: 203, rejected: 5, total: 223 },
    avgProcessingTime: 2.8,
    slaCompliance: 97,
  },
  {
    service: 'juridique',
    name: 'Service Juridique',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
    documents: { pending: 7, validated: 34, rejected: 2, total: 43 },
    avgProcessingTime: 5.2,
    slaCompliance: 89,
  },
];

const mockDocuments: ValidationDocument[] = [
  {
    id: 'BC-2024-001245',
    type: 'bc',
    reference: 'BC-2024-001245',
    title: 'Achat équipements informatiques',
    amount: 4500000,
    currency: 'FCFA',
    supplier: 'TECH SOLUTIONS SARL',
    supplierCode: 'TECH-001',
    service: 'achats',
    submittedBy: 'M. Konaté',
    submittedAt: '2024-01-15T09:30:00Z',
    status: 'pending_validation',
    currentLevel: 1,
    maxLevel: 3,
    dueDate: '2024-01-20T18:00:00Z',
    priority: 'high',
    hasThreeWayMatch: true,
    threeWayStatus: 'matched',
    linkedDocuments: [
      { type: 'BL', ref: 'BL-2024-001245' },
    ],
    comments: 3,
    attachments: 5,
  },
  {
    id: 'FAC-2024-003421',
    type: 'facture',
    reference: 'FAC-2024-003421',
    title: 'Facture maintenance serveurs',
    amount: 2800000,
    currency: 'FCFA',
    supplier: 'DATACENTER AFRICA',
    supplierCode: 'DATA-002',
    service: 'finance',
    submittedBy: 'Mme Diallo',
    submittedAt: '2024-01-14T14:00:00Z',
    status: 'pending_validation',
    currentLevel: 2,
    maxLevel: 2,
    dueDate: '2024-01-18T18:00:00Z',
    priority: 'urgent',
    hasThreeWayMatch: true,
    threeWayStatus: 'partial',
    linkedDocuments: [
      { type: 'BC', ref: 'BC-2024-001198' },
      { type: 'BL', ref: 'BL-2024-001198' },
    ],
    comments: 1,
    attachments: 2,
  },
  {
    id: 'AVE-2024-000087',
    type: 'avenant',
    reference: 'AVE-2024-000087',
    title: 'Avenant contrat maintenance',
    amount: 1200000,
    currency: 'FCFA',
    supplier: 'MULTI SERVICES',
    supplierCode: 'MULT-003',
    service: 'juridique',
    submittedBy: 'Me Touré',
    submittedAt: '2024-01-12T11:00:00Z',
    status: 'level1_approved',
    currentLevel: 2,
    maxLevel: 3,
    dueDate: '2024-01-25T18:00:00Z',
    priority: 'medium',
    hasThreeWayMatch: false,
    linkedDocuments: [
      { type: 'Contrat', ref: 'CTR-2023-000456' },
    ],
    comments: 5,
    attachments: 8,
  },
];

// ================================
// Helpers
// ================================
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    draft: 'Brouillon',
    submitted: 'Soumis',
    pending_validation: 'En attente',
    level1_approved: 'Niveau 1 validé',
    level2_approved: 'Niveau 2 validé',
    level3_approved: 'Validé final',
    rejected: 'Rejeté',
    revision_required: 'À réviser',
    completed: 'Clôturé',
  };
  return labels[status];
}

function getStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-blue-100 text-blue-700',
    pending_validation: 'bg-amber-100 text-amber-700',
    level1_approved: 'bg-blue-100 text-blue-700',
    level2_approved: 'bg-indigo-100 text-indigo-700',
    level3_approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
    revision_required: 'bg-orange-100 text-orange-700',
    completed: 'bg-slate-100 text-slate-600',
  };
  return colors[status];
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-rose-100 text-rose-700',
  };
  return colors[priority] || colors.low;
}

function getDocTypeIcon(type: DocumentType): React.ComponentType<{ className?: string }> {
  const icons: Record<DocumentType, React.ComponentType<{ className?: string }>> = {
    bc: FileText,
    facture: Receipt,
    avenant: FileEdit,
  };
  return icons[type];
}

function getDocTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    bc: 'Bon de commande',
    facture: 'Facture',
    avenant: 'Avenant',
  };
  return labels[type];
}

// ================================
// Sub-components
// ================================
function ServiceQueueCard({
  queue,
  isActive,
  onClick,
}: {
  queue: ServiceQueue;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = queue.icon;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border text-left transition-all w-full',
        isActive
          ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10'
          : 'border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', queue.bgColor)}>
          <Icon className={cn('w-5 h-5', queue.color)} />
        </div>
        {queue.documents.pending > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            {queue.documents.pending}
          </span>
        )}
      </div>
      
      <div className="mt-3">
        <div className="font-semibold text-sm">{queue.name}</div>
        <div className="text-xs text-slate-400 mt-1">
          {queue.documents.total} documents
        </div>
      </div>
      
      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400">{queue.avgProcessingTime}h</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="text-slate-400">{queue.slaCompliance}%</span>
        </div>
      </div>
    </button>
  );
}

function DocumentCard({
  document,
  onView,
  onValidate,
  onReject,
}: {
  document: ValidationDocument;
  onView: () => void;
  onValidate: () => void;
  onReject: () => void;
}) {
  const DocIcon = getDocTypeIcon(document.type);
  
  return (
    <div className="p-4 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-none',
            document.type === 'bc' && 'bg-blue-500/10',
            document.type === 'facture' && 'bg-emerald-500/10',
            document.type === 'avenant' && 'bg-purple-500/10'
          )}>
            <DocIcon className={cn(
              'w-5 h-5',
              document.type === 'bc' && 'text-blue-600',
              document.type === 'facture' && 'text-emerald-600',
              document.type === 'avenant' && 'text-purple-600'
            )} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">{document.reference}</div>
            <div className="text-xs text-slate-400 truncate">{document.title}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-none">
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getPriorityColor(document.priority))}>
            {document.priority === 'urgent' ? '🔴 Urgent' : document.priority}
          </span>
        </div>
      </div>
      
      {/* Info grid */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300 truncate">{document.supplier}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{formatAmount(document.amount)} {document.currency}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300">{document.submittedBy}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300">{formatDate(document.dueDate)}</span>
        </div>
      </div>
      
      {/* 3-way match indicator */}
      {document.hasThreeWayMatch && (
        <div className={cn(
          'mt-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs',
          document.threeWayStatus === 'matched' && 'bg-emerald-50 dark:bg-emerald-900/20',
          document.threeWayStatus === 'partial' && 'bg-amber-50 dark:bg-amber-900/20',
          document.threeWayStatus === 'mismatch' && 'bg-rose-50 dark:bg-rose-900/20',
          document.threeWayStatus === 'pending' && 'bg-slate-50 dark:bg-slate-800/50'
        )}>
          <FileCheck className={cn(
            'w-4 h-4',
            document.threeWayStatus === 'matched' && 'text-emerald-600',
            document.threeWayStatus === 'partial' && 'text-amber-600',
            document.threeWayStatus === 'mismatch' && 'text-rose-600',
            document.threeWayStatus === 'pending' && 'text-slate-400'
          )} />
          <span className={cn(
            'font-medium',
            document.threeWayStatus === 'matched' && 'text-emerald-700',
            document.threeWayStatus === 'partial' && 'text-amber-700',
            document.threeWayStatus === 'mismatch' && 'text-rose-700',
            document.threeWayStatus === 'pending' && 'text-slate-600'
          )}>
            3-Way: {document.threeWayStatus === 'matched' ? 'Conforme' : 
                    document.threeWayStatus === 'partial' ? 'Partiel' :
                    document.threeWayStatus === 'mismatch' ? 'Non conforme' : 'En attente'}
          </span>
          {document.linkedDocuments && (
            <span className="text-slate-400 ml-auto">
              {document.linkedDocuments.map(d => d.ref).join(', ')}
            </span>
          )}
        </div>
      )}
      
      {/* Status & Level */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(document.status))}>
            {getStatusLabel(document.status)}
          </span>
          <span className="text-xs text-slate-400">
            Niveau {document.currentLevel}/{document.maxLevel}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {document.comments && document.comments > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
              💬 {document.comments}
            </span>
          )}
          {document.attachments && document.attachments > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
              📎 {document.attachments}
            </span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onView} className="flex-1">
          <Eye className="w-3.5 h-3.5 mr-1" />
          Voir
        </FluentButton>
        {document.status === 'pending_validation' && (
          <>
            <FluentButton size="sm" variant="success" onClick={onValidate} className="flex-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Valider
            </FluentButton>
            <FluentButton size="sm" variant="destructive" onClick={onReject}>
              <XCircle className="w-3.5 h-3.5" />
            </FluentButton>
          </>
        )}
      </div>
    </div>
  );
}

// ================================
// Main Component
// ================================
export function ValidationBCServiceQueues({
  onOpenDocument,
  onValidate,
  onReject,
}: {
  onOpenDocument: (id: string, type: DocumentType) => void;
  onValidate: (doc: ValidationDocument) => void;
  onReject: (doc: ValidationDocument) => void;
}) {
  const [activeService, setActiveService] = useState<ServiceSource | 'all'>('all');
  const [documents, setDocuments] = useState<ValidationDocument[]>(mockDocuments);
  const [queues, setQueues] = useState<ServiceQueue[]>(mockQueues);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'priority'>('date');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');

  const refresh = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setDocuments([...mockDocuments]);
    setQueues([...mockQueues]);
    setLoading(false);
  }, []);

  const filteredDocuments = documents.filter(doc => {
    if (activeService !== 'all' && doc.service !== activeService) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'priority') {
      const p = { urgent: 4, high: 3, medium: 2, low: 1 };
      return p[b.priority] - p[a.priority];
    }
    return 0;
  });

  const totalStats = queues.reduce((acc, q) => ({
    pending: acc.pending + q.documents.pending,
    validated: acc.validated + q.documents.validated,
    rejected: acc.rejected + q.documents.rejected,
    total: acc.total + q.documents.total,
  }), { pending: 0, validated: 0, rejected: 0, total: 0 });

  return (
    <div className="space-y-6">
      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* All services */}
        <button
          type="button"
          onClick={() => setActiveService('all')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all',
            activeService === 'all'
              ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10'
              : 'border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:shadow-md'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="font-semibold text-sm">Tous les services</div>
              <div className="text-xs text-slate-400">{totalStats.total} documents</div>
            </div>
          </div>
          {totalStats.pending > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-amber-600 font-medium">{totalStats.pending} en attente</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </button>

        {queues.map(queue => (
          <ServiceQueueCard
            key={queue.service}
            queue={queue}
            isActive={activeService === queue.service}
            onClick={() => setActiveService(queue.service)}
          />
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as DocumentStatus | 'all')}
          >
            <SelectTrigger className="h-9 min-w-[140px] rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="pending_validation">En attente</SelectItem>
              <SelectItem value="level1_approved">Niveau 1</SelectItem>
              <SelectItem value="level2_approved">Niveau 2</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as 'date' | 'amount' | 'priority')}
          >
            <SelectTrigger className="h-9 min-w-[140px] rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
              <SelectValue placeholder="Tri" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <SelectItem value="date">Tri par date</SelectItem>
              <SelectItem value="amount">Tri par montant</SelectItem>
              <SelectItem value="priority">Tri par priorité</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">{filteredDocuments.length} document(s)</span>
          <FluentButton size="sm" variant="secondary" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </FluentButton>
        </div>
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileCheck className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-400">Aucun document trouvé</p>
          </div>
        ) : (
          filteredDocuments.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={() => onOpenDocument(doc.id, doc.type)}
              onValidate={() => onValidate(doc)}
              onReject={() => onReject(doc)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ValidationBCServiceQueues;

