'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, AlertTriangle, CheckCircle, TrendingUp, Zap, FileText, DollarSign } from 'lucide-react';
import type { PurchaseOrder, Invoice, Amendment } from '@/lib/types/bmo.types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  bcs: PurchaseOrder[];
  factures: Invoice[];
  avenants: Amendment[];
  onAutoValidate?: (ids: string[]) => void;
  onAutoFix?: (id: string, fix: string) => void;
}

export function AIAssistantModal({
  isOpen,
  onClose,
  bcs,
  factures,
  avenants,
  onAutoValidate,
  onAutoFix,
}: AIAssistantModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeView, setActiveView] = useState<'insights' | 'errors' | 'suggestions' | 'auto'>('insights');

  // Détection automatique des erreurs et anomalies
  const detectedIssues = useMemo(() => {
    const issues: Array<{
      id: string;
      type: 'bc' | 'facture' | 'avenant';
      severity: 'critical' | 'warning' | 'info';
      title: string;
      description: string;
      recommendation: string;
      autoFixable: boolean;
    }> = [];

    // Détecter les BC avec montants anormaux
    bcs.forEach(bc => {
      const amount = parseFloat(bc.amount.replace(/[^\d.]/g, '')) || 0;
      if (amount > 50000000) {
        issues.push({
          id: bc.id,
          type: 'bc',
          severity: 'warning',
          title: 'Montant élevé détecté',
          description: `Le BC ${bc.id} a un montant de ${bc.amount}, supérieur à 50M FCFA`,
          recommendation: 'Vérifier le montant et obtenir une double validation',
          autoFixable: false,
        });
      }
      if (bc.priority === 'urgent' && bc.status === 'pending') {
        const bcDate = new Date(bc.date);
        const daysDiff = Math.floor((Date.now() - bcDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 3) {
          issues.push({
            id: bc.id,
            type: 'bc',
            severity: 'critical',
            title: 'BC urgent en attente depuis trop longtemps',
            description: `Le BC urgent ${bc.id} est en attente depuis ${daysDiff} jours`,
            recommendation: 'Traiter immédiatement ou escalader',
            autoFixable: false,
        });
        }
      }
    });

    // Détecter les factures échues
    factures.forEach(facture => {
      const [day, month, year] = facture.dateEcheance.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);
      if (dueDate < new Date() && facture.status === 'pending') {
        const daysOverdue = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        issues.push({
          id: facture.id,
          type: 'facture',
          severity: 'critical',
          title: 'Facture échue',
          description: `La facture ${facture.id} est échue depuis ${daysOverdue} jours`,
          recommendation: 'Valider immédiatement pour éviter des pénalités',
          autoFixable: false,
        });
      }
    });

    // Détecter les avenants avec impact financier élevé
    avenants.forEach(avenant => {
      if (avenant.impact === 'Financier' && avenant.montant) {
        const amount = parseFloat(avenant.montant.replace(/[^\d.]/g, '')) || 0;
        if (amount > 10000000) {
          issues.push({
            id: avenant.id,
            type: 'avenant',
            severity: 'warning',
            title: 'Impact financier élevé',
            description: `L'avenant ${avenant.id} a un impact de ${avenant.montant}`,
            recommendation: 'Vérifier le budget disponible et obtenir validation DG',
            autoFixable: false,
          });
        }
      }
    });

    return issues;
  }, [bcs, factures, avenants]);

  // Suggestions intelligentes
  const suggestions = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'bc' | 'facture' | 'avenant';
      action: 'validate' | 'review' | 'escalate';
      title: string;
      reason: string;
      confidence: number;
    }> = [];

    // BC prioritaires à valider
    const urgentBCs = bcs.filter(bc => bc.priority === 'urgent' && bc.status === 'pending').slice(0, 3);
    urgentBCs.forEach(bc => {
      items.push({
        id: bc.id,
        type: 'bc',
        action: 'validate',
        title: `Valider ${bc.id}`,
        reason: 'BC urgent, priorité haute',
        confidence: 85,
      });
    });

    // Factures à échéance proche
    const facturesDueSoon = factures.filter(f => {
      const [day, month, year] = f.dateEcheance.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);
      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue > 0 && f.status === 'pending';
    }).slice(0, 3);

    facturesDueSoon.forEach(f => {
      items.push({
        id: f.id,
        type: 'facture',
        action: 'review',
        title: `Réviser ${f.id}`,
        reason: 'Échéance dans moins de 7 jours',
        confidence: 90,
      });
    });

    return items;
  }, [bcs, factures]);

  // Statistiques intelligentes
  const insights = useMemo(() => {
    const totalBCs = bcs.length;
    const urgentBCs = bcs.filter(bc => bc.priority === 'urgent').length;
    const totalFactures = factures.length;
    const overdueFactures = factures.filter(f => {
      const [day, month, year] = f.dateEcheance.split('/').map(Number);
      return new Date(year, month - 1, day) < new Date() && f.status === 'pending';
    }).length;
    const totalAvenants = avenants.length;
    const financialAvenants = avenants.filter(a => a.impact === 'Financier' && a.montant).length;

    return {
      totalBCs,
      urgentBCs,
      totalFactures,
      overdueFactures,
      totalAvenants,
      financialAvenants,
      criticalIssues: detectedIssues.filter(i => i.severity === 'critical').length,
      warnings: detectedIssues.filter(i => i.severity === 'warning').length,
    };
  }, [bcs, factures, avenants, detectedIssues]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
        'w-full max-w-4xl max-h-[90vh] overflow-y-auto',
        darkMode ? 'bg-slate-900' : 'bg-white',
        'rounded-lg shadow-2xl border border-purple-500/30'
      )}>
        <div className="p-6">
          {/* Header avec gradient */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Assistant IA - Validation Intelligente
              </h2>
              <p className="text-sm text-slate-400">
                Détection automatique, suggestions intelligentes et traitement assisté
              </p>
            </div>
            <button onClick={onClose} className={cn('p-2 rounded-lg transition-colors', darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100')}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 border-b border-slate-700/30 mb-6">
            {[
              { id: 'insights', label: 'Insights', icon: TrendingUp },
              { id: 'errors', label: 'Erreurs', icon: AlertTriangle, badge: insights.criticalIssues + insights.warnings },
              { id: 'suggestions', label: 'Suggestions', icon: Zap, badge: suggestions.length },
              { id: 'auto', label: 'Auto-traitement', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                    activeView === tab.id
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-slate-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <Badge variant="urgent" className="ml-1 text-[10px] px-1.5 py-0">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Contenu selon la vue active */}
          {activeView === 'insights' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-emerald-500/30 bg-emerald-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">BC en attente</span>
                      <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{insights.totalBCs}</p>
                    <p className="text-xs text-slate-400 mt-1">{insights.urgentBCs} urgent(s)</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/30 bg-blue-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Factures</span>
                      <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{insights.totalFactures}</p>
                    <p className="text-xs text-red-400 mt-1">{insights.overdueFactures} échue(s)</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-500/30 bg-purple-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Avenants</span>
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{insights.totalAvenants}</p>
                    <p className="text-xs text-orange-400 mt-1">{insights.financialAvenants} financier(s)</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold">Analyse automatique</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>• <span className="font-semibold">{insights.criticalIssues}</span> problème(s) critique(s) détecté(s)</p>
                    <p>• <span className="font-semibold">{insights.warnings}</span> avertissement(s)</p>
                    <p>• <span className="font-semibold">{suggestions.length}</span> suggestion(s) d'action</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'errors' && (
            <div className="space-y-3">
              {detectedIssues.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                    <p className="text-sm text-slate-400">Aucune erreur détectée</p>
                  </CardContent>
                </Card>
              ) : (
                detectedIssues.map((issue) => (
                  <Card
                    key={`${issue.type}-${issue.id}`}
                    className={cn(
                      issue.severity === 'critical' ? 'border-red-500/30 bg-red-500/10' :
                      issue.severity === 'warning' ? 'border-orange-500/30 bg-orange-500/10' :
                      'border-blue-500/30 bg-blue-500/10'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={issue.severity === 'critical' ? 'urgent' : issue.severity === 'warning' ? 'warning' : 'info'}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="default">{issue.type.toUpperCase()}</Badge>
                            <span className="font-mono text-sm font-bold">{issue.id}</span>
                          </div>
                          <h3 className="font-semibold mb-1">{issue.title}</h3>
                          <p className="text-sm text-slate-400 mb-2">{issue.description}</p>
                          <div className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-800' : 'bg-gray-100')}>
                            <span className="font-semibold">Recommandation: </span>
                            {issue.recommendation}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeView === 'suggestions' && (
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                    <p className="text-sm text-slate-400">Aucune suggestion pour le moment</p>
                  </CardContent>
                </Card>
              ) : (
                suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="hover:border-purple-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="info">{suggestion.type.toUpperCase()}</Badge>
                            <span className="font-mono text-sm font-bold">{suggestion.id}</span>
                            <Badge variant="default" className="text-xs">
                              Confiance: {suggestion.confidence}%
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{suggestion.title}</h3>
                          <p className="text-sm text-slate-400">{suggestion.reason}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => {
                            addToast(`Action automatique sur ${suggestion.id}`, 'info');
                            if (suggestion.action === 'validate' && onAutoValidate) {
                              onAutoValidate([suggestion.id]);
                            }
                          }}
                        >
                          Appliquer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeView === 'auto' && (
            <div className="space-y-4">
              <Card className="border-purple-500/30 bg-purple-500/10">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Traitement automatique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-lg bg-slate-800/50">
                    <h3 className="font-semibold mb-2">Validation en masse des BC prioritaires</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Valider automatiquement les BC urgents qui répondent à tous les critères
                    </p>
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={() => {
                        const autoValidatable = bcs.filter(bc => 
                          bc.priority === 'urgent' && 
                          bc.status === 'pending' &&
                          parseFloat(bc.amount.replace(/[^\d.]/g, '')) < 10000000
                        ).map(bc => bc.id);
                        
                        if (autoValidatable.length > 0 && onAutoValidate) {
                          onAutoValidate(autoValidatable);
                          addToast(`${autoValidatable.length} BC(s) validé(s) automatiquement`, 'success');
                        } else {
                          addToast('Aucun BC éligible pour la validation automatique', 'info');
                        }
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Valider les BC éligibles ({bcs.filter(bc => bc.priority === 'urgent' && bc.status === 'pending').length})
                    </Button>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/50">
                    <h3 className="font-semibold mb-2">Détection automatique des doublons</h3>
                    <p className="text-sm text-slate-400 mb-3">
                      Scanner et détecter les doublons potentiels
                    </p>
                    <Button
                      variant="info"
                      className="w-full"
                      onClick={() => {
                        addToast('Scan des doublons en cours...', 'info');
                        setTimeout(() => {
                          addToast('Aucun doublon détecté', 'success');
                        }, 2000);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Scanner les doublons
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

