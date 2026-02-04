'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  RefreshCw,
  ChevronRight,
  Filter,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface ActivityEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'validated' | 'rejected' | 'modified' | 'escalated' | 'delegated' | 'comment';
  actor: {
    id: string;
    name: string;
    role: string;
  };
  document?: {
    id: string;
    type: 'bc' | 'facture' | 'avenant';
    title: string;
  };
  details?: string;
  metadata?: Record<string, unknown>;
}

interface Props {
  limit?: number;
  showFilters?: boolean;
  onViewDocument?: (documentId: string) => void;
}

// ============================================
// Component
// ============================================
export function ValidationBCActivityHistory({ limit = 10, showFilters = true, onViewDocument }: Props) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'validated' | 'rejected' | 'created'>('all');

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/validation-bc/activity?limit=${limit}&filter=${filter}`);
      if (!res.ok) throw new Error('Erreur chargement activités');
      
      const data = await res.json();
      setActivities(data.data || []);
    } catch (e) {
      setError('Impossible de charger l\'historique');
      console.error(e);
      
      // Fallback mock data
      setActivities([
        {
          id: 'ACT-001',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          action: 'validated',
          actor: { id: 'U1', name: 'Jean DUPONT', role: 'Chef de service' },
          document: { id: 'BC-2026-0048', type: 'bc', title: 'Fournitures bureau' },
          details: 'Validation avec commentaire: Conforme',
        },
        {
          id: 'ACT-002',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          action: 'rejected',
          actor: { id: 'U2', name: 'Marie FALL', role: 'DAF' },
          document: { id: 'FAC-2026-0089', type: 'facture', title: 'Facture logiciels' },
          details: 'Rejeté: Montant non conforme au BC',
        },
        {
          id: 'ACT-003',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          action: 'created',
          actor: { id: 'U3', name: 'Pierre SALL', role: 'Agent comptable' },
          document: { id: 'BC-2026-0052', type: 'bc', title: 'Équipement IT' },
        },
        {
          id: 'ACT-004',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          action: 'escalated',
          actor: { id: 'U1', name: 'Jean DUPONT', role: 'Chef de service' },
          document: { id: 'BC-2026-0045', type: 'bc', title: 'Marché travaux' },
          details: 'Escaladé vers DAF: Montant supérieur au seuil',
        },
        {
          id: 'ACT-005',
          timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
          action: 'validated',
          actor: { id: 'U4', name: 'Sophie DIOP', role: 'Contrôleur' },
          document: { id: 'FAC-2026-0085', type: 'facture', title: 'Maintenance' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [limit, filter]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getActionIcon = (action: ActivityEntry['action']) => {
    switch (action) {
      case 'validated':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'created':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'delegated':
        return <User className="w-4 h-4 text-purple-500" />;
      case 'modified':
        return <Clock className="w-4 h-4 text-slate-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionLabel = (action: ActivityEntry['action']) => {
    switch (action) {
      case 'validated': return 'a validé';
      case 'rejected': return 'a rejeté';
      case 'created': return 'a créé';
      case 'escalated': return 'a escaladé';
      case 'delegated': return 'a délégué';
      case 'modified': return 'a modifié';
      case 'comment': return 'a commenté';
      default: return 'a agi sur';
    }
  };

  const getActionColor = (action: ActivityEntry['action']) => {
    switch (action) {
      case 'validated':
        return 'border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10';
      case 'rejected':
        return 'border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/10';
      case 'escalated':
        return 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-900/10';
      default:
        return 'border-l-slate-300 bg-white dark:bg-slate-800/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredActivities = activities.filter(a => {
    if (filter === 'all') return true;
    return a.action === filter;
  });

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold">Historique d'activité</h3>
        </div>
        <div className="flex items-center gap-2">
          {showFilters && (
            <div className="flex items-center gap-1 text-xs">
              {[
                { key: 'all', label: 'Tout' },
                { key: 'validated', label: '✅' },
                { key: 'rejected', label: '❌' },
                { key: 'created', label: '➕' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as typeof filter)}
                  className={cn(
                    "px-2 py-1 rounded-lg transition-colors",
                    filter === f.key
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={loadActivities}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 max-h-[300px] overflow-auto">
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <div className="text-sm">Aucune activité récente</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                className={cn(
                  "p-3 rounded-xl border-l-4 border border-slate-200/50 dark:border-slate-700/50 transition-all hover:shadow-sm",
                  getActionColor(activity.action)
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium">{activity.actor.name}</span>
                      <span className="text-slate-400 mx-1">{getActionLabel(activity.action)}</span>
                      {activity.document && (
                        <button
                          onClick={() => onViewDocument?.(activity.document!.id)}
                          className="font-mono text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {activity.document.id}
                        </button>
                      )}
                    </div>
                    
                    {activity.details && (
                      <div className="text-xs text-slate-400 mt-1">{activity.details}</div>
                    )}
                    
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>{formatTime(activity.timestamp)}</span>
                      <span>•</span>
                      <span>{activity.actor.role}</span>
                    </div>
                  </div>

                  {activity.document && onViewDocument && (
                    <button
                      onClick={() => onViewDocument(activity.document!.id)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredActivities.length >= limit && (
        <div className="px-4 py-2 border-t border-slate-200/70 dark:border-slate-700/50">
          <FluentButton size="xs" variant="secondary" className="w-full">
            Voir tout l'historique
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </FluentButton>
        </div>
      )}
    </div>
  );
}

export default ValidationBCActivityHistory;

