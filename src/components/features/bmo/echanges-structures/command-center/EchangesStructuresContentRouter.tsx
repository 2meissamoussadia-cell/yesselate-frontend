/**
 * ContentRouter pour Échanges Structurés
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { echangesStructures, coordinationStats } from '@/lib/data';
import { useEchangesStructuresCommandCenterStore } from '@/lib/stores/echangesStructuresCommandCenterStore';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Mail } from 'lucide-react';

interface EchangesStructuresContentRouterProps {
  category: string;
  subCategory: string | null;
}

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const EchangesStructuresContentRouter = React.memo(function EchangesStructuresContentRouter({
  category,
  subCategory,
}: EchangesStructuresContentRouterProps) {
  const { filters, detailPanel, openDetailPanel } = useEchangesStructuresCommandCenterStore();
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  // Filtrer les échanges selon la catégorie et les filtres
  const filteredEchanges = useMemo(() => {
    let result = [...echangesStructures];

    // Filtrer par catégorie principale
    if (category !== 'overview' && category !== 'analytics' && category !== 'settings') {
      if (category === 'ouvert') {
        result = result.filter(e => e.status === 'ouvert');
      } else if (category === 'en_traitement') {
        result = result.filter(e => e.status === 'en_traitement');
      } else if (category === 'escalade') {
        result = result.filter(e => e.status === 'escalade');
      } else if (category === 'resolu') {
        result = result.filter(e => e.status === 'resolu');
      } else if (category === 'critiques') {
        result = result.filter(e => e.priority === 'critique');
      } else if (category === 'en_retard') {
        result = result.filter(e => e.autoEscalationWarning);
      }
    }

    // Filtrer par sous-catégorie (type)
    if (subCategory && subCategory !== 'all') {
      result = result.filter(e => e.type === subCategory);
    }

    // Appliquer les filtres du store
    if (filters.status.length > 0) {
      result = result.filter(e => filters.status.includes(e.status));
    }
    if (filters.type.length > 0) {
      result = result.filter(e => filters.type.includes(e.type));
    }
    if (filters.priority.length > 0) {
      result = result.filter(e => filters.priority.includes(e.priority));
    }
    if (filters.searchQuery.trim()) {
      const q = normalize(filters.searchQuery);
      result = result.filter(e =>
        normalize(e.id).includes(q) ||
        normalize(e.subject).includes(q) ||
        normalize(e.content).includes(q) ||
        normalize(e.from.bureau).includes(q) ||
        normalize(e.to.bureau).includes(q) ||
        normalize(e.linkedContext.label).includes(q)
      );
    }

    return result;
  }, [category, subCategory, filters]);

  const stats = coordinationStats.echanges;

  // Overview Dashboard
  if (category === 'overview') {
    return <OverviewView echanges={filteredEchanges} stats={stats} />;
  }

  // Analytics view
  if (category === 'analytics') {
    return <AnalyticsView />;
  }

  // Settings view
  if (category === 'settings') {
    return <SettingsView />;
  }

  // Liste des échanges pour les autres catégories
  return (
    <EchangesListView
      echanges={filteredEchanges}
      category={category}
      onEchangeClick={(id) => openDetailPanel(id, {})}
      selectedId={detailPanel.echangeId}
    />
  );
});

// ================================
// Overview View
// ================================
const OverviewView = React.memo(function OverviewView({
  echanges,
  stats,
}: {
  echanges: typeof echangesStructures;
  stats: typeof coordinationStats.echanges;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Principe clé */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <h3 className="font-bold text-blue-400">Pas un chat - Chaque échange a une intention</h3>
              <p className="text-sm text-slate-400">
                Type obligatoire (demande info, alerte risque...). Délai de réponse 48h max. Auto-escalade si non traité.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes */}
      {(stats.enRetard > 0 || stats.escalades > 0) && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">Attention requise</h3>
                <p className="text-sm text-slate-400">
                  {stats.enRetard > 0 && `${stats.enRetard} échange(s) en retard • `}
                  {stats.escalades > 0 && `${stats.escalades} escalade(s) en cours`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des échanges */}
      <div className="space-y-3">
        {echanges.slice(0, 10).map((echange) => (
          <EchangeCard key={echange.id} echange={echange} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
});

// ================================
// Echanges List View
// ================================
const EchangesListView = React.memo(function EchangesListView({
  echanges,
  category,
  onEchangeClick,
  selectedId,
}: {
  echanges: typeof echangesStructures;
  category: string;
  onEchangeClick: (id: string) => void;
  selectedId: string | null;
}) {
  return (
    <div className="p-6">
      <div className="space-y-3">
        {echanges.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Aucun échange trouvé</p>
            </CardContent>
          </Card>
        ) : (
          echanges.map((echange) => (
            <EchangeCard
              key={echange.id}
              echange={echange}
              onClick={() => onEchangeClick(echange.id)}
              isSelected={selectedId === echange.id}
            />
          ))
        )}
      </div>
    </div>
  );
});

// ================================
// Echange Card
// ================================
const EchangeCard = React.memo(function EchangeCard({
  echange,
  onClick,
  isSelected = false,
}: {
  echange: (typeof echangesStructures)[0];
  onClick: () => void;
  isSelected?: boolean;
}) {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      demande_info: '❓',
      alerte_risque: '🚨',
      proposition_substitution: '🔄',
      demande_validation: '✅',
      signalement_blocage: '🚫',
      coordination_urgente: '⚡',
    };
    return icons[type] || '📨';
  };

  const getDeadlineStatus = (deadline: string, status: string) => {
    if (status === 'resolu' || status === 'cloture_sans_suite') return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursRemaining < 0) return { label: 'En retard', color: 'red', urgent: true };
    if (hoursRemaining < 24) return { label: `${Math.round(hoursRemaining)}h restantes`, color: 'amber', urgent: true };
    if (hoursRemaining < 48) return { label: `${Math.round(hoursRemaining)}h restantes`, color: 'amber', urgent: false };
    return { label: `${Math.round(hoursRemaining / 24)}j restants`, color: 'emerald', urgent: false };
  };

  const deadlineStatus = getDeadlineStatus(echange.deadline, echange.status);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
        echange.status === 'escalade' && 'border-l-4 border-l-red-500',
        echange.autoEscalationWarning && 'border-l-4 border-l-amber-500',
        echange.status === 'resolu' && 'border-l-4 border-l-emerald-500 opacity-70'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{getTypeIcon(echange.type)}</span>
              <span className="font-mono text-xs text-blue-400">{echange.id}</span>
              <Badge
                variant={
                  echange.status === 'escalade'
                    ? 'urgent'
                    : echange.status === 'resolu'
                    ? 'success'
                    : echange.status === 'ouvert'
                    ? 'warning'
                    : 'info'
                }
              >
                {echange.status}
              </Badge>
              <Badge
                variant={
                  echange.priority === 'critique' ? 'urgent' : echange.priority === 'urgente' ? 'warning' : 'default'
                }
              >
                {echange.priority}
              </Badge>
            </div>
            <h3 className="font-bold mt-1">{echange.subject}</h3>
          </div>
          {deadlineStatus && (
            <Badge variant={deadlineStatus.urgent ? 'urgent' : 'default'} pulse={deadlineStatus.urgent}>
              ⏰ {deadlineStatus.label}
            </Badge>
          )}
        </div>

        {/* Flux */}
        <div className="flex items-center gap-3 mb-3 p-2 rounded bg-slate-700/30">
          <div className="text-center">
            <p className="text-[10px] text-slate-400">De</p>
            <BureauTag bureau={echange.from.bureau} />
            <p className="text-xs">{echange.from.employeeName}</p>
          </div>
          <span className="text-xl">→</span>
          <div className="text-center">
            <p className="text-[10px] text-slate-400">À</p>
            <BureauTag bureau={echange.to.bureau} />
            {echange.to.employeeName && <p className="text-xs">{echange.to.employeeName}</p>}
          </div>
        </div>

        {/* Contexte lié */}
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 mb-3">
          <p className="text-xs text-blue-400">
            🔗 {echange.linkedContext.type}: {echange.linkedContext.id}
          </p>
          <p className="text-sm">{echange.linkedContext.label}</p>
        </div>

        {/* Réponse attendue */}
        <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30 mb-3">
          <p className="text-xs text-purple-400">📋 Réponse attendue</p>
          <p className="text-sm">{echange.expectedResponse}</p>
        </div>

        {/* Réponses */}
        {echange.responses.length > 0 && (
          <div className="mb-3">
            <Badge variant="info">{echange.responses.length} réponse(s)</Badge>
            {echange.responses.some((r) => r.isResolutive) && (
              <Badge variant="success" className="ml-1">
                Résolutive
              </Badge>
            )}
          </div>
        )}

        {/* Alertes */}
        {echange.autoEscalationWarning && echange.status !== 'resolu' && echange.status !== 'escalade' && (
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 mb-3">
            <p className="text-xs text-amber-400">⚠️ Non traité depuis 48h+ - Escalade suggérée</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ================================
// Analytics View
// ================================
const AnalyticsView = React.memo(function AnalyticsView() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Analytiques</h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Settings View
// ================================
const SettingsView = React.memo(function SettingsView() {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center">
        <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Paramètres</h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});








