/**
 * ContentRouter pour Clients - Version 2.0
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 * Architecture visuelle cohérente avec le Dashboard BMO
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Crown,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  FileText,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Activity,
  Eye,
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  Award,
  Briefcase,
  Globe,
  HandshakeIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ClientsGrowthChart,
  ClientsRevenueChart,
  ClientsSatisfactionChart,
  ClientsSectorChart,
  ClientsRegionChart,
  ClientsLifecycleChart,
  ClientsMonthlyRevenueChart,
  ClientsInteractionsHeatmap,
} from './ClientsAnalyticsCharts';

interface ContentRouterProps {
  category: string;
  subCategory: string;
  onViewClient?: (client: any) => void;
  onEditClient?: (client: any) => void;
  onDeleteClient?: (id: string) => void;
}

// ================================
// Mock Data
// ================================
const mockStats = {
  totalClients: 156,
  prospects: 12,
  premium: 8,
  litiges: 3,
  satisfaction: 94,
  caTotal: '4.2M€',
  caGrowth: '+9.8%',
  retention: 92,
  newThisMonth: 8,
  churnRisk: 5,
};

const mockClients = [
  { id: '1', name: 'Groupe Delta', type: 'premium', sector: 'Technologie', ca: '450K€', satisfaction: 98, since: '2021', city: 'Paris', status: 'active', contacts: 12 },
  { id: '2', name: 'Omega Corp', type: 'premium', sector: 'Industrie', ca: '380K€', satisfaction: 95, since: '2019', city: 'Lyon', status: 'active', contacts: 8 },
  { id: '3', name: 'Sigma Holdings', type: 'premium', sector: 'Finance', ca: '320K€', satisfaction: 92, since: '2020', city: 'Marseille', status: 'active', contacts: 6 },
  { id: '4', name: 'Alpha Services', type: 'standard', sector: 'Services', ca: '150K€', satisfaction: 88, since: '2022', city: 'Bordeaux', status: 'active', contacts: 4 },
  { id: '5', name: 'Beta Industries', type: 'standard', sector: 'Industrie', ca: '120K€', satisfaction: 85, since: '2023', city: 'Toulouse', status: 'pending', contacts: 3 },
  { id: '6', name: 'Gamma Tech', type: 'prospect', sector: 'Technologie', ca: '-', satisfaction: 0, since: '2024', city: 'Nantes', status: 'prospect', contacts: 2 },
];

const mockProspects = [
  { id: '1', name: 'Tech Innovations SARL', contact: 'Marie Dupont', email: 'marie@techinno.fr', phone: '+33 6 12 34 56 78', source: 'Site web', status: 'hot', value: '85K€', lastContact: '1 jour', progress: 75 },
  { id: '2', name: 'Green Energy Corp', contact: 'Paul Martin', email: 'paul@greenenergy.fr', phone: '+33 6 98 76 54 32', source: 'Recommandation', status: 'warm', value: '120K€', lastContact: '3 jours', progress: 50 },
  { id: '3', name: 'Digital Solutions', contact: 'Sophie Bernard', email: 'sophie@digitalsol.fr', phone: '+33 6 45 67 89 01', source: 'Salon', status: 'cold', value: '45K€', lastContact: '1 semaine', progress: 25 },
];

const mockLitiges = [
  { id: '1', client: 'Epsilon SA', subject: 'Retard de livraison', severity: 'high', date: '2025-01-08', status: 'open', amount: '12K€', daysOpen: 5 },
  { id: '2', client: 'Zeta Corp', subject: 'Qualité non conforme', severity: 'medium', date: '2025-01-05', status: 'in_progress', amount: '5K€', daysOpen: 8 },
  { id: '3', client: 'Eta Industries', subject: 'Facturation erronée', severity: 'low', date: '2025-01-03', status: 'resolved', amount: '2K€', daysOpen: 0 },
];

// ================================
// Main Router
// ================================
export const ClientsContentRouter = React.memo(function ClientsContentRouter({
  category,
  subCategory,
  onViewClient,
  onEditClient,
  onDeleteClient,
}: ContentRouterProps) {
  // Pass callbacks to views
  const viewProps = { onViewClient, onEditClient, onDeleteClient };
  
  switch (category) {
    case 'overview':
      return <OverviewDashboard {...viewProps} />;
    case 'prospects':
      return <ProspectsView subCategory={subCategory} {...viewProps} />;
    case 'premium':
      return <PremiumView subCategory={subCategory} {...viewProps} />;
    case 'litiges':
      return <LitigesView subCategory={subCategory} />;
    case 'historique':
      return <HistoriqueView subCategory={subCategory} />;
    case 'contrats':
      return <ContratsView subCategory={subCategory} />;
    case 'performance':
      return <PerformanceView subCategory={subCategory} />;
    case 'entreprises':
      return <EntreprisesView subCategory={subCategory} {...viewProps} />;
    case 'interactions':
      return <InteractionsView subCategory={subCategory} />;
    default:
      return <OverviewDashboard {...viewProps} />;
  }
});

// ================================
// Overview Dashboard - Vue principale sophistiquée
// ================================
function OverviewDashboard({ onViewClient, onEditClient, onDeleteClient }: Partial<ContentRouterProps> = {}) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // KPIs principaux
  const kpis = [
    { id: 'clients', label: 'Clients Actifs', value: mockStats.totalClients, trend: 8, icon: Users, color: 'cyan' },
    { id: 'prospects', label: 'Prospects', value: mockStats.prospects, trend: 3, icon: UserPlus, color: 'blue' },
    { id: 'premium', label: 'Premium', value: mockStats.premium, trend: 1, icon: Crown, color: 'amber' },
    { id: 'litiges', label: 'En Litige', value: mockStats.litiges, trend: -1, icon: AlertTriangle, color: mockStats.litiges > 0 ? 'rose' : 'slate' },
  ];

  const topClients = mockClients.filter(c => c.type === 'premium').slice(0, 3);
  const recentActivity = mockClients.slice(0, 4);
  const atRiskClients = mockClients.filter(c => c.satisfaction < 88).slice(0, 3);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Critical Alert Banner */}
      {mockStats.litiges > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {mockStats.litiges} litige(s) en cours nécessitant une attention
                </p>
                <p className="text-sm text-slate-400">
                  Impact potentiel sur la satisfaction client — Actions requises
                </p>
              </div>
            </div>
            <Button className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5">
              Traiter maintenant
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Churn Risk Alert */}
      {mockStats.churnRisk > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {mockStats.churnRisk} clients à risque de churn détectés
                </p>
                <p className="text-sm text-slate-400">
                  Score de satisfaction inférieur au seuil critique
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
              Voir les détails
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Section KPIs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Indicateurs Clés
          </h2>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const iconColorClasses: Record<string, string> = {
              cyan: 'text-cyan-400',
              blue: 'text-blue-400',
              amber: 'text-amber-400',
              rose: 'text-rose-400',
              slate: 'text-slate-400',
            };

            return (
              <button
                key={kpi.id}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
                    <Icon className={cn('w-5 h-5', iconColorClasses[kpi.color])} />
                  </div>
                  {kpi.trend !== 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium">
                      {kpi.trend > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">+{Math.abs(kpi.trend)}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">{kpi.trend}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-200">{kpi.value}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{kpi.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section Clients Premium + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients Premium */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              Top Clients Premium
            </h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{mockStats.premium}</Badge>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 text-xs">
                Voir tout
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {topClients.map((client, idx) => (
              <button
                key={client.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                  <span className="text-sm font-bold text-amber-400">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200 truncate">{client.name}</p>
                    <Crown className="w-3 h-3 text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-400">{client.sector} • {client.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-400">{client.ca}</p>
                  <div className="flex items-center justify-end gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-400">{client.satisfaction}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Performance Globale */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Performance Globale
            </h2>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 text-xs">
              Détails
            </Button>
          </div>

          <div className="p-4 space-y-4">
            {/* Main metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Satisfaction</span>
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400">{mockStats.satisfaction}%</span>
                  <span className="text-xs text-emerald-400">+2%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Rétention</span>
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-400">{mockStats.retention}%</span>
                  <span className="text-xs text-emerald-400">+1%</span>
                </div>
              </div>
            </div>

            {/* CA */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Chiffre d'affaires total</p>
                  <p className="text-2xl font-bold text-slate-200">{mockStats.caTotal}</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">{mockStats.caGrowth}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section Actions Rapides + Activité Récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Rapides */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden lg:col-span-1">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Actions Rapides
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <QuickActionButton
              icon={UserPlus}
              title="Nouveau client"
              description="Ajouter un client ou prospect"
              color="cyan"
            />
            <QuickActionButton
              icon={MessageSquare}
              title="Nouvelle interaction"
              description="Enregistrer un échange client"
              color="blue"
            />
            <QuickActionButton
              icon={FileText}
              title="Créer un contrat"
              description="Générer un nouveau contrat"
              color="purple"
            />
            <QuickActionButton
              icon={BarChart3}
              title="Rapport client"
              description="Analyser la performance"
              color="emerald"
            />
          </div>
        </section>

        {/* Activité Récente */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Activité Récente
            </h2>
            <Badge variant="default">{recentActivity.length}</Badge>
          </div>

          <div className="divide-y divide-slate-800/50">
            {recentActivity.map((client) => (
              <button
                key={client.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  client.type === 'premium' ? 'bg-amber-500' :
                  client.type === 'prospect' ? 'bg-blue-500' :
                  'bg-cyan-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{client.name}</p>
                  <p className="text-xs text-slate-400">{client.sector}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {client.city}
                  </Badge>
                  <span className="text-xs font-medium text-slate-400">
                    {client.ca}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Section Analytics Charts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Analytics & Tendances
          </h2>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 text-xs gap-1.5">
            <Eye className="w-4 h-4" />
            Voir détails
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Croissance clients */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Évolution du portefeuille
            </h3>
            <ClientsGrowthChart />
          </div>

          {/* Répartition CA */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Répartition du chiffre d'affaires
            </h3>
            <ClientsRevenueChart />
          </div>

          {/* Satisfaction */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Évolution de la satisfaction
            </h3>
            <ClientsSatisfactionChart />
          </div>

          {/* Cycle de vie */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Cycle de vie clients
            </h3>
            <ClientsLifecycleChart />
          </div>
        </div>
      </section>

      {/* Clients à risque */}
      {atRiskClients.length > 0 && (
        <section className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-200">
                Clients à surveiller
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Ces clients présentent des indicateurs de satisfaction en baisse. 
                Une action proactive est recommandée.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {atRiskClients.map(client => (
                  <Badge key={client.id} className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {client.name} ({client.satisfaction}%)
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gouvernance Info */}
      <section className="rounded-xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">
              Gouvernance Client — Relation stratégique
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Chaque client représente une relation à long terme. Les indicateurs de satisfaction 
              et de rétention guident les actions prioritaires pour maintenir un portefeuille sain.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ================================
// Prospects View
// ================================
function ProspectsView({ subCategory, onViewClient, onEditClient, onDeleteClient }: { subCategory: string } & Partial<ContentRouterProps>) {
  const filteredProspects = subCategory === 'all' 
    ? mockProspects 
    : mockProspects.filter(p => p.status === subCategory);

  const stats = {
    total: mockProspects.length,
    hot: mockProspects.filter(p => p.status === 'hot').length,
    warm: mockProspects.filter(p => p.status === 'warm').length,
    cold: mockProspects.filter(p => p.status === 'cold').length,
    totalValue: mockProspects.reduce((acc, p) => acc + parseInt(p.value.replace('K€', '')) * 1000, 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            Pipeline Prospects
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {filteredProspects.length} prospect(s) • Valeur potentielle: {(stats.totalValue / 1000).toFixed(0)}K€
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-1.5">
          <UserPlus className="w-4 h-4" />
          Nouveau prospect
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total" value={stats.total} color="blue" />
        <StatCard icon={Zap} label="Chauds 🔥" value={stats.hot} color="rose" />
        <StatCard icon={Activity} label="Tièdes ☀️" value={stats.warm} color="amber" />
        <StatCard icon={Clock} label="Froids ❄️" value={stats.cold} color="blue" />
      </div>

      {/* Prospects Pipeline */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200">Pipeline de conversion</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 h-8 gap-1">
              <Filter className="w-3 h-3" />
              Filtrer
            </Button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/50">
          {filteredProspects.map((prospect) => (
            <div
              key={prospect.id}
              className="flex items-center gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors"
            >
              {/* Status indicator */}
              <div className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                prospect.status === 'hot' ? 'bg-rose-500 animate-pulse' :
                prospect.status === 'warm' ? 'bg-amber-500' :
                'bg-blue-500'
              )} />

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-200">{prospect.name}</p>
                  <Badge
                    className={cn(
                      'text-xs',
                      prospect.status === 'hot' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      prospect.status === 'warm' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    )}
                  >
                    {prospect.status === 'hot' ? '🔥 Chaud' : prospect.status === 'warm' ? '☀️ Tiède' : '❄️ Froid'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {prospect.contact}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {prospect.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {prospect.lastContact}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-32">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Progression</span>
                  <span className="text-slate-300">{prospect.progress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      prospect.progress >= 75 ? 'bg-emerald-500' :
                      prospect.progress >= 50 ? 'bg-amber-500' :
                      'bg-blue-500'
                    )}
                    style={{ width: `${prospect.progress}%` }}
                  />
                </div>
              </div>

              {/* Value */}
              <div className="text-right">
                <p className="text-lg font-bold text-cyan-400">{prospect.value}</p>
                <p className="text-xs text-slate-400">Potentiel</p>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-600" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ================================
// Premium View
// ================================
function PremiumView({ subCategory, onViewClient, onEditClient, onDeleteClient }: { subCategory: string } & Partial<ContentRouterProps>) {
  const premiumClients = mockClients.filter(c => c.type === 'premium');

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Clients Premium
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Vos {premiumClients.length} comptes stratégiques prioritaires
          </p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1">
          <Crown className="w-4 h-4 mr-2" />
          {premiumClients.length} clients
        </Badge>
      </div>

      {/* Premium Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Clients Premium</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">{premiumClients.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">CA Premium</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">1.15M€</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Satisfaction moy.</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">95%</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <HandshakeIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Contrats actifs</span>
          </div>
          <p className="text-2xl font-bold text-slate-200">24</p>
        </div>
      </div>

      {/* Premium Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {premiumClients.map((client, idx) => (
          <div
            key={client.id}
            className="p-6 rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/20 hover:from-slate-800 hover:to-amber-950/30 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                  <span className="text-lg font-bold text-amber-400">#{idx + 1}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">{client.name}</h3>
                  <p className="text-sm text-slate-400">{client.sector} • Client depuis {client.since}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-amber-400">{client.satisfaction}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-slate-800/50">
                <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-200">{client.ca}</p>
                <p className="text-xs text-slate-400">CA Annuel</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-800/50">
                <MessageSquare className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-200">{client.contacts}</p>
                <p className="text-xs text-slate-400">Contacts</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-800/50">
                <MapPin className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-sm font-medium text-slate-200">{client.city}</p>
                <p className="text-xs text-slate-400">Localisation</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Litiges View
// ================================
function LitigesView({ subCategory }: { subCategory: string }) {
  const filteredLitiges = subCategory === 'all'
    ? mockLitiges
    : mockLitiges.filter(l => l.status === subCategory);

  const stats = {
    open: mockLitiges.filter(l => l.status === 'open').length,
    inProgress: mockLitiges.filter(l => l.status === 'in_progress').length,
    resolved: mockLitiges.filter(l => l.status === 'resolved').length,
    totalAmount: mockLitiges.filter(l => l.status !== 'resolved').reduce((acc, l) => acc + parseInt(l.amount.replace('K€', '')) * 1000, 0),
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header Alert */}
      <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {stats.open + stats.inProgress} litige(s) actif(s)
            </h1>
            <p className="text-slate-400">
              Impact financier estimé: {(stats.totalAmount / 1000).toFixed(0)}K€
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={AlertTriangle} label="Ouverts" value={stats.open} color="rose" />
          <StatCard icon={Activity} label="En cours" value={stats.inProgress} color="amber" />
          <StatCard icon={CheckCircle2} label="Résolus" value={stats.resolved} color="emerald" />
        </div>
      </div>

      {/* Litiges List */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Dossiers de litige
          </h2>
          <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5">
            <Zap className="w-3 h-3" />
            Traiter
          </Button>
        </div>

        <div className="divide-y divide-slate-800/50">
          {filteredLitiges.map((litige) => (
            <div
              key={litige.id}
              className={cn(
                'flex items-center gap-4 px-4 py-4 transition-colors cursor-pointer',
                litige.severity === 'high' ? 'hover:bg-rose-500/5' :
                litige.severity === 'medium' ? 'hover:bg-amber-500/5' :
                'hover:bg-slate-800/40'
              )}
            >
              <div className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                litige.severity === 'high' ? 'bg-rose-500 animate-pulse' :
                litige.severity === 'medium' ? 'bg-amber-500' :
                'bg-slate-500'
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-200">{litige.client}</p>
                  <Badge
                    className={cn(
                      'text-xs',
                      litige.status === 'open' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      litige.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    )}
                  >
                    {litige.status === 'open' ? 'Ouvert' : litige.status === 'in_progress' ? 'En cours' : 'Résolu'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{litige.subject}</p>
                {litige.daysOpen > 0 && (
                  <p className="text-xs text-slate-600 mt-1">Ouvert depuis {litige.daysOpen} jour(s)</p>
                )}
              </div>
              <div className="text-right">
                <p className={cn(
                  'text-lg font-bold',
                  litige.severity === 'high' ? 'text-rose-400' : 'text-slate-300'
                )}>
                  {litige.amount}
                </p>
                <p className="text-xs text-slate-400">Impact</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ================================
// Performance View
// ================================
function PerformanceView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Performance Client
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyse des indicateurs clés de performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfaction */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Évolution de la satisfaction
          </h3>
          <ClientsSatisfactionChart />
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Évolution du CA
          </h3>
          <ClientsMonthlyRevenueChart />
        </div>

        {/* Secteurs */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            Répartition par secteur
          </h3>
          <ClientsSectorChart />
        </div>

        {/* Régions */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            Répartition géographique
          </h3>
          <ClientsRegionChart />
        </div>
      </div>
    </div>
  );
}

// ================================
// Entreprises View
// ================================
function EntreprisesView({ subCategory, onViewClient, onEditClient, onDeleteClient }: { subCategory: string } & Partial<ContentRouterProps>) {
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Entreprises Clientes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {mockClients.length} entreprises dans le portefeuille
          </p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Building2 className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockClients.map((client) => (
          <div
            key={client.id}
            onClick={() => onViewClient?.(client)}
            className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  client.type === 'premium' ? 'bg-amber-500/20 border border-amber-500/30' :
                  client.type === 'prospect' ? 'bg-blue-500/20 border border-blue-500/30' :
                  'bg-slate-800 border border-slate-700/50'
                )}>
                  {client.type === 'premium' ? (
                    <Crown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Building2 className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {client.name}
                  </h3>
                  <p className="text-sm text-slate-400">{client.sector}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-cyan-400">{client.ca}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{client.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" />
                <span>{client.satisfaction}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Historique View
// ================================
function HistoriqueView({ subCategory }: { subCategory: string }) {
  const history = [
    { id: '1', type: 'interaction', client: 'Groupe Delta', action: 'Appel commercial', date: 'Il y a 2h', user: 'Marie D.' },
    { id: '2', type: 'contract', client: 'Omega Corp', action: 'Renouvellement contrat', date: 'Il y a 1j', user: 'Jean P.' },
    { id: '3', type: 'litige', client: 'Epsilon SA', action: 'Ouverture litige', date: 'Il y a 2j', user: 'System' },
    { id: '4', type: 'new', client: 'Tech Innovations', action: 'Nouveau prospect', date: 'Il y a 3j', user: 'Sophie B.' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Historique des activités
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Chronologie des événements clients
        </p>
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700/50" />

          <div className="space-y-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="relative flex items-start gap-4 pl-10"
              >
                <div className={cn(
                  'absolute left-2.5 w-3 h-3 rounded-full border-2 border-slate-900',
                  item.type === 'litige' ? 'bg-rose-500' :
                  item.type === 'new' ? 'bg-emerald-500' :
                  item.type === 'contract' ? 'bg-blue-500' :
                  'bg-cyan-500'
                )} style={{ top: '0.5rem' }} />

                <div className="flex-1 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-200">{item.action}</p>
                    <Badge className="text-xs text-slate-400">
                      {item.client}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{item.user}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ================================
// Contrats View
// ================================
function ContratsView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Gestion des Contrats
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            24 contrats actifs
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <FileText className="w-4 h-4 mr-2" />
          Nouveau contrat
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Actifs" value={18} color="emerald" />
        <StatCard icon={Clock} label="À renouveler" value={4} color="amber" />
        <StatCard icon={XCircle} label="Expirés" value={2} color="rose" />
        <StatCard icon={DollarSign} label="Valeur totale" value="2.4M€" color="blue" />
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <p className="text-slate-400 text-center py-8">
          Interface de gestion des contrats en cours de développement
        </p>
      </div>
    </div>
  );
}

// ================================
// Interactions View
// ================================
function InteractionsView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Interactions Clients
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Suivi des échanges et communications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Heatmap des interactions
          </h3>
          <ClientsInteractionsHeatmap />
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Cycle de vie
          </h3>
          <ClientsLifecycleChart />
        </div>
      </div>
    </div>
  );
}

// ================================
// Helper Components
// ================================
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'blue' | 'rose' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'slate';
  onClick?: () => void;
}

function StatCard({ icon: Icon, label, value, color, onClick }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'p-4 rounded-xl border text-left transition-all',
        colorClasses[color],
        onClick && 'hover:scale-[1.02] cursor-pointer'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', colorClasses[color].split(' ')[0])} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </button>
  );
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'cyan' | 'blue' | 'purple' | 'emerald' | 'amber';
  onClick?: () => void;
}

function QuickActionButton({ icon: Icon, title, description, color, onClick }: QuickActionButtonProps) {
  const colorClasses: Record<string, string> = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 hover:border-slate-600/50 hover:bg-slate-800/30 transition-all text-left group"
    >
      <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
        <Icon className={cn('w-5 h-5', colorClasses[color])} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </button>
  );
}
