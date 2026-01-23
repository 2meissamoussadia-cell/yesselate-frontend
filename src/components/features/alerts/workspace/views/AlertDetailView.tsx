'use client';

import { useState, useMemo } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  AlertCircle, AlertTriangle, Info, CheckCircle,
  Clock, User, Building2, DollarSign, TrendingUp,
  Eye, UserPlus, MessageSquare, XCircle, CheckCircle2,
  FileText, ExternalLink, Calendar, Hash, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAlertById, type Alert } from '@/lib/data/alerts';

interface AlertDetailViewProps {
  alertId: string;
}

const SEVERITY_CONFIG = {
  critical: { color: 'text-rose-500', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30', icon: AlertCircle },
  warning: { color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', icon: AlertTriangle },
  info: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', icon: Info },
  success: { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', icon: CheckCircle },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  acknowledged: { label: 'Acquittée', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  resolved: { label: 'Résolue', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  escalated: { label: 'Escaladée', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ignored: { label: 'Ignorée', color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
};

export function AlertDetailView({ alertId }: AlertDetailViewProps) {
  const alert = useMemo(() => getAlertById(alertId), [alertId]);
  const [loading, setLoading] = useState(false);

  if (!alert) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-8 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
        <p className="text-slate-500">Alerte introuvable</p>
      </div>
    );
  }

  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const SeverityIcon = severityConfig.icon;
  const statusConfig = STATUS_CONFIG[alert.status];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return null;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);
  };

  const handleAction = async (actionId: string) => {
    setLoading(true);
    console.log(`Action ${actionId} sur alerte ${alertId}`);
    
    // Simuler une action
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En production: await fetch(`/api/alerts/${alertId}/actions`, { method: 'POST', body: JSON.stringify({ action: actionId }) });
    
    setLoading(false);
    
    // Toast notification (à implémenter)
    window.alert(`Action "${actionId}" exécutée avec succès`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4">
      {/* Contenu principal */}
      <div className="space-y-4">
        {/* Header */}
        <div className={cn("rounded-2xl border p-6 dark:border-slate-800", severityConfig.bgColor, severityConfig.borderColor)}>
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-xl", severityConfig.bgColor)}>
              <SeverityIcon className={cn("w-6 h-6", severityConfig.color)} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {alert.title}
                  </h1>
                  <p className="text-sm font-mono text-slate-400">{alert.id}</p>
                </div>
                
                <div className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", statusConfig.bgColor, statusConfig.color)}>
                  {statusConfig.label}
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {alert.description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Informations principales */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Informations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Sévérité</p>
                <p className={cn("font-medium capitalize", severityConfig.color)}>{alert.severity}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 capitalize">{alert.type}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Impact</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 capitalize">{alert.impact}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Créée le</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(alert.createdAt)}</p>
              </div>
            </div>
            
            {alert.bureau && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bureau</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{alert.bureau}</p>
                </div>
              </div>
            )}
            
            {alert.responsible && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Responsable</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{alert.responsible}</p>
                </div>
              </div>
            )}
            
            {alert.amount && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Montant</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{formatAmount(alert.amount)}</p>
                </div>
              </div>
            )}
            
            {alert.daysBlocked && alert.daysBlocked > 0 && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-rose-500 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bloqué depuis</p>
                  <p className="font-medium text-rose-600 dark:text-rose-400">{alert.daysBlocked} jours</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Timeline */}
        {alert.timeline && alert.timeline.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Timeline</h2>
            
            <div className="space-y-4">
              {alert.timeline.map((event, idx) => (
                <div key={event.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                    {idx < alert.timeline!.length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-slate-700 dark:text-slate-200 capitalize">{event.type}</p>
                      <p className="text-xs text-slate-400">{formatDate(event.timestamp)}</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{event.message}</p>
                    <p className="text-xs text-slate-500 mt-1">Par {event.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {alert.actions && alert.actions.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Actions disponibles</h2>
            
            <div className="flex flex-wrap gap-3">
              {alert.actions.map((action) => (
                <FluentButton
                  key={action.id}
                  variant={action.type === 'danger' ? 'destructive' : action.type === 'primary' ? 'primary' : 'secondary'}
                  onClick={() => handleAction(action.id)}
                  disabled={loading}
                >
                  {action.label}
                </FluentButton>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Panneau latéral */}
      <div className="space-y-4">
        {/* Lien vers dossier lié */}
        {alert.relatedId && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Dossier lié</h3>
            
            <a
              href={`#${alert.relatedId}`}
              className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{alert.relatedId}</p>
                  <p className="text-xs text-slate-500 capitalize">{alert.relatedType}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}
        
        {/* Projet lié */}
        {alert.project && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Projet</h3>
            
            <a
              href={`#${alert.project}`}
              className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{alert.project}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        )}
        
        {/* Métriques de performance */}
        {(alert.responseTime || alert.resolutionTime) && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Performance</h3>
            
            <div className="space-y-3">
              {alert.responseTime && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Temps de réponse</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{alert.responseTime}min</p>
                </div>
              )}
              
              {alert.resolutionTime && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Temps de résolution</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{Math.round(alert.resolutionTime / 60)}h</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

