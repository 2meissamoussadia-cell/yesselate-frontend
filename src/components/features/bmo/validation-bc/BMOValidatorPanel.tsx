'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, 
  DollarSign, FileText, Shield, Lightbulb, ArrowRight 
} from 'lucide-react';
import type { PurchaseOrder, Invoice, Amendment } from '@/lib/types/bmo.types';
import type { EnrichedBC, EnrichedFacture, EnrichedAvenant } from '@/lib/types/document-validation.types';
import { 
  analyzeBCForBMO, 
  analyzeFactureForBMO, 
  analyzeAvenantForBMO,
  generateBMODecisionRecommendation 
} from '@/lib/utils/validation-logic';

interface BMOValidatorPanelProps {
  context: 'bc' | 'facture' | 'avenant';
  item: PurchaseOrder | Invoice | Amendment | EnrichedBC | EnrichedFacture | EnrichedAvenant;
  onAction?: (action: string) => void;
}

export function BMOValidatorPanel({ context, item, onAction }: BMOValidatorPanelProps) {
  const { darkMode } = useAppStore();

  // Convertir EnrichedBC/EnrichedFacture/EnrichedAvenant en types standards si nécessaire
  const standardItem = useMemo(() => {
    if (context === 'bc') {
      const enriched = item as EnrichedBC;
      // Convertir EnrichedBC en PurchaseOrder format
      const montantTTC = enriched.montantTTC ?? enriched.montantHT ?? 0;
      return {
        id: enriched.id,
        subject: enriched.objet || 'BC sans objet',
        supplier: enriched.fournisseur || 'Fournisseur non spécifié',
        project: enriched.projet || 'Projet non spécifié',
        amount: montantTTC.toString(),
        priority: 'normal' as const,
        bureau: enriched.bureauEmetteur || 'BMO',
        status: enriched.status === 'validated' ? 'validated' : enriched.status === 'rejected' ? 'rejected' : 'pending',
        requestedBy: enriched.demandeur?.nom || 'N/A',
        date: enriched.dateEmission || new Date().toISOString().split('T')[0],
        dateLimit: enriched.dateLimite || new Date().toISOString().split('T')[0],
      } as PurchaseOrder;
    } else if (context === 'facture') {
      const enriched = item as EnrichedFacture;
      const montantTTC = enriched.montantTTC ?? enriched.montantHT ?? 0;
      return {
        id: enriched.id,
        supplier: enriched.fournisseur || 'Fournisseur non spécifié',
        project: enriched.projet || 'Projet non spécifié',
        montant: montantTTC,
        dateFacture: enriched.dateEmission || new Date().toISOString().split('T')[0],
        dateEcheance: enriched.dateLimite || new Date().toISOString().split('T')[0],
        status: enriched.status === 'validated' ? 'validated' : enriched.status === 'rejected' ? 'rejected' : 'pending',
      } as unknown as Invoice;
    } else {
      const enriched = item as EnrichedAvenant;
      return {
        id: enriched.id,
        project: enriched.projet || 'Projet non spécifié',
        motif: enriched.motif || 'Motif non spécifié',
        impactFinancier: enriched.impactFinancier ?? 0,
        impactDelai: enriched.impactDelai ?? 0,
        status: enriched.status === 'validated' ? 'validated' : enriched.status === 'rejected' ? 'rejected' : 'pending',
      } as unknown as Amendment;
    }
  }, [context, item]);

  // Analyser l'item selon son contexte
  const analysis = useMemo(() => {
    if (context === 'bc') {
      return analyzeBCForBMO(standardItem as PurchaseOrder);
    } else if (context === 'facture') {
      return analyzeFactureForBMO(standardItem as Invoice);
    } else {
      return analyzeAvenantForBMO(standardItem as Amendment);
    }
  }, [context, standardItem]);

  // Générer recommandation
  const recommendation = useMemo(() => {
    return generateBMODecisionRecommendation(context, analysis, standardItem);
  }, [context, analysis, standardItem]);

  // Labels selon le contexte
  const labels = {
    bc: {
      title: 'Analyse BMO - Bon de Commande',
      originBureau: 'Bureau Achat et Approvisionnement (BA)',
      whyTitle: 'Pourquoi ce BC arrive au BMO ?',
      whatTitle: 'Ce que le BMO doit vérifier',
      expectedTitle: 'Ce que le BMO attend',
    },
    facture: {
      title: 'Analyse BMO - Facture',
      originBureau: 'Bureau Finance (BF)',
      whyTitle: 'Pourquoi cette facture arrive au BMO ?',
      whatTitle: 'Ce que le BMO doit vérifier',
      expectedTitle: 'Ce que le BMO attend',
    },
    avenant: {
      title: 'Analyse BMO - Avenant',
      originBureau: 'Bureau Juridique (BJ)',
      whyTitle: 'Pourquoi cet avenant arrive au BMO ?',
      whatTitle: 'Ce que le BMO doit vérifier',
      expectedTitle: 'Ce que le BMO attend',
    },
  };

  const label = labels[context];

  return (
    <div className="space-y-4">
      {/* En-tête avec origine */}
      <Card className="border-blue-500/30 bg-blue-500/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            {label.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Origine:</span>
            <Badge variant="info" className="text-xs">{label.originBureau}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pourquoi arrive au BMO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            {label.whyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.escalationReasons.length > 0 ? (
            <div className="space-y-2">
              {analysis.escalationReasons.map((reason, idx) => {
                const reasonLabels: Record<string, string> = {
                  // BC
                  montant_eleve: 'Montant supérieur au seuil du bureau',
                  decision_strategique: 'Décision stratégique requise',
                  fournisseur_non_habituel: 'Fournisseur non référencé',
                  urgence_non_justifiee: 'Urgence non justifiée',
                  // Facture
                  echeance_imminente: 'Échéance imminente ou dépassée',
                  facture_non_conforme: 'Facture non conforme (documents manquants)',
                  discrepancy_montant: 'Discrepance entre BC et facture',
                  // Avenant
                  impact_financier_eleve: 'Impact financier significatif',
                  impact_delai: 'Impact sur les délais',
                  impact_technique: 'Impact technique majeur',
                };
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                    <span>{reasonLabels[reason] || reason}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Aucune raison d'escalade détectée</p>
          )}
        </CardContent>
      </Card>

      {/* Vérifications BMO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {label.whatTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.bmoChecks.length > 0 ? (
            <div className="space-y-3">
              {analysis.bmoChecks.map((check) => (
                <div
                  key={check.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    check.status === 'passed' ? 'border-emerald-500/30 bg-emerald-500/10' :
                    check.status === 'failed' ? 'border-red-500/30 bg-red-500/10' :
                    check.status === 'warning' ? 'border-orange-500/30 bg-orange-500/10' :
                    'border-slate-700/30 bg-slate-800/30'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{check.label}</span>
                        <Badge
                          variant={
                            check.status === 'passed' ? 'success' :
                            check.status === 'failed' ? 'urgent' :
                            check.status === 'warning' ? 'warning' :
                            'default'
                          }
                          className="text-[10px]"
                        >
                          {check.status === 'passed' ? '✓ OK' :
                           check.status === 'failed' ? '✕ Échec' :
                           check.status === 'warning' ? '⚠ Avertissement' :
                           '⏳ En attente'}
                        </Badge>
                        {check.automated && (
                          <Badge variant="info" className="text-[10px]">Auto</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{check.description}</p>
                      {check.details && (
                        <p className="text-xs text-slate-500 italic">{check.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Aucune vérification requise</p>
          )}
        </CardContent>
      </Card>

      {/* Recommandation de décision */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Recommandation de décision BMO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge
              variant={
                analysis.riskLevel === 'critical' ? 'urgent' :
                analysis.riskLevel === 'high' ? 'warning' :
                analysis.riskLevel === 'medium' ? 'info' :
                'success'
              }
              className="text-xs"
            >
              Risque: {analysis.riskLevel}
            </Badge>
            {analysis.automatedDecision && (
              <Badge variant="info" className="text-xs">
                Décision auto: {analysis.automatedDecision}
              </Badge>
            )}
          </div>
          
          {recommendation.recommendation && (
            <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-800/50' : 'bg-gray-100')}>
              <p className="text-sm">{recommendation.recommendation}</p>
            </div>
          )}

          {recommendation.actions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400">Actions suggérées:</p>
              {recommendation.actions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="secondary"
                  className="w-full justify-start text-xs"
                  onClick={() => onAction?.(action)}
                >
                  <ArrowRight className="w-3 h-3 mr-2" />
                  {action}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Niveau de risque global */}
      <Card className={cn(
        analysis.riskLevel === 'critical' ? 'border-red-500/50 bg-red-500/10' :
        analysis.riskLevel === 'high' ? 'border-orange-500/50 bg-orange-500/10' :
        analysis.riskLevel === 'medium' ? 'border-yellow-500/50 bg-yellow-500/10' :
        'border-emerald-500/50 bg-emerald-500/10'
      )}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className={cn(
                'w-5 h-5',
                analysis.riskLevel === 'critical' ? 'text-red-400' :
                analysis.riskLevel === 'high' ? 'text-orange-400' :
                analysis.riskLevel === 'medium' ? 'text-yellow-400' :
                'text-emerald-400'
              )} />
              <span className="text-sm font-semibold">
                Niveau de risque: {analysis.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

