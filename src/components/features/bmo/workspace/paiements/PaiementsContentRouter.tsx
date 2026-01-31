/**
 * Content Router pour Validation Paiements
 * Route le contenu selon la catégorie sidebar active
 */

'use client';

import React from 'react';
import { 
  PaiementsInboxView, 
  PaiementsEcheancierView, 
  PaiementsTresorerieView 
} from './views';
import type { PaiementsStats } from '@/lib/services/paiementsApiService';
import { PaiementsAnalyticsCharts } from './analytics/PaiementsAnalyticsCharts';
import { 
  LayoutDashboard,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Users,
  Shield,
} from 'lucide-react';

interface PaiementsContentRouterProps {
  category: string;
  subCategory: string | null;
  stats: PaiementsStats | null;
}

export function PaiementsContentRouter({
  category,
  subCategory,
  stats,
}: PaiementsContentRouterProps) {
  switch (category) {
    case 'overview':
      return <OverviewContent stats={stats} />;
    
    case 'pending':
      return <PendingContent subCategory={subCategory} stats={stats} />;
    
    case 'urgent':
      return <UrgentContent subCategory={subCategory} stats={stats} />;
    
    case 'validated':
      return <ValidatedContent subCategory={subCategory} />;
    
    case 'rejected':
      return <RejectedContent subCategory={subCategory} />;
    
    case 'scheduled':
      return <ScheduledContent subCategory={subCategory} stats={stats} />;
    
    case 'tresorerie':
      return <TresorerieContent subCategory={subCategory} stats={stats} />;
    
    case 'fournisseurs':
      return <FournisseursContent subCategory={subCategory} />;
    
    case 'audit':
      return <AuditContent subCategory={subCategory} />;
    
    default:
      return <OverviewContent stats={stats} />;
  }
}

// ================================
// Vue Overview (Dashboard)
// ================================
function OverviewContent({ stats }: { stats: PaiementsStats | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Vue d'ensemble</h2>
        <p className="text-slate-400">Tableau de bord des paiements</p>
      </div>

      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<LayoutDashboard className="h-5 w-5" />}
            color="text-slate-400"
          />
          <StatCard
            label="En attente"
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
            color="text-amber-400"
          />
          <StatCard
            label="Validés"
            value={stats.validated}
            icon={<CheckCircle className="h-5 w-5" />}
            color="text-emerald-400"
          />
          <StatCard
            label="Planifiés"
            value={stats.scheduled}
            icon={<Calendar className="h-5 w-5" />}
            color="text-blue-400"
          />
        </div>
      )}

      {/* Analytics Charts */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Analytics & Tendances</h3>
        <PaiementsAnalyticsCharts />
      </div>

      {/* Vue inbox par défaut */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Paiements récents</h3>
        <PaiementsInboxView
          tabId="overview-inbox"
          data={{ queue: 'all' }}
        />
      </div>
    </div>
  );
}

// ================================
// Vue À Valider
// ================================
function PendingContent({ 
  subCategory, 
  stats 
}: { 
  subCategory: string | null;
  stats: PaiementsStats | null;
}) {
  const titles: Record<string, string> = {
    'all': 'Tous les paiements à valider',
    'bf-pending': 'Paiements à valider - Bureau Finance',
    'dg-pending': 'Paiements à valider - Direction Générale',
  };

  const title = titles[subCategory || 'all'] || 'Paiements à valider';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">{title}</h2>
          <p className="text-slate-400 mt-1">
            {stats?.pending || 0} paiement(s) en attente de validation
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <PaiementsInboxView
          tabId="pending-inbox"
          data={{ 
            queue: 'pending',
            filter: { subCategory }
          }}
        />
      </div>
    </div>
  );
}

// ================================
// Vue Urgents
// ================================
function UrgentContent({ 
  subCategory,
  stats 
}: { 
  subCategory: string | null;
  stats: PaiementsStats | null;
}) {
  const titles: Record<string, string> = {
    'critical': 'Paiements critiques',
    'high': 'Paiements haute priorité',
  };

  const title = titles[subCategory || 'critical'] || 'Paiements urgents';
  const urgentCount = (stats?.byUrgency?.critical || 0) + (stats?.byUrgency?.high || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            {title}
          </h2>
          <p className="text-slate-400 mt-1">
            {urgentCount} paiement(s) urgents nécessitant attention
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 border-red-500/20 p-6">
        <PaiementsInboxView
          tabId="urgent-inbox"
          data={{ 
            queue: 'urgent',
            filter: { subCategory }
          }}
        />
      </div>
    </div>
  );
}

// ================================
// Vue Validés
// ================================
function ValidatedContent({ subCategory }: { subCategory: string | null }) {
  const titles: Record<string, string> = {
    'today': 'Paiements validés aujourd\'hui',
    'week': 'Paiements validés cette semaine',
    'month': 'Paiements validés ce mois',
  };

  const title = titles[subCategory || 'today'] || 'Paiements validés';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-emerald-400" />
          {title}
        </h2>
        <p className="text-slate-400 mt-1">Paiements approuvés et prêts pour traitement</p>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 border-emerald-500/20 p-6">
        <PaiementsInboxView
          tabId="validated-inbox"
          data={{ 
            queue: 'validated',
            filter: { subCategory }
          }}
        />
      </div>
    </div>
  );
}

// ================================
// Vue Rejetés
// ================================
function RejectedContent({ subCategory }: { subCategory: string | null }) {
  const titles: Record<string, string> = {
    'recent': 'Paiements récemment rejetés',
    'archived': 'Paiements rejetés archivés',
  };

  const title = titles[subCategory || 'recent'] || 'Paiements rejetés';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <XCircle className="h-6 w-6 text-red-400" />
          {title}
        </h2>
        <p className="text-slate-400 mt-1">Paiements refusés avec motifs</p>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <PaiementsInboxView
          tabId="rejected-inbox"
          data={{ 
            queue: 'rejected',
            filter: { subCategory }
          }}
        />
      </div>
    </div>
  );
}

// ================================
// Vue Planifiés
// ================================
function ScheduledContent({ 
  subCategory,
  stats 
}: { 
  subCategory: string | null;
  stats: PaiementsStats | null;
}) {
  // Si sous-catégorie "echeancier", afficher le calendrier
  if (subCategory === 'echeancier') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-400" />
            Échéancier des Paiements
          </h2>
          <p className="text-slate-400 mt-1">Calendrier interactif et planification</p>
        </div>

        <PaiementsEcheancierView />
      </div>
    );
  }

  // Sinon, afficher la vue liste
  const titles: Record<string, string> = {
    'upcoming': 'Paiements à venir',
    'in-progress': 'Paiements en cours de traitement',
  };

  const title = titles[subCategory || 'upcoming'] || 'Paiements planifiés';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-400" />
          {title}
        </h2>
        <p className="text-slate-400 mt-1">
          {stats?.scheduled || 0} paiement(s) planifiés
        </p>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <PaiementsInboxView
          tabId="scheduled-inbox"
          data={{ 
            queue: 'scheduled',
            filter: { subCategory }
          }}
        />
      </div>
    </div>
  );
}

// ================================
// Vue Trésorerie
// ================================
function TresorerieContent({ 
  subCategory,
  stats 
}: { 
  subCategory: string | null;
  stats: PaiementsStats | null;
}) {
  // Si sous-catégorie "dashboard" ou "flux", afficher la vue complète
  if (subCategory === 'dashboard' || subCategory === 'flux') {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            Trésorerie & Flux
          </h2>
          <p className="text-slate-400 mt-1">Dashboard financier complet avec prévisions</p>
        </div>

        <PaiementsTresorerieView />
      </div>
    );
  }

  // Sinon, afficher le résumé avec stats
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-400" />
          Trésorerie
        </h2>
        <p className="text-slate-400 mt-1">Tableau de bord financier</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats && (
          <>
            <StatCard
              label="Disponible"
              value={`${(stats.tresorerieDisponible / 1_000_000_000).toFixed(1)}Md FCFA`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="text-emerald-400"
            />
            <StatCard
              label="Échéances 7j"
              value={stats.echeancesJ7}
              icon={<Calendar className="h-5 w-5" />}
              color="text-amber-400"
            />
            <StatCard
              label="Échéances 30j"
              value={stats.echeancesJ30}
              icon={<Calendar className="h-5 w-5" />}
              color="text-blue-400"
            />
          </>
        )}
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Vue Trésorerie</h3>
          <p className="text-sm text-slate-400 mb-4">
            Sélectionnez "Dashboard" ou "Flux" dans le menu pour voir les graphiques détaillés
          </p>
        </div>
      </div>
    </div>
  );
}

// ================================
// Vue Fournisseurs
// ================================
function FournisseursContent({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-400" />
          Gestion Fournisseurs
        </h2>
        <p className="text-slate-400 mt-1">Paiements groupés par fournisseur</p>
      </div>

      <PlaceholderView
        icon={<Users className="h-12 w-12" />}
        title="Vue Fournisseurs"
        description="Liste des fournisseurs et historique paiements"
      />
    </div>
  );
}

// ================================
// Vue Audit
// ================================
function AuditContent({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-400" />
          Piste d'Audit
        </h2>
        <p className="text-slate-400 mt-1">Registre complet des décisions et actions</p>
      </div>

      <PlaceholderView
        icon={<Shield className="h-12 w-12" />}
        title="Vue Audit"
        description="Historique traçable des validations et rejets"
      />
    </div>
  );
}

// ================================
// Composants Helpers
// ================================
function StatCard({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: string;
}) {
  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4">
      <div className="flex items-center gap-3">
        <div className={`${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-200">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderView({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-slate-600 mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-4">{description}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 text-sm text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          En cours de développement
        </div>
      </div>
    </div>
  );
}

