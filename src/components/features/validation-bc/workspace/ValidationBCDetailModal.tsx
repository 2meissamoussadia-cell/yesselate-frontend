/**
 * Validation BC Detail Modal
 * Pattern Modal Overlay pour module Validation BC
 * 
 * Avantages:
 * - Contexte préservé (liste visible en arrière-plan)
 * - Navigation rapide (← → entre documents)
 * - UX moderne et fluide
 * - Multitâche possible
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UniversalDetailModal } from '@/components/shared/UniversalDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
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
  MessageSquare,
  History,
  Eye,
  Edit,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';

interface ValidationBCDetailModalProps {
  documents: ValidationDocument[];
  selectedId: string | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onValidate?: (doc: ValidationDocument) => void;
  onReject?: (doc: ValidationDocument) => void;
  onRequestInfo?: (doc: ValidationDocument) => void;
}

export function ValidationBCDetailModal({
  documents,
  selectedId,
  onClose,
  onPrevious,
  onNext,
  onValidate,
  onReject,
  onRequestInfo,
}: ValidationBCDetailModalProps) {
  const document = documents.find((d) => d.id === selectedId);
  const [activeTab, setActiveTab] = useState('details');

  // Reset tab when document changes
  useEffect(() => {
    setActiveTab('details');
  }, [selectedId]);

  if (!document) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case 'validated':
        return (
          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            {status}
          </Badge>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bc':
        return 'Bon de Commande';
      case 'facture':
        return 'Facture';
      case 'avenant':
        return 'Avenant';
      default:
        return type;
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
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <UniversalDetailModal
      isOpen={!!selectedId}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      title={document.id}
      subtitle={`${getTypeLabel(document.type)} • ${document.fournisseur}`}
      headerColor="blue"
      width="xl"
      actions={
        <div className="flex gap-2">
          {document.status === 'pending' && (
            <>
              {onValidate && (
                <Button
                  size="sm"
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => onValidate(document)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => onReject(document)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
              )}
              {onRequestInfo && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                  onClick={() => onRequestInfo(document)}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Demander info
                </Button>
              )}
            </>
          )}
          <Button size="sm" variant="ghost">
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button size="sm" variant="ghost">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Montant TTC</p>
                  <p className="text-xl font-bold text-slate-200">
                    {formatCurrency(document.montantTTC)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-500/10">
                  {getStatusBadge(document.status)}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Statut</p>
                  <p className="text-lg font-semibold text-slate-200 capitalize">
                    {document.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-500/10">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Bureau</p>
                  <p className="text-lg font-semibold text-slate-200">{document.bureau}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="comments">Commentaires</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Type</p>
                    <p className="font-medium text-slate-200">{getTypeLabel(document.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">ID Document</p>
                    <p className="font-medium text-slate-200">{document.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Fournisseur</p>
                    <p className="font-medium text-slate-200">{document.fournisseur}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Bureau</p>
                    <p className="font-medium text-slate-200">{document.bureau}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Objet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{document.objet}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Détails financiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Montant HT</p>
                    <p className="text-xl font-bold text-slate-200">
                      {formatCurrency(document.montantHT || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Montant TTC</p>
                    <p className="text-xl font-bold text-blue-400">
                      {formatCurrency(document.montantTTC)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Workflow de validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Workflow en cours de développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Commentaires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Aucun commentaire pour le moment.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">Document créé</p>
                      <p className="text-xs text-slate-400">
                        {document.createdAt ? formatDate(document.createdAt) : 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UniversalDetailModal>
  );
}

