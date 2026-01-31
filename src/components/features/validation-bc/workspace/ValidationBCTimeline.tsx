'use client';

import React, { useEffect, useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Activity, CheckCircle2, XCircle, Clock, User, FileText, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTimeline } from '@/lib/services/validation-bc-api';
import type { TimelineEvent } from '@/lib/services/validation-bc-api';

interface ValidationBCTimelineProps {
  open: boolean;
  documentId?: string;
  onClose: () => void;
}

export function ValidationBCTimeline({ open, documentId, onClose }: ValidationBCTimelineProps) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (!open) return;

    const loadTimeline = async () => {
      setLoading(true);
      try {
        const response = await getTimeline(documentId || 'global');
        setEvents(response.events);
      } catch (error) {
        console.error('Failed to load timeline:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [open, documentId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileText className="w-4 h-4" />;
      case 'validated':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'comment':
        return <Activity className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'validated':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'rejected':
        return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';
      case 'comment':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'text-slate-400 bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <FluentModal open={open} title={documentId ? `Timeline — ${documentId}` : 'Timeline globale'} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {documentId ? `Historique complet du document` : `Historique des 50 dernières actions`}
          </div>
          <FluentButton size="sm" variant="secondary" onClick={() => {}} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Actualiser
          </FluentButton>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-400">Chargement...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Aucun événement</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-none z-10', getColor(event.type))}>
                    {getIcon(event.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#141414]/40">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="font-medium">{event.action}</div>
                        <div className="text-xs text-slate-400 flex-none">
                          {new Date(event.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        <span>{event.actorName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs">{event.actorRole}</span>
                      </div>

                      {event.details && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400">
                          {event.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

