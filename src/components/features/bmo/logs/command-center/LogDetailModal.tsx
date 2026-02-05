/**
 * Modal overlay complète pour afficher les détails d'un log
 * Pattern: Modal overlay avec tabs (comme SubstitutionDetailModal)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Terminal,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Server,
  Globe,
  Shield,
  Clock,
  User,
  Hash,
  FileText,
  Download,
  Archive,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { logsApiService, type LogEntry } from '@/lib/services/logsApiService';

interface LogDetailModalProps {
  open: boolean;
  onClose: () => void;
  logId: string | null;
}

export function LogDetailModal({ open, onClose, logId }: LogDetailModalProps) {
  const [log, setLog] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'metadata' | 'context' | 'history'>('details');

  useEffect(() => {
    if (!open || !logId) {
      setLog(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    logsApiService.getLogById(logId).then((log) => {
      setLog(log);
      setLoading(false);
    }).catch((error) => {
      console.error('Error loading log:', error);
      setLog(null);
      setLoading(false);
    });
  }, [open, logId]);

  if (!open) return null;

  const levelColors = {
    error: 'text-red-400 bg-red-500/20 border-red-500/30',
    warn: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    info: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    debug: 'text-slate-400 bg-slate-500/20 border-slate-500/30',
  };

  const sourceIcons = {
    system: Server,
    api: Globe,
    database: FileText,
    auth: Shield,
    business: Terminal,
  };

  const levelIcons = {
    error: AlertCircle,
    warn: AlertTriangle,
    info: Info,
    debug: Bug,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : log ? (
                <>
                  {(() => {
                    const LevelIcon = levelIcons[log.level as keyof typeof levelIcons] || Info;
                    const SourceIcon = sourceIcons[log.source as keyof typeof sourceIcons] || Terminal;
                    return (
                      <>
                        <div className={cn('p-2 rounded-lg border', levelColors[log.level as keyof typeof levelColors] || levelColors.info)}>
                          <LevelIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-slate-100 truncate">
                            {log.message}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="default"
                              className={cn('text-xs border', levelColors[log.level as keyof typeof levelColors] || levelColors.info)}
                            >
                              {logsApiService.getLevelLabel(log.level)}
                            </Badge>
                            <Badge variant="default" className="text-xs bg-slate-800/50 text-slate-400 border border-slate-700/50">
                              <SourceIcon className="h-3 w-3 mr-1" />
                              {logsApiService.getSourceLabel(log.source)}
                            </Badge>
                            <span className="text-xs text-slate-400">{log.module}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <h2 className="text-lg font-semibold text-slate-100">Log non trouvé</h2>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !log ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Log non trouvé</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-none px-6 pt-4 border-b border-slate-800/50">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                  <TabsTrigger value="context">Contexte</TabsTrigger>
                  <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="details" className="p-6 space-y-6 m-0">
                  <DetailsTab log={log} levelColors={levelColors} sourceIcons={sourceIcons} />
                </TabsContent>

                <TabsContent value="metadata" className="p-6 space-y-6 m-0">
                  <MetadataTab log={log} />
                </TabsContent>

                <TabsContent value="context" className="p-6 space-y-6 m-0">
                  <ContextTab log={log} />
                </TabsContent>

                <TabsContent value="history" className="p-6 space-y-6 m-0">
                  <HistoryTab log={log} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {/* Footer Actions */}
        {log && (
          <div className="flex-none px-6 py-4 border-t border-slate-800/50 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-400">
                <Archive className="h-4 w-4 mr-2" />
                Archiver
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-400">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marquer comme résolu
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-400">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm" onClick={onClose} className="border-slate-700 text-slate-400">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// Details Tab
// ================================
function DetailsTab({ log, levelColors, sourceIcons }: { log: LogEntry; levelColors: Record<string, string>; sourceIcons: Record<string, React.ComponentType<{ className?: string }>> }) {
  const SourceIcon = sourceIcons[log.source as keyof typeof sourceIcons] || Terminal;

  return (
    <div className="space-y-6">
      {/* Message principal */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Message</h3>
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-slate-200 font-medium">{log.message}</p>
        </div>
      </div>

      {/* Détails */}
      {log.details && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Détails</h3>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-slate-300 whitespace-pre-wrap">{log.details}</p>
          </div>
        </div>
      )}

      {/* Informations principales */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Informations</h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={<Hash className="h-4 w-4" />} label="ID" value={log.id} />
          <InfoCard icon={<Clock className="h-4 w-4" />} label="Timestamp" value={new Date(log.timestamp).toLocaleString('fr-FR')} />
          <InfoCard
            icon={<FileText className="h-4 w-4" />}
            label="Niveau"
            value={
              <Badge variant="default" className={cn('text-xs border', levelColors[log.level as keyof typeof levelColors] || levelColors.info)}>
                {logsApiService.getLevelLabel(log.level)}
              </Badge>
            }
          />
          <InfoCard
            icon={<SourceIcon className="h-4 w-4" />}
            label="Source"
            value={logsApiService.getSourceLabel(log.source)}
          />
          <InfoCard icon={<FileText className="h-4 w-4" />} label="Module" value={log.module} />
        </div>
      </div>
    </div>
  );
}

// ================================
// Metadata Tab
// ================================
function MetadataTab({ log }: { log: LogEntry }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Métadonnées</h3>
      {log.metadata ? (
        <div className="space-y-2">
          {Object.entries(log.metadata).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <span className="text-sm text-slate-400 font-mono">{key}</span>
              <span className="text-sm text-slate-200 font-mono">{String(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-center py-8">Aucune métadonnée disponible</p>
      )}
    </div>
  );
}

// ================================
// Context Tab
// ================================
function ContextTab({ log }: { log: LogEntry }) {
  const [context, setContext] = useState<{ previous: LogEntry[]; current: LogEntry; next: LogEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    logsApiService.getLogContext(log.id).then((ctx) => {
      setContext(ctx);
      setLoading(false);
    }).catch((error) => {
      console.error('Error loading context:', error);
      setContext(null);
      setLoading(false);
    });
  }, [log.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Contexte</h3>
        <p className="text-slate-400 text-center py-8">Aucun contexte disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Contexte</h3>
      
      {/* Logs précédents */}
      {context.previous.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-2">Logs précédents ({context.previous.length})</h4>
          <div className="space-y-2">
            {context.previous.map((prevLog) => (
              <LogContextItem key={prevLog.id} log={prevLog} />
            ))}
          </div>
        </div>
      )}

      {/* Log actuel */}
      <div>
        <h4 className="text-xs font-medium text-slate-400 mb-2">Log actuel</h4>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <LogContextItem log={context.current} isCurrent />
        </div>
      </div>

      {/* Logs suivants */}
      {context.next.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 mb-2">Logs suivants ({context.next.length})</h4>
          <div className="space-y-2">
            {context.next.map((nextLog) => (
              <LogContextItem key={nextLog.id} log={nextLog} />
            ))}
          </div>
        </div>
      )}

      {context.previous.length === 0 && context.next.length === 0 && (
        <p className="text-slate-400 text-center py-8">Aucun log lié trouvé</p>
      )}
    </div>
  );
}

function LogContextItem({ log, isCurrent = false }: { log: LogEntry; isCurrent?: boolean }) {
  const levelColors = {
    error: 'text-red-400',
    warn: 'text-amber-400',
    info: 'text-blue-400',
    debug: 'text-slate-400',
  };

  return (
    <div className={cn(
      'p-3 rounded-lg border text-sm',
      isCurrent
        ? 'bg-blue-500/10 border-blue-500/30'
        : 'bg-slate-800/50 border-slate-700/50'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-medium', levelColors[log.level as keyof typeof levelColors] || levelColors.info)}>
              {logsApiService.getLevelLabel(log.level)}
            </span>
            <span className="text-xs text-slate-400">{log.module}</span>
            <span className="text-xs text-slate-600">
              {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
            </span>
          </div>
          <p className="text-slate-300 truncate">{log.message}</p>
        </div>
      </div>
    </div>
  );
}

// ================================
// History Tab
// ================================
function HistoryTab({ log }: { log: LogEntry }) {
  const [history, setHistory] = useState<Array<{ id: string; timestamp: string; action: string; userId?: string; userName?: string; details?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    logsApiService.getLogHistory(log.id).then((hist) => {
      setHistory(hist);
      setLoading(false);
    }).catch((error) => {
      console.error('Error loading history:', error);
      setHistory([]);
      setLoading(false);
    });
  }, [log.id]);

  const actionLabels: Record<string, string> = {
    read: 'Consultation',
    archived: 'Archivé',
    resolved: 'Résolu',
    exported: 'Exporté',
    commented: 'Commenté',
  };

  const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    read: Eye,
    archived: Archive,
    resolved: CheckCircle,
    exported: Download,
    commented: FileText,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Historique</h3>
        <p className="text-slate-400 text-center py-8">Aucun historique disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Historique</h3>
      <div className="space-y-3">
        {history.map((entry) => {
          const ActionIcon = actionIcons[entry.action] || FileText;
          return (
            <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <ActionIcon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-200">
                    {actionLabels[entry.action] || entry.action}
                  </span>
                  {entry.userName && (
                    <span className="text-xs text-slate-400">par {entry.userName}</span>
                  )}
                </div>
                {entry.details && (
                  <p className="text-xs text-slate-400">{entry.details}</p>
                )}
                <p className="text-xs text-slate-600 mt-1">
                  {new Date(entry.timestamp).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================
// Helper Components
// ================================
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-slate-200 font-medium">{value}</div>
    </div>
  );
}

