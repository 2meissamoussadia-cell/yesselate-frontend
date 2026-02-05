'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, FileText, CheckCircle, XCircle, MessageSquare, 
  AlertTriangle, Download, Eye, Send, RefreshCw, Shield,
  History, User, Calendar, TrendingUp
} from 'lucide-react';
import type { 
  EnrichedBC, 
  EnrichedFacture, 
  EnrichedAvenant,
  DocumentType,
  DocumentAnomaly,
  DocumentAnnotation,
  DocumentSignature,
} from '@/lib/types/document-validation.types';
import { verifyBC, verifyFacture, verifyAvenant } from '@/lib/services/document-verification.service';
import { AnomalyAnnotationPanel } from './AnomalyAnnotationPanel';
import { SignatureBlock, generateSignature } from './SignatureBlock';
import { RequestComplementModal } from './RequestComplementModal';
import { CorrectionModal } from './CorrectionModal';
import { BCLignesTable } from './BCLignesTable';
import { BCDetailsExpanded } from './BCDetailsExpanded';
import { BCDocumentView } from './BCDocumentView';
import { DocumentDetailsTabs } from './DocumentDetailsTabs';
import { BMOValidatorPanel } from './BMOValidatorPanel';
import { BCModalTabs } from './BCModalTabs';
import type { SignatoryProfile } from '@/lib/types/document-validation.types';
import { getStatusBadgeConfig } from '@/lib/utils/status-utils';
import {
  useAnomalies,
  useAnnotations,
  useResolveAnomaly,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
} from '@/lib/api/hooks/useValidationBCAnomalies';

interface EnhancedDocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: EnrichedBC | EnrichedFacture | EnrichedAvenant | null;
  documentType: DocumentType;
  onValidate?: () => void;
  onReject?: () => void;
  onRequestComplement?: () => void;
  onSign?: (signature: DocumentSignature) => void;
  onAuditComplete?: (bcId: string, report: any) => void; // WHY: Propager le rapport d'audit au parent
  allBCs?: any[]; // WHY: Pour recommandations contextuelles
}

export function EnhancedDocumentDetailsModal({
  isOpen,
  onClose,
  document,
  documentType,
  onValidate,
  onReject,
  onRequestComplement,
  onSign,
  onAuditComplete,
  allBCs = [],
}: EnhancedDocumentDetailsModalProps) {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [activeTab, setActiveTab] = useState<'bmo' | 'details' | 'document' | 'verification' | 'annotations' | 'history'>('bmo');
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  
  // React Query hooks pour anomalies et annotations (pour factures/avenants uniquement)
  const documentId = document?.id || '';
  const { data: queryAnomalies = [] } = useAnomalies(documentId, {
    enabled: !!documentId && documentType !== 'bc', // Pour BC, on utilise les anomalies du document
  });
  const { data: queryAnnotations = [] } = useAnnotations(documentId, {
    enabled: !!documentId && documentType !== 'bc', // Pour BC, on utilise les annotations du document
  });
  
  // Mutations
  const resolveAnomalyMutation = useResolveAnomaly();
  const createAnnotationMutation = useCreateAnnotation();
  const updateAnnotationMutation = useUpdateAnnotation();
  const deleteAnnotationMutation = useDeleteAnnotation();
  
  // Utiliser les données du document si disponibles, sinon utiliser React Query
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>(document?.annotations || []);
  const [anomalies, setAnomalies] = useState<DocumentAnomaly[]>(document?.anomalies || []);
  
  // Mettre à jour les données si React Query retourne des données (pour factures/avenants)
  useEffect(() => {
    if (documentType !== 'bc' && documentId && queryAnomalies.length > 0) {
      setAnomalies(queryAnomalies);
    }
  }, [queryAnomalies, documentType, documentId]);
  
  useEffect(() => {
    if (documentType !== 'bc' && documentId && queryAnnotations.length > 0) {
      setAnnotations(queryAnnotations);
    }
  }, [queryAnnotations, documentType, documentId]);
  
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [signature, setSignature] = useState<DocumentSignature | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // WHY: Reset scroll au changement de document

  // WHY: Bloquer le scroll du body quand la modal est ouverte (vérification SSR)
  useEffect(() => {
    const globalDoc = typeof globalThis !== 'undefined' && 'document' in globalThis ? (globalThis as unknown as Window).document : null;
    if (isOpen && globalDoc?.body) {
      const prev = globalDoc.body.style.overflow;
      globalDoc.body.style.overflow = 'hidden';
      return () => {
        if (globalDoc?.body) globalDoc.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  // Reset activeTab et scroll au changement de document (WHY: éviter tab/scroll persistence entre documents différents)
  useEffect(() => {
    if (document?.id) {
      setActiveTab('bmo');
      // Reset scroll avec setTimeout pour s'assurer que le ref est prêt
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo(0, 0);
        }
      }, 0);
    }
  }, [document?.id]);

  // Vérification automatique au chargement
  useEffect(() => {
    if (!document) return;

    let result;
    if (documentType === 'bc') {
      result = verifyBC(document as EnrichedBC);
      // Pour BC, utiliser les anomalies de la vérification
      setAnomalies(result.anomalies);
    } else if (documentType === 'facture') {
      result = verifyFacture(document as EnrichedFacture);
    } else {
      result = verifyAvenant(document as EnrichedAvenant);
    }
    // Pour factures/avenants, les anomalies viennent de React Query (gérées dans useEffect précédent)

    setVerificationResult(result);
  }, [document, documentType]);

  if (!isOpen || !document) return null;

  // Profils de signataires (simulation)
  const signatoryProfiles: SignatoryProfile[] = [
    {
      id: 'SIG-001',
      name: 'A. DIALLO',
      function: 'Directeur Général',
      authority: 'directeur',
      active: true,
    },
    {
      id: 'SIG-002',
      name: 'M. FALL',
      function: 'Président',
      authority: 'president',
      active: true,
    },
  ];

  const handleValidate = () => {
    // Générer signature si validé
    const signatory = signatoryProfiles[0]; // Par défaut le DG
    const sig = generateSignature(document.id, documentType, signatory);
    setSignature(sig);
    
    if (onSign) {
      onSign(sig);
    }

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'validation',
      module: `validation-${documentType}`,
      targetId: document.id,
      targetType: documentType === 'bc' ? 'Bon de commande' : documentType === 'facture' ? 'Facture' : 'Avenant',
      targetLabel: documentType === 'bc' ? (document as EnrichedBC).objet : documentType === 'facture' ? (document as EnrichedFacture).objet : (document as EnrichedAvenant).objet,
      details: `Document validé - Hash: ${sig.signatureHash}`,
      bureau: 'BMO',
    });

    addToast(`✓ ${document.id} validé et signé`, 'success');
    if (onValidate) onValidate();
  };

  const handleReject = () => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'rejection',
      module: `validation-${documentType}`,
      targetId: document.id,
      targetType: documentType === 'bc' ? 'Bon de commande' : documentType === 'facture' ? 'Facture' : 'Avenant',
      targetLabel: documentType === 'bc' ? (document as EnrichedBC).objet : documentType === 'facture' ? (document as EnrichedFacture).objet : (document as EnrichedAvenant).objet,
      details: 'Document refusé par le BMO',
      bureau: 'BMO',
    });

    addToast(`✕ ${document.id} refusé`, 'warning');
    if (onReject) onReject();
  };

  const handleRequestComplement = () => {
    setShowComplementModal(true);
  };

  const handleAddAnnotation = async (annotation: Omit<DocumentAnnotation, 'id' | 'createdAt'>) => {
    try {
      if (documentType === 'bc') {
        // Pour BC, utiliser le state local
        const newAnnotation: DocumentAnnotation = {
          ...annotation,
          id: `ANN-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setAnnotations([...annotations, newAnnotation]);
        addToast('Annotation ajoutée', 'success');
      } else {
        // Pour factures/avenants, utiliser React Query
        await createAnnotationMutation.mutateAsync(annotation);
        addToast('Annotation ajoutée', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'annotation:', error);
      addToast('Erreur lors de l\'ajout de l\'annotation', 'error');
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      if (documentType === 'bc') {
        // Pour BC, utiliser le state local
        setAnomalies(anomalies.map(a => 
          a.id === anomalyId 
            ? { ...a, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy: 'BMO-USER' }
            : a
        ));
        addToast('Anomalie marquée comme résolue', 'success');
      } else {
        // Pour factures/avenants, utiliser React Query
        await resolveAnomalyMutation.mutateAsync({ anomalyId });
        addToast('Anomalie marquée comme résolue', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'anomalie:', error);
      addToast('Erreur lors de la résolution de l\'anomalie', 'error');
    }
  };

  const handleUpdateAnnotation = async (annotationId: string, comment: string) => {
    try {
      if (documentType === 'bc') {
        // Pour BC, utiliser le state local
        setAnnotations(annotations.map(a => 
          a.id === annotationId ? { ...a, comment } : a
        ));
        addToast('Annotation mise à jour', 'success');
      } else {
        // Pour factures/avenants, utiliser React Query
        await updateAnnotationMutation.mutateAsync({ id: annotationId, comment });
        addToast('Annotation mise à jour', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'annotation:', error);
      addToast('Erreur lors de la mise à jour de l\'annotation', 'error');
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      if (documentType === 'bc') {
        // Pour BC, utiliser le state local
        setAnnotations(annotations.filter(a => a.id !== annotationId));
        addToast('Annotation supprimée', 'success');
      } else {
        // Pour factures/avenants, utiliser React Query
        await deleteAnnotationMutation.mutateAsync({ id: annotationId, documentId });
        addToast('Annotation supprimée', 'success');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annotation:', error);
      addToast('Erreur lors de la suppression de l\'annotation', 'error');
    }
  };

  const getDocumentLabel = () => {
    if (documentType === 'bc') {
      return (document as EnrichedBC).objet;
    } else if (documentType === 'facture') {
      return (document as EnrichedFacture).objet;
    } else {
      return (document as EnrichedAvenant).objet;
    }
  };

  // WHY: Utiliser la fonction centralisée pour cohérence UI
  const getStatusBadge = (status: string) => {
    const config = getStatusBadgeConfig(status);
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-0 right-0 h-full w-full max-w-6xl z-50',
        'transform transition-transform duration-300 ease-in-out',
        darkMode ? 'bg-slate-900' : 'bg-white',
        'shadow-2xl border-l border-slate-700/30',
        'overflow-hidden',
        'scrollbar-gutter-stable' // Stabilise la largeur pour éviter les sauts
      )}>
        <div ref={scrollContainerRef} className="flex flex-col h-full overflow-hidden" style={{ scrollbarGutter: 'stable' }}>
          {/* Header */}
          <div className={cn(
            'p-6 border-b',
            verificationResult?.severity === 'critical' ? 'bg-gradient-to-r from-red-500/20 to-red-500/5 border-red-500/30' :
            verificationResult?.severity === 'error' ? 'bg-gradient-to-r from-red-500/20 to-red-500/5 border-red-500/30' :
            verificationResult?.severity === 'warning' ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 border-orange-500/30' :
            'bg-gradient-to-r from-blue-500/20 to-blue-500/5 border-blue-500/30'
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="info" className="font-mono">{document.id}</Badge>
                  {getStatusBadge(document.status)}
                  {anomalies.filter(a => !a.resolved).length > 0 && (
                    <Badge variant="urgent" className="text-xs">
                      {anomalies.filter(a => !a.resolved).length} anomalie(s)
                    </Badge>
                  )}
                  {verificationResult && (
                    <Badge
                      variant={
                        verificationResult.severity === 'critical' ? 'urgent' :
                        verificationResult.severity === 'error' ? 'urgent' :
                        verificationResult.severity === 'warning' ? 'warning' :
                        'success'
                      }
                      className="text-xs"
                    >
                      {verificationResult.isValid ? '✓ Valide' : verificationResult.severity}
                    </Badge>
                  )}
                </div>
                <h2 className="font-bold text-xl mb-2">{getDocumentLabel()}</h2>
              </div>
              <button onClick={onClose} className={cn('p-2 rounded-lg transition-colors ml-2', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Pour les BCs, utiliser BCModalTabs qui gère ses propres onglets */}
          {documentType === 'bc' ? (
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col" style={{ scrollbarGutter: 'stable' }}>
              <BCModalTabs
                key={document.id} // Force reset au changement de BC
                bc={document as EnrichedBC}
                allBCs={allBCs} // WHY: Pour recommandations contextuelles
                onDecision={async (payload) => {
                  if (payload.decision === 'approve') {
                    handleValidate();
                  } else if (payload.decision === 'reject') {
                    handleReject();
                  } else if (payload.decision === 'request_complement') {
                    setShowComplementModal(true);
                  } else if (payload.decision === 'escalate') {
                    addToast(`Escalade vers ${payload.target.toUpperCase()}`, 'info');
                  }
                }}
                onAuditComplete={onAuditComplete} // WHY: Remonter le rapport d'audit
              />
            </div>
          ) : (
            <>
              {/* Tabs pour Factures et Avenants */}
              <div className="flex border-b border-slate-700/30 overflow-x-auto">
                {[
                  { id: 'bmo', label: 'Analyse BMO', icon: Shield },
                  { id: 'details', label: 'Détails', icon: FileText },
                  { id: 'verification', label: 'Vérification', icon: Shield, badge: verificationResult?.anomalies?.length || 0 },
                  { id: 'annotations', label: 'Annotations', icon: MessageSquare, badge: annotations.length },
                  { id: 'history', label: 'Historique', icon: History },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                        activeTab === tab.id
                          ? 'text-blue-400 border-b-2 border-blue-400'
                          : 'text-slate-400 hover:text-slate-300'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.badge && tab.badge > 0 && (
                        <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0">
                          {tab.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content pour Factures et Avenants */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'bmo' && (
                  <BMOValidatorPanel
                    context={documentType}
                    item={document}
                    onAction={(action) => {
                      if (action === 'validate') {
                        handleValidate();
                      } else if (action === 'reject') {
                        handleReject();
                      } else if (action === 'request-complement') {
                        setShowComplementModal(true);
                      } else if (action === 'escalate') {
                        addToast('Fonctionnalité d\'escalade à implémenter', 'info');
                      }
                    }}
                  />
                )}

                {activeTab === 'details' && (
              <div className="space-y-4">
                {documentType === 'facture' ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Informations de la facture</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">Fournisseur</span>
                          <span className="font-medium">{(document as EnrichedFacture).fournisseur}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">Projet</span>
                          <span className="font-mono text-orange-400 font-semibold">{(document as EnrichedFacture).projet}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">BC associé</span>
                          <span className="font-mono text-blue-400">{(document as EnrichedFacture).bcAssocie || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">Montant HT</span>
                          <span className="font-mono font-bold">{(document as EnrichedFacture).montantHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">TVA ({(document as EnrichedFacture).tva}%)</span>
                          <span className="font-mono">{((document as EnrichedFacture).montantTTC - (document as EnrichedFacture).montantHT).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Montant TTC</span>
                          <span className="font-mono font-bold text-amber-400">{(document as EnrichedFacture).montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA</span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Informations de l'avenant</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">Projet</span>
                          <span className="font-mono text-orange-400 font-semibold">{(document as EnrichedAvenant).projet}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">Motif</span>
                          <span>{(document as EnrichedAvenant).motif}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700/30">
                          <span className="text-slate-400">Impact financier</span>
                          <span className="font-mono font-bold">{(document as EnrichedAvenant).impactFinancier.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400">Impact délai</span>
                          <span className="font-mono">{(document as EnrichedAvenant).impactDelai > 0 ? '+' : ''}{(document as EnrichedAvenant).impactDelai} jours</span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Signature si validé */}
                {signature && (
                  <SignatureBlock signature={signature} />
                )}
              </div>
            )}

            {activeTab === 'verification' && verificationResult && (
              <div className="space-y-4">
                {/* Résumé */}
                <Card className={cn(
                  verificationResult.isValid 
                    ? 'border-emerald-500/30 bg-emerald-500/10' 
                    : 'border-orange-500/30 bg-orange-500/10'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {verificationResult.isValid ? (
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                      )}
                      <div>
                        <p className="font-semibold">{verificationResult.summary}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {verificationResult.anomalies.length} anomalie(s) détectée(s)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Résultats des vérifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Résultats des vérifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {verificationResult.checks.map((check: any) => (
                      <div
                        key={check.id}
                        className={cn(
                          'p-3 rounded-lg border flex items-center justify-between',
                          check.passed 
                            ? 'border-emerald-500/30 bg-emerald-500/10' 
                            : 'border-orange-500/30 bg-orange-500/10'
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">{check.name}</span>
                            <Badge variant={check.passed ? 'success' : 'warning'} className="text-[10px]">
                              {check.passed ? '✓' : '✕'}
                            </Badge>
                          </div>
                          {check.message && (
                            <p className="text-xs text-slate-400">{check.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {anomalies.filter(a => !a.resolved).length > 0 && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setShowCorrectionModal(true)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Ouvrir la gestion des corrections
                  </Button>
                )}
              </div>
            )}

            {activeTab === 'annotations' && (
              <AnomalyAnnotationPanel
                documentId={document.id}
                documentType={documentType}
                anomalies={anomalies}
                annotations={annotations}
                onAddAnnotation={handleAddAnnotation}
                onResolveAnomaly={handleResolveAnomaly}
                onUpdateAnnotation={handleUpdateAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
              />
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-400 text-center py-4 italic">
                      L'historique détaillé sera disponible bientôt pour les {documentType === 'facture' ? 'factures' : 'avenants'}.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer avec actions */}
          <div className="p-6 border-t border-slate-700/30 bg-slate-800/30">
            <div className="flex gap-3">
              <Button
                variant="success"
                onClick={handleValidate}
                disabled={!verificationResult?.isValid || document.status === 'validated'}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Valider et signer
              </Button>
              <Button
                variant="destructive"
                onClick={onReject}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Refuser
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowComplementModal(true)}
              >
                <Send className="w-4 h-4 mr-2" />
                Demander complément
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Modales */}
      <RequestComplementModal
        isOpen={showComplementModal}
        onClose={() => setShowComplementModal(false)}
        documentId={document.id}
        documentType={documentType}
        documentLabel={getDocumentLabel()}
        anomalies={anomalies.filter(a => !a.resolved)}
        onRequest={(request) => {
          addToast('Demande de complément envoyée', 'success');
          setShowComplementModal(false);
        }}
      />

      <CorrectionModal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        documentId={document.id}
        documentLabel={getDocumentLabel()}
        anomalies={anomalies}
        onValidateCorrection={handleResolveAnomaly}
        onMarkResolved={handleResolveAnomaly}
      />
    </>
  );
}

