'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useValidationBCWorkspaceStore } from '@/lib/stores/validationBCWorkspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/cn';
import { ValidationBCDocumentPreview, type DocumentPiece } from './ValidationBCDocumentPreview';
import { 
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { 
  RefreshCw, Check, X, UserPlus, MessageSquare, FileText, 
  Clock, Building2, Tag, DollarSign, AlertTriangle, User,
  Calendar, CheckCircle2, XCircle, History, Mail, Phone,
  Target, Users, FileWarning, Paperclip, ThumbsUp, ThumbsDown,
  AlertCircle, Shield, ChevronDown, ChevronUp, ExternalLink,
  Wallet, CalendarClock, Info, ShoppingCart, Receipt, FileEdit,
  Scale, Link, ArrowRight, TrendingUp, ArrowLeft
} from 'lucide-react';

// ============================================
// Types
// ============================================
type ValidationLevel = {
  level: number;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  requiredAmount?: number;
};

type AuditEvent = {
  id: string;
  type: string;
  actorName: string;
  message?: string | null;
  createdAt: string;
};

type Supplier = {
  id: string;
  name: string;
  siret?: string;
  status: 'verified' | 'pending' | 'blocked';
  rating?: number;
};

type ThreeWayMatch = {
  bcAmount: number;
  invoiceAmount: number;
  deliveryQty: number;
  orderedQty: number;
  tolerance: number;
  amountMatch: boolean;
  qtyMatch: boolean;
  overallMatch: boolean;
};

type DocumentDetail = {
  id: string;
  reference: string;
  type: 'bc' | 'facture' | 'avenant';
  status: 'pending' | 'validated' | 'rejected';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  amount: number;
  createdAt: string;
  delayDays: number;
  isOverdue: boolean;
  
  // Source service
  sourceService: 'achats' | 'finance' | 'juridique';
  sourceAgent: { name: string; email?: string; phone?: string };
  
  // Description
  subject: string;
  description?: string;
  justification?: string;
  
  // Related entities
  supplier?: Supplier;
  projectCode?: string;
  budgetLine?: string;
  budgetAvailable?: number;
  
  // 3-way match
  threeWayMatch?: ThreeWayMatch;
  
  // Documents
  documents: DocumentPiece[];
  
  // Validation chain
  validationLevels: ValidationLevel[];
  currentLevel: number;
  
  // Audit
  audit: AuditEvent[];
};

// ============================================
// Constants
// ============================================
const EMPLOYEES = [
  { id: 'EMP-001', name: 'A. DIALLO', role: 'Responsable Validation' },
  { id: 'EMP-002', name: 'M. KONÉ', role: 'Chargé de Dossiers' },
  { id: 'EMP-003', name: 'S. TRAORÉ', role: 'Analyste Financier' },
  { id: 'EMP-004', name: 'K. CAMARA', role: 'Chef de Bureau' },
];

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'bg-rose-500/20 text-rose-500 border-rose-500/30', icon: AlertTriangle },
  high: { label: 'Élevée', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: AlertCircle },
  normal: { label: 'Normale', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Tag },
  low: { label: 'Basse', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Tag },
};

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-amber-500/20 text-amber-500', icon: Clock },
  validated: { label: 'Validé', color: 'bg-emerald-500/20 text-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Rejeté', color: 'bg-rose-500/20 text-rose-500', icon: XCircle },
};

const TYPE_CONFIG = {
  bc: { label: 'Bon de commande', icon: ShoppingCart, color: 'text-blue-500', service: 'achats' },
  facture: { label: 'Facture', icon: Receipt, color: 'text-emerald-500', service: 'finance' },
  avenant: { label: 'Avenant', icon: FileEdit, color: 'text-purple-500', service: 'juridique' },
};

const SERVICE_CONFIG = {
  achats: { label: 'Service Achats', color: 'bg-blue-500', icon: ShoppingCart },
  finance: { label: 'Service Finance', color: 'bg-emerald-500', icon: Building2 },
  juridique: { label: 'Service Juridique', color: 'bg-purple-500', icon: Scale },
};

const ACTION_ICONS: Record<string, typeof Check> = {
  creation: FileText,
  validation: CheckCircle2,
  rejection: XCircle,
  assign: UserPlus,
  request_complement: MessageSquare,
  review: Clock,
  level_approved: Shield,
};

// ============================================
// Helpers
// ============================================
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ============================================
// Props
// ============================================
type Props = {
  documentId: string;
  documentType: 'bc' | 'facture' | 'avenant';
};

// ============================================
// Component
// ============================================
export function ValidationBCDocumentView({ documentId, documentType }: Props) {
  const { updateTab, closeTab, tabs } = useValidationBCWorkspaceStore();
  
  const [data, setData] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Expandable sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['threeWay', 'documents', 'validation'])
  );
  
  // Modals
  const [complementOpen, setComplementOpen] = useState(false);
  const [complementText, setComplementText] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [assignNote, setAssignNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<'validate' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Callback pour fermer l'onglet
  const handleCloseTab = useCallback(() => {
    const tabId = `document:${documentType}:${documentId}`;
    console.log('🔍 Tentative de fermeture:', tabId);
    console.log('📋 Onglets disponibles:', tabs.map(t => t.id));
    closeTab(tabId);
  }, [documentType, documentId, closeTab, tabs]);

  // Debug: afficher les infos au montage du composant
  useEffect(() => {
    console.log('🎯 ValidationBCDocumentView montée:', {
      documentId,
      documentType,
      expectedTabId: `document:${documentType}:${documentId}`,
      availableTabs: tabs.map(t => ({ id: t.id, title: t.title }))
    });
  }, [documentId, documentType, tabs]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    const abortController = new AbortController();
    
    try {
      // Simulated API call with abort support
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 300);
        abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Request aborted'));
        });
      });
      
      const mockData: DocumentDetail = {
        id: documentId,
        reference: documentId,
        type: documentType,
        status: 'pending',
        priority: 'high',
        amount: 2450000,
        createdAt: '2026-01-08',
        delayDays: 2,
        isOverdue: false,
        sourceService: documentType === 'bc' ? 'achats' : documentType === 'facture' ? 'finance' : 'juridique',
        sourceAgent: { name: 'Jean Dupont', email: 'j.dupont@example.com', phone: '+221 77 123 45 67' },
        subject: `${TYPE_CONFIG[documentType].label} - Fournitures informatiques`,
        description: 'Acquisition de matériel informatique pour le nouveau bureau',
        justification: 'Renouvellement du parc informatique obsolète',
        supplier: {
          id: 'FOUR-001',
          name: 'Tech Solutions SARL',
          siret: '123 456 789 00012',
          status: 'verified',
          rating: 4.5,
        },
        projectCode: 'PRJ-2026-042',
        budgetLine: 'BL-612-EQUIP',
        budgetAvailable: 5000000,
        threeWayMatch: documentType === 'facture' ? {
          bcAmount: 2450000,
          invoiceAmount: 2450000,
          deliveryQty: 50,
          orderedQty: 50,
          tolerance: 2,
          amountMatch: true,
          qtyMatch: true,
          overallMatch: true,
        } : undefined,
        documents: [
          { id: 'doc1', name: 'Bon de commande BC-2026-0042.pdf', type: 'pdf', status: 'verified', date: '08/01/2026', uploadedBy: 'J. Dupont', required: true, category: 'bon_commande' },
          { id: 'doc2', name: 'Devis fournisseur.pdf', type: 'pdf', status: 'verified', date: '05/01/2026', uploadedBy: 'J. Dupont', required: true, category: 'devis' },
          { id: 'doc3', name: 'Facture FA-2026-0089.pdf', type: 'pdf', status: 'pending', date: '10/01/2026', uploadedBy: 'M. Finance', required: true, category: 'facture' },
          { id: 'doc4', name: 'Bon de livraison.pdf', type: 'pdf', status: 'missing', date: '', required: true, category: 'justificatif' },
        ],
        validationLevels: [
          { level: 1, name: 'Validation initiale', role: 'Chef d\'équipe', status: 'approved', approvedBy: 'S. Martin', approvedAt: '2026-01-08T14:30:00' },
          { level: 2, name: 'Validation budgétaire', role: 'Contrôleur financier', status: 'pending', requiredAmount: 1000000 },
          { level: 3, name: 'Approbation direction', role: 'Directeur', status: 'pending', requiredAmount: 2000000 },
        ],
        currentLevel: 2,
        audit: [
          { id: 'e1', type: 'creation', actorName: 'J. Dupont', createdAt: '2026-01-08T09:00:00', message: 'Document créé' },
          { id: 'e2', type: 'level_approved', actorName: 'S. Martin', createdAt: '2026-01-08T14:30:00', message: 'Niveau 1 validé' },
          { id: 'e3', type: 'review', actorName: 'Système', createdAt: '2026-01-09T08:00:00', message: 'En attente niveau 2' },
        ],
      };
      
      setData(mockData);
      updateTab(`document:${documentType}:${documentId}`, {
        title: `${documentId}`,
        icon: documentType === 'bc' ? '📄' : documentType === 'facture' ? '🧾' : '📝',
      });
    } catch (err) {
      if (err instanceof Error && err.message !== 'Request aborted') {
        console.error('Error loading document:', err);
      }
      setData(null);
    } finally {
      setLoading(false);
    }
    
    return () => abortController.abort();
  }, [documentId, documentType, updateTab]);

  useEffect(() => { load(); }, [load]);

  const canAct = useMemo(() => !!data && data.status === 'pending', [data]);

  const action = async (type: 'validate' | 'reject' | 'request_complement' | 'assign', payload?: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentVerify = useCallback((id: string, verified: boolean, comment?: string) => {
    console.log('Document verification:', id, verified, comment);
  }, []);

  const handleRequestDocument = useCallback((category: string, message: string) => {
    console.log('Document request:', category, message);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto" />
        <p className="mt-2 text-slate-400">Chargement...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <p className="mt-2 font-medium">Document introuvable</p>
        <button
          onClick={() => closeTab(`document:${documentType}:${documentId}`)}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Fermer l&apos;onglet
        </button>
      </div>
    );
  }

  const TypeIcon = TYPE_CONFIG[data.type].icon;
  const priorityConfig = PRIORITY_CONFIG[data.priority];
  const statusConfig = STATUS_CONFIG[data.status];
  const serviceConfig = SERVICE_CONFIG[data.sourceService];
  const budgetUsage = data.budgetAvailable ? Math.round((data.amount / data.budgetAvailable) * 100) : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
      {/* Main Panel */}
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <TypeIcon className={cn('w-4 h-4', TYPE_CONFIG[data.type].color)} />
                <span className="font-mono">{data.reference}</span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded', statusConfig.color)}>
                  {statusConfig.label}
                </span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded border', priorityConfig.color)}>
                  {priorityConfig.label}
                </span>
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs', serviceConfig.color)}>
                  {serviceConfig.label}
                </span>
              </div>
              <h1 className="mt-2 text-xl font-bold">{data.subject}</h1>
              {data.description && (
                <p className="mt-1 text-sm text-slate-400">{data.description}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Bouton Retour - Version simple sans Tooltip complexe */}
              <button 
                type="button"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer" 
                onClick={handleCloseTab}
                title="Fermer cet onglet"
                aria-label="Fermer l'onglet"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" 
                      onClick={load}
                      disabled={loading}
                      aria-label="Actualiser"
                    >
                      <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Actualiser le document</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 flex items-center gap-2 text-sm disabled:opacity-50 transition-colors"
                      onClick={() => setComplementOpen(true)}
                      disabled={!data || actionLoading}
                      aria-label="Demander un complément d'information"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Complément</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Demander un complément d&apos;information</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 flex items-center gap-2 text-sm disabled:opacity-50 transition-colors"
                      onClick={() => setAssignOpen(true)}
                      disabled={!data || actionLoading}
                      aria-label="Affecter à un employé"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Affecter</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Affecter à un employé</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                      disabled={!canAct || actionLoading}
                      onClick={() => setConfirmAction('validate')}
                      aria-label="Valider le document"
                    >
                      <Check className="w-4 h-4" />
                      Valider
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Approuver ce document</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                      disabled={!canAct || actionLoading}
                      onClick={() => setConfirmAction('reject')}
                      aria-label="Rejeter le document"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Rejeter ce document</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <DollarSign className="w-3 h-3" />
              Montant
            </div>
            <div className="font-semibold font-mono">{formatCurrency(data.amount)}</div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Clock className="w-3 h-3" />
              Délai
            </div>
            <div className={cn('font-semibold', data.isOverdue && 'text-rose-500')}>
              J+{data.delayDays} {data.isOverdue && <AlertTriangle className="w-3 h-3 inline" />}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Shield className="w-3 h-3" />
              Niveau validation
            </div>
            <div className="font-semibold">
              {data.currentLevel}/{data.validationLevels.length}
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Paperclip className="w-3 h-3" />
              Documents
            </div>
            <div className="font-semibold">
              {data.documents.filter(d => d.status === 'verified').length}/{data.documents.filter(d => d.required).length}
              <span className="text-xs text-slate-400 ml-1">vérifiés</span>
            </div>
          </div>
        </div>

        {/* Supplier */}
        {data.supplier && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Fournisseur
            </h3>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{data.supplier.name}</p>
                {data.supplier.siret && (
                  <p className="text-sm text-slate-400">SIRET : {data.supplier.siret}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  data.supplier.status === 'verified' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                  data.supplier.status === 'pending' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                  data.supplier.status === 'blocked' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {data.supplier.status === 'verified' ? '✓ Référencé' : data.supplier.status === 'blocked' ? '⚠ Bloqué' : '⏳ En attente'}
                </span>
                {data.supplier.rating && (
                  <span className="flex items-center gap-1 text-sm">
                    <span className="text-amber-400">★</span>
                    {data.supplier.rating}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3-Way Match */}
        {data.threeWayMatch && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 overflow-hidden">
            <button
              className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30"
              onClick={() => toggleSection('threeWay')}
            >
              <h3 className="font-semibold flex items-center gap-2">
                <Link className="w-4 h-4 text-purple-500" />
                Rapprochement 3 voies (3-Way Match)
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium ml-2',
                  data.threeWayMatch.overallMatch 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {data.threeWayMatch.overallMatch ? '✓ Conforme' : '✕ Écart détecté'}
                </span>
              </h3>
              {expandedSections.has('threeWay') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expandedSections.has('threeWay') && (
              <div className="px-5 pb-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* BC */}
                  <div className={cn(
                    'p-4 rounded-xl border',
                    data.threeWayMatch.amountMatch ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800/50'
                  )}>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Bon de commande
                    </div>
                    <p className="font-mono font-semibold">{formatCurrency(data.threeWayMatch.bcAmount)}</p>
                    <p className="text-sm text-slate-400 mt-1">{data.threeWayMatch.orderedQty} unités</p>
                  </div>
                  
                  {/* Arrows */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <ArrowRight className={cn('w-6 h-6', data.threeWayMatch.amountMatch ? 'text-emerald-500' : 'text-red-500')} />
                      <span className="text-xs text-slate-400">Tolérance : {data.threeWayMatch.tolerance}%</span>
                    </div>
                  </div>
                  
                  {/* Facture */}
                  <div className={cn(
                    'p-4 rounded-xl border',
                    data.threeWayMatch.amountMatch ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800/50'
                  )}>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Receipt className="w-4 h-4 text-emerald-500" />
                      Facture
                    </div>
                    <p className="font-mono font-semibold">{formatCurrency(data.threeWayMatch.invoiceAmount)}</p>
                    <p className="text-sm text-slate-400 mt-1">{data.threeWayMatch.deliveryQty} livrés</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-3 h-3 rounded-full', data.threeWayMatch.amountMatch ? 'bg-emerald-500' : 'bg-red-500')} />
                    <span className="text-sm">Montants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-3 h-3 rounded-full', data.threeWayMatch.qtyMatch ? 'bg-emerald-500' : 'bg-red-500')} />
                    <span className="text-sm">Quantités</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation Chain */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 overflow-hidden">
          <button
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30"
            onClick={() => toggleSection('validation')}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Chaîne de validation multi-niveaux
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {data.currentLevel}/{data.validationLevels.length}
              </span>
            </h3>
            {expandedSections.has('validation') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.has('validation') && (
            <div className="px-5 pb-5">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${(data.currentLevel / data.validationLevels.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {data.validationLevels.map((level, idx) => (
                  <div
                    key={level.level}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      level.status === 'approved' && 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20',
                      level.status === 'rejected' && 'border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20',
                      level.status === 'pending' && idx + 1 === data.currentLevel && 'border-blue-300 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20 ring-2 ring-blue-200 dark:ring-blue-800/50',
                      level.status === 'pending' && idx + 1 !== data.currentLevel && 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                        level.status === 'approved' && 'bg-emerald-500 text-white',
                        level.status === 'rejected' && 'bg-red-500 text-white',
                        level.status === 'pending' && idx + 1 === data.currentLevel && 'bg-blue-500 text-white',
                        level.status === 'pending' && idx + 1 !== data.currentLevel && 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                      )}>
                        {level.status === 'approved' ? <Check className="w-4 h-4" /> : level.status === 'rejected' ? <X className="w-4 h-4" /> : level.level}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-semibold">{level.name}</p>
                            <p className="text-sm text-slate-400">{level.role}</p>
                          </div>
                          {level.requiredAmount && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Seuil : {formatCurrency(level.requiredAmount)}
                            </span>
                          )}
                        </div>

                        {level.approvedBy && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            ✓ Validé par <strong>{level.approvedBy}</strong> le {formatDate(level.approvedAt || null)}
                          </p>
                        )}

                        {level.comments && (
                          <p className="text-sm text-slate-400 mt-1 italic">« {level.comments} »</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 overflow-hidden">
          <button
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30"
            onClick={() => toggleSection('documents')}
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-slate-400" />
              Pièces justificatives
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                {data.documents.length}
              </span>
            </h3>
            {expandedSections.has('documents') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.has('documents') && (
            <div className="px-5 pb-5">
              <ValidationBCDocumentPreview
                documents={data.documents}
                onVerify={handleDocumentVerify}
                onRequestDocument={handleRequestDocument}
              />
            </div>
          )}
        </div>

        {/* Budget */}
        {budgetUsage !== null && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              Budget
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full ml-2',
                budgetUsage > 100 ? 'bg-rose-500/20 text-rose-500' : budgetUsage > 80 ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
              )}>
                {budgetUsage}% du disponible
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-1">Montant demandé</div>
                <div className="font-semibold font-mono">{formatCurrency(data.amount)}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-1">Budget disponible</div>
                <div className="font-semibold font-mono">{formatCurrency(data.budgetAvailable)}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-1">Ligne budgétaire</div>
                <div className="font-mono text-sm">{data.budgetLine}</div>
              </div>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all',
                  budgetUsage > 100 ? 'bg-rose-500' : budgetUsage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(100, budgetUsage)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Source Agent */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Demandeur
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">{data.sourceAgent.name}</p>
              <p className="text-sm text-slate-400">{serviceConfig.label}</p>
            </div>
          </div>
          {data.sourceAgent.email && (
            <a href={`mailto:${data.sourceAgent.email}`} className="flex items-center gap-2 text-sm text-blue-500 hover:underline mb-2">
              <Mail className="w-4 h-4" />
              {data.sourceAgent.email}
            </a>
          )}
          {data.sourceAgent.phone && (
            <a href={`tel:${data.sourceAgent.phone}`} className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
              <Phone className="w-4 h-4" />
              {data.sourceAgent.phone}
            </a>
          )}
        </div>

        {/* Audit Trail */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 overflow-hidden">
          <div className="p-5 border-b border-slate-200/70 dark:border-slate-800">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="w-4 h-4" />
              Journal d&apos;audit
            </h3>
            <p className="text-xs text-slate-400 mt-1">{data.audit.length} événement{data.audit.length > 1 ? 's' : ''}</p>
          </div>

          <div className="max-h-[400px] overflow-auto p-5 space-y-3">
            {data.audit.map((e, idx) => {
              const Icon = ACTION_ICONS[e.type] ?? FileText;
              const isFirst = idx === 0;
              
              return (
                <div 
                  key={e.id}
                  className={cn(
                    'relative pl-6 pb-3',
                    idx < data.audit.length - 1 && 'border-l-2 border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className={cn(
                    'absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full',
                    isFirst ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                  )} />
                  
                  <div className="rounded-xl border border-slate-200/70 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium capitalize">{e.type.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(e.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-medium">{e.actorName}</span>
                      {e.message && <span className="text-slate-400"> — {e.message}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FluentModal
        open={complementOpen}
        title={`Demander un complément — ${data.reference}`}
        onClose={() => setComplementOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Précisez les informations ou documents manquants.
          </p>
          <textarea
            className="w-full min-h-[150px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="Ex: Veuillez fournir le devis détaillé..."
            value={complementText}
            onChange={(e) => setComplementText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button 
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" 
              onClick={() => { setComplementOpen(false); setComplementText(''); }}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={complementText.trim().length < 10 || actionLoading}
              onClick={async () => {
                await action('request_complement', { message: complementText });
                setComplementOpen(false);
                setComplementText('');
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      </FluentModal>

      <FluentModal
        open={assignOpen}
        title={`Affecter — ${data.reference}`}
        onClose={() => setAssignOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2 max-h-[300px] overflow-auto">
            {EMPLOYEES.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp.id)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border transition-colors',
                  selectedEmployee === emp.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-semibold">{emp.name}</div>
                    <div className="text-sm text-slate-400">{emp.role}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <textarea
            className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="Instructions..."
            value={assignNote}
            onChange={(e) => setAssignNote(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button 
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" 
              onClick={() => { setAssignOpen(false); setSelectedEmployee(''); setAssignNote(''); }}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={!selectedEmployee || actionLoading}
              onClick={async () => {
                const emp = EMPLOYEES.find(e => e.id === selectedEmployee);
                await action('assign', { employeeId: selectedEmployee, employeeName: emp?.name, note: assignNote });
                setAssignOpen(false);
                setSelectedEmployee('');
                setAssignNote('');
              }}
            >
              Affecter
            </button>
          </div>
        </div>
      </FluentModal>

      <FluentModal
        open={confirmAction !== null}
        title={confirmAction === 'validate' ? 'Confirmer la validation' : 'Confirmer le rejet'}
        onClose={() => { setConfirmAction(null); setRejectReason(''); }}
      >
        <div className="space-y-4">
          {confirmAction === 'validate' ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">Validation du document</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-300">Cette action est définitive.</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-rose-500" />
                  <div>
                    <p className="font-semibold text-rose-700 dark:text-rose-400">Rejet du document</p>
                    <p className="text-sm text-rose-600 dark:text-rose-300">Un motif doit être fourni.</p>
                  </div>
                </div>
              </div>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 outline-none focus:ring-2 focus:ring-rose-500/30"
                placeholder="Motif du rejet..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button 
              className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" 
              onClick={() => { setConfirmAction(null); setRejectReason(''); }}
            >
              Annuler
            </button>
            <button
              className={cn(
                'px-4 py-2 rounded-xl text-white disabled:opacity-50',
                confirmAction === 'validate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              )}
              disabled={actionLoading || (confirmAction === 'reject' && rejectReason.trim().length < 10)}
              onClick={async () => {
                if (confirmAction === 'validate') {
                  await action('validate');
                } else {
                  await action('reject', { reason: rejectReason });
                }
                setConfirmAction(null);
                setRejectReason('');
              }}
            >
              {confirmAction === 'validate' ? 'Confirmer' : 'Rejeter'}
            </button>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

