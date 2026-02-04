'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Shield, ArrowUpRight, CheckCircle2, FileText, Clock, 
  Building2, User, Hash, Search, Filter, Download, ChevronRight,
  AlertCircle, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blockedApi, type AuditEntry } from '@/lib/services/blockedApiService';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';

type Props = {
  tabId: string;
  data: Record<string, unknown>;
};

const ACTION_CONFIG: Record<string, { icon: typeof Eye; color: string; label: string }> = {
  created: { icon: FileText, color: 'text-blue-500', label: 'Créé' },
  updated: { icon: FileText, color: 'text-slate-400', label: 'Modifié' },
  escalated: { icon: ArrowUpRight, color: 'text-orange-500', label: 'Escaladé' },
  substituted: { icon: Shield, color: 'text-purple-500', label: 'Substitué' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Résolu' },
  reassigned: { icon: Building2, color: 'text-blue-500', label: 'Réassigné' },
  commented: { icon: FileText, color: 'text-slate-400', label: 'Commenté' },
};

export function BlockedAuditView({ tabId, data }: Props) {
  const { decisions } = useBlockedWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Load audit log
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const apiEntries = await blockedApi.getAuditLog(undefined, 100);
        setEntries(apiEntries);
      } catch (error) {
        console.error('Failed to load audit log:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Combine API entries with local decisions
  const allEntries = useMemo(() => {
    const localEntries: AuditEntry[] = decisions.map(d => ({
      id: d.batchId || `local-${d.at}`,
      at: d.at,
      action: d.action as AuditEntry['action'],
      dossierId: d.dossierId,
      dossierSubject: d.dossierSubject,
      userId: d.userId,
      userName: d.userName,
      userRole: d.userRole,
      details: d.details,
      hash: d.hash,
    }));

    return [...localEntries, ...entries].sort((a, b) => 
      new Date(b.at).getTime() - new Date(a.at).getTime()
    );
  }, [entries, decisions]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          entry.dossierId.toLowerCase().includes(q) ||
          entry.dossierSubject.toLowerCase().includes(q) ||
          entry.userName.toLowerCase().includes(q) ||
          entry.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allEntries, search, actionFilter]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, AuditEntry[]> = {};
    filteredEntries.forEach(entry => {
      const date = new Date(entry.at).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const formatTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportAudit = async () => {
    const csv = [
      ['Date', 'Heure', 'Action', 'Dossier ID', 'Sujet', 'Utilisateur', 'Rôle', 'Détails', 'Hash'],
      ...filteredEntries.map(e => [
        new Date(e.at).toLocaleDateString('fr-FR'),
        formatTime(e.at),
        e.action,
        e.dossierId,
        e.dossierSubject,
        e.userName,
        e.userRole,
        e.details,
        e.hash,
      ])
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-blocages-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-400" />
            Registre d'audit
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {filteredEntries.length} entrée(s) · Traçabilité complète des décisions
          </p>
        </div>

        <button
          onClick={exportAudit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4 text-slate-400" />
          Exporter
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans l'audit..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-slate-500/20 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les actions</SelectItem>
            <SelectItem value="escalated">Escalades</SelectItem>
            <SelectItem value="substituted">Substitutions</SelectItem>
            <SelectItem value="resolved">Résolutions</SelectItem>
            <SelectItem value="reassigned">Réassignations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit entries grouped by date */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dayEntries]) => (
          <div key={date}>
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              {date}
            </h3>
            <div className="space-y-2">
              {dayEntries.map((entry) => {
                const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.updated;
                const Icon = config.icon;

                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg bg-slate-100 dark:bg-slate-800")}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}>
                            {config.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(entry.at)}
                          </span>
                        </div>

                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {entry.dossierSubject}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {entry.details}
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {entry.userName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {entry.userRole}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Hash className="w-3 h-3" />
                            {entry.hash.substring(0, 20)}...
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {entry.dossierId}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune entrée d'audit</p>
          <p className="text-sm mt-1">Les actions seront enregistrées ici</p>
        </div>
      )}

      {/* Integrity notice */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-purple-500" />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
              Intégrité garantie par SHA-256
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Chaque entrée est signée cryptographiquement et immuable. Les hashes peuvent être vérifiés indépendamment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

