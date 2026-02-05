'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { FluentButton } from '@/components/ui/fluent-button';
import {
  Activity,
  Clock,
  Hash,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import type { DelegationUIState } from '@/lib/stores/delegationWorkspaceStore';

interface Props {
  delegationId: string;
  delegation: any;
  sub?: DelegationUIState['sub'];
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('fr-FR');
}

function shortHash(hash: string | null | undefined): string {
  if (!hash) return '—';
  return hash.slice(0, 8) + '…';
}

export function DelegationAuditSection({ delegationId, delegation, sub }: Props) {
  // Par défaut : timeline
  if (!sub || sub === 'timeline') {
    return <TimelineView delegation={delegation} />;
  }

  switch (sub) {
    case 'hashchain':
      return <HashChainView delegationId={delegationId} delegation={delegation} />;
    case 'exports':
      return <ExportsView delegationId={delegationId} />;
    case 'anomalies':
      return <AnomaliesView delegationId={delegationId} delegation={delegation} />;
    default:
      return <TimelineView delegation={delegation} />;
  }
}

// ============================================
// TIMELINE VIEW
// ============================================

function TimelineView({ delegation }: { delegation: any }) {
  const events = delegation?.events || [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-500" />
        Timeline des événements
      </h2>
      
      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
        
        <div className="space-y-4">
          {events.map((event: any, i: number) => (
            <div key={event.id} className="relative pl-10">
              {/* Point */}
              <div className={cn(
                "absolute left-2.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                event.eventType === 'CREATED' && 'bg-emerald-500',
                event.eventType === 'USED' && 'bg-blue-500',
                event.eventType === 'EXTENDED' && 'bg-purple-500',
                event.eventType === 'SUSPENDED' && 'bg-amber-500',
                event.eventType === 'REVOKED' && 'bg-rose-500',
                event.eventType === 'APPROVED' && 'bg-emerald-500',
                !['CREATED', 'USED', 'EXTENDED', 'SUSPENDED', 'REVOKED', 'APPROVED'].includes(event.eventType) && 'bg-slate-400'
              )} />
              
              {/* Carte événement */}
              <div className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium capitalize",
                        event.eventType === 'CREATED' && 'bg-emerald-100 text-emerald-700',
                        event.eventType === 'USED' && 'bg-blue-100 text-blue-700',
                        event.eventType === 'EXTENDED' && 'bg-purple-100 text-purple-700',
                        event.eventType === 'SUSPENDED' && 'bg-amber-100 text-amber-800',
                        event.eventType === 'REVOKED' && 'bg-rose-100 text-rose-700',
                        event.eventType === 'APPROVED' && 'bg-emerald-100 text-emerald-700'
                      )}>
                        {event.eventType?.toLowerCase()}
                      </span>
                      
                      {event.targetDoc?.ref && (
                        <span className="text-xs text-slate-400">
                          {event.targetDoc.ref}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm mt-1">
                      {event.summary || `Par ${event.actor?.name}`}
                    </div>
                    
                    <div className="text-xs text-slate-400 mt-1">
                      {event.actor?.name} • {formatDateTime(event.createdAt)}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-slate-400">
                    <div className="font-mono">{shortHash(event.hashes?.currentFull || event.eventHash)}</div>
                  </div>
                </div>
                
                {event.targetDoc?.amount && (
                  <div className="mt-2 text-sm text-slate-600">
                    Montant : {new Intl.NumberFormat('fr-FR').format(event.targetDoc.amount)} XOF
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Aucun événement enregistré.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// HASH CHAIN VIEW
// ============================================

function HashChainView({ delegationId, delegation }: { delegationId: string; delegation: any }) {
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<any>(null);

  const verify = useCallback(async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/delegations/${encodeURIComponent(delegationId)}/audit`);
      if (res.ok) {
        const data = await res.json();
        setVerification(data.verification);
      }
    } catch (e) {
      logger.error('Erreur vérification', e instanceof Error ? e : undefined, { component: 'DelegationAuditSection' });
    } finally {
      setVerifying(false);
    }
  }, [delegationId]);

  const events = delegation?.events || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Hash className="w-5 h-5 text-slate-400" />
            Chaîne de hash
          </h2>
          <p className="text-sm text-slate-400">
            Vérification cryptographique de l&apos;intégrité du journal.
          </p>
        </div>
        <FluentButton size="sm" variant="primary" onClick={verify} disabled={verifying}>
          {verifying ? (
            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <FileCheck className="w-4 h-4 mr-1" />
          )}
          Vérifier intégrité
        </FluentButton>
      </div>

      {/* Résultat vérification */}
      {verification && (
        <div className={cn(
          "p-4 rounded-xl border",
          verification.valid
            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
            : "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800"
        )}>
          <div className="flex items-center gap-2">
            {verification.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
            <span className={cn(
              "font-medium",
              verification.valid ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
            )}>
              {verification.message}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Algorithme : {verification.algorithm} • {verification.eventsChecked} événements vérifiés
          </div>
        </div>
      )}

      {/* Hash de tête */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Hash décision (racine)</div>
            <div className="font-mono text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded break-all">
              {delegation?.decisionHash || '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Hash tête de chaîne (actuel)</div>
            <div className="font-mono text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded break-all">
              {delegation?.headHash || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des hashs */}
      <div className="space-y-2">
        {events.map((event: any, i: number) => (
          <div key={event.id} className="p-3 rounded-lg border border-slate-200/70 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">#{i + 1}</span>
                <span className="text-sm font-medium">{event.eventType}</span>
              </div>
              <div className="text-xs text-slate-400">
                {formatDateTime(event.createdAt)}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Prev:</span>
                <span className="font-mono ml-1">{shortHash(event.hashes?.previousFull || event.previousHash)}</span>
              </div>
              <div>
                <span className="text-slate-400">Hash:</span>
                <span className="font-mono ml-1">{shortHash(event.hashes?.currentFull || event.eventHash)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXPORTS VIEW
// ============================================

function ExportsView({ delegationId }: { delegationId: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Download className="w-5 h-5 text-blue-500" />
        Exports
      </h2>
      <p className="text-sm text-slate-400">
        Télécharger le journal d&apos;audit dans différents formats.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExportCard
          title="Export CSV"
          description="Tableur compatible Excel"
          format="csv"
          delegationId={delegationId}
        />
        <ExportCard
          title="Export JSON"
          description="Format structuré pour intégration"
          format="json"
          delegationId={delegationId}
        />
        <ExportCard
          title="Export PDF"
          description="Document imprimable"
          format="pdf"
          delegationId={delegationId}
        />
      </div>
    </div>
  );
}

function ExportCard({ title, description, format, delegationId }: { 
  title: string; 
  description: string; 
  format: string;
  delegationId: string;
}) {
  const handleExport = () => {
    // TODO: implémenter l'export
    window.open(`/api/delegations/${encodeURIComponent(delegationId)}/export?format=${format}`, '_blank');
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 hover:border-blue-300 transition-colors">
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-slate-400 mb-3">{description}</p>
      <FluentButton size="sm" variant="secondary" onClick={handleExport}>
        <Download className="w-3.5 h-3.5 mr-1" />
        Télécharger
      </FluentButton>
    </div>
  );
}

// ============================================
// ANOMALIES VIEW
// ============================================

function AnomaliesView({ delegationId, delegation }: { delegationId: string; delegation: any }) {
  // En production, charger depuis l'API
  const anomalies = [
    { id: 1, type: 'UNUSUAL_HOURS', severity: 'MEDIUM', description: 'Usage à 22h15', date: new Date() },
    { id: 2, type: 'THRESHOLD_EXCEEDED', severity: 'HIGH', description: 'Tentative dépassement plafond', date: new Date() },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Anomalies détectées
      </h2>
      <p className="text-sm text-slate-400">
        Comportements inhabituels ou violations de règles.
      </p>
      
      <div className="space-y-2">
        {anomalies.map(a => (
          <div
            key={a.id}
            className={cn(
              "p-3 rounded-xl border",
              a.severity === 'HIGH' && "border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800",
              a.severity === 'MEDIUM' && "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800",
              a.severity === 'LOW' && "border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700"
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={cn(
                "w-4 h-4 flex-none mt-0.5",
                a.severity === 'HIGH' && "text-rose-500",
                a.severity === 'MEDIUM' && "text-amber-500",
                a.severity === 'LOW' && "text-slate-400"
              )} />
              <div>
                <div className="font-medium text-sm">{a.type.replace(/_/g, ' ')}</div>
                <div className="text-sm text-slate-600">{a.description}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {formatDateTime(a.date)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {anomalies.length === 0 && (
          <div className="text-center py-8 text-slate-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            Aucune anomalie détectée
          </div>
        )}
      </div>
    </div>
  );
}

