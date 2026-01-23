/**
 * Vue détail d'une alerte
 * Affiche tous les détails d'une alerte avec actions possibles
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Activity,
  XCircle,
  FileText,
  CheckCircle2,
  Clock,
  User,
  Building,
  DollarSign,
  Calendar,
  Check,
  X,
  MessageSquare,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface AlertDetailViewProps {
  alertId?: string;
}

const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const TYPE_LABELS = {
  system: 'Alerte Système',
  blocked: 'Dossier Bloqué',
  payment: 'Paiement',
  contract: 'Contrat',
};

const TYPE_ICONS = {
  system: Activity,
  blocked: XCircle,
  payment: FileText,
  contract: CheckCircle2,
};

export function AlertDetailView({ alertId }: AlertDetailViewProps) {
  const { getActiveTab, closeTab } = useGovernanceWorkspaceStore();
  const activeTab = getActiveTab();
  const alert = activeTab?.metadata?.alert;
  
  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState('');
  const [showActions, setShowActions] = useState(true);
  
  if (!alert) {
    return (
      <div className="p-6">
        <Card className="border-white/10 bg-slate-900/50">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Alerte non trouvée</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const TypeIcon = TYPE_ICONS[alert.type as keyof typeof TYPE_ICONS] || Activity;
  const original = alert.metadata?.original;
  
  const handleResolve = async () => {
    if (!resolution.trim()) return;
    
    setIsResolving(true);
    
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fermer l'onglet après résolution
    if (activeTab) {
      closeTab(activeTab.id);
    }
  };
  
  const handleEscalate = () => {
    // TODO: Implémenter escalade
    alert('Escalade vers BMO (à implémenter)');
  };
  
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <TypeIcon className={cn(
              'h-8 w-8 flex-shrink-0',
              alert.severity === 'critical' && 'text-red-400',
              alert.severity === 'warning' && 'text-amber-400',
              alert.severity === 'info' && 'text-blue-400',
              alert.severity === 'success' && 'text-emerald-400'
            )} />
            
            <h1 className="text-3xl font-bold text-white">{alert.title}</h1>
            
            {alert.severity === 'critical' && (
              <Zap className="h-6 w-6 text-red-400 animate-pulse" />
            )}
          </div>
          
          {alert.description && (
            <p className="text-white/70 text-lg mb-4">{alert.description}</p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="default"
              className={cn('text-sm', SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info)}
            >
              {alert.severity.toUpperCase()}
            </Badge>
            
            <Badge variant="default" className="bg-slate-500/20 text-slate-300 text-sm">
              {TYPE_LABELS[alert.type as keyof typeof TYPE_LABELS] || 'Alerte'}
            </Badge>
            
            {alert.bureau && (
              <Badge variant="default" className="bg-blue-500/20 text-blue-300 text-sm">
                <Building className="h-3 w-3 mr-1" />
                {alert.bureau}
              </Badge>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              onClick={handleEscalate}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Escalader
            </Button>
            
            <Button
              variant="default"
              onClick={() => setShowActions(false)}
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            >
              <Check className="h-4 w-4 mr-2" />
              Résoudre
            </Button>
          </div>
        )}
      </div>
      
      {/* Formulaire de résolution */}
      {!showActions && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Résoudre l'alerte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">
                Description de la résolution
              </label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Décrivez comment l'alerte a été résolue..."
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleResolve}
                disabled={!resolution.trim() || isResolving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isResolving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Résolution en cours...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirmer la résolution
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  setShowActions(true);
                  setResolution('');
                }}
                className="text-white/60 hover:text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Détails de l'alerte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations principales */}
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="ID" value={alert.id} icon={FileText} />
            <InfoRow label="Type" value={TYPE_LABELS[alert.type as keyof typeof TYPE_LABELS] || 'Alerte'} icon={TypeIcon} />
            <InfoRow 
              label="Sévérité" 
              value={alert.severity} 
              icon={AlertTriangle}
              valueColor={
                alert.severity === 'critical' ? 'text-red-400' :
                alert.severity === 'warning' ? 'text-amber-400' :
                alert.severity === 'info' ? 'text-blue-400' :
                'text-emerald-400'
              }
            />
            
            {alert.bureau && (
              <InfoRow label="Bureau" value={alert.bureau} icon={Building} />
            )}
            
            {alert.amount && alert.amount !== '—' && (
              <InfoRow 
                label="Montant" 
                value={`${alert.amount} FCFA`} 
                icon={DollarSign}
                valueColor="text-emerald-400"
              />
            )}
            
            {alert.date && (
              <InfoRow label="Date" value={alert.date} icon={Calendar} />
            )}
            
            {alert.delay !== undefined && (
              <InfoRow 
                label="Retard" 
                value={`${alert.delay} jours`} 
                icon={Clock}
                valueColor="text-red-400"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Détails spécifiques */}
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Détails Spécifiques</CardTitle>
          </CardHeader>
          <CardContent>
            {alert.type === 'blocked' && original && (
              <div className="space-y-3">
                <DetailRow label="Responsable" value={original.responsible} />
                <DetailRow label="Projet" value={original.project} />
                <DetailRow label="Raison" value={original.reason} />
                <DetailRow 
                  label="Bloqué depuis" 
                  value={original.blockedSince} 
                />
                <DetailRow 
                  label="Impact" 
                  value={original.impact}
                  valueColor={
                    original.impact === 'critical' ? 'text-red-400' :
                    original.impact === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  }
                />
              </div>
            )}
            
            {alert.type === 'payment' && original && (
              <div className="space-y-3">
                <DetailRow label="Bénéficiaire" value={original.beneficiary} />
                <DetailRow label="Type" value={original.type} />
                <DetailRow label="Référence" value={original.ref} />
                <DetailRow label="Projet" value={original.project} />
                <DetailRow label="Échéance" value={original.dueDate} />
                <DetailRow label="Validé par" value={original.validatedBy} />
              </div>
            )}
            
            {alert.type === 'contract' && original && (
              <div className="space-y-3">
                <DetailRow label="Partenaire" value={original.partner} />
                <DetailRow label="Type" value={original.type} />
                <DetailRow label="Préparé par" value={original.preparedBy} />
                {original.expiry && original.expiry !== '—' && (
                  <DetailRow label="Expiration" value={original.expiry} />
                )}
              </div>
            )}
            
            {alert.type === 'system' && (
              <div className="text-white/60 text-sm">
                <p>Alerte système automatique</p>
                <p className="mt-2">{alert.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Actions recommandées */}
      <Card className="border-blue-500/30 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="text-blue-300 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions Recommandées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-white/80">
            {alert.severity === 'critical' && (
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                <span>Action immédiate requise - Traiter en priorité</span>
              </li>
            )}
            
            {alert.type === 'blocked' && (
              <>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Vérifier la disponibilité du responsable</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Considérer une délégation ou substitution</span>
                </li>
              </>
            )}
            
            {alert.type === 'payment' && (
              <>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Vérifier les documents justificatifs</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Planifier le paiement avant échéance</span>
                </li>
              </>
            )}
            
            {alert.type === 'contract' && (
              <>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Réviser les clauses avec le service juridique</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                  <span>Programmer la signature avec les parties</span>
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ElementType;
  valueColor?: string;
}

function InfoRow({ label, value, icon: Icon, valueColor = 'text-white' }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-white/60">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className={cn('font-semibold text-right', valueColor)}>{value}</span>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

function DetailRow({ label, value, valueColor = 'text-white' }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b border-white/5 last:border-0">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={cn('font-medium', valueColor)}>{value}</span>
    </div>
  );
}

