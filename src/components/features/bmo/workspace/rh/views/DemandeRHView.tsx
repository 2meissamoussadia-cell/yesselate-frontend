'use client';

import { useState, useMemo, useEffect } from 'react';
import { type RHTab } from '@/lib/stores/rhWorkspaceStore';
import { demandesRH } from '@/lib/data/bmo-mock-2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { 
  FileText, Calendar, DollarSign, MapPin, Paperclip, 
  CheckCircle2, XCircle, Clock, AlertTriangle, User,
  Shield, Hash, Users, TrendingUp, Info, TriangleAlert
} from 'lucide-react';
import {
  validateDemand,
  checkConflicts,
  generateValidationReport,
  getCongeBalance,
  calculateWorkingDays,
  type ValidationResult,
  type ConflictCheck,
  type CongeBalance,
  type WorkingDaysResult,
} from '@/lib/services/rhBusinessService';
import { RHDemandeTimeline } from '../RHDemandeTimeline';
import { RHComments } from '../RHComments';
import { RHDocumentPreview } from '../RHDocumentPreview';
import { RHFavoriteButton } from '../RHFavorites';

const TYPE_ICONS: Record<string, string> = {
  Congé: '🏖️',
  Dépense: '💸',
  Maladie: '🏥',
  Déplacement: '✈️',
  Paie: '💰',
};

const TYPE_COLORS: Record<string, string> = {
  Congé: 'bg-emerald-500/20 border-emerald-500/50',
  Dépense: 'bg-amber-500/20 border-amber-500/50',
  Maladie: 'bg-red-500/20 border-red-500/50',
  Déplacement: 'bg-blue-500/20 border-blue-500/50',
  Paie: 'bg-purple-500/20 border-purple-500/50',
};

export function DemandeRHView({ tab }: { tab: RHTab }) {
  const demandeId = tab.data?.demandeId as string;
  const demande = useMemo(() => demandesRH.find(d => d.id === demandeId), [demandeId]);
  
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | 'info' | 'substitution' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoRequest, setInfoRequest] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États pour les fonctionnalités métier
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [conflicts, setConflicts] = useState<ConflictCheck | null>(null);
  const [balance, setBalance] = useState<CongeBalance | null>(null);
  const [workingDays, setWorkingDays] = useState<WorkingDaysResult | null>(null);
  
  // Calcul automatique des validations à l'ouverture
  useEffect(() => {
    if (demande) {
      const report = generateValidationReport(demande, demandesRH);
      setValidation(report.validation);
      setConflicts(report.conflicts);
      setBalance(report.balance || null);
      setWorkingDays(report.workingDays || null);
    }
  }, [demande]);

  if (!demande) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <div className="text-center text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Demande introuvable</p>
          <p className="text-sm mt-1">La demande {demandeId} n&apos;existe pas ou a été supprimée.</p>
        </div>
      </div>
    );
  }

  const handleAction = async (action: 'approve' | 'reject' | 'info' | 'substitution') => {
    setLoading(true);
    try {
      // Simulation - en production, appeler l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActionModal(null);
      setRejectReason('');
      setInfoRequest('');
    } catch (e) {
      logger.error('Erreur action', e instanceof Error ? e : undefined, { component: 'DemandeRHView' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
      {/* Contenu principal */}
      <div className="space-y-4">
        {/* En-tête */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-xl flex-none">
              {demande.initials}
            </div>
            
            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-xs text-orange-400">{demande.id}</span>
                <Badge variant="info" className={TYPE_COLORS[demande.type]}>
                  {TYPE_ICONS[demande.type]} {demande.type}
                </Badge>
                {demande.subtype && <Badge variant="default">{demande.subtype}</Badge>}
                <BureauTag bureau={demande.bureau} />
                <Badge
                  variant={
                    demande.status === 'validated' ? 'success' :
                    demande.status === 'rejected' ? 'default' :
                    demande.priority === 'urgent' ? 'urgent' :
                    demande.priority === 'high' ? 'warning' : 'info'
                  }
                  pulse={demande.priority === 'urgent' && demande.status === 'pending'}
                >
                  {demande.status === 'validated' ? '✅ Validée' :
                   demande.status === 'rejected' ? '❌ Refusée' :
                   demande.priority}
                </Badge>
                
                {/* Bouton favoris */}
                <RHFavoriteButton demandId={demande.id} size="sm" />
              </div>
              
              <h1 className="text-2xl font-bold mb-1">{demande.agent}</h1>
              <p className="text-sm text-slate-400">
                <User className="w-3.5 h-3.5 inline mr-1" />
                Agent ID: {demande.agentId}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Demande soumise le {demande.date}
              </p>
            </div>
          </div>
        </div>

        {/* Alertes et validations métier */}
        {validation && validation.rules.length > 0 && (
          <Card className={cn(
            validation.rules.some(r => r.type === 'error') ? 'border-red-500/50' :
            validation.rules.some(r => r.type === 'warning') ? 'border-amber-500/50' :
            'border-blue-500/50'
          )}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                Règles de validation métier
              </h2>
              
              <div className="space-y-2">
                {validation.rules.map((rule) => (
                  <div 
                    key={rule.id}
                    className={cn(
                      "p-4 rounded-xl border",
                      rule.type === 'error' && "bg-red-500/10 border-red-500/30",
                      rule.type === 'warning' && "bg-amber-500/10 border-amber-500/30",
                      rule.type === 'info' && "bg-blue-500/10 border-blue-500/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-none mt-0.5">
                        {rule.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                        {rule.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        {rule.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">
                          {rule.code}
                        </div>
                        <div className="text-sm">
                          {rule.message}
                        </div>
                        {rule.details && (
                          <div className="text-xs text-slate-400 mt-1">
                            {rule.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Résumé validation */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className={cn(
                    "p-2 rounded-lg",
                    validation.canApprove ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    <div className="font-semibold">
                      {validation.canApprove ? '✅ Peut être approuvée' : '❌ Bloquée'}
                    </div>
                  </div>
                  
                  {validation.requiresSubstitution && (
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <div className="font-semibold">🔄 Substitution requise</div>
                    </div>
                  )}
                  
                  {validation.requiresDGApproval && (
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <div className="font-semibold">👔 Validation DG</div>
                    </div>
                  )}
                  
                  {validation.requiresManagerApproval && (
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <div className="font-semibold">👤 Validation Manager</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conflits et chevauchements */}
        {conflicts && conflicts.hasConflict && (
          <Card className="border-red-500/50">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TriangleAlert className="w-5 h-5 text-red-500" />
                Conflits détectés ({conflicts.conflicts.length})
              </h2>
              
              <div className="space-y-3">
                {conflicts.conflicts.map((conflict, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-4 rounded-xl border",
                      conflict.severity === 'critical' && "bg-red-500/10 border-red-500/30",
                      conflict.severity === 'high' && "bg-orange-500/10 border-orange-500/30",
                      conflict.severity === 'medium' && "bg-amber-500/10 border-amber-500/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={cn(
                        "w-5 h-5 flex-none mt-0.5",
                        conflict.severity === 'critical' && "text-red-500",
                        conflict.severity === 'high' && "text-orange-500",
                        conflict.severity === 'medium' && "text-amber-500"
                      )} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">
                          {conflict.type === 'same_employee' && 'Chevauchement même employé'}
                          {conflict.type === 'same_team' && 'Conflit équipe'}
                          {conflict.type === 'same_skill' && 'Compétence critique'}
                          {conflict.type === 'bureau_understaffed' && 'Bureau sous-effectif'}
                        </div>
                        <div className="text-sm">
                          {conflict.message}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Période: {conflict.affectedPeriod.start} → {conflict.affectedPeriod.end}
                        </div>
                        {conflict.affectedEmployees && conflict.affectedEmployees.length > 0 && (
                          <div className="text-xs text-slate-400 mt-1">
                            Employés concernés: {conflict.affectedEmployees.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Détails de la demande */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Détails de la demande
            </h2>
            
            <div className="space-y-4">
              {/* Motif */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 font-medium mb-1">MOTIF</div>
                <div className="text-sm">{demande.reason}</div>
              </div>
              
              {/* Informations spécifiques selon le type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {demande.startDate && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">DATE DÉBUT</span>
                    </div>
                    <div className="text-sm font-semibold">{demande.startDate}</div>
                  </div>
                )}
                
                {demande.endDate && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">DATE FIN</span>
                    </div>
                    <div className="text-sm font-semibold">{demande.endDate}</div>
                  </div>
                )}
                
                {demande.days && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">DURÉE</span>
                    </div>
                    <div className="text-sm font-semibold">{demande.days} jours</div>
                  </div>
                )}
                
                {demande.amount && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">MONTANT</span>
                    </div>
                    <div className="text-sm font-semibold font-mono">{demande.amount} FCFA</div>
                  </div>
                )}
                
                {demande.destination && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">DESTINATION</span>
                    </div>
                    <div className="text-sm font-semibold">{demande.destination}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents joints - avec prévisualisation améliorée */}
        {demande.documents && demande.documents.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-orange-500" />
                Documents joints ({demande.documents.length})
              </h2>
              
              <RHDocumentPreview 
                documents={demande.documents.map(doc => ({
                  ...doc,
                  status: 'pending' as const,
                }))}
                onVerify={(docId, verified) => {
                  logger.debug('Document verification', { component: 'DemandeRHView', docId, verified });
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Timeline de la demande */}
        <RHDemandeTimeline demand={demande} />

        {/* Section commentaires */}
        <RHComments demandId={demande.id} />

        {/* Traçabilité validation/refus */}
        {(demande.validatedBy || demande.rejectedBy) && (
          <Card className={cn(
            demande.validatedBy ? "border-emerald-500/50" : "border-red-500/50"
          )}>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                Traçabilité
              </h2>
              
              {demande.validatedBy && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Validée par {demande.validatedBy}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{demande.validatedAt}</p>
                  {demande.validationComment && (
                    <p className="text-sm mt-2 italic">"{demande.validationComment}"</p>
                  )}
                </div>
              )}
              
              {demande.rejectedBy && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      Refusée par {demande.rejectedBy}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{demande.rejectedAt}</p>
                  {demande.rejectionReason && (
                    <p className="text-sm mt-2 italic">Motif: {demande.rejectionReason}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Panneau latéral */}
      <div className="space-y-4">
        {/* Solde de congés */}
        {balance && (demande.type === 'Congé' || demande.type === 'Maladie') && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Solde de congés
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Congés annuels</div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${(balance.annuelRestant / balance.annuelTotal) * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm font-bold">
                      {balance.annuelRestant}/{balance.annuelTotal}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {balance.annuelPris} jours pris
                  </div>
                </div>
                
                {balance.ancienneteTotal > 0 && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Congés ancienneté</div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${(balance.ancienneteRestant / balance.ancienneteTotal) * 100}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm font-bold">
                        {balance.ancienneteRestant}/{balance.ancienneteTotal}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                  Dernière mise à jour: {balance.lastUpdated}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Calcul jours ouvrables */}
        {workingDays && (demande.type === 'Congé' || demande.type === 'Maladie') && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Calcul automatique
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-500/10">
                  <span className="text-slate-600 dark:text-slate-300">Jours ouvrables</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {workingDays.workingDays}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Jours calendaires</span>
                  <span className="font-semibold">{workingDays.totalDays}</span>
                </div>
                
                {workingDays.weekendDays > 0 && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <span className="text-slate-600 dark:text-slate-300">Weekends inclus</span>
                    <span className="font-semibold">{workingDays.weekendDays}</span>
                  </div>
                )}
                
                {workingDays.publicHolidays.length > 0 && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                      {workingDays.publicHolidays.length} jour(s) férié(s)
                    </div>
                    <div className="text-xs text-slate-400">
                      {workingDays.publicHolidays.join(', ')}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                  💡 Les jours ouvrables excluent weekends et jours fériés
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {demande.status === 'pending' && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Actions</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="success"
                  onClick={() => setActionModal('approve')}
                  disabled={validation ? !validation.canApprove : false}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {validation?.canApprove ? 'Approuver' : 'Bloqué - Voir règles'}
                </Button>
                
                {(demande.type === 'Congé' || demande.type === 'Maladie') && (
                  <Button 
                    className="w-full" 
                    variant="warning"
                    onClick={() => setActionModal('substitution')}
                  >
                    🔄 Créer substitution
                  </Button>
                )}
                
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => setActionModal('info')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Demander des infos
                </Button>
                
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={() => setActionModal('reject')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impacts */}
        {(demande.impactSubstitution || demande.impactFinance) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Impacts</h3>
              <div className="space-y-2">
                {demande.impactSubstitution && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                      🔄 SUBSTITUTION
                    </div>
                    <div className="text-xs font-mono">{demande.impactSubstitution}</div>
                  </div>
                )}
                
                {demande.impactFinance && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                      💰 FINANCE
                    </div>
                    <div className="text-xs font-mono">{demande.impactFinance}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hash traçabilité */}
        {demande.hash && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Hash traçabilité
              </h3>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs break-all text-slate-600 dark:text-slate-400">
                {demande.hash}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                🔐 Signature cryptographique pour audit
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informations complémentaires */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Informations</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Bureau</span>
                <BureauTag bureau={demande.bureau} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type</span>
                <span>{TYPE_ICONS[demande.type]} {demande.type}</span>
              </div>
              {demande.subtype && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Sous-type</span>
                  <span>{demande.subtype}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Date demande</span>
                <span>{demande.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Priorité</span>
                <Badge variant={
                  demande.priority === 'urgent' ? 'urgent' :
                  demande.priority === 'high' ? 'warning' : 'info'
                }>
                  {demande.priority}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales d'action */}
      <FluentModal
        open={actionModal === 'approve'}
        title="Approuver la demande"
        onClose={() => setActionModal(null)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400">Validation</div>
              <div className="text-sm text-emerald-600 dark:text-emerald-300">
                Cette action est définitive et déclenchera les impacts associés.
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setActionModal(null)}>
              Annuler
            </Button>
            <Button 
              variant="success" 
              onClick={() => handleAction('approve')}
              disabled={loading}
            >
              {loading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </FluentModal>

      <FluentModal
        open={actionModal === 'reject'}
        title="Refuser la demande"
        onClose={() => setActionModal(null)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <XCircle className="w-8 h-8 text-rose-500" />
            <div>
              <div className="font-semibold text-rose-700 dark:text-rose-400">Rejet</div>
              <div className="text-sm text-rose-600 dark:text-rose-300">
                Veuillez indiquer le motif du refus.
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Motif du refus *</label>
            <textarea
              className="w-full min-h-[100px] rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none
                         focus:ring-2 focus:ring-rose-500/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
              placeholder="Expliquez le motif du refus..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setActionModal(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleAction('reject')}
              disabled={loading || rejectReason.trim().length < 5}
            >
              {loading ? 'Traitement...' : 'Confirmer le refus'}
            </Button>
          </div>
        </div>
      </FluentModal>

      <FluentModal
        open={actionModal === 'info'}
        title="Demander des informations complémentaires"
        onClose={() => setActionModal(null)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Informations requises *</label>
            <textarea
              className="w-full min-h-[100px] rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none
                         focus:ring-2 focus:ring-blue-500/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
              placeholder="Précisez les informations ou documents manquants..."
              value={infoRequest}
              onChange={(e) => setInfoRequest(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setActionModal(null)}>
              Annuler
            </Button>
            <Button 
              onClick={() => handleAction('info')}
              disabled={loading || infoRequest.trim().length < 5}
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </div>
        </div>
      </FluentModal>

      <FluentModal
        open={actionModal === 'substitution'}
        title="Créer une substitution"
        onClose={() => setActionModal(null)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-2xl">🔄</div>
            <div>
              <div className="font-semibold text-amber-700 dark:text-amber-400">Substitution</div>
              <div className="text-sm text-amber-600 dark:text-amber-300">
                Une substitution sera créée pour assurer la continuité de service.
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-400">
            Cette action créera automatiquement une substitution temporaire pour {demande.agent} du {demande.startDate} au {demande.endDate}.
          </p>
          
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setActionModal(null)}>
              Annuler
            </Button>
            <Button 
              variant="warning"
              onClick={() => handleAction('substitution')}
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer la substitution'}
            </Button>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

