/**
 * Modal overlay pour les détails d'un log
 * Pattern modal overlay - comme Analytics/Tickets
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toCsv, downloadBlob } from '@/lib/utils/export';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck,
  AlertTriangle,
  Shield,
  User,
  Globe,
  Clock,
  Database,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';

interface LogDetailModalProps {
  open: boolean;
  onClose: () => void;
  logId: string | null;
  onNext?: () => void;
  onPrevious?: () => void;
  canNavigateNext?: boolean;
  canNavigatePrevious?: boolean;
}

export function LogDetailModal({
  open,
  onClose,
  logId,
  onNext,
  onPrevious,
  canNavigateNext = false,
  canNavigatePrevious = false,
}: LogDetailModalProps) {
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !logId) return;
    setLoading(true);
    const mockLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'security',
      source: 'auth-service',
      message: 'Failed authentication attempt',
      userId: 'USR-001',
      ip: '192.168.1.100',
      sessionId: 'sess-123',
      details: { attempt: 3, reason: 'invalid_credentials' },
      severity: 85,
    };
    fetch(`/api/internal/logs/${logId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLog(data ?? mockLog))
      .catch(() => setLog(mockLog))
      .finally(() => setLoading(false));
  }, [open, logId]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && canNavigatePrevious && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight' && canNavigateNext && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onNext, onPrevious, canNavigateNext, canNavigatePrevious]);

  if (!open) return null;

  const levelConfig: Record<string, { icon: string; variant: any; color: string }> = {
    debug: { icon: '🔧', variant: 'default', color: 'slate' },
    info: { icon: 'ℹ️', variant: 'info', color: 'blue' },
    warning: { icon: '⚠️', variant: 'warning', color: 'amber' },
    error: { icon: '❌', variant: 'destructive', color: 'red' },
    critical: { icon: '🚨', variant: 'destructive', color: 'red' },
    security: { icon: '🔐', variant: 'warning', color: 'purple' },
  };

  const config = log ? levelConfig[log.level] || levelConfig.info : levelConfig.info;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-800/30">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                disabled={!canNavigatePrevious}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={!canNavigateNext}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn('p-2 rounded-lg border', `bg-${config.color}-500/10 border-${config.color}-500/20`)}>
                <span className="text-xl">{config.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <>
                    <div className="h-5 bg-slate-700/50 rounded w-48 mb-1 animate-pulse" />
                    <div className="h-4 bg-slate-700/30 rounded w-32 animate-pulse" />
                  </>
                ) : log ? (
                  <>
                    <h2 className="text-lg font-semibold text-slate-100 truncate">
                      Log {log.id}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={config.variant} className="text-xs">
                        {log.level}
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        {log.category}
                      </Badge>
                      <Badge variant="info" className="text-xs">
                        sev {log.severity}
                      </Badge>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!log) return;
                const rows = [{ id: log.id, timestamp: log.timestamp, level: log.level, source: log.source, message: log.message, userId: log.userId, ip: log.ip }];
                const csv = toCsv(rows);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                downloadBlob(blob, `log-evidence-${log.id}-${new Date().toISOString().slice(0, 10)}.csv`);
                logger.debug('Export evidence pack', { component: 'LogDetailModal' });
              }}
              className="h-8 px-3 text-slate-400 hover:text-slate-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-800/30 rounded animate-pulse" />
              ))}
            </div>
          ) : log ? (
            <div className="space-y-6">
              {/* Message */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Message</h3>
                <p className="text-base text-slate-200 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                  {log.message}
                </p>
              </div>

              {/* Métadonnées */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Métadonnées</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400">Timestamp</span>
                    </div>
                    <p className="text-slate-200 font-mono text-sm">{log.timestamp}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400">Source</span>
                    </div>
                    <p className="text-slate-200 font-mono text-sm">{log.source}</p>
                  </div>
                  {log.userId && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400">Utilisateur</span>
                      </div>
                      <p className="text-slate-200 font-mono text-sm">{log.userId}</p>
                    </div>
                  )}
                  {log.ip && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-400">IP</span>
                      </div>
                      <p className="text-slate-200 font-mono text-sm">{log.ip}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Détails */}
              {log.details && Object.keys(log.details).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Détails</h3>
                  <pre className="text-sm text-slate-300 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions rapides */}
              <div className="flex gap-2 pt-4 border-t border-slate-800/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Créer incident
                    console.log('Create incident');
                  }}
                  className="flex-1"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Créer incident
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/internal/logs/${log?.id}/verify`);
                      logger.debug('Vérification intégrité', { component: 'LogDetailModal', ok: res.ok });
                    } catch {
                      logger.debug('Verify integrity', { component: 'LogDetailModal' });
                    }
                  }}
                  className="flex-1"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Vérifier intégrité
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>Log introuvable</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

