'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, GitCompare, TrendingUp, AlertTriangle, CheckCircle, 
  DollarSign, Building2, FileText, ArrowRight, ArrowLeft,
  Sparkles, User, Calendar, Package
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import type { PurchaseOrder } from '@/lib/types/bmo.types';
import { getStatusBadgeConfig } from '@/lib/utils/status-utils';

interface BCComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBCs: (EnrichedBC | PurchaseOrder)[]; // 2-3 BCs à comparer
  allBCs?: (EnrichedBC | PurchaseOrder)[]; // Tous les BCs pour actions
  onValidateBatch?: (bcIds: string[]) => void;
  onRejectBatch?: (bcIds: string[], reason: string) => void;
}

export function BCComparisonModal({
  isOpen,
  onClose,
  selectedBCs,
  allBCs = [],
  onValidateBatch,
  onRejectBatch,
}: BCComparisonModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeView, setActiveView] = useState<'overview' | 'details' | 'differences'>('overview');

  // Normaliser les BCs pour avoir un format uniforme
  const normalizedBCs = useMemo(() => {
    return selectedBCs.map(bc => {
      if ('montantTTC' in bc) {
        // C'est un EnrichedBC
        const amount = (bc as EnrichedBC).montantTTC || (bc as EnrichedBC).montantHT || 0;
        return {
          id: bc.id,
          subject: (bc as EnrichedBC).objet || 'BC sans objet',
          supplier: (bc as EnrichedBC).fournisseur || 'N/A',
          project: (bc as EnrichedBC).projet || 'N/A',
          amount,
          date: (bc as EnrichedBC).dateEmission || '',
          status: (bc as EnrichedBC).status || 'pending',
          priority: 'normal' as const,
          bureau: (bc as EnrichedBC).bureauEmetteur || 'N/A',
          anomalies: (bc as EnrichedBC).anomalies || [],
          enriched: bc as EnrichedBC,
          raw: bc,
        };
      } else {
        // C'est un PurchaseOrder
        const amount = typeof (bc as PurchaseOrder).amount === 'string'
          ? parseFloat((bc as PurchaseOrder).amount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
          : (bc as PurchaseOrder).amount || 0;
        return {
          id: bc.id,
          subject: (bc as PurchaseOrder).subject || 'BC sans objet',
          supplier: (bc as PurchaseOrder).supplier || 'N/A',
          project: (bc as PurchaseOrder).project || 'N/A',
          amount,
          date: (bc as PurchaseOrder).date || '',
          status: (bc as PurchaseOrder).status || 'pending',
          priority: (bc as PurchaseOrder).priority || 'normal',
          bureau: (bc as PurchaseOrder).bureau || 'N/A',
          anomalies: [],
          enriched: null,
          raw: bc,
        };
      }
    });
  }, [selectedBCs]);

  // Calculer les différences
  const differences = useMemo(() => {
    if (normalizedBCs.length < 2) return [];

    const diffs: Array<{
      field: string;
      label: string;
      values: { bcId: string; value: string | number; formatted: string }[];
      type: 'amount' | 'text' | 'status' | 'count';
      highlight: boolean;
    }> = [];

    // Comparer montants
    const amounts = normalizedBCs.map(bc => Number(bc.amount));
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const amountDiff = ((maxAmount - minAmount) / minAmount) * 100;

    if (amountDiff > 5) { // Plus de 5% de différence
      diffs.push({
        field: 'amount',
        label: 'Montant',
        values: normalizedBCs.map(bc => ({
          bcId: bc.id,
          value: bc.amount,
          formatted: `${bc.amount.toLocaleString('fr-FR')} FCFA`,
        })),
        type: 'amount',
        highlight: true,
      });
    }

    // Comparer fournisseurs
    const suppliers = normalizedBCs.map(bc => bc.supplier);
    const uniqueSuppliers = [...new Set(suppliers)];
    if (uniqueSuppliers.length > 1) {
      diffs.push({
        field: 'supplier',
        label: 'Fournisseur',
        values: normalizedBCs.map(bc => ({
          bcId: bc.id,
          value: bc.supplier,
          formatted: bc.supplier,
        })),
        type: 'text',
        highlight: true,
      });
    }

    // Comparer projets
    const projects = normalizedBCs.map(bc => bc.project);
    const uniqueProjects = [...new Set(projects)];
    if (uniqueProjects.length > 1) {
      diffs.push({
        field: 'project',
        label: 'Projet',
        values: normalizedBCs.map(bc => ({
          bcId: bc.id,
          value: bc.project,
          formatted: bc.project,
        })),
        type: 'text',
        highlight: false,
      });
    }

    // Comparer statuts
    const statuses = normalizedBCs.map(bc => bc.status);
    const uniqueStatuses = [...new Set(statuses)];
    if (uniqueStatuses.length > 1) {
      diffs.push({
        field: 'status',
        label: 'Statut',
        values: normalizedBCs.map(bc => {
          const config = getStatusBadgeConfig(bc.status);
          return {
            bcId: bc.id,
            value: bc.status,
            formatted: config.label,
          };
        }),
        type: 'status',
        highlight: false,
      });
    }

    // Comparer anomalies
    const anomaliesCounts = normalizedBCs.map(bc => bc.anomalies.length);
    const maxAnomalies = Math.max(...anomaliesCounts);
    const minAnomalies = Math.min(...anomaliesCounts);
    if (maxAnomalies !== minAnomalies) {
      diffs.push({
        field: 'anomalies',
        label: 'Anomalies',
        values: normalizedBCs.map(bc => ({
          bcId: bc.id,
          value: bc.anomalies.length,
          formatted: `${bc.anomalies.length} anomalie${bc.anomalies.length > 1 ? 's' : ''}`,
        })),
        type: 'count',
        highlight: maxAnomalies > 0,
      });
    }

    return diffs;
  }, [normalizedBCs]);

  // Statistiques de similarité
  const similarityStats = useMemo(() => {
    if (normalizedBCs.length < 2) return null;

    const sameSupplier = new Set(normalizedBCs.map(bc => bc.supplier)).size === 1;
    const sameProject = new Set(normalizedBCs.map(bc => bc.project)).size === 1;
    const amounts = normalizedBCs.map(bc => Number(bc.amount));
    const amountDiff = (Math.max(...amounts) - Math.min(...amounts)) / Math.min(...amounts);
    const similarAmount = amountDiff <= 0.2; // ±20%

    let score = 0;
    if (sameSupplier) score += 40;
    if (sameProject) score += 30;
    if (similarAmount) score += 30;

    return {
      score,
      sameSupplier,
      sameProject,
      similarAmount,
      recommendation: score >= 70 ? 'highly_similar' : score >= 50 ? 'similar' : 'different',
    };
  }, [normalizedBCs]);

  if (!isOpen || normalizedBCs.length < 2) return null;

  const totalAmount = normalizedBCs.reduce((sum, bc) => sum + Number(bc.amount), 0);
  const hasSameSupplier = similarityStats?.sameSupplier;
  const hasSameProject = similarityStats?.sameProject;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-7xl max-h-[90vh] z-50',
        'rounded-xl shadow-2xl overflow-hidden',
        darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'
      )}>
        {/* Header */}
        <div className={cn(
          'p-6 border-b',
          darkMode ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-slate-700' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-gray-200'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                )}>
                  <GitCompare className={cn('w-6 h-6', darkMode ? 'text-blue-400' : 'text-blue-600')} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Comparaison de {normalizedBCs.length} BC{normalizedBCs.length > 1 ? 's' : ''}</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Total : {totalAmount.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
              {similarityStats && (
                <div className="flex gap-2 mt-3">
                  <Badge variant={similarityStats.score >= 70 ? 'success' : similarityStats.score >= 50 ? 'warning' : 'default'} className="text-xs">
                    Score de similarité : {similarityStats.score}%
                  </Badge>
                  {hasSameSupplier && (
                    <Badge variant="info" className="text-xs">Même fournisseur</Badge>
                  )}
                  {hasSameProject && (
                    <Badge variant="info" className="text-xs">Même projet</Badge>
                  )}
                </div>
              )}
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

          {/* Navigation */}
          <div className="flex gap-2 mt-4">
            {(['overview', 'details', 'differences'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeView === view
                    ? darkMode
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                    : darkMode
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-gray-100 text-gray-700'
                )}
              >
                {view === 'overview' && 'Vue d\'ensemble'}
                {view === 'details' && 'Détails'}
                {view === 'differences' && `Différences (${differences.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
          {activeView === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              {normalizedBCs.map((bc, idx) => (
                <Card key={bc.id} className={cn(
                  'transition-all',
                  darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="info" className="font-mono mb-2">{bc.id}</Badge>
                        <CardTitle className="text-base line-clamp-2">{bc.subject}</CardTitle>
                      </div>
                      {(() => {
                        const config = getStatusBadgeConfig(bc.status);
                        return <Badge variant={config.variant}>{config.label}</Badge>;
                      })()}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          Fournisseur
                        </div>
                        <div className={cn('font-semibold mt-1', darkMode ? 'text-white' : 'text-gray-900')}>
                          {bc.supplier}
                        </div>
                      </div>
                      <div>
                        <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          Projet
                        </div>
                        <div className={cn('font-semibold mt-1', darkMode ? 'text-orange-400' : 'text-orange-600')}>
                          {bc.project}
                        </div>
                      </div>
                      <div>
                        <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          Montant
                        </div>
                        <div className={cn('font-bold mt-1 text-amber-400', darkMode ? 'text-amber-400' : 'text-amber-600')}>
                          {bc.amount.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                      <div>
                        <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          Anomalies
                        </div>
                        <div className="mt-1">
                          {bc.anomalies.length > 0 ? (
                            <Badge variant="urgent" className="text-xs">
                              {bc.anomalies.length}
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-xs">Aucune</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeView === 'details' && (
            <div className="space-y-4">
              <div className={cn(
                'overflow-x-auto rounded-lg border',
                darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-white'
              )}>
                <table className="w-full text-sm">
                  <thead className={cn(
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                  )}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Critère</th>
                      {normalizedBCs.map((bc) => (
                        <th key={bc.id} className="px-4 py-3 text-left font-semibold">
                          {bc.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={cn('border-t', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                      <td className={cn('px-4 py-3', darkMode ? 'text-slate-300' : 'text-gray-700')}>Objet</td>
                      {normalizedBCs.map((bc) => (
                        <td key={bc.id} className={cn('px-4 py-3', darkMode ? 'text-white' : 'text-gray-900')}>
                          {bc.subject}
                        </td>
                      ))}
                    </tr>
                    <tr className={cn('border-t', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                      <td className={cn('px-4 py-3', darkMode ? 'text-slate-300' : 'text-gray-700')}>Fournisseur</td>
                      {normalizedBCs.map((bc) => (
                        <td key={bc.id} className={cn('px-4 py-3', darkMode ? 'text-white' : 'text-gray-900')}>
                          {bc.supplier}
                        </td>
                      ))}
                    </tr>
                    <tr className={cn('border-t', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                      <td className={cn('px-4 py-3', darkMode ? 'text-slate-300' : 'text-gray-700')}>Projet</td>
                      {normalizedBCs.map((bc) => (
                        <td key={bc.id} className={cn('px-4 py-3 font-mono text-orange-400', darkMode ? 'text-orange-400' : 'text-orange-600')}>
                          {bc.project}
                        </td>
                      ))}
                    </tr>
                    <tr className={cn('border-t', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                      <td className={cn('px-4 py-3', darkMode ? 'text-slate-300' : 'text-gray-700')}>Montant</td>
                      {normalizedBCs.map((bc) => (
                        <td key={bc.id} className={cn('px-4 py-3 font-bold text-amber-400', darkMode ? 'text-amber-400' : 'text-amber-600')}>
                          {bc.amount.toLocaleString('fr-FR')} FCFA
                        </td>
                      ))}
                    </tr>
                    <tr className={cn('border-t', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                      <td className={cn('px-4 py-3', darkMode ? 'text-slate-300' : 'text-gray-700')}>Date</td>
                      {normalizedBCs.map((bc) => (
                        <td key={bc.id} className={cn('px-4 py-3', darkMode ? 'text-white' : 'text-gray-900')}>
                          {bc.date || '—'}
                        </td>
                      ))}
                    </tr>
                    <tr className={cn('border-t', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                      <td className={cn('px-4 py-3', darkMode ? 'text-slate-300' : 'text-gray-700')}>Bureau</td>
                      {normalizedBCs.map((bc) => (
                        <td key={bc.id} className={cn('px-4 py-3', darkMode ? 'text-white' : 'text-gray-900')}>
                          {bc.bureau}
                        </td>
                      ))}
                    </tr>
                    <tr className={cn('border-t', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                      <td className={cn('px-4 py-3', darkMode ? 'text-slate-300' : 'text-gray-700')}>Anomalies</td>
                      {normalizedBCs.map((bc) => (
                        <td key={bc.id} className="px-4 py-3">
                          {bc.anomalies.length > 0 ? (
                            <Badge variant="urgent" className="text-xs">
                              {bc.anomalies.length}
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-xs">Aucune</Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'differences' && (
            <div className="space-y-4">
              {differences.length === 0 ? (
                <div className={cn(
                  'text-center py-12',
                  darkMode ? 'text-slate-400' : 'text-gray-500'
                )}>
                  <CheckCircle className={cn('w-12 h-12 mx-auto mb-3', darkMode ? 'text-slate-600' : 'text-gray-400')} />
                  <p className="text-sm">Aucune différence significative détectée entre ces BCs.</p>
                </div>
              ) : (
                differences.map((diff, idx) => (
                  <Card
                    key={idx}
                    className={cn(
                      diff.highlight && 'border-orange-500/50 bg-orange-500/5'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {diff.highlight && <AlertTriangle className="w-4 h-4 text-orange-400" />}
                        {diff.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {diff.values.map((val) => (
                          <div key={val.bcId} className={cn(
                            'p-3 rounded-lg',
                            darkMode ? 'bg-slate-800/50' : 'bg-gray-50'
                          )}>
                            <div className={cn('text-xs mb-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                              {val.bcId}
                            </div>
                            <div className={cn(
                              'font-semibold',
                              diff.type === 'amount' && 'text-amber-400',
                              darkMode ? 'text-white' : 'text-gray-900'
                            )}>
                              {val.formatted}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className={cn(
          'p-4 border-t flex items-center justify-between',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
        )}>
          <div className="text-xs text-slate-400">
            {normalizedBCs.length} BC{normalizedBCs.length > 1 ? 's' : ''} sélectionné{normalizedBCs.length > 1 ? 's' : ''} • Total : {totalAmount.toLocaleString('fr-FR')} FCFA
          </div>
          <div className="flex gap-2">
            {similarityStats && similarityStats.score >= 70 && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  if (onValidateBatch) {
                    onValidateBatch(normalizedBCs.map(bc => bc.id));
                    addToast(`${normalizedBCs.length} BC(s) validé(s) en lot`, 'success');
                    onClose();
                  }
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Valider tout ({normalizedBCs.length})
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

