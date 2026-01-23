/**
 * ContentRouter pour Conférences
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 * Affiche les conférences filtrées avec cartes
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, Calendar, Clock, Users, AlertTriangle, Gavel, Briefcase, Unlock, CheckCircle2 } from 'lucide-react';
import { conferencesDecisionnelles } from '@/lib/data';
import type { ConferenceDecisionnelle } from '@/lib/types/bmo.types';
import type { ConferencesActiveFilters } from '@/lib/stores/conferencesCommandCenterStore';

interface ContentRouterProps {
  category: string;
  subCategory: string | null;
  filters?: ConferencesActiveFilters;
  onSelectConference?: (id: string) => void;
  selectedConferenceId?: string | null;
}

export const ConferencesContentRouter = React.memo(function ConferencesContentRouter({
  category,
  subCategory,
  filters,
  onSelectConference,
  selectedConferenceId,
}: ContentRouterProps) {
  // Filtrer les conférences selon la catégorie et les filtres
  const filteredConferences = useMemo(() => {
    let filtered = [...conferencesDecisionnelles];

    // Filtre par catégorie principale
    if (category === 'planned') {
      filtered = filtered.filter((c) => c.status === 'planifiee');
    } else if (category === 'ongoing') {
      filtered = filtered.filter((c) => c.status === 'en_cours');
    } else if (category === 'completed') {
      filtered = filtered.filter((c) => c.status === 'terminee');
    } else if (category === 'crisis') {
      filtered = filtered.filter((c) => c.type === 'crise');
    } else if (category === 'arbitrage') {
      filtered = filtered.filter((c) => c.type === 'arbitrage');
    } else if (category === 'revue_projet') {
      filtered = filtered.filter((c) => c.type === 'revue_projet');
    } else if (category === 'comite_direction') {
      filtered = filtered.filter((c) => c.type === 'comite_direction');
    } else if (category === 'resolution_blocage') {
      filtered = filtered.filter((c) => c.type === 'resolution_blocage');
    }

    // Appliquer les filtres du store
    if (filters) {
      if (filters.statuses.length > 0) {
        filtered = filtered.filter((c) => filters.statuses.includes(c.status));
      }
      if (filters.types.length > 0) {
        filtered = filtered.filter((c) => filters.types.includes(c.type));
      }
      if (filters.priorities.length > 0) {
        filtered = filtered.filter((c) => filters.priorities.includes(c.priority));
      }
      if (filters.bureaux.length > 0) {
        filtered = filtered.filter((c) =>
          c.participants.some((p) => filters.bureaux.includes(p.bureau))
        );
      }
      if (filters.dateRange.start || filters.dateRange.end) {
        filtered = filtered.filter((c) => {
          const confDate = new Date(c.scheduledAt);
          if (filters.dateRange.start && confDate < filters.dateRange.start) return false;
          if (filters.dateRange.end && confDate > filters.dateRange.end) return false;
          return true;
        });
      }
    }

    // Tri par date (plus récentes d'abord)
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduledAt).getTime();
      const dateB = new Date(b.scheduledAt).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [category, filters]);

  // Vue d'ensemble
  if (category === 'overview') {
    return <OverviewView conferences={filteredConferences} onSelectConference={onSelectConference} selectedConferenceId={selectedConferenceId} />;
  }

  // Vues par catégorie avec liste
  return (
    <ConferencesListView
      conferences={filteredConferences}
      category={category}
      subCategory={subCategory}
      onSelectConference={onSelectConference}
      selectedConferenceId={selectedConferenceId}
    />
  );
});

// ================================
// Overview View
// ================================
function OverviewView({
  conferences,
  onSelectConference,
  selectedConferenceId,
}: {
  conferences: ConferenceDecisionnelle[];
  onSelectConference?: (id: string) => void;
  selectedConferenceId?: string | null;
}) {
  const stats = useMemo(() => {
    return {
      total: conferences.length,
      planifiees: conferences.filter((c) => c.status === 'planifiee').length,
      enCours: conferences.filter((c) => c.status === 'en_cours').length,
      terminees: conferences.filter((c) => c.status === 'terminee').length,
      critiques: conferences.filter((c) => c.priority === 'critique' && c.status === 'planifiee').length,
    };
  }, [conferences]);

  const nowMs = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const soonCount = conferences.filter((c) => {
    if (c.status !== 'planifiee') return false;
    const d = new Date(c.scheduledAt);
    if (!d || isNaN(d.getTime())) return false;
    const delta = d.getTime() - nowMs;
    return delta > 0 && delta <= DAY_MS;
  }).length;

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-1">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.planifiees}</p>
            <p className="text-xs text-slate-400 mt-1">Planifiées</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.enCours}</p>
            <p className="text-xs text-slate-400 mt-1">En cours</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.terminees}</p>
            <p className="text-xs text-slate-400 mt-1">Terminées</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critiques}</p>
            <p className="text-xs text-slate-400 mt-1">Critiques</p>
            {soonCount > 0 && (
              <Badge variant="warning" className="mt-1 text-xs">
                {soonCount} bientôt
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste récente */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Video className="h-5 w-5 text-purple-400" />
          Conférences récentes
        </h2>
        <div className="grid gap-4">
          {conferences.slice(0, 10).map((conf) => (
            <ConferenceCard
              key={conf.id}
              conference={conf}
              isSelected={selectedConferenceId === conf.id}
              onSelect={() => onSelectConference?.(conf.id)}
            />
          ))}
        </div>
        {conferences.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Aucune conférence</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ================================
// List View
// ================================
function ConferencesListView({
  conferences,
  category,
  subCategory,
  onSelectConference,
  selectedConferenceId,
}: {
  conferences: ConferenceDecisionnelle[];
  category: string;
  subCategory: string | null;
  onSelectConference?: (id: string) => void;
  selectedConferenceId?: string | null;
}) {
  const categoryLabels: Record<string, string> = {
    planned: 'Planifiées',
    ongoing: 'En cours',
    completed: 'Terminées',
    crisis: 'Crises',
    arbitrage: 'Arbitrages',
    revue_projet: 'Revues projet',
    comite_direction: 'Comités direction',
    resolution_blocage: 'Résolutions blocage',
  };

  const categoryIcons: Record<string, typeof Video> = {
    planned: Calendar,
    ongoing: Clock,
    completed: CheckCircle2,
    crisis: AlertTriangle,
    arbitrage: Gavel,
    revue_projet: Briefcase,
    comite_direction: Users,
    resolution_blocage: Unlock,
  };

  const Icon = categoryIcons[category] || Video;
  const label = categoryLabels[category] || category;

  return (
    <div className="p-6 space-y-4 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold text-slate-200">{label}</h2>
          <Badge className="text-sm">
            {conferences.length}
          </Badge>
        </div>
      </div>

      {/* Liste */}
      <div className="grid gap-4">
        {conferences.map((conf) => (
          <ConferenceCard
            key={conf.id}
            conference={conf}
            isSelected={selectedConferenceId === conf.id}
            onSelect={() => onSelectConference?.(conf.id)}
          />
        ))}
      </div>

      {conferences.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune conférence trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ================================
// Conference Card
// ================================
function ConferenceCard({
  conference,
  isSelected,
  onSelect,
}: {
  conference: ConferenceDecisionnelle;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      crise: '🚨',
      arbitrage: '⚖️',
      revue_projet: '📊',
      comite_direction: '👔',
      resolution_blocage: '🔓',
    };
    return icons[type] || '📹';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'info' | 'warning' | 'urgent'> = {
      normale: 'default',
      haute: 'info',
      urgente: 'warning',
      critique: 'urgent',
    };
    return variants[priority] || 'default';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'success' | 'info'> = {
      planifiee: 'warning',
      en_cours: 'info',
      terminee: 'success',
      annulee: 'default',
    };
    return variants[status] || 'default';
  };

  const formatDateFR = (d: Date) => d.toLocaleDateString('fr-FR');
  const formatTimeFR = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const scheduled = new Date(conference.scheduledAt);
  const nowMs = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const delta = scheduled.getTime() - nowMs;
  const isSoon = conference.status === 'planifiee' && delta > 0 && delta <= DAY_MS;
  const isOverdue = conference.status === 'planifiee' && scheduled.getTime() < nowMs;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-purple-500/50',
        isSelected && 'ring-2 ring-purple-500',
        conference.status === 'planifiee' && conference.priority === 'critique' && 'border-l-4 border-l-red-500',
        conference.status === 'planifiee' && conference.priority !== 'critique' && 'border-l-4 border-l-amber-500',
        conference.status === 'terminee' && 'border-l-4 border-l-emerald-500 opacity-90'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-lg">{getTypeIcon(conference.type)}</span>
              <span className="font-mono text-xs text-purple-400">{conference.id}</span>
              <Badge variant={getStatusBadge(conference.status)}>{conference.status}</Badge>
              <Badge variant={getPriorityBadge(conference.priority)}>{conference.priority}</Badge>
              {isSoon && <Badge variant="urgent" pulse>Bientôt</Badge>}
              {isOverdue && <Badge variant="urgent">En retard</Badge>}
            </div>
            <h3 className="font-bold text-slate-200 mb-1">{conference.title}</h3>
            <p className="text-sm text-slate-400">
              {formatDateFR(scheduled)} à {formatTimeFR(scheduled)} • {conference.duration}min
            </p>
          </div>
        </div>

        {/* Contexte lié */}
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 mb-3">
          <p className="text-xs text-blue-400 mb-1">🔗 {conference.linkedContext.type}</p>
          <p className="text-sm font-medium text-slate-200">{conference.linkedContext.label}</p>
        </div>

        {/* Participants preview */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-400">{conference.participants.length} participant(s)</span>
          </div>
          <Badge variant="default" className="text-xs">{conference.location}</Badge>
        </div>

        {/* Décisions extraites */}
        {conference.decisionsExtracted.length > 0 && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50">
            <Badge variant="success" className="text-xs">
              ✓ {conference.decisionsExtracted.length} décision(s) extraite(s)
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
