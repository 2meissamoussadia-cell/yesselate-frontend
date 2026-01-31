/**
 * Modal Détails Complet d'un Paiement - Validation Paiements
 * Vue 360° avec toutes les informations métier
 * Inspiré de ValidationBC DocumentDetailsModal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Printer,
  Clock,
  User,
  Building2,
  Calendar,
  Paperclip,
  MessageSquare,
  History,
  Eye,
  Ban,
  FileText,
  CreditCard,
  TrendingUp,
  Shield,
  Info,
} from 'lucide-react';

import type { Paiement } from '@/lib/services/paiementsApiService';

// ================================
// Types
// ================================
interface PaiementDetailsModalProps {
  paiement: Paiement | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate?: () => void;
  onReject?: () => void;
  onRequestInfo?: () => void;
  onSchedule?: () => void;
}

interface FullPaiementDetails extends Paiement {
  fournisseurDetails?: {
    nom: string;
    rib: string;
    iban?: string;
    bic?: string;
    adresse: string;
    telephone: string;
    email: string;
    historiquePayments: number;
    montantTotal: number;
    fiabilite: string;
    dernierPaiement: string;
  };
  documentSource?: {
    type: 'bc' | 'facture' | 'contrat';
    id: string;
    montant: number;
    date: string;
  };
  workflow?: {
    etapes: Array<{
      niveau: number;
      nom: string;
      validateur: string;
      statut: 'pending' | 'validated' | 'rejected' | 'waiting';
      date?: string;
      commentaire?: string;
    }>;
    niveauActuel: number;
  };
  timeline?: Array<{
    id: string;
    type: 'created' | 'modified' | 'validated' | 'rejected' | 'scheduled' | 'executed' | 'comment';
    action: string;
    actorName: string;
    actorRole: string;
    timestamp: string;
    details?: string;
  }>;
  commentaires?: Array<{
    id: string;
    author: string;
    role: string;
    content: string;
    timestamp: string;
    private: boolean;
  }>;
  documents?: Array<{
    id: string;
    nom: string;
    type: string;
    taille: number;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  controles?: {
    budgetDisponible: boolean;
    ribValide: boolean;
    documentSource: boolean;
    montantCoherent: boolean;
    dateValide: boolean;
    approbationRequise: boolean;
  };
  tresorerie?: {
    soldeActuel: number;
    soldePrevisionnel: number;
    impact: number;
    alerteSeuil: boolean;
  };
}

// ================================
// Component
// ================================
export function PaiementDetailsModal({
  paiement,
  isOpen,
  onClose,
  onValidate,
  onReject,
  onRequestInfo,
  onSchedule,
}: PaiementDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullDetails, setFullDetails] = useState<FullPaiementDetails | null>(null);

  useEffect(() => {
    if (isOpen && paiement) {
      loadFullDetails(paiement.id);
    }
  }, [isOpen, paiement]);

  const loadFullDetails = async (paiementId: string) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Remplacer par vraie API /paiements/[id]/full
      // const response = await fetch(`/api/paiements/${paiementId}/full`);
      // const data = await response.json();
      
      // Mock data enrichies
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockFullDetails: FullPaiementDetails = {
        ...paiement!,
        fournisseurDetails: {
          nom: typeof paiement!.fournisseur === 'object' && paiement!.fournisseur && 'name' in paiement!.fournisseur
            ? (paiement!.fournisseur as { name: string }).name
            : String(paiement!.fournisseur ?? ''),
          rib: 'SN08 SN01 0000 0000 1234 5678 90',
          iban: 'SN08SN010000000012345678',
          bic: 'CBAOSNDA',
          adresse: 'Avenue Bourguiba, Dakar',
          telephone: '+221 33 889 12 34',
          email: 'contact@fournisseur.sn',
          historiquePayments: 45,
          montantTotal: 250000000,
          fiabilite: 'Excellent',
          dernierPaiement: '2024-12-20',
        },
        documentSource: {
          type: 'bc',
          id: 'BC-2024-001',
          montant: paiement!.montant,
          date: '2024-01-10',
        },
        workflow: {
          etapes: [
            {
              niveau: 1,
              nom: 'Chef Service Finance',
              validateur: 'M. KANE',
              statut: 'validated',
              date: '2024-01-11T10:30:00Z',
              commentaire: 'Conforme, pièces jointes validées',
            },
            {
              niveau: 2,
              nom: 'Directeur Financier',
              validateur: 'A. DIALLO',
              statut: 'pending',
            },
            {
              niveau: 3,
              nom: 'Directeur Général',
              validateur: 'B. SOW',
              statut: 'waiting',
            },
          ],
          niveauActuel: 2,
        },
        timeline: [
          {
            id: 'tl-1',
            type: 'created',
            action: 'Paiement créé',
            actorName: 'Système',
            actorRole: 'Auto',
            timestamp: '2024-01-10T14:00:00Z',
            details: 'Création automatique depuis BC-2024-001',
          },
          {
            id: 'tl-2',
            type: 'validated',
            action: 'Validé niveau 1',
            actorName: 'M. KANE',
            actorRole: 'Chef Service Finance',
            timestamp: '2024-01-11T10:30:00Z',
            details: 'Conforme, pièces jointes validées',
          },
          {
            id: 'tl-3',
            type: 'comment',
            action: 'Commentaire ajouté',
            actorName: 'M. KANE',
            actorRole: 'Chef Service Finance',
            timestamp: '2024-01-11T10:35:00Z',
            details: 'Vérifier le RIB avec le fournisseur',
          },
        ],
        commentaires: [
          {
            id: 'com-1',
            author: 'M. KANE',
            role: 'Chef Service Finance',
            content: 'Vérifier le RIB avec le fournisseur avant exécution',
            timestamp: '2024-01-11T10:35:00Z',
            private: false,
          },
        ],
        documents: [
          {
            id: 'doc-1',
            nom: 'BC-2024-001.pdf',
            type: 'application/pdf',
            taille: 245000,
            url: '/documents/bc-2024-001.pdf',
            uploadedBy: 'Système',
            uploadedAt: '2024-01-10T14:00:00Z',
          },
          {
            id: 'doc-2',
            nom: 'RIB_Fournisseur.pdf',
            type: 'application/pdf',
            taille: 125000,
            url: '/documents/rib.pdf',
            uploadedBy: 'M. KANE',
            uploadedAt: '2024-01-11T10:00:00Z',
          },
        ],
        controles: {
          budgetDisponible: true,
          ribValide: true,
          documentSource: true,
          montantCoherent: true,
          dateValide: true,
          approbationRequise: true,
        },
        tresorerie: {
          soldeActuel: 450000000,
          soldePrevisionnel: 440000000,
          impact: -10000000,
          alerteSeuil: false,
        },
      };

      setFullDetails(mockFullDetails);
    } catch (err) {
      console.error('Error loading full details:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">En attente</Badge>,
      validated: <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Validé</Badge>,
      rejected: <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeté</Badge>,
      scheduled: <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Planifié</Badge>,
      executed: <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Exécuté</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      critical: <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">Critique</Badge>,
      high: <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Haute</Badge>,
      medium: <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Moyenne</Badge>,
      low: <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Basse</Badge>,
    };
    return badges[priority as keyof typeof badges] || <Badge>{priority}</Badge>;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700 text-slate-50">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-700/50">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-emerald-400" />
            {fullDetails ? `Détails du paiement: ${fullDetails.reference}` : 'Chargement...'}
          </DialogTitle>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-50">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="animate-spin h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-red-400">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
            <Button onClick={() => loadFullDetails(paiement!.id)} className="mt-4">
              Réessayer
            </Button>
          </div>
        ) : fullDetails ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-6 w-full bg-slate-800">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="comments">Commentaires</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="tresorerie">Trésorerie</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="details" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations Générales */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Informations Générales
                        </h3>
                        <Separator className="bg-slate-700" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Référence</span>
                            <span className="font-medium text-slate-200">{fullDetails.reference}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Statut</span>
                            {getStatusBadge(fullDetails.status)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Priorité</span>
                            {getPriorityBadge(fullDetails.urgency)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Bureau</span>
                            <span className="text-slate-300">{fullDetails.bureau}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date d'échéance</span>
                            <span className="text-slate-300">
                              {fullDetails.dateEcheance ? new Date(fullDetails.dateEcheance).toLocaleDateString('fr-FR') : '-'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Montant */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Montant
                        </h3>
                        <Separator className="bg-slate-700" />
                        <div className="text-center py-4">
                          <div className="text-3xl font-bold text-emerald-400">
                            {formatCurrency(fullDetails.montant)}
                          </div>
                          <div className="text-sm text-slate-400 mt-1">Montant TTC</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fournisseur */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Fournisseur
                        </h3>
                        <Separator className="bg-slate-700" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Nom</span>
                            <span className="font-medium text-slate-200">{fullDetails.fournisseurDetails?.nom}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">RIB</span>
                            <span className="text-slate-300 font-mono text-xs">{fullDetails.fournisseurDetails?.rib}</span>
                          </div>
                          {fullDetails.fournisseurDetails?.iban && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">IBAN</span>
                              <span className="text-slate-300 font-mono text-xs">{fullDetails.fournisseurDetails.iban}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-400">Téléphone</span>
                            <span className="text-slate-300">{fullDetails.fournisseurDetails?.telephone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Fiabilité</span>
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              {fullDetails.fournisseurDetails?.fiabilite}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Historique</span>
                            <span className="text-slate-300">{fullDetails.fournisseurDetails?.historiquePayments} paiements</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Document Source */}
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Document Source
                        </h3>
                        <Separator className="bg-slate-700" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Type</span>
                            <Badge className="bg-blue-500/20 text-blue-400">
                              {fullDetails.documentSource?.type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Référence</span>
                            <span className="font-medium text-blue-400">{fullDetails.documentSource?.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Montant</span>
                            <span className="text-slate-300">{formatCurrency(fullDetails.documentSource?.montant || 0)}</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le document
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contrôles Automatiques */}
                    <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Contrôles Automatiques
                        </h3>
                        <Separator className="bg-slate-700" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(fullDetails.controles || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-sm">
                              {value ? (
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-400" />
                              )}
                              <span className={value ? 'text-slate-300' : 'text-red-400'}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold text-slate-200">Circuit de Validation</h3>
                  <div className="space-y-3">
                    {fullDetails.workflow?.etapes.map((etape, index) => (
                      <Card key={index} className={cn(
                        "border-l-4",
                        etape.statut === 'validated' && 'border-l-emerald-500 bg-emerald-500/5',
                        etape.statut === 'pending' && 'border-l-amber-500 bg-amber-500/5',
                        etape.statut === 'rejected' && 'border-l-red-500 bg-red-500/5',
                        etape.statut === 'waiting' && 'border-l-slate-700 bg-slate-800/50'
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center",
                                etape.statut === 'validated' && 'bg-emerald-500/20',
                                etape.statut === 'pending' && 'bg-amber-500/20',
                                etape.statut === 'rejected' && 'bg-red-500/20',
                                etape.statut === 'waiting' && 'bg-slate-700'
                              )}>
                                <span className="font-bold">{etape.niveau}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-200">{etape.nom}</h4>
                                <p className="text-sm text-slate-400">{etape.validateur}</p>
                              </div>
                            </div>
                            {etape.statut === 'validated' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                            {etape.statut === 'pending' && <Clock className="h-5 w-5 text-amber-400" />}
                            {etape.statut === 'rejected' && <XCircle className="h-5 w-5 text-red-400" />}
                          </div>
                          {etape.date && (
                            <p className="text-xs text-slate-400 mb-1">
                              {formatDate(etape.date)}
                            </p>
                          )}
                          {etape.commentaire && (
                            <p className="text-sm text-slate-300 italic mt-2">
                              "{etape.commentaire}"
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold text-slate-200">Documents Attachés</h3>
                  {fullDetails.documents && fullDetails.documents.length > 0 ? (
                    <div className="space-y-2">
                      {fullDetails.documents.map((doc) => (
                        <Card key={doc.id} className="bg-slate-800/50 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Paperclip className="h-5 w-5 text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-200">{doc.nom}</p>
                                  <p className="text-sm text-slate-400">
                                    {(doc.taille / 1024).toFixed(1)} KB • Uploadé par {doc.uploadedBy}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Aucun document attaché.</p>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold text-slate-200">Commentaires</h3>
                  {fullDetails.commentaires && fullDetails.commentaires.length > 0 ? (
                    <div className="space-y-3">
                      {fullDetails.commentaires.map((comment) => (
                        <Card key={comment.id} className="bg-slate-800/50 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500/20 text-blue-400">
                                  {comment.author.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-slate-200">{comment.author}</span>
                                  <span className="text-xs text-slate-400">{comment.role}</span>
                                  {comment.private && (
                                    <Badge variant="outline" className="text-xs">Privé</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-300">{comment.content}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {formatDate(comment.timestamp)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Aucun commentaire.</p>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold text-slate-200">Historique des Actions</h3>
                  {fullDetails.timeline && fullDetails.timeline.length > 0 ? (
                    <div className="relative border-l border-slate-700 ml-4 space-y-6">
                      {fullDetails.timeline.map((event) => (
                        <div key={event.id} className="relative ml-6">
                          <span className="absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900 ring-4 ring-slate-900">
                            <History className="h-3 w-3 text-emerald-300" />
                          </span>
                          <div>
                            <h4 className="font-semibold text-slate-200">{event.action}</h4>
                            <p className="text-sm text-slate-400">
                              {event.actorName} ({event.actorRole}) • {formatDate(event.timestamp)}
                            </p>
                            {event.details && (
                              <p className="text-sm text-slate-300 mt-1">{event.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Aucun historique.</p>
                  )}
                </TabsContent>

                <TabsContent value="tresorerie" className="space-y-4 mt-0">
                  <h3 className="text-lg font-semibold text-slate-200">Impact Trésorerie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400">Solde Actuel</span>
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(fullDetails.tresorerie?.soldeActuel || 0)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400">Solde Prévisionnel</span>
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {formatCurrency(fullDetails.tresorerie?.soldePrevisionnel || 0)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-400">Impact du Paiement</span>
                          {fullDetails.tresorerie?.alerteSeuil && (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          )}
                        </div>
                        <div className="text-2xl font-bold text-red-400">
                          {formatCurrency(fullDetails.tresorerie?.impact || 0)}
                        </div>
                        {fullDetails.tresorerie?.alerteSeuil && (
                          <p className="text-sm text-amber-400 mt-2">
                            ⚠️ Attention : Ce paiement approche du seuil de trésorerie
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/50">
              {fullDetails.status === 'pending' && (
                <>
                  {onRequestInfo && (
                    <Button variant="outline" onClick={onRequestInfo}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Demander infos
                    </Button>
                  )}
                  {onSchedule && (
                    <Button variant="outline" onClick={onSchedule} className="text-blue-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      Planifier
                    </Button>
                  )}
                  {onReject && (
                    <Button variant="destructive" onClick={onReject}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  )}
                  {onValidate && (
                    <Button onClick={onValidate} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider
                    </Button>
                  )}
                </>
              )}
              <Button variant="secondary" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

