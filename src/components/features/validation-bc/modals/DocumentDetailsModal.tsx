/**
 * Modal Détails Complet d'un Document - Validation BC
 * Vue 360° avec toutes les informations métier
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Printer,
  Share2,
  Clock,
  User,
  Building2,
  DollarSign,
  Calendar,
  Paperclip,
  MessageSquare,
  History,
  TrendingUp,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  Info,
  Shield,
} from 'lucide-react';

import type { ValidationDocument } from '@/lib/services/validation-bc-api';

// ================================
// Types
// ================================
interface DocumentDetailsModalProps {
  document: ValidationDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate?: () => void;
  onReject?: () => void;
  onRequestInfo?: () => void;
  onEdit?: () => void;
}

interface FullDocumentDetails extends ValidationDocument {
  projetDetails?: {
    nom: string;
    code: string;
    budgetTotal: number;
    budgetUtilise: number;
    budgetRestant: number;
    pourcentageUtilise: number;
  };
  fournisseurDetails?: {
    nom: string;
    ninea: string;
    adresse: string;
    telephone: string;
    email: string;
    historiqueCommandes: number;
    montantTotal: number;
    fiabilite: string;
    derniereCommande: string;
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
    etapeCourante: number;
    prochainValidateur?: {
      id: string;
      nom: string;
      fonction: string;
    };
  };
  controles?: {
    budgetOk: boolean;
    montantCoherent: boolean;
    piecesCompletes: boolean;
    fournisseurActif: boolean;
    delaiRespect: boolean;
    details: string[];
  };
  commentairesDetails?: Array<{
    id: string;
    auteur: string;
    fonction: string;
    date: string;
    texte: string;
    pieceJointe?: string;
  }>;
}

// ================================
// Component
// ================================
export function DocumentDetailsModal({
  document,
  isOpen,
  onClose,
  onValidate,
  onReject,
  onRequestInfo,
  onEdit,
}: DocumentDetailsModalProps) {
  const [fullDetails, setFullDetails] = useState<FullDocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');

  // Charger les détails complets
  useEffect(() => {
    if (document && isOpen) {
      loadFullDetails();
    }
  }, [document, isOpen]);

  const loadFullDetails = async () => {
    setLoading(true);
    try {
      // TODO: Appel API réel
      // const response = await fetch(`/api/validation-bc/documents/${document.id}/full`);
      // const data = await response.json();
      
      // Mock data pour l'instant
      const mockDetails: FullDocumentDetails = {
        ...document!,
        projetDetails: {
          nom: 'Construction Route Nationale N°2',
          code: 'PRJ-2024-RN02',
          budgetTotal: 500000000,
          budgetUtilise: 350000000,
          budgetRestant: 150000000,
          pourcentageUtilise: 70,
        },
        fournisseurDetails: {
          nom: document!.fournisseur,
          ninea: '123456789',
          adresse: 'Dakar, Sénégal',
          telephone: '+221 77 123 45 67',
          email: 'contact@fournisseur.com',
          historiqueCommandes: 45,
          montantTotal: 125000000,
          fiabilite: 'Excellent',
          derniereCommande: '2024-12-15',
        },
        workflow: {
          etapes: [
            {
              niveau: 1,
              nom: 'Chef de Service',
              validateur: 'A. DIALLO',
              statut: 'validated',
              date: '2024-01-10 10:30',
              commentaire: 'Budget vérifié, pièces conformes',
            },
            {
              niveau: 2,
              nom: 'Directeur Administratif et Financier',
              validateur: 'M. KANE',
              statut: 'pending',
            },
            {
              niveau: 3,
              nom: 'Direction Générale',
              validateur: 'B. SOW',
              statut: 'waiting',
            },
          ],
          etapeCourante: 2,
          prochainValidateur: {
            id: 'val-2',
            nom: 'M. KANE',
            fonction: 'DAF',
          },
        },
        controles: {
          budgetOk: true,
          montantCoherent: true,
          piecesCompletes: false,
          fournisseurActif: true,
          delaiRespect: false,
          details: [
            '✅ Budget projet disponible : 150M FCFA restants',
            '✅ Montant cohérent avec le marché initial',
            '⚠️ Bon de livraison manquant',
            '✅ Fournisseur actif et certifié',
            '❌ Délai de validation dépassé de 2 jours',
          ],
        },
        commentairesDetails: [
          {
            id: 'com-1',
            auteur: 'A. DIALLO',
            fonction: 'Chef de Service',
            date: '2024-01-10 10:30',
            texte: 'Budget vérifié et disponible. Pièces conformes.',
          },
          {
            id: 'com-2',
            auteur: 'F. NDIAYE',
            fonction: 'Assistant',
            date: '2024-01-09 15:45',
            texte: 'Documents reçus et vérifiés. Manque le bon de livraison.',
          },
        ],
      };

      setFullDetails(mockDetails);
    } catch (error) {
      console.error('Error loading full details:', error);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: ValidationDocument['status']) => {
    const config = {
      pending: { label: 'En attente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
      validated: { label: 'Validé', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
      rejected: { label: 'Rejeté', className: 'bg-red-500/10 text-red-400 border-red-500/30', icon: XCircle },
      anomaly: { label: 'Anomalie', className: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: AlertTriangle },
    };

    const { label, className, icon: Icon } = config[status];
    return (
      <Badge variant="outline" className={cn('flex items-center gap-1', className)}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getControleIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-emerald-400" />
    ) : (
      <XCircle className="h-4 w-4 text-red-400" />
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    // TODO: Appel API
    console.log('Adding comment:', newComment);
    setNewComment('');
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700">
        {/* Header */}
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-200 mb-2">
                  {document.id}
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(document.status)}
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                    {document.type === 'bc' ? 'Bon de Commande' : document.type === 'facture' ? 'Facture' : 'Avenant'}
                  </Badge>
                  {document.urgent && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 animate-pulse">
                      Urgent
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions rapides */}
            <div className="flex items-center gap-2">
              {document.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    onClick={onValidate}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Valider
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                    onClick={onReject}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                    onClick={onRequestInfo}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Demander infos
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-slate-700" />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-slate-800/50 border-b border-slate-700 rounded-none w-full justify-start">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="documents">Documents ({document.documents?.length || 0})</TabsTrigger>
            <TabsTrigger value="comments">Commentaires ({fullDetails?.commentairesDetails?.length || 0})</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="related">Liés</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-6">
            {/* TAB: DÉTAILS */}
            <TabsContent value="details" className="mt-0 space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : (
                <>
                  {/* Informations générales */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Informations Générales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400">Objet</label>
                        <p className="text-slate-200 font-medium">{document.objet}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Bureau</label>
                        <p className="text-slate-200 font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {document.bureau}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Date d'émission</label>
                        <p className="text-slate-200 font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(document.dateEmission)}
                        </p>
                      </div>
                      {document.dateLimite && (
                        <div>
                          <label className="text-sm text-slate-400">Date limite</label>
                          <p className="text-slate-200 font-medium flex items-center gap-2 text-red-400">
                            <Clock className="h-4 w-4" />
                            {formatDate(document.dateLimite)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Détails financiers */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Détails Financiers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                          <label className="text-sm text-slate-400">Montant HT</label>
                          <p className="text-xl font-bold text-slate-200">{formatCurrency(document.montantHT)}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                          <label className="text-sm text-slate-400">TVA ({document.tva}%)</label>
                          <p className="text-xl font-bold text-slate-200">
                            {formatCurrency(document.montantTTC - document.montantHT)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <label className="text-sm text-blue-400">Montant TTC</label>
                          <p className="text-xl font-bold text-blue-300">{formatCurrency(document.montantTTC)}</p>
                        </div>
                      </div>

                      {/* Lignes de détail */}
                      {document.lignes && document.lignes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-200 mb-2">Lignes de détail</h4>
                          <div className="rounded-lg border border-slate-700 overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-slate-700">
                                  <TableHead className="text-slate-300">Désignation</TableHead>
                                  <TableHead className="text-slate-300 text-right">Qté</TableHead>
                                  <TableHead className="text-slate-300">Unité</TableHead>
                                  <TableHead className="text-slate-300 text-right">P.U. HT</TableHead>
                                  <TableHead className="text-slate-300 text-right">Montant</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {document.lignes.map((ligne) => (
                                  <TableRow key={ligne.id} className="border-slate-700">
                                    <TableCell className="text-slate-200">{ligne.designation}</TableCell>
                                    <TableCell className="text-slate-200 text-right">{ligne.quantite}</TableCell>
                                    <TableCell className="text-slate-400">{ligne.unite}</TableCell>
                                    <TableCell className="text-slate-200 text-right">
                                      {formatCurrency(ligne.prixUnitaire)}
                                    </TableCell>
                                    <TableCell className="text-slate-200 text-right font-medium">
                                      {formatCurrency(ligne.montant)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Budget Projet */}
                  {fullDetails?.projetDetails && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Budget Projet: {fullDetails.projetDetails.nom}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="text-sm text-slate-400">Budget Total</label>
                            <p className="text-lg font-bold text-slate-200">
                              {formatCurrency(fullDetails.projetDetails.budgetTotal)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">Utilisé</label>
                            <p className="text-lg font-bold text-amber-400">
                              {formatCurrency(fullDetails.projetDetails.budgetUtilise)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">Restant</label>
                            <p className="text-lg font-bold text-emerald-400">
                              {formatCurrency(fullDetails.projetDetails.budgetRestant)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">Taux d'utilisation</label>
                            <p className="text-lg font-bold text-blue-400">
                              {fullDetails.projetDetails.pourcentageUtilise}%
                            </p>
                          </div>
                        </div>
                        <Progress 
                          value={fullDetails.projetDetails.pourcentageUtilise} 
                          className="h-3"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Fournisseur */}
                  {fullDetails?.fournisseurDetails && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Fournisseur
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400">Nom</label>
                          <p className="text-slate-200 font-medium">{fullDetails.fournisseurDetails.nom}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">NINEA</label>
                          <p className="text-slate-200 font-medium">{fullDetails.fournisseurDetails.ninea}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Téléphone</label>
                          <p className="text-slate-200 font-medium">{fullDetails.fournisseurDetails.telephone}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Email</label>
                          <p className="text-slate-200 font-medium">{fullDetails.fournisseurDetails.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Historique</label>
                          <p className="text-slate-200 font-medium">
                            {fullDetails.fournisseurDetails.historiqueCommandes} commandes
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Fiabilité</label>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            {fullDetails.fournisseurDetails.fiabilite}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Demandeur */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Demandeur
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-blue-500/20 text-blue-400 text-lg">
                            {document.demandeur.nom.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-slate-400">Nom</label>
                            <p className="text-slate-200 font-medium">{document.demandeur.nom}</p>
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">Fonction</label>
                            <p className="text-slate-200 font-medium">{document.demandeur.fonction}</p>
                          </div>
                          <div>
                            <label className="text-sm text-slate-400">Bureau</label>
                            <p className="text-slate-200 font-medium">{document.demandeur.bureau}</p>
                          </div>
                          {document.demandeur.email && (
                            <div>
                              <label className="text-sm text-slate-400">Email</label>
                              <p className="text-slate-200 font-medium">{document.demandeur.email}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contrôles automatiques */}
                  {fullDetails?.controles && (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Contrôles Automatiques
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {fullDetails.controles.details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-slate-300">{detail}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* TAB: WORKFLOW */}
            <TabsContent value="workflow" className="mt-0">
              {fullDetails?.workflow && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>Circuit de Validation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fullDetails.workflow.etapes.map((etape, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'h-10 w-10 rounded-full flex items-center justify-center border-2',
                                etape.statut === 'validated'
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                  : etape.statut === 'pending'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                  : etape.statut === 'rejected'
                                  ? 'bg-red-500/20 border-red-500 text-red-400'
                                  : 'bg-slate-700 border-slate-600 text-slate-400'
                              )}
                            >
                              {index + 1}
                            </div>
                            {index < fullDetails.workflow.etapes.length - 1 && (
                              <div className="w-0.5 h-12 bg-slate-700 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <h4 className="font-semibold text-slate-200">{etape.nom}</h4>
                            <p className="text-sm text-slate-400">{etape.validateur}</p>
                            {etape.date && (
                              <p className="text-xs text-slate-400 mt-1">{etape.date}</p>
                            )}
                            {etape.commentaire && (
                              <p className="text-sm text-slate-300 mt-2 p-2 bg-slate-900/50 rounded">
                                {etape.commentaire}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB: DOCUMENTS */}
            <TabsContent value="documents" className="mt-0">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Pièces Jointes ({document.documents?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {document.documents && document.documents.length > 0 ? (
                    <div className="space-y-2">
                      {document.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700 hover:bg-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-slate-200 font-medium">{doc.nom}</p>
                              <p className="text-xs text-slate-400">
                                {doc.type} • {(doc.taille / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-8">Aucun document attaché</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: COMMENTAIRES */}
            <TabsContent value="comments" className="mt-0 space-y-4">
              {/* Liste des commentaires */}
              {fullDetails?.commentairesDetails && fullDetails.commentairesDetails.length > 0 && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 space-y-4">
                    {fullDetails.commentairesDetails.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-500/20 text-blue-400">
                            {comment.auteur.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-200">{comment.auteur}</span>
                            <span className="text-xs text-slate-400">{comment.fonction}</span>
                            <span className="text-xs text-slate-400">• {comment.date}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{comment.texte}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Nouveau commentaire */}
              {document.status === 'pending' && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => setNewComment('')}>
                        Annuler
                      </Button>
                      <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Commenter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB: HISTORIQUE */}
            <TabsContent value="history" className="mt-0">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {document.timeline && document.timeline.length > 0 ? (
                    <div className="space-y-4">
                      {document.timeline.map((event) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-blue-400" />
                            </div>
                            <div className="w-0.5 flex-1 bg-slate-700 my-1" />
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-slate-200 font-medium">{event.action}</p>
                            <p className="text-sm text-slate-400">
                              {event.actorName} • {event.actorRole}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{event.timestamp}</p>
                            {event.details && (
                              <p className="text-sm text-slate-300 mt-2">{event.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-8">Aucun historique disponible</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: DOCUMENTS LIÉS */}
            <TabsContent value="related" className="mt-0">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Documents Liés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-slate-400 py-8">
                    Aucun document lié trouvé
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

