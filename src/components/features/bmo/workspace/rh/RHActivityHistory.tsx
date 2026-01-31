'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  History, Search, Filter, Download, RefreshCw, 
  CheckCircle2, XCircle, Clock, FileText, MessageSquare,
  User, Calendar, ChevronDown, Eye
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type ActivityType = 'validation' | 'rejection' | 'creation' | 'comment' | 'document' | 'modification' | 'assignment';

type Activity = {
  id: string;
  type: ActivityType;
  demandId: string;
  demandType: string;
  agent: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  details?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

// ============================================
// DONNÉES MOCK
// ============================================

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'ACT-001',
    type: 'validation',
    demandId: 'RH-2026-0089',
    demandType: 'Congé',
    agent: 'Cheikh GUEYE',
    actor: { id: 'USR-001', name: 'Amadou DIALLO', role: 'DRH' },
    action: 'Demande validée',
    details: 'Congé annuel approuvé',
    timestamp: '09/01/2026 14:35',
  },
  {
    id: 'ACT-002',
    type: 'comment',
    demandId: 'RH-2026-0089',
    demandType: 'Congé',
    agent: 'Cheikh GUEYE',
    actor: { id: 'USR-001', name: 'Amadou DIALLO', role: 'DRH' },
    action: 'Commentaire ajouté',
    details: 'Merci de prévoir la passation des dossiers.',
    timestamp: '09/01/2026 14:30',
  },
  {
    id: 'ACT-003',
    type: 'rejection',
    demandId: 'RH-2026-0087',
    demandType: 'Dépense',
    agent: 'Fatou NDIAYE',
    actor: { id: 'USR-002', name: 'Moussa FALL', role: 'Chef comptable' },
    action: 'Demande rejetée',
    details: 'Justificatifs incomplets',
    timestamp: '09/01/2026 11:20',
  },
  {
    id: 'ACT-004',
    type: 'document',
    demandId: 'RH-2026-0086',
    demandType: 'Maladie',
    agent: 'Rama SY',
    actor: { id: 'EMP-009', name: 'Rama SY', role: 'Agent' },
    action: 'Document ajouté',
    details: 'Certificat médical téléchargé',
    timestamp: '09/01/2026 10:45',
  },
  {
    id: 'ACT-005',
    type: 'creation',
    demandId: 'RH-2026-0091',
    demandType: 'Déplacement',
    agent: 'Modou DIOP',
    actor: { id: 'EMP-010', name: 'Modou DIOP', role: 'Agent' },
    action: 'Demande créée',
    details: 'Mission à Saint-Louis du 15/01 au 18/01',
    timestamp: '09/01/2026 09:15',
  },
  {
    id: 'ACT-006',
    type: 'modification',
    demandId: 'RH-2026-0085',
    demandType: 'Congé',
    agent: 'Ndèye FAYE',
    actor: { id: 'EMP-011', name: 'Ndèye FAYE', role: 'Agent' },
    action: 'Demande modifiée',
    details: 'Dates ajustées: 20/01 - 27/01',
    timestamp: '08/01/2026 16:50',
  },
  {
    id: 'ACT-007',
    type: 'assignment',
    demandId: 'RH-2026-0084',
    demandType: 'Dépense',
    agent: 'Coumba FALL',
    actor: { id: 'USR-003', name: 'Système', role: 'Auto' },
    action: 'Demande assignée',
    details: 'Assignée à Amadou DIALLO pour validation',
    timestamp: '08/01/2026 14:00',
  },
  {
    id: 'ACT-008',
    type: 'validation',
    demandId: 'RH-2026-0083',
    demandType: 'Paie',
    agent: 'Ibrahima SARR',
    actor: { id: 'USR-001', name: 'Amadou DIALLO', role: 'DRH' },
    action: 'Avance validée',
    details: 'Avance sur salaire: 150,000 FCFA',
    timestamp: '08/01/2026 11:30',
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function RHActivityHistory() {
  const [activities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [filterDemandType, setFilterDemandType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrer les activités
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (filterType !== 'all' && a.type !== filterType) return false;
      if (filterDemandType !== 'all' && a.demandType !== filterDemandType) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          a.demandId.toLowerCase().includes(query) ||
          a.agent.toLowerCase().includes(query) ||
          a.actor.name.toLowerCase().includes(query) ||
          a.action.toLowerCase().includes(query) ||
          a.details?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activities, filterType, filterDemandType, search]);

  // Configuration des types d'activité
  const getTypeConfig = (type: ActivityType) => {
    switch (type) {
      case 'validation':
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Validation' };
      case 'rejection':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejet' };
      case 'creation':
        return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Création' };
      case 'comment':
        return { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Commentaire' };
      case 'document':
        return { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Document' };
      case 'modification':
        return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Modification' };
      case 'assignment':
        return { icon: User, color: 'text-teal-500', bg: 'bg-teal-500/10', label: 'Assignation' };
      default:
        return { icon: History, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Action' };
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: filteredActivities.length,
    validations: filteredActivities.filter(a => a.type === 'validation').length,
    rejections: filteredActivities.filter(a => a.type === 'rejection').length,
    today: filteredActivities.filter(a => a.timestamp.includes('09/01/2026')).length,
  }), [filteredActivities]);

  // Export
  const handleExport = () => {
    const csv = [
      ['ID', 'Type', 'Demande', 'Type Demande', 'Agent', 'Acteur', 'Action', 'Détails', 'Date'].join(','),
      ...filteredActivities.map(a => [
        a.id,
        a.type,
        a.demandId,
        a.demandType,
        a.agent,
        a.actor.name,
        a.action,
        `"${a.details || ''}"`,
        a.timestamp,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historique-rh-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const demandTypes = [...new Set(activities.map(a => a.demandType))];

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            Historique des actions
          </h2>
          <p className="text-sm text-slate-400">
            {stats.total} action{stats.total > 1 ? 's' : ''} • {stats.today} aujourd&apos;hui
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", showFilters && "rotate-180")} />
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.validations}</div>
          <div className="text-xs text-emerald-500">Validations</div>
        </div>
        <div className="p-3 rounded-xl bg-red-500/10">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejections}</div>
          <div className="text-xs text-red-500">Rejets</div>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.today}</div>
          <div className="text-xs text-blue-500">Aujourd&apos;hui</div>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                         bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            {/* Type d'action */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as ActivityType | 'all')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                       bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="all">Tous les types</option>
              <option value="validation">✅ Validations</option>
              <option value="rejection">❌ Rejets</option>
              <option value="creation">📄 Créations</option>
              <option value="comment">💬 Commentaires</option>
              <option value="document">📎 Documents</option>
              <option value="modification">✏️ Modifications</option>
              <option value="assignment">👤 Assignations</option>
            </select>

            {/* Type de demande */}
            <select
              value={filterDemandType}
              onChange={e => setFilterDemandType(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                       bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="all">Tous les types de demande</option>
              {demandTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date début</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                         bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date fin</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                         bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* Liste des activités */}
      <Card>
        <CardContent className="p-0">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune activité trouvée</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredActivities.map(activity => {
                const config = getTypeConfig(activity.type);
                const Icon = config.icon;
                const isExpanded = expandedId === activity.id;

                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-xl", config.bg)}>
                        <Icon className={cn("w-5 h-5", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{activity.action}</span>
                          <Badge variant="default" className="text-[10px]">
                            {activity.demandId}
                          </Badge>
                          <Badge variant="default" className={cn("text-[10px]", config.bg, config.color)}>
                            {activity.demandType}
                          </Badge>
                        </div>

                        <div className="text-sm text-slate-400 mt-1">
                          <span className="font-medium">{activity.agent}</span>
                          <span className="mx-1">•</span>
                          <span>par {activity.actor.name} ({activity.actor.role})</span>
                        </div>

                        {activity.details && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {activity.details}
                          </div>
                        )}

                        {isExpanded && (
                          <div className="mt-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{activity.timestamp}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <span>Acteur: {activity.actor.name}</span>
                            </div>
                            <button className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              Voir la demande
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {activity.timestamp.split(' ')[1]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

