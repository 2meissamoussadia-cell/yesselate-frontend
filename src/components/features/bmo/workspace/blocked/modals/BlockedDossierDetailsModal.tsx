/**
 * ====================================================================
 * MODAL : Détails Dossier Bloqué - Version Enrichie
 * 7 onglets ultra-détaillés avec business logic avancée
 * ====================================================================
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useBlockedCommandCenterStore } from '@/lib/stores/blockedCommandCenterStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  DollarSign,
  User,
  Users,
  CheckCircle,
  XCircle,
  Timer,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  GitBranch,
  MessageSquare,
  Paperclip,
  Download,
  Eye,
  ExternalLink,
  ChevronRight,
  Upload,
  History,
  Target,
  Activity,
  Sparkles,
  ArrowRight,
  Scale,
  Ban,
  RefreshCw,
  Send,
  Plus,
  Info,
  Loader2,
} from 'lucide-react';
import type { BlockedDossier } from '@/lib/types/bmo.types';
import { blockedApi } from '@/lib/services/blockedApiService';

interface BlockedDossierDetailsModalProps {
  open: boolean;
  onClose: () => void;
  dossierId: string;
}

type SlaEnriched = { deadline: string; remaining: number; status: 'critical' | 'warning' | 'expired' | 'ok'; alerts: Array<{ level: string; message: string }> };

function isSlaObject(sla: BlockedDossier['sla'] | SlaEnriched | undefined): sla is SlaEnriched {
  return typeof sla === 'object' && sla !== null && 'status' in sla && 'remaining' in sla;
}

interface EnrichedDossier extends Omit<BlockedDossier, 'impact' | 'sla'> {
  reference?: string;
  status?: string;
  sla?: BlockedDossier['sla'] | SlaEnriched;
  impact?: BlockedDossier['impact'] | {
    financial: { amount: number; currency: string; description: string };
    operational: { score: number; description: string; affected: string[] };
    reputational: { score: number; description: string; stakeholders: string[] };
  };
  workflow?: {
    currentStep: number;
    totalSteps: number;
    steps: Array<{
      id: string;
      name: string;
      status: 'completed' | 'current' | 'pending';
      responsable: string;
      date?: string;
      duration?: number;
    }>;
  };
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
    url: string;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    role: string;
    content: string;
    createdAt: string;
    attachments?: Array<{ name: string; url: string }>;
    mentions?: string[];
  }>;
  timeline?: Array<{
    id: string;
    type: 'status' | 'comment' | 'escalation' | 'document' | 'resolution' | 'assignment';
    title: string;
    description: string;
    actor: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  actions?: {
    suggested: Array<{
      id: string;
      type: 'resolution' | 'escalation' | 'substitution' | 'arbitration';
      title: string;
      description: string;
      confidence: number;
      impact: 'low' | 'medium' | 'high';
      effort: 'low' | 'medium' | 'high';
    }>;
  };
  parties?: {
    responsable: { id: string; name: string; role: string; bureau: string };
    validateurs: Array<{ id: string; name: string; role: string }>;
    observateurs: Array<{ id: string; name: string; role: string }>;
  };
}

export function BlockedDossierDetailsModal({
  open,
  onClose,
  dossierId,
}: BlockedDossierDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [dossier, setDossier] = useState<EnrichedDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [documentCategory, setDocumentCategory] = useState<'bc' | 'facture' | 'contrat' | 'justificatif' | 'rib' | 'autre'>('autre');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ url: string; type: string } | null>(null);

  // Charger dossier enrichi
  useEffect(() => {
    if (!open || !dossierId) return;

    setLoading(true);
    // TODO: Remplacer par API /api/bmo/blocked/[id]/full
    blockedApi.getById(dossierId).then((baseDossier) => {
      if (!baseDossier) {
        setLoading(false);
        setDossier(null);
        return;
      }
      // Mock enrichissement
      const enriched: EnrichedDossier = {
        ...baseDossier,
        id: baseDossier.id ?? dossierId,
        workflow: {
          currentStep: 2,
          totalSteps: 4,
          steps: [
            {
              id: '1',
              name: 'Détection',
              status: 'completed',
              responsable: 'Système',
              date: '2026-01-08T10:00:00',
              duration: 0,
            },
            {
              id: '2',
              name: 'Analyse',
              status: 'current',
              responsable: 'Chef Service - Dakar',
              date: '2026-01-08T14:00:00',
              duration: 48,
            },
            {
              id: '3',
              name: 'Résolution',
              status: 'pending',
              responsable: 'À assigner',
            },
            {
              id: '4',
              name: 'Validation',
              status: 'pending',
              responsable: 'DAF / BMO',
            },
          ],
        },
        impact: {
          financial: {
            amount: 15000000,
            currency: 'FCFA',
            description: 'Retard paiement fournisseur + pénalités contractuelles',
          },
          operational: {
            score: 85,
            description: 'Blocage workflow validation BC, 12 dossiers en attente',
            affected: ['Validation BC', 'Gestion Fournisseurs', 'Comptabilité'],
          },
          reputational: {
            score: 70,
            description: 'Risque contentieux fournisseur SENELEC',
            stakeholders: ['SENELEC', 'DAF', 'Direction Générale'],
          },
        },
        documents: [
          {
            id: 'doc1',
            name: 'BC_2024_12345.pdf',
            type: 'application/pdf',
            size: 2456789,
            uploadedBy: 'Jean DIOP',
            uploadedAt: '2026-01-08T10:15:00',
            url: '/documents/bc_2024_12345.pdf',
          },
          {
            id: 'doc2',
            name: 'Facture_SENELEC.pdf',
            type: 'application/pdf',
            size: 1234567,
            uploadedBy: 'Marie FALL',
            uploadedAt: '2026-01-08T11:30:00',
            url: '/documents/facture_senelec.pdf',
          },
          {
            id: 'doc3',
            name: 'Contrat_Cadre.pdf',
            type: 'application/pdf',
            size: 5678901,
            uploadedBy: 'Système',
            uploadedAt: '2026-01-08T10:00:00',
            url: '/documents/contrat_cadre.pdf',
          },
        ],
        comments: [
          {
            id: 'c1',
            author: 'Jean DIOP',
            role: 'Chef Service Dakar',
            content: 'Blocage identifié : signature manquante du validateur @MarieFALL. Fournisseur SENELEC exige règlement urgent sous 48h.',
            createdAt: '2026-01-08T14:30:00',
            mentions: ['MarieFALL'],
          },
          {
            id: 'c2',
            author: 'Marie FALL',
            role: 'DAF',
            content: 'Validateur absent (congé maladie). Demande substitution ou escalade BMO pour déblocage urgent.',
            createdAt: '2026-01-09T09:15:00',
            attachments: [{ name: 'justificatif_absence.pdf', url: '/docs/justificatif.pdf' }],
          },
        ],
        timeline: [
          {
            id: 't1',
            type: 'status',
            title: 'Dossier détecté comme bloqué',
            description: 'Détection automatique via système SLA',
            actor: 'Système',
            timestamp: '2026-01-08T10:00:00',
          },
          {
            id: 't2',
            type: 'assignment',
            title: 'Assigné à Jean DIOP',
            description: 'Responsable: Chef Service Dakar',
            actor: 'Système',
            timestamp: '2026-01-08T10:05:00',
          },
          {
            id: 't3',
            type: 'comment',
            title: 'Commentaire ajouté',
            description: 'Blocage identifié : signature manquante',
            actor: 'Jean DIOP',
            timestamp: '2026-01-08T14:30:00',
          },
          {
            id: 't4',
            type: 'escalation',
            title: 'Escaladé vers DAF',
            description: 'Demande arbitrage pour substitution validateur',
            actor: 'Jean DIOP',
            timestamp: '2026-01-09T08:00:00',
          },
        ],
        actions: {
          suggested: [
            {
              id: 'a1',
              type: 'substitution',
              title: 'Substitution validateur',
              description: 'Remplacer validateur absent par suppléant disponible',
              confidence: 0.92,
              impact: 'high',
              effort: 'low',
            },
            {
              id: 'a2',
              type: 'escalation',
              title: 'Escalade DG',
              description: 'Escalader vers Direction Générale pour décision rapide',
              confidence: 0.78,
              impact: 'high',
              effort: 'medium',
            },
            {
              id: 'a3',
              type: 'arbitration',
              title: 'Arbitrage BMO',
              description: 'Décision BMO pour déblocage immédiat (pouvoir suprême)',
              confidence: 0.85,
              impact: 'high',
              effort: 'low',
            },
          ],
        },
        parties: {
          responsable: {
            id: 'u1',
            name: 'Jean DIOP',
            role: 'Chef Service',
            bureau: 'Dakar',
          },
          validateurs: [
            { id: 'u2', name: 'Marie FALL', role: 'DAF' },
            { id: 'u3', name: 'Amadou SECK', role: 'BMO' },
          ],
          observateurs: [
            { id: 'u4', name: 'Fatou NDIAYE', role: 'Comptable' },
            { id: 'u5', name: 'Ibrahima BA', role: 'Contrôleur' },
          ],
        },
        sla: {
          deadline: '2026-01-10T17:00:00',
          remaining: 8,
          status: 'critical',
          alerts: [
            {
              level: 'critical',
              message: 'SLA critique : 8h restantes avant échéance',
            },
            {
              level: 'warning',
              message: 'Impact financier élevé (15M FCFA)',
            },
          ],
        },
      };

      setDossier(enriched);
      setLoading(false);
    });
  }, [open, dossierId]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !dossier) return;

    setSendingComment(true);
    try {
      // TODO: API POST /api/bmo/blocked/[id]/comment
      await blockedApi.addComment({ dossierId: dossier.id, content: newComment, visibility: 'internal' });
      setNewComment('');
      // Recharger dossier
    } finally {
      setSendingComment(false);
    }
  };

  const handleUploadDocument = async (files: FileList | null) => {
    if (!files || files.length === 0 || !dossier) return;

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('category', documentCategory);
      
      // TODO: API POST /api/bmo/blocked/[id]/documents/upload
      // await blockedApi.uploadDocuments(dossier.id, formData);
      
      // Mock: Simuler upload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Recharger documents
      // await refreshDossier();
    } catch (error) {
      logger.error('Upload error', error as Error, { context: 'BlockedDossierDetailsModal' });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handlePreviewDocument = (doc: { url: string; type: string; name: string }) => {
    setPreviewDocument({ url: doc.url, type: doc.type });
  };

  const handleDownloadDocument = async (docUrl: string, docName: string) => {
    try {
      // TODO: API GET /api/bmo/blocked/documents/[id]/download
      const response = await fetch(docUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Download error', error as Error, { context: 'BlockedDossierDetailsModal' });
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-400';
      case 'escalated':
        return 'bg-orange-500/10 text-orange-400';
      case 'resolved':
        return 'bg-green-500/10 text-green-400';
      case 'substituted':
        return 'bg-blue-500/10 text-blue-400';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  const getSLAColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-orange-400';
      case 'expired':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!dossier) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl text-white flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-400" />
                Dossier Bloqué - {dossier.reference ?? dossier.id}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(dossier.status ?? 'pending')}>
                  {dossier.status ?? 'pending'}
                </Badge>
                <Badge className={getImpactColor(typeof dossier.impact === 'object' && dossier.impact && 'financial' in dossier.impact ? 'high' : (typeof dossier.impact === 'string' ? dossier.impact : 'medium'))}>
                  Impact: {typeof dossier.impact === 'object' && dossier.impact && 'financial' in dossier.impact ? 'High' : (typeof dossier.impact === 'string' ? dossier.impact : 'Medium')}
                </Badge>
                {isSlaObject(dossier.sla) && (
                  <Badge variant="outline" className={cn('border', getSLAColor(dossier.sla.status))}>
                    <Clock className="h-3 w-3 mr-1" />
                    SLA: {dossier.sla.remaining}h restantes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-7 bg-slate-800/50">
            <TabsTrigger value="details" className="text-xs">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="workflow" className="text-xs">
              <GitBranch className="h-3.5 w-3.5 mr-1.5" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs">
              <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
              Impact
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              <Paperclip className="h-3.5 w-3.5 mr-1.5" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Commentaires
            </TabsTrigger>
            <TabsTrigger value="historique" className="text-xs">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Actions
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[calc(90vh-220px)] overflow-y-auto">
            {/* ONGLET 1: DÉTAILS */}
            <TabsContent value="details" className="space-y-6 m-0">
              {/* Alertes SLA */}
              {isSlaObject(dossier.sla) && dossier.sla.alerts.length > 0 && (
                <div className="space-y-2">
                  {dossier.sla.alerts.map((alert: { level: string; message: string }, idx: number) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        alert.level === 'critical'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      )}
                    >
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Informations Générales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Référence</label>
                    <div className="text-white font-medium">{dossier.reference ?? dossier.id}</div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Type de Blocage</label>
                    <div className="flex items-center gap-2 text-white">
                      <Ban className="h-4 w-4 text-red-400" />
                      {dossier.type || 'Validation manquante'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Bureau</label>
                    <div className="flex items-center gap-2 text-white">
                      <Building2 className="h-4 w-4 text-blue-400" />
                      {dossier.bureau}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Délai de Blocage</label>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-orange-400" />
                      <span className="text-white font-medium">{dossier.delay} jours</span>
                      <span className="text-sm text-slate-400">
                        (depuis {new Date(dossier.blockedSince).toLocaleDateString('fr-FR')})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Statut</label>
                    <Badge className={cn(getStatusColor(dossier.status ?? 'pending'), 'text-sm px-3 py-1')}>
                      {dossier.status ?? 'pending'}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Niveau d'Impact</label>
                    <Badge className={cn(getImpactColor('high'), 'text-sm px-3 py-1')}>
                      {typeof dossier.impact === 'string' ? dossier.impact.charAt(0).toUpperCase() + dossier.impact.slice(1) : 'High'}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Responsable</label>
                    {dossier.parties && (
                      <div className="flex items-center gap-2 text-white">
                        <User className="h-4 w-4 text-purple-400" />
                        <div>
                          <div className="font-medium">{dossier.parties.responsable.name}</div>
                          <div className="text-xs text-slate-400">{dossier.parties.responsable.role}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {dossier.sla && (
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Échéance SLA</label>
                      <div className="flex items-center gap-2">
                        <Clock className={cn('h-4 w-4', isSlaObject(dossier.sla) ? getSLAColor(dossier.sla.status) : '')} />
                        <span className="text-white font-medium">
                          {isSlaObject(dossier.sla) ? new Date(dossier.sla.deadline).toLocaleString('fr-FR') : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-800" />

              {/* Description */}
              <div>
                <label className="text-sm text-slate-400 block mb-2">Description du Blocage</label>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                  {dossier.reason || 'Aucune description disponible'}
                </div>
              </div>

              {/* Parties Prenantes */}
              {dossier.parties && (
                <div>
                  <label className="text-sm text-slate-400 block mb-3">Parties Prenantes</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <User className="h-3.5 w-3.5" />
                        Responsable
                      </div>
                      <div className="text-white font-medium">
                        {dossier.parties.responsable.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {dossier.parties.responsable.role}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Shield className="h-3.5 w-3.5" />
                        Validateurs ({dossier.parties.validateurs.length})
                      </div>
                      {dossier.parties.validateurs.map((v, idx) => (
                        <div key={idx} className="text-sm text-white mb-1">
                          {v.name}
                          <span className="text-xs text-slate-400 ml-1">({v.role})</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Eye className="h-3.5 w-3.5" />
                        Observateurs ({dossier.parties.observateurs.length})
                      </div>
                      {dossier.parties.observateurs.map((o, idx) => (
                        <div key={idx} className="text-sm text-white mb-1">
                          {o.name}
                          <span className="text-xs text-slate-400 ml-1">({o.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ONGLET 2: WORKFLOW */}
            <TabsContent value="workflow" className="space-y-6 m-0">
              {dossier.workflow && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Circuit de Résolution</h3>
                      <p className="text-sm text-slate-400">
                        Étape {dossier.workflow.currentStep} sur {dossier.workflow.totalSteps}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Progression</div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(
                          (dossier.workflow.currentStep / dossier.workflow.totalSteps) * 100
                        )}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dossier.workflow.steps.map((step, idx) => (
                      <div
                        key={step.id}
                        className={cn(
                          'relative border rounded-lg p-4 transition-all',
                          step.status === 'completed'
                            ? 'bg-green-500/5 border-green-500/30'
                            : step.status === 'current'
                            ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/20'
                            : 'bg-slate-800/30 border-slate-700'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold',
                              step.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : step.status === 'current'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-slate-700 text-slate-400'
                            )}
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : step.status === 'current' ? (
                              <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{step.name}</h4>
                              {step.status === 'completed' && (
                                <Badge variant="outline" className="text-green-400 border-green-500/30">
                                  Terminé
                                </Badge>
                              )}
                              {step.status === 'current' && (
                                <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                                  En cours
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">Responsable:</span>
                                <span className="text-white ml-2">{step.responsable}</span>
                              </div>
                              {step.date && (
                                <div>
                                  <span className="text-slate-400">Date:</span>
                                  <span className="text-white ml-2">
                                    {new Date(step.date).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              )}
                              {step.duration !== undefined && (
                                <div>
                                  <span className="text-slate-400">Durée:</span>
                                  <span className="text-white ml-2">{step.duration}h</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Connector line */}
                        {dossier.workflow && idx < dossier.workflow.steps.length - 1 && (
                          <div
                            className={cn(
                              'absolute left-9 top-full h-3 w-0.5 -translate-x-1/2',
                              step.status === 'completed'
                                ? 'bg-green-500/30'
                                : 'bg-slate-700'
                            )}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* ONGLET 3: IMPACT */}
            <TabsContent value="impact" className="space-y-6 m-0">
              {typeof dossier.impact === 'object' && dossier.impact && 'financial' in dossier.impact && (
                <>
                  {/* Impact Financier */}
                  <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500/20 p-3 rounded-lg">
                          <DollarSign className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Impact Financier</h3>
                          <p className="text-sm text-slate-400">Pertes estimées</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-red-400">
                          {(dossier.impact.financial.amount / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-slate-400">{dossier.impact.financial.currency}</div>
                      </div>
                    </div>
                    <p className="text-slate-300">{dossier.impact.financial.description}</p>
                  </div>

                  {/* Impact Opérationnel */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500/20 p-3 rounded-lg">
                          <Activity className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Impact Opérationnel</h3>
                          <p className="text-sm text-slate-400">Processus affectés</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-orange-400">
                          {dossier.impact.operational.score}/100
                        </div>
                        <div className="text-sm text-slate-400">Score d'impact</div>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">{dossier.impact.operational.description}</p>
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Services affectés:</div>
                      <div className="flex flex-wrap gap-2">
                        {dossier.impact.operational.affected.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-orange-400 border-orange-500/30">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Impact Réputationnel */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-500/20 p-3 rounded-lg">
                          <TrendingDown className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Impact Réputationnel</h3>
                          <p className="text-sm text-slate-400">Risque image</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400">
                          {dossier.impact.reputational.score}/100
                        </div>
                        <div className="text-sm text-slate-400">Score de risque</div>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">{dossier.impact.reputational.description}</p>
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Parties prenantes concernées:</div>
                      <div className="flex flex-wrap gap-2">
                        {dossier.impact.reputational.stakeholders.map((stakeholder, idx) => (
                          <Badge key={idx} variant="outline" className="text-purple-400 border-purple-500/30">
                            {stakeholder}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ONGLET 4: DOCUMENTS */}
            <TabsContent value="documents" className="space-y-4 m-0">
              {/* Upload Zone */}
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Ajouter un document</h3>
                    <p className="text-xs text-slate-400">Glissez-déposez ou cliquez pour parcourir</p>
                  </div>
                  <Select
                    value={documentCategory}
                    onValueChange={(value: typeof documentCategory) => setDocumentCategory(value)}
                  >
                    <SelectTrigger className="w-[150px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bc">BC (Bon de Commande)</SelectItem>
                      <SelectItem value="facture">Facture</SelectItem>
                      <SelectItem value="contrat">Contrat</SelectItem>
                      <SelectItem value="justificatif">Justificatif</SelectItem>
                      <SelectItem value="rib">RIB</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => handleUploadDocument(e.target.files)}
                  className="hidden"
                />
                <label
                  htmlFor="document-upload"
                  className="flex flex-col items-center justify-center p-4 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  {uploadingDocument ? (
                    <>
                      <Loader2 className="h-8 w-8 text-blue-400 animate-spin mb-2" />
                      <span className="text-sm text-slate-400">Téléchargement...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-400">
                        Cliquez pour sélectionner ou glissez-déposez
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        PDF, DOC, XLS, JPG, PNG (max 10MB)
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Liste Documents */}
              {dossier.documents && dossier.documents.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-400">
                      {dossier.documents.length} document(s)
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        BC: {dossier.documents.filter(d => d.type.includes('bc')).length}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Factures: {dossier.documents.filter(d => d.type.includes('facture')).length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dossier.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="bg-blue-500/20 p-2 rounded">
                            <FileText className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{doc.name}</div>
                            <div className="text-sm text-slate-400 flex items-center gap-3">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>•</span>
                              <span>Ajouté par {doc.uploadedBy}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(doc.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewDocument({ url: doc.url, type: doc.type, name: doc.name });
                            }}
                            title="Aperçu"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.url, doc.name)}
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun document attaché</p>
                </div>
              )}
            </TabsContent>

            {/* ONGLET 5: COMMENTAIRES */}
            <TabsContent value="comments" className="space-y-4 m-0">
              {/* Nouveau commentaire */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire... (utilisez @ pour mentionner)"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Joindre fichier
                  </Button>
                  <Button
                    onClick={handleSendComment}
                    disabled={!newComment.trim() || sendingComment}
                    size="sm"
                  >
                    {sendingComment ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Envoyer
                  </Button>
                </div>
              </div>

              {/* Liste commentaires */}
              {dossier.comments && dossier.comments.length > 0 ? (
                <div className="space-y-3">
                  {dossier.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-500/20 h-10 w-10 rounded-full flex items-center justify-center text-purple-400 font-medium">
                            {comment.author.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-white">{comment.author}</div>
                            <div className="text-xs text-slate-400">{comment.role}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatRelativeTime(comment.createdAt)}
                        </div>
                      </div>

                      <p className="text-slate-300 mb-2">{comment.content}</p>

                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {comment.attachments.map((att, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              <span>{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {comment.mentions && comment.mentions.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          {comment.mentions.map((mention, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              @{mention}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun commentaire</p>
                </div>
              )}
            </TabsContent>

            {/* ONGLET 6: HISTORIQUE */}
            <TabsContent value="historique" className="space-y-3 m-0">
              {dossier.timeline && dossier.timeline.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />

                  <div className="space-y-4">
                    {dossier.timeline.map((event, idx) => {
                      const getEventIcon = () => {
                        switch (event.type) {
                          case 'status':
                            return <Activity className="h-4 w-4" />;
                          case 'comment':
                            return <MessageSquare className="h-4 w-4" />;
                          case 'escalation':
                            return <TrendingUp className="h-4 w-4" />;
                          case 'document':
                            return <FileText className="h-4 w-4" />;
                          case 'resolution':
                            return <CheckCircle className="h-4 w-4" />;
                          case 'assignment':
                            return <User className="h-4 w-4" />;
                          default:
                            return <Activity className="h-4 w-4" />;
                        }
                      };

                      const getEventColor = () => {
                        switch (event.type) {
                          case 'resolution':
                            return 'bg-green-500/20 text-green-400';
                          case 'escalation':
                            return 'bg-orange-500/20 text-orange-400';
                          case 'comment':
                            return 'bg-blue-500/20 text-blue-400';
                          default:
                            return 'bg-slate-600 text-slate-400';
                        }
                      };

                      return (
                        <div key={event.id} className="relative pl-12">
                          {/* Icon */}
                          <div
                            className={cn(
                              'absolute left-0 h-8 w-8 rounded-full flex items-center justify-center',
                              getEventColor()
                            )}
                          >
                            {getEventIcon()}
                          </div>

                          {/* Content */}
                          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-white">{event.title}</h4>
                              <span className="text-xs text-slate-400">
                                {formatRelativeTime(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-1">{event.description}</p>
                            <div className="text-xs text-slate-400">Par {event.actor}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun historique disponible</p>
                </div>
              )}
            </TabsContent>

            {/* ONGLET 7: ACTIONS */}
            <TabsContent value="actions" className="space-y-4 m-0">
              <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Actions Suggérées (IA)</h3>
                    <p className="text-sm text-slate-400">
                      Recommandations basées sur l'analyse du dossier
                    </p>
                  </div>
                </div>
              </div>

              {dossier.actions && dossier.actions.suggested.length > 0 ? (
                <div className="space-y-3">
                  {dossier.actions.suggested.map((action) => (
                    <div
                      key={action.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{action.title}</h4>
                            <Badge
                              variant="outline"
                              className="text-green-400 border-green-500/30"
                            >
                              {Math.round(action.confidence * 100)}% confiance
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">{action.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                            <span className="text-slate-400">Impact:</span>
                            <span className="text-white capitalize">{action.impact}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-slate-400">Effort:</span>
                            <span className="text-white capitalize">{action.effort}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            setTimeout(() => {
                              const { openModal } = useBlockedCommandCenterStore.getState();
                              openModal('resolution-advanced', {
                                dossier,
                                preselectedType: action.type,
                              });
                            }, 300);
                          }}
                        >
                          Appliquer
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucune action suggérée pour le moment</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={async () => {
              // TODO: Toggle watchlist
              try {
                // await blockedApi.toggleWatchlist(dossier.id);
                // showToast('success', 'Ajouté à la liste de suivi');
              } catch (error) {
                logger.error('Watchlist error', error as Error, { context: 'BlockedDossierDetailsModal' });
              }
            }}>
              <Eye className="h-4 w-4 mr-2" />
              Suivre
            </Button>
            <Button variant="outline" onClick={async () => {
              // TODO: Export PDF/Excel
              try {
                // const pdf = await blockedApi.exportDossierPDF(dossier.id);
                // downloadFile(pdf, `dossier-${dossier.reference}.pdf`);
                // showToast('success', 'Export généré');
              } catch (error) {
                logger.error('Export error', error as Error, { context: 'BlockedDossierDetailsModal' });
              }
            }}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button
              onClick={() => {
                onClose();
                // Ouvrir modal résolution après fermeture
                setTimeout(() => {
                  const { openModal } = useBlockedCommandCenterStore.getState();
                  openModal('resolution-advanced', { dossier });
                }, 300);
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Résoudre
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Modal Preview Document */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Aperçu Document</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {previewDocument.type.startsWith('image/') ? (
                <img
                  src={previewDocument.url}
                  alt="Preview"
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg"
                />
              ) : previewDocument.type === 'application/pdf' ? (
                <iframe
                  src={previewDocument.url}
                  className="w-full h-[70vh] rounded-lg border border-slate-700"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aperçu non disponible pour ce type de fichier</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(previewDocument.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir dans un nouvel onglet
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

