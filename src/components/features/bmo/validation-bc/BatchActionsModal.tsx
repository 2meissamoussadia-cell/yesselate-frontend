'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, Layers, CheckCircle, XCircle, Send, FileDown, User,
  AlertTriangle, Loader2, Trash2
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import type { PurchaseOrder } from '@/lib/types/bmo.types';
import { getStatusBadgeConfig } from '@/lib/utils/status-utils';

interface BatchActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBCIds: string[];
  allBCs: (EnrichedBC | PurchaseOrder)[];
  onValidate?: (ids: string[]) => void;
  onReject?: (ids: string[], reason: string) => void;
  onRequestComplement?: (ids: string[], message: string) => void;
  onExport?: (ids: string[], format: 'excel' | 'pdf') => void;
  onAssign?: (ids: string[], assignee: string) => void;
}

type BatchAction = 'validate' | 'reject' | 'request_complement' | 'export' | 'assign';

export function BatchActionsModal({
  isOpen,
  onClose,
  selectedBCIds,
  allBCs,
  onValidate,
  onReject,
  onRequestComplement,
  onExport,
  onAssign,
}: BatchActionsModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [selectedAction, setSelectedAction] = useState<BatchAction | null>(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [assignee, setAssignee] = useState('');
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf'>('excel');
  const [isProcessing, setIsProcessing] = useState(false);

  // Récupérer les BCs sélectionnés
  const selectedBCs = useMemo(() => {
    return selectedBCIds.map(id => {
      const enriched = allBCs.find(bc => bc.id === id && 'montantTTC' in bc);
      if (enriched) return enriched as EnrichedBC;
      const raw = allBCs.find(bc => bc.id === id && 'amount' in bc);
      if (raw) return raw as PurchaseOrder;
      return null;
    }).filter(Boolean) as (EnrichedBC | PurchaseOrder)[];
  }, [selectedBCIds, allBCs]);

  // Statistiques des BCs sélectionnés
  const stats = useMemo(() => {
    const totalAmount = selectedBCs.reduce((sum, bc) => {
      const amount = 'montantTTC' in bc ? Number(bc.montantTTC) || 0 : 
                    typeof (bc as PurchaseOrder).amount === 'string' 
                      ? parseFloat((bc as PurchaseOrder).amount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
                      : Number((bc as PurchaseOrder).amount) || 0;
      return sum + amount;
    }, 0);

    const statusCounts = selectedBCs.reduce((acc, bc) => {
      const status = 'status' in bc ? bc.status : (bc as PurchaseOrder).status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const canValidate = selectedBCs.filter(bc => {
      const status = 'status' in bc ? bc.status : (bc as PurchaseOrder).status || 'pending';
      return status === 'pending' || status === 'pending_bmo' || status === 'audit_required';
    }).length;

    const hasAnomalies = selectedBCs.filter(bc => {
      if ('anomalies' in bc) {
        const anomalies = (bc as EnrichedBC).anomalies;
        return anomalies && anomalies.length > 0;
      }
      return false;
    }).length;

    return {
      count: selectedBCs.length,
      totalAmount,
      statusCounts,
      canValidate,
      hasAnomalies,
    };
  }, [selectedBCs]);

  const handleExecute = async () => {
    if (!selectedAction) return;

    setIsProcessing(true);

    try {
      switch (selectedAction) {
        case 'validate':
          if (onValidate) {
            onValidate(selectedBCIds);
            addToast(`${selectedBCIds.length} BC(s) validé(s) en lot`, 'success');
          }
          break;
        case 'reject':
          if (onReject && reason.trim()) {
            onReject(selectedBCIds, reason);
            addToast(`${selectedBCIds.length} BC(s) rejeté(s) en lot`, 'warning');
          } else {
            addToast('Veuillez fournir un motif de rejet', 'error');
            setIsProcessing(false);
            return;
          }
          break;
        case 'request_complement':
          if (onRequestComplement && message.trim()) {
            onRequestComplement(selectedBCIds, message);
            addToast(`Demande de complément envoyée pour ${selectedBCIds.length} BC(s)`, 'info');
          } else {
            addToast('Veuillez fournir un message', 'error');
            setIsProcessing(false);
            return;
          }
          break;
        case 'export':
          if (onExport) {
            onExport(selectedBCIds, exportFormat);
            addToast(`Export ${exportFormat.toUpperCase()} lancé pour ${selectedBCIds.length} BC(s)`, 'success');
          }
          break;
        case 'assign':
          if (onAssign && assignee.trim()) {
            onAssign(selectedBCIds, assignee);
            addToast(`${selectedBCIds.length} BC(s) assigné(s) à ${assignee}`, 'success');
          } else {
            addToast('Veuillez sélectionner un validateur', 'error');
            setIsProcessing(false);
            return;
          }
          break;
      }

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        setSelectedAction(null);
        setReason('');
        setMessage('');
        setAssignee('');
      }, 500);
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action en lot:', error);
      addToast('Erreur lors de l\'exécution de l\'action', 'error');
      setIsProcessing(false);
    }
  };

  if (!isOpen || selectedBCIds.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-3xl max-h-[90vh] z-50',
        'rounded-xl shadow-2xl overflow-hidden',
        darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'
      )}>
        {/* Header */}
        <div className={cn(
          'p-6 border-b',
          darkMode ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-slate-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-gray-200'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  darkMode ? 'bg-green-500/20' : 'bg-green-100'
                )}>
                  <Layers className={cn('w-6 h-6', darkMode ? 'text-green-400' : 'text-green-600')} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Actions en Lot</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedBCIds.length} BC{selectedBCIds.length > 1 ? 's' : ''} sélectionné{selectedBCIds.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="info" className="text-xs">
                  {stats.count} BC{stats.count > 1 ? 's' : ''}
                </Badge>
                <Badge variant="default" className="text-xs">
                  Total: {stats.totalAmount.toLocaleString('fr-FR')} FCFA
                </Badge>
                <Badge variant={stats.canValidate > 0 ? 'success' : 'default'} className="text-xs">
                  {stats.canValidate} validable{stats.canValidate > 1 ? 's' : ''}
                </Badge>
                {stats.hasAnomalies > 0 && (
                  <Badge variant="urgent" className="text-xs">
                    {stats.hasAnomalies} avec anomalie{stats.hasAnomalies > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6 space-y-4">
          {/* Prévisualisation */}
          <Card className={cn(darkMode ? 'bg-slate-800/50' : 'bg-gray-50')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">BCs sélectionnés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedBCs.slice(0, 5).map((bc) => {
                  const id = bc.id;
                  const subject = 'objet' in bc ? bc.objet : (bc as PurchaseOrder).subject;
                  const status = 'status' in bc ? bc.status : (bc as PurchaseOrder).status || 'pending';
                  const config = getStatusBadgeConfig(status);
                  return (
                    <div key={id} className={cn(
                      'flex items-center justify-between p-2 rounded-lg text-xs',
                      darkMode ? 'bg-slate-700/30' : 'bg-white'
                    )}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400">{id}</span>
                        <span className={cn('truncate max-w-[200px]', darkMode ? 'text-white/80' : 'text-gray-700')}>
                          {subject}
                        </span>
                      </div>
                      <Badge variant={config.variant} className="text-[10px]">
                        {config.label}
                      </Badge>
                    </div>
                  );
                })}
                {selectedBCs.length > 5 && (
                  <div className={cn('text-xs text-center py-2', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                    ... et {selectedBCs.length - 5} autre{(selectedBCs.length - 5) > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions disponibles */}
          <div className="space-y-3">
            <h3 className={cn('text-sm font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
              Sélectionner une action
            </h3>

            {/* Valider en lot */}
            <Card
              className={cn(
                'cursor-pointer transition-all',
                selectedAction === 'validate' && 'ring-2 ring-green-400',
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
              )}
              onClick={() => setSelectedAction('validate')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    selectedAction === 'validate' 
                      ? darkMode ? 'bg-green-500/30' : 'bg-green-100'
                      : darkMode ? 'bg-slate-700/50' : 'bg-gray-200'
                  )}>
                    <CheckCircle className={cn(
                      'w-5 h-5',
                      selectedAction === 'validate' 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-slate-400' : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      Valider en lot
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      Valider tous les BCs sélectionnés ({stats.canValidate} validable{stats.canValidate > 1 ? 's' : ''})
                    </div>
                  </div>
                  <Badge variant={stats.canValidate > 0 ? 'success' : 'default'} className="text-xs">
                    {stats.canValidate}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Rejeter en lot */}
            <Card
              className={cn(
                'cursor-pointer transition-all',
                selectedAction === 'reject' && 'ring-2 ring-red-400',
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
              )}
              onClick={() => setSelectedAction('reject')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    selectedAction === 'reject' 
                      ? darkMode ? 'bg-red-500/30' : 'bg-red-100'
                      : darkMode ? 'bg-slate-700/50' : 'bg-gray-200'
                  )}>
                    <XCircle className={cn(
                      'w-5 h-5',
                      selectedAction === 'reject' 
                        ? darkMode ? 'text-red-400' : 'text-red-600'
                        : darkMode ? 'text-slate-400' : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      Rejeter en lot
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      Rejeter tous les BCs avec un motif unifié
                    </div>
                  </div>
                </div>
                {selectedAction === 'reject' && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <label className={cn('text-xs block mb-2', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                      Motif de rejet (obligatoire)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Motif unifié pour tous les BCs..."
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm resize-none',
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      )}
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demander complément en lot */}
            <Card
              className={cn(
                'cursor-pointer transition-all',
                selectedAction === 'request_complement' && 'ring-2 ring-amber-400',
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
              )}
              onClick={() => setSelectedAction('request_complement')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    selectedAction === 'request_complement' 
                      ? darkMode ? 'bg-amber-500/30' : 'bg-amber-100'
                      : darkMode ? 'bg-slate-700/50' : 'bg-gray-200'
                  )}>
                    <Send className={cn(
                      'w-5 h-5',
                      selectedAction === 'request_complement' 
                        ? darkMode ? 'text-amber-400' : 'text-amber-600'
                        : darkMode ? 'text-slate-400' : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      Demander complément en lot
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      Envoyer une demande de complément à tous les BCs
                    </div>
                  </div>
                </div>
                {selectedAction === 'request_complement' && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <label className={cn('text-xs block mb-2', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                      Message (obligatoire)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Message unifié pour tous les BCs..."
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm resize-none',
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      )}
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exporter en lot */}
            <Card
              className={cn(
                'cursor-pointer transition-all',
                selectedAction === 'export' && 'ring-2 ring-blue-400',
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
              )}
              onClick={() => setSelectedAction('export')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    selectedAction === 'export' 
                      ? darkMode ? 'bg-blue-500/30' : 'bg-blue-100'
                      : darkMode ? 'bg-slate-700/50' : 'bg-gray-200'
                  )}>
                    <FileDown className={cn(
                      'w-5 h-5',
                      selectedAction === 'export' 
                        ? darkMode ? 'text-blue-400' : 'text-blue-600'
                        : darkMode ? 'text-slate-400' : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      Exporter en lot
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      Exporter tous les BCs sélectionnés en Excel ou PDF
                    </div>
                  </div>
                </div>
                {selectedAction === 'export' && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={exportFormat === 'excel' ? 'default' : 'ghost'}
                        onClick={() => setExportFormat('excel')}
                      >
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant={exportFormat === 'pdf' ? 'default' : 'ghost'}
                        onClick={() => setExportFormat('pdf')}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assigner en lot */}
            <Card
              className={cn(
                'cursor-pointer transition-all',
                selectedAction === 'assign' && 'ring-2 ring-purple-400',
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
              )}
              onClick={() => setSelectedAction('assign')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    selectedAction === 'assign' 
                      ? darkMode ? 'bg-purple-500/30' : 'bg-purple-100'
                      : darkMode ? 'bg-slate-700/50' : 'bg-gray-200'
                  )}>
                    <User className={cn(
                      'w-5 h-5',
                      selectedAction === 'assign' 
                        ? darkMode ? 'text-purple-400' : 'text-purple-600'
                        : darkMode ? 'text-slate-400' : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className={cn('font-semibold', darkMode ? 'text-white' : 'text-gray-900')}>
                      Assigner en lot
                    </div>
                    <div className={cn('text-xs mt-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      Assigner tous les BCs à un validateur spécifique
                    </div>
                  </div>
                </div>
                {selectedAction === 'assign' && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <label className={cn('text-xs block mb-2', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                      Validateur (obligatoire)
                    </label>
                    <select
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg text-sm',
                        darkMode 
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      )}
                    >
                      <option value="">Sélectionner un validateur</option>
                      <option value="BMO-001">A. DIALLO (Directeur Général)</option>
                      <option value="BMO-002">M. FALL (Président)</option>
                      <option value="BMO-003">J. NDIAYE (BMO - Responsable Achat)</option>
                      <option value="BMO-004">S. TOURE (BMO - Responsable Finance)</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Prévisualisation de l'action */}
          {selectedAction && (
            <Card className={cn(
              darkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={cn('w-5 h-5 mt-0.5', darkMode ? 'text-blue-400' : 'text-blue-600')} />
                  <div className="flex-1">
                    <div className={cn('font-semibold mb-1', darkMode ? 'text-white' : 'text-gray-900')}>
                      Aperçu de l'action
                    </div>
                    <div className={cn('text-sm', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                      {selectedAction === 'validate' && (
                        <>Cette action va <strong>valider {stats.canValidate} BC(s)</strong> en lot. Les autres BCs seront ignorés.</>
                      )}
                      {selectedAction === 'reject' && (
                        <>Cette action va <strong>rejeter {selectedBCIds.length} BC(s)</strong> avec le motif: "{reason || '(vide)'}"</>
                      )}
                      {selectedAction === 'request_complement' && (
                        <>Cette action va <strong>envoyer une demande de complément</strong> pour {selectedBCIds.length} BC(s).</>
                      )}
                      {selectedAction === 'export' && (
                        <>Cette action va <strong>exporter {selectedBCIds.length} BC(s)</strong> au format {exportFormat.toUpperCase()}.</>
                      )}
                      {selectedAction === 'assign' && (
                        <>Cette action va <strong>assigner {selectedBCIds.length} BC(s)</strong> à {assignee || '(non sélectionné)'}.</>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t flex items-center justify-between',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
        )}>
          <div className="text-xs text-slate-400">
            {selectedBCIds.length} BC{selectedBCIds.length > 1 ? 's' : ''} sélectionné{selectedBCIds.length > 1 ? 's' : ''} • Total: {stats.totalAmount.toLocaleString('fr-FR')} FCFA
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
              Annuler
            </Button>
            <Button
              variant={selectedAction === 'validate' ? 'success' : selectedAction === 'reject' ? 'destructive' : 'default'}
              size="sm"
              onClick={handleExecute}
              disabled={!selectedAction || isProcessing || 
                (selectedAction === 'reject' && !reason.trim()) ||
                (selectedAction === 'request_complement' && !message.trim()) ||
                (selectedAction === 'assign' && !assignee.trim())}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {selectedAction === 'validate' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {selectedAction === 'reject' && <XCircle className="w-4 h-4 mr-2" />}
                  {selectedAction === 'request_complement' && <Send className="w-4 h-4 mr-2" />}
                  {selectedAction === 'export' && <FileDown className="w-4 h-4 mr-2" />}
                  {selectedAction === 'assign' && <User className="w-4 h-4 mr-2" />}
                  Exécuter
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

