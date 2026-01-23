/**
 * Vue liste/inbox des alertes système
 * Affiche les alertes selon la queue sélectionnée
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  AlertTriangle,
  Activity,
  XCircle,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  Zap,
  RefreshCw,
} from 'lucide-react';
import {
  systemAlerts,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
} from '@/lib/data';
import { GovernanceActiveFilters } from '../GovernanceActiveFilters';
import { GovernanceListSkeleton } from '../GovernanceSkeletons';

// Types d'alertes unifiés
interface UnifiedAlert {
  id: string;
  title: string;
  description?: string;
  type: 'system' | 'blocked' | 'payment' | 'contract';
  severity: 'critical' | 'warning' | 'info' | 'success';
  bureau?: string;
  amount?: string;
  delay?: number;
  date?: string;
  metadata?: Record<string, any>;
}

const SEVERITY_COLORS = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

const TYPE_LABELS = {
  system: 'Système',
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

export function AlertsInboxView() {
  const { alertQueue, searchTerm, setSearchTerm, openTab } = useGovernanceWorkspaceStore();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simuler chargement initial
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [alertQueue]);
  
  // Unifier toutes les alertes
  const allAlerts = useMemo((): UnifiedAlert[] => {
    const alerts: UnifiedAlert[] = [];
    
    // System alerts
    systemAlerts.forEach(alert => {
      alerts.push({
        id: alert.id,
        title: alert.title,
        description: alert.action,
        type: 'system',
        severity: alert.type as any,
        metadata: { original: alert },
      });
    });
    
    // Blocked dossiers
    blockedDossiers.forEach(dossier => {
      alerts.push({
        id: dossier.id,
        title: `Dossier bloqué: ${dossier.subject}`,
        description: dossier.reason,
        type: 'blocked',
        severity: dossier.impact === 'critical' ? 'critical' : dossier.impact === 'high' ? 'warning' : 'info',
        bureau: dossier.bureau,
        amount: dossier.amount,
        delay: dossier.delay,
        date: dossier.blockedSince,
        metadata: { original: dossier },
      });
    });
    
    // Payments N+1
    paymentsN1.forEach(payment => {
      const isUrgent = new Date(payment.dueDate.split('/').reverse().join('-')) < new Date();
      alerts.push({
        id: payment.id,
        title: `Paiement en attente: ${payment.beneficiary}`,
        description: `${payment.type} - ${payment.ref}`,
        type: 'payment',
        severity: isUrgent ? 'critical' : 'warning',
        bureau: payment.bureau,
        amount: payment.amount,
        date: payment.date,
        metadata: { original: payment },
      });
    });
    
    // Contracts to sign
    contractsToSign.forEach(contract => {
      alerts.push({
        id: contract.id,
        title: `Contrat à signer: ${contract.subject}`,
        description: `${contract.type} - ${contract.partner}`,
        type: 'contract',
        severity: 'warning',
        bureau: contract.bureau,
        amount: contract.amount,
        date: contract.date,
        metadata: { original: contract },
      });
    });
    
    return alerts;
  }, []);
  
  // Filtrer les alertes selon la queue
  const filteredAlerts = useMemo(() => {
    let items = [...allAlerts];
    
    // Filtrer par queue
    switch (alertQueue) {
      case 'system':
        items = items.filter(a => a.type === 'system');
        break;
      case 'blocked':
        items = items.filter(a => a.type === 'blocked');
        break;
      case 'payment':
        items = items.filter(a => a.type === 'payment');
        break;
      case 'contract':
        items = items.filter(a => a.type === 'contract');
        break;
      case 'critical':
        items = items.filter(a => a.severity === 'critical');
        break;
      case 'all':
      default:
        break;
    }
    
    // Recherche textuelle
    if (localSearch.trim()) {
      const searchLower = localSearch.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.bureau?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrer par sévérité
    if (selectedSeverity) {
      items = items.filter(item => item.severity === selectedSeverity);
    }
    
    // Trier par sévérité (critical first)
    items.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    return items;
  }, [alertQueue, allAlerts, localSearch, selectedSeverity]);
  
  const handleOpenAlert = (alert: UnifiedAlert) => {
    openTab('alert-detail', alert.title, { alert });
  };
  
  const queueTitle = {
    all: 'Toutes les alertes',
    system: 'Alertes système',
    blocked: 'Dossiers bloqués',
    payment: 'Paiements en attente',
    contract: 'Contrats à signer',
    critical: 'Alertes critiques',
  }[alertQueue];
  
  const criticalCount = filteredAlerts.filter(a => a.severity === 'critical').length;
  
  // Construire les filtres actifs
  const activeFilters = [];
  if (selectedSeverity) {
    activeFilters.push({
      id: 'severity',
      label: 'Sévérité',
      value: selectedSeverity,
      onRemove: () => setSelectedSeverity(null),
    });
  }
  if (localSearch) {
    activeFilters.push({
      id: 'search',
      label: 'Recherche',
      value: localSearch,
      onRemove: () => setLocalSearch(''),
    });
  }
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };
  
  if (isLoading) {
    return <GovernanceListSkeleton />;
  }
  
  return (
    <div className="flex h-full">
      {/* Liste principale */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                {queueTitle}
              </h2>
              <p className="text-white/60 text-sm mt-1">
                {filteredAlerts.length} alerte(s)
                {criticalCount > 0 && (
                  <span className="ml-2 text-red-400 font-semibold">
                    · {criticalCount} critique(s)
                  </span>
                )}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          {/* Filtres */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Recherche */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Rechercher une alerte..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            
            {/* Filtres sévérité */}
            <div className="flex items-center gap-2">
              {(['critical', 'warning', 'info'] as const).map(severity => (
                <Button
                  key={severity}
                  variant={selectedSeverity === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
                  className={cn(
                    'h-8',
                    selectedSeverity === severity && 'bg-blue-500 hover:bg-blue-600'
                  )}
                >
                  {severity === 'critical' && '🔴'}
                  {severity === 'warning' && '🟡'}
                  {severity === 'info' && '🔵'}
                  <span className="ml-1 capitalize">{severity}</span>
                </Button>
              ))}
            </div>
            
            {/* Reset filtres */}
            {(selectedSeverity || localSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSeverity(null);
                  setLocalSearch('');
                }}
                className="text-white/60 hover:text-white"
              >
                Réinitialiser
              </Button>
            )}
          </div>
          
          {/* Active Filters */}
          <GovernanceActiveFilters
            filters={activeFilters}
            onClearAll={() => {
              setSelectedSeverity(null);
              setLocalSearch('');
            }}
          />
          
          {/* Liste des alertes */}
          {filteredAlerts.length === 0 ? (
            <Card className="border-white/10 bg-slate-900/50">
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-white/60">Aucune alerte trouvée</p>
                <p className="text-white/40 text-sm mt-2">Tout est sous contrôle ! 🎉</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const TypeIcon = TYPE_ICONS[alert.type];
                
                return (
                  <Card
                    key={alert.id}
                    className={cn(
                      'group border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl hover:border-blue-500/30 transition-all cursor-pointer',
                      alert.severity === 'critical' && 'ring-2 ring-red-500/30 animate-pulse'
                    )}
                    onClick={() => handleOpenAlert(alert)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <TypeIcon className={cn(
                              'h-5 w-5 flex-shrink-0',
                              alert.severity === 'critical' && 'text-red-400',
                              alert.severity === 'warning' && 'text-amber-400',
                              alert.severity === 'info' && 'text-blue-400',
                              alert.severity === 'success' && 'text-emerald-400'
                            )} />
                            
                            <h3 className="text-white font-semibold">
                              {alert.title}
                            </h3>
                            
                            {alert.severity === 'critical' && (
                              <Zap className="h-4 w-4 text-red-400 animate-pulse" />
                            )}
                          </div>
                          
                          {alert.description && (
                            <p className="text-white/60 text-sm mb-3">
                              {alert.description}
                            </p>
                          )}
                          
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="default"
                              className={SEVERITY_COLORS[alert.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info}
                            >
                              {alert.severity}
                            </Badge>
                            
                            <Badge
                              variant="default"
                              className="bg-slate-500/20 text-slate-300"
                            >
                              {TYPE_LABELS[alert.type]}
                            </Badge>
                            
                            {alert.bureau && (
                              <Badge variant="default" className="bg-blue-500/20 text-blue-300">
                                {alert.bureau}
                              </Badge>
                            )}
                            
                            {alert.amount && alert.amount !== '—' && (
                              <Badge variant="default" className="bg-emerald-500/20 text-emerald-300">
                                {alert.amount} FCFA
                              </Badge>
                            )}
                            
                            {alert.delay !== undefined && (
                              <Badge variant="default" className="bg-red-500/20 text-red-300">
                                <Clock className="h-3 w-3 mr-1" />
                                {alert.delay} jours de retard
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Action */}
                        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
                      </div>
                      
                      {/* Footer */}
                      {alert.date && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
                          <span>Date: {alert.date}</span>
                          <span className="text-white/60">{alert.id}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar stats (optionnel) */}
      <div className="w-80 border-l border-white/10 bg-slate-900/30 p-4 space-y-4 hidden xl:block">
        <h3 className="text-white font-semibold mb-4">Statistiques</h3>
        
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Par sévérité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow 
              label="Critique" 
              value={allAlerts.filter(a => a.severity === 'critical').length} 
              color="text-red-400" 
            />
            <StatRow 
              label="Avertissement" 
              value={allAlerts.filter(a => a.severity === 'warning').length} 
              color="text-amber-400" 
            />
            <StatRow 
              label="Info" 
              value={allAlerts.filter(a => a.severity === 'info').length} 
              color="text-blue-400" 
            />
            <StatRow 
              label="Succès" 
              value={allAlerts.filter(a => a.severity === 'success').length} 
              color="text-emerald-400" 
            />
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Par type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Système" value={allAlerts.filter(a => a.type === 'system').length} />
            <StatRow label="Dossiers bloqués" value={allAlerts.filter(a => a.type === 'blocked').length} />
            <StatRow label="Paiements" value={allAlerts.filter(a => a.type === 'payment').length} />
            <StatRow label="Contrats" value={allAlerts.filter(a => a.type === 'contract').length} />
          </CardContent>
        </Card>
        
        {/* Quick actions */}
        <Card className="border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-300 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Actions recommandées</span>
            </div>
            <p className="text-white/60 text-xs">
              {criticalCount > 0 
                ? `Traiter ${criticalCount} alerte(s) critique(s) en priorité`
                : 'Aucune action urgente requise'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: number;
  color?: string;
}

function StatRow({ label, value, color = 'text-white' }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={cn('font-semibold', color)}>{value}</span>
    </div>
  );
}

