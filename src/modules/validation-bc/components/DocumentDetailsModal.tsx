/**
 * Modal de détails complets d'un document - Validation-BC
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Printer,
  Clock,
  User,
  Building2,
  DollarSign,
  Calendar,
  MessageSquare,
  History,
  Eye,
  ShoppingCart,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DocumentValidation } from '../types/validationTypes';
import { getValidationDocumentById } from '../api/validationApi';
import { ValidationModal } from './ValidationModal';
import { RejectModal } from './RejectModal';
import { RequestInfoModal } from './RequestInfoModal';

interface DocumentDetailsModalProps {
  open: boolean;
  document: DocumentValidation | null;
  onClose: () => void;
  onValidate?: () => void;
  onReject?: () => void;
  onRequestInfo?: () => void;
}

export function DocumentDetailsModal({
  open,
  document,
  onClose,
  onValidate,
  onReject,
  onRequestInfo,
}: DocumentDetailsModalProps) {
  const [fullDocument, setFullDocument] = useState<DocumentValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestInfoModalOpen, setRequestInfoModalOpen] = useState(false);

  useEffect(() => {
    if (document && open) {
      loadFullDocument();
    }
  }, [document, open]);

  const loadFullDocument = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const full = await getValidationDocumentById(document.id);
      setFullDocument(full || document);
    } catch (error) {
      console.error('Erreur chargement document:', error);
      setFullDocument(document);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateClick = () => {
    setValidationModalOpen(true);
  };

  const handleRejectClick = () => {
    setRejectModalOpen(true);
  };

  const handleRequestInfoClick = () => {
    setRequestInfoModalOpen(true);
  };

  const handleConfirmRequestInfo = async (message: string) => {
    // TODO: Implémenter l'envoi de la demande
    onRequestInfo?.();
  };

  const handleConfirmValidation = async (comment?: string) => {
    // TODO: Implémenter la validation
    setValidationModalOpen(false);
    onValidate?.();
    onClose();
  };

  const handleConfirmReject = async (reason: string, comment?: string) => {
    // TODO: Implémenter le rejet
    setRejectModalOpen(false);
    onReject?.();
    onClose();
  };

  if (!document) return null;

  const doc = fullDocument || document;
  const getTypeIcon = () => {
    switch (doc.type) {
      case 'BC':
        return ShoppingCart;
      case 'FACTURE':
        return Receipt;
      case 'AVENANT':
        return FileText;
    }
  };

  const getStatutConfig = () => {
    switch (doc.statut) {
      case 'EN_ATTENTE':
        return { icon: Clock, color: 'amber', label: 'En attente' };
      case 'VALIDE':
        return { icon: CheckCircle2, color: 'emerald', label: 'Validé' };
      case 'REJETE':
        return { icon: XCircle, color: 'red', label: 'Rejeté' };
      case 'URGENT':
        return { icon: AlertTriangle, color: 'orange', label: 'Urgent' };
    }
  };

  const TypeIcon = getTypeIcon();
  const statutConfig = getStatutConfig();
  const StatutIcon = statutConfig.icon;

  return (
    <>
      <Dialog open={open && !validationModalOpen && !rejectModalOpen && !requestInfoModalOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TypeIcon className="h-6 w-6 text-slate-400" />
                <div>
                  <DialogTitle className="text-xl text-slate-200">{doc.numero}</DialogTitle>
                  <DialogDescription className="text-slate-400">{doc.titre}</DialogDescription>
                </div>
              </div>
              <Badge
                variant={statutConfig.color === 'red' ? 'destructive' : 'default'}
                className={cn(
                  statutConfig.color === 'amber' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                  statutConfig.color === 'orange' && 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                  statutConfig.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                )}
              >
                <StatutIcon className="h-3 w-3 mr-1" />
                {statutConfig.label}
              </Badge>
            </div>
          </DialogHeader>

          {/* Actions */}
          {(doc.statut === 'EN_ATTENTE' || doc.statut === 'URGENT') && (
            <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
              <Button
                size="sm"
                onClick={handleValidateClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Valider
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRejectClick}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRequestInfoClick}
                className="border-slate-700 text-slate-300"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Demander infos
              </Button>
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="details" className="data-[state=active]:bg-slate-700">
                Détails
              </TabsTrigger>
              <TabsTrigger value="workflow" className="data-[state=active]:bg-slate-700">
                Workflow
              </TabsTrigger>
              <TabsTrigger value="comments" className="data-[state=active]:bg-slate-700">
                Commentaires
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-slate-700">
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-slate-200">{doc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Service:</span>
                      <span className="text-slate-200">{doc.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Demandeur:</span>
                      <span className="text-slate-200">{doc.demandeur}</span>
                    </div>
                    {doc.dateCreation && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date création:</span>
                        <span className="text-slate-200">
                          {new Date(doc.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Informations financières</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Montant:</span>
                      <span className="text-lg font-bold text-slate-200">
                        {doc.montant.toLocaleString('fr-FR')} {doc.devise || 'EUR'}
                      </span>
                    </div>
                    {doc.delaiMoyen && (
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Délai moyen:</span>
                        <span className="text-slate-200">{doc.delaiMoyen.toFixed(1)} jours</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {doc.description && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-slate-300">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">{doc.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="workflow" className="mt-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-sm text-slate-400">Workflow de validation à implémenter</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-sm text-slate-400">Système de commentaires à implémenter</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 space-y-3">
                  {doc.dateCreation && (
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400">Créé le</span>
                      <span className="text-slate-200">
                        {new Date(doc.dateCreation).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  {doc.dateValidation && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-slate-400">Validé le</span>
                      <span className="text-slate-200">
                        {new Date(doc.dateValidation).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {doc.validateur && (
                        <>
                          <span className="text-slate-400">par</span>
                          <span className="text-slate-200">{doc.validateur}</span>
                        </>
                      )}
                    </div>
                  )}
                  {doc.dateRejet && (
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-slate-400">Rejeté le</span>
                      <span className="text-slate-200">
                        {new Date(doc.dateRejet).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      {doc && (
        <>
          <ValidationModal
            open={validationModalOpen}
            document={doc}
            onClose={() => setValidationModalOpen(false)}
            onConfirm={handleConfirmValidation}
          />
          <RejectModal
            open={rejectModalOpen}
            document={doc}
            onClose={() => setRejectModalOpen(false)}
            onConfirm={handleConfirmReject}
          />
          <RequestInfoModal
            open={requestInfoModalOpen}
            document={doc}
            onClose={() => setRequestInfoModalOpen(false)}
            onConfirm={handleConfirmRequestInfo}
          />
        </>
      )}
    </>
  );
}

