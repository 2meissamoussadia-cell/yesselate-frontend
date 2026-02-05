'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';
import {
  History,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  ArrowUp,
  FileText,
  Search,
  User,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorId: string;
  actorRole?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  arbitrageId?: string;
}

// ============================================
// Component
// ============================================
export function ArbitragesTimeline({ open, onClose, arbitrageId }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = arbitrageId
        ? `/api/arbitrages/${arbitrageId}/timeline`
        : '/api/arbitrages/timeline';
      
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      setEvents(data.data || []);
    } catch (e) {
      setError('Impossible de charger la timeline');
    } finally {
      setLoading(false);
    }
  }, [arbitrageId]);

  useEffect(() => {
    if (open) loadTimeline();
  }, [open, loadTimeline]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'creation':
        return <Plus className="w-4 h-4 text-emerald-500" />;
      case 'escalade':
        return <ArrowUp className="w-4 h-4 text-rose-500" />;
      case 'decision':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'complement':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'commentaire':
        return <MessageSquare className="w-4 h-4 text-slate-400" />;
      case 'analyse':
        return <Search className="w-4 h-4 text-purple-500" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'creation':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'escalade':
        return 'border-rose-500 bg-rose-50 dark:bg-rose-900/20';
      case 'decision':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'complement':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'commentaire':
        return 'border-slate-400 bg-slate-50 dark:bg-slate-800/50';
      case 'analyse':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-slate-300 bg-slate-50 dark:bg-slate-800/50';
    }
  };

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <FluentModal
      open={open}
      title={arbitrageId ? `Timeline — ${arbitrageId}` : 'Timeline — Tous les arbitrages'}
      onClose={onClose}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <FluentButton size="sm" variant="secondary" onClick={loadTimeline}>
              Réessayer
            </FluentButton>
          </div>
        )}

        {loading && !events.length && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Aucun événement dans la timeline</p>
          </div>
        )}

        {events.length > 0 && (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-4">
              {events.map((event, idx) => (
                <div key={event.id} className="relative pl-10">
                  {/* Dot */}
                  <div
                    className={cn(
                      'absolute left-2 top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white dark:bg-slate-900',
                      getEventColor(event.type)
                    )}
                  >
                    {getEventIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div
                    className={cn(
                      'p-4 rounded-xl border-l-4',
                      getEventColor(event.type)
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm">{event.title}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {event.description}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(event.timestamp)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      <span>{event.actor}</span>
                      {event.actorRole && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{event.actorRole}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <FluentButton size="sm" variant="secondary" onClick={loadTimeline} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Actualiser
          </FluentButton>
          <FluentButton size="sm" variant="primary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

export default ArbitragesTimeline;

