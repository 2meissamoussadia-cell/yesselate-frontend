/**
 * ContentRouter pour Audit
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Shield,
  Activity,
  Lock,
  CheckCircle2,
  Gauge,
  FileText,
  ScanSearch,
  FileBarChart,
  Settings,
  Loader2,
} from 'lucide-react';
import { useAuditCommandCenterStore } from '@/lib/stores/auditCommandCenterStore';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const AuditContentRouter = React.memo(function AuditContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Dashboard par défaut pour la vue overview
  if (category === 'overview') {
    return <OverviewDashboard />;
  }

  // Events view
  if (category === 'events') {
    return <EventsView subCategory={subCategory} />;
  }

  // Security view
  if (category === 'security') {
    return <SecurityView subCategory={subCategory} />;
  }

  // Compliance view
  if (category === 'compliance') {
    return <ComplianceView subCategory={subCategory} />;
  }

  // Performance view
  if (category === 'performance') {
    return <PerformanceView subCategory={subCategory} />;
  }

  // System Logs view
  if (category === 'system-logs') {
    return <SystemLogsView subCategory={subCategory} />;
  }

  // Traceability view
  if (category === 'traceability') {
    return <TraceabilityView subCategory={subCategory} />;
  }

  // Reports view
  if (category === 'reports') {
    return <ReportsView subCategory={subCategory} />;
  }

  // Settings view
  if (category === 'settings') {
    return <SettingsView subCategory={subCategory} />;
  }

  // Placeholder par défaut
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overview Dashboard
// ================================
const OverviewDashboard = React.memo(function OverviewDashboard() {
  const { openDetailPanel, openModal } = useAuditCommandCenterStore();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          icon={Activity}
          title="Événements Actifs"
          value="156"
          subtitle="+12 depuis hier"
          onClick={() => openModal('event-detail', { type: 'all' })}
          color="cyan"
        />
        <DashboardCard
          icon={Lock}
          title="Alertes Sécurité"
          value="12"
          subtitle="3 critiques"
          onClick={() => openModal('security-alert', {})}
          color="red"
        />
        <DashboardCard
          icon={CheckCircle2}
          title="Taux Conformité"
          value="94%"
          subtitle="+2% ce mois"
          onClick={() => openModal('compliance-check', {})}
          color="emerald"
        />
        <DashboardCard
          icon={Gauge}
          title="Score Performance"
          value="87%"
          subtitle="+3% cette semaine"
          onClick={() => openDetailPanel('event', 'performance', {})}
          color="blue"
        />
        <DashboardCard
          icon={FileText}
          title="Logs Système"
          value="234"
          subtitle="Aujourd'hui"
          onClick={() => openModal('event-detail', { type: 'system-logs' })}
          color="slate"
        />
        <DashboardCard
          icon={ScanSearch}
          title="Traçabilité OK"
          value="98%"
          subtitle="Excellent"
          onClick={() => openDetailPanel('trace', 'traceability', {})}
          color="emerald"
        />
      </div>

      {/* Recent Events Table */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-200">Événements récents</h3>
        </div>
        <div className="p-4">
          <div className="text-sm text-slate-400 text-center py-8">
            Liste des événements récents en cours de développement
          </div>
        </div>
      </div>
    </div>
  );
});

// ================================
// Events View
// ================================
const EventsView = React.memo(function EventsView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Événements</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Security View
// ================================
const SecurityView = React.memo(function SecurityView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Sécurité</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Compliance View
// ================================
const ComplianceView = React.memo(function ComplianceView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Conformité</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Performance View
// ================================
const PerformanceView = React.memo(function PerformanceView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Gauge className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Performance</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// System Logs View
// ================================
const SystemLogsView = React.memo(function SystemLogsView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Logs Système</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Traceability View
// ================================
const TraceabilityView = React.memo(function TraceabilityView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ScanSearch className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Traçabilité</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Reports View
// ================================
const ReportsView = React.memo(function ReportsView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileBarChart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Rapports</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Settings View
// ================================
const SettingsView = React.memo(function SettingsView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Paramètres</h3>
          <p className="text-slate-400">Sous-catégorie: {subCategory}</p>
          <p className="text-sm text-slate-600 mt-2">Contenu en cours de développement</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Dashboard Card Component
// ================================
interface DashboardCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  onClick?: () => void;
  color?: 'cyan' | 'red' | 'emerald' | 'blue' | 'slate';
}

const DashboardCard = React.memo(function DashboardCard({
  icon: Icon,
  title,
  value,
  subtitle,
  onClick,
  color = 'slate',
}: DashboardCardProps) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-6 rounded-lg border transition-all cursor-pointer',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-200 mb-1">{value}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  );
});

