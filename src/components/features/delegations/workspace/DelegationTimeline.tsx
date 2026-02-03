'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  History,
  Plus,
  Edit,
  Trash2,
  Pause,
  Play,
  Clock,
  Shield,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  FileText,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type EventType = 
  | 'created'
  | 'updated'
  | 'extended'
  | 'suspended'
  | 'reactivated'
  | 'revoked'
  | 'used'
  | 'denied'
  | 'control_requested'
  | 'control_approved'
  | 'control_rejected';

interface TimelineEvent {
  id: string;
  delegationId: string;
  delegationCode: string;
  eventType: EventType;
  actorId: string;
  actorName: string;
  actorRole: string;
  summary: string;
  details: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  previousHash: string | null;
  hash: string;
}

interface TimelineGroup {
  date: string;
  events: TimelineEvent[];
}

interface Props {
  delegationId?: string;
  open: boolean;
  onClose: () => void;
}

// ============================================
// HELPERS
// ============================================

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { 
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getEventConfig = (type: EventType) => {
  switch (type) {
    case 'created':
      return { icon: Plus, color: 'emerald', label: 'Créée' };
    case 'updated':
      return { icon: Edit, color: 'blue', label: 'Modifiée' };
    case 'extended':
      return { icon: Clock, color: 'purple', label: 'Prolongée' };
    case 'suspended':
      return { icon: Pause, color: 'amber', label: 'Suspendue' };
    case 'reactivated':
      return { icon: Play, color: 'emerald', label: 'Réactivée' };
    case 'revoked':
      return { icon: Trash2, color: 'rose', label: 'Révoquée' };
    case 'used':
      return { icon: Shield, color: 'blue', label: 'Utilisée' };
    case 'denied':
      return { icon: XCircle, color: 'rose', label: 'Refusée' };
    case 'control_requested':
      return { icon: AlertTriangle, color: 'amber', label: 'Contrôle demandé' };
    case 'control_approved':
      return { icon: CheckCircle2, color: 'emerald', label: 'Contrôle approuvé' };
    case 'control_rejected':
      return { icon: XCircle, color: 'rose', label: 'Contrôle rejeté' };
    default:
      return { icon: History, color: 'slate', label: type };
  }
};

// ============================================
// COMPONENT
// ============================================

export function DelegationTimeline({ delegationId, open, onClose }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [showVerification, setShowVerification] = useState(false);

  // Load timeline events
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = delegationId
        ? `/api/delegations/${encodeURIComponent(delegationId)}/timeline`
        : '/api/delegations/timeline';

      const res = await fetch(endpoint, { cache: 'no-store' });

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      const data = await res.json();
      setEvents(data.events || []);
    } catch (e) {
      setError('Impossible de charger l\'historique');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [delegationId]);

  useEffect(() => {
    if (open) {
      loadEvents();
    }
  }, [open, loadEvents]);

  // Toggle event expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(e => e.eventType === filterType);
  }, [events, filterType]);

  // Group by date
  const groupedEvents = useMemo<TimelineGroup[]>(() => {
    const groups: Record<string, TimelineEvent[]> = {};

    for (const event of filteredEvents) {
      const date = new Date(event.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    }

    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, events]) => ({
        date,
        events: events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      }));
  }, [filteredEvents]);

  // Verify hash chain
  const verifyChain = useCallback(async () => {
    setShowVerification(true);
    // La vérification est faite côté serveur via l'API /verify
  }, []);

  // Export timeline
  const exportTimeline = useCallback(() => {
    const data = JSON.stringify(events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline_${delegationId || 'all'}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events, delegationId]);

  const eventTypes: EventType[] = [
    'created', 'updated', 'extended', 'suspended', 'reactivated',
    'revoked', 'used', 'denied', 'control_requested', 'control_approved', 'control_rejected'
  ];

  return (
    <FluentModal
      open={open}
      title={delegationId ? `Historique — ${delegationId}` : 'Journal d\'audit global'}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Header controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as EventType | 'all')}>
              <SelectTrigger className="h-9 min-w-[160px] rounded-lg border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#141414]/70 text-sm focus:ring-2 focus:ring-purple-400/30">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f1f]">
                <SelectItem value="all">Tous les événements</SelectItem>
                {eventTypes.map(type => {
                  const config = getEventConfig(type);
                  return (
                    <SelectItem key={type} value={type}>{config.label}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <span className="text-xs text-slate-400">{filteredEvents.length} événement(s)</span>
          </div>

          <div className="flex items-center gap-2">
            <FluentButton size="xs" variant="secondary" onClick={loadEvents} disabled={loading}>
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </FluentButton>
            <FluentButton size="xs" variant="secondary" onClick={exportTimeline}>
              <Download className="w-3.5 h-3.5" />
            </FluentButton>
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-slate-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-rose-300" />
            <div>{error}</div>
            <FluentButton size="sm" variant="secondary" onClick={loadEvents} className="mt-4">
              Réessayer
            </FluentButton>
          </div>
        ) : groupedEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <div>Aucun événement</div>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-auto space-y-6 pr-2">
            {groupedEvents.map(group => (
              <div key={group.date}>
                {/* Date header */}
                <div className="sticky top-0 bg-white/95 dark:bg-[#1f1f1f]/95 backdrop-blur-sm z-10 pb-2 mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(group.events[0].createdAt)}
                  </div>
                </div>

                {/* Events */}
                <div className="relative pl-6 space-y-4">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />

                  {group.events.map(event => {
                    const config = getEventConfig(event.eventType);
                    const Icon = config.icon;
                    const isExpanded = expandedEvents.has(event.id);

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "relative rounded-xl border bg-white/80 dark:bg-[#1f1f1f]/60 p-3 transition-all",
                          config.color === 'emerald' && "border-emerald-200/50 hover:border-emerald-300",
                          config.color === 'blue' && "border-blue-200/50 hover:border-blue-300",
                          config.color === 'purple' && "border-purple-200/50 hover:border-purple-300",
                          config.color === 'amber' && "border-amber-200/50 hover:border-amber-300",
                          config.color === 'rose' && "border-rose-200/50 hover:border-rose-300",
                          config.color === 'slate' && "border-slate-200/50 hover:border-slate-300"
                        )}
                      >
                        {/* Timeline dot */}
                        <div className={cn(
                          "absolute -left-[18px] top-4 w-3 h-3 rounded-full ring-2 ring-white dark:ring-[#1f1f1f]",
                          config.color === 'emerald' && "bg-emerald-500",
                          config.color === 'blue' && "bg-blue-500",
                          config.color === 'purple' && "bg-purple-500",
                          config.color === 'amber' && "bg-amber-500",
                          config.color === 'rose' && "bg-rose-500",
                          config.color === 'slate' && "bg-slate-400"
                        )} />

                        {/* Event header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={cn(
                              "p-1.5 rounded-lg",
                              config.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/30",
                              config.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                              config.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30",
                              config.color === 'amber' && "bg-amber-100 dark:bg-amber-900/30",
                              config.color === 'rose' && "bg-rose-100 dark:bg-rose-900/30",
                              config.color === 'slate' && "bg-slate-100 dark:bg-slate-800/50"
                            )}>
                              <Icon className={cn(
                                "w-4 h-4",
                                config.color === 'emerald' && "text-emerald-600",
                                config.color === 'blue' && "text-blue-600",
                                config.color === 'purple' && "text-purple-600",
                                config.color === 'amber' && "text-amber-600",
                                config.color === 'rose' && "text-rose-600",
                                config.color === 'slate' && "text-slate-400"
                              )} />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-xs font-medium",
                                  config.color === 'emerald' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
                                  config.color === 'blue' && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                                  config.color === 'purple' && "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
                                  config.color === 'amber' && "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
                                  config.color === 'rose' && "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
                                  config.color === 'slate' && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                )}>
                                  {config.label}
                                </span>
                                <span className="font-mono text-xs text-purple-600 dark:text-purple-400">{event.delegationCode}</span>
                              </div>
                              <div className="text-sm mt-1">{event.summary}</div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {event.actorName}
                                </span>
                                <span>{formatTime(event.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {(event.details || event.metadata) && (
                            <button
                              onClick={() => toggleExpand(event.id)}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            {event.details && (
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                <FileText className="w-3.5 h-3.5 inline mr-1" />
                                {event.details}
                              </div>
                            )}
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 overflow-auto">
                                {JSON.stringify(event.metadata, null, 2)}
                              </div>
                            )}
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                              <Shield className="w-3 h-3" />
                              <span className="font-mono truncate">{event.hash}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Historique cryptographiquement signé
          </div>
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

export default DelegationTimeline;


