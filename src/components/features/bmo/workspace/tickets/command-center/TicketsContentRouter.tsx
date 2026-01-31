/**
 * Content Router du Tickets Command Center
 * Affiche le contenu en fonction de la navigation
 * Architecture visuelle cohérente avec le Dashboard BMO (style Blocked)
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  LayoutGrid,
  Building2,
  History,
  Zap,
  Shield,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Scale,
  Target,
  Users,
  Wallet,
  Activity,
  CheckCircle2,
  XCircle,
  Timer,
  Layers,
  Loader2,
  Eye,
  Star,
  MessageSquare,
  Upload,
  Ticket,
  Inbox,
  Settings,
  Phone,
  Mail,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Forward,
  Archive,
  Trash2,
  Tag,
  Paperclip,
  Send,
  RefreshCw,
  ExternalLink,
  Copy,
  Download,
} from 'lucide-react';

// Types
interface TicketData {
  id: string;
  reference: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  category: 'technique' | 'commercial' | 'facturation' | 'livraison' | 'qualite' | 'autre';
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    vip?: boolean;
  };
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  slaDeadline?: string;
  slaBreached?: boolean;
  responseTime?: number;
  resolutionTime?: number;
  messages: number;
  attachments: number;
  tags: string[];
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
  critical: number;
  slaBreached: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  resolvedToday: number;
  newToday: number;
}

// Mock data
const mockTickets: TicketData[] = [
  {
    id: '1',
    reference: 'TK-2024-0142',
    title: 'Problème de facturation récurrent',
    description: 'Le client signale des erreurs récurrentes sur ses factures mensuelles depuis 3 mois.',
    priority: 'critical',
    status: 'open',
    category: 'facturation',
    client: { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corporation', vip: true },
    assignee: { id: 'a1', name: 'Marie Dupont' },
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    slaDeadline: new Date(Date.now() + 2 * 3600000).toISOString(),
    slaBreached: false,
    responseTime: 12,
    messages: 8,
    attachments: 3,
    tags: ['urgent', 'vip', 'escalade'],
  },
  {
    id: '2',
    reference: 'TK-2024-0141',
    title: 'Demande de remboursement',
    description: 'Client demande remboursement suite à livraison non conforme.',
    priority: 'high',
    status: 'in_progress',
    category: 'commercial',
    client: { id: 'c2', name: 'TechStart', email: 'support@techstart.io', company: 'TechStart SAS' },
    assignee: { id: 'a2', name: 'Jean Pierre' },
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    slaDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    responseTime: 8,
    messages: 5,
    attachments: 2,
    tags: ['remboursement'],
  },
  {
    id: '3',
    reference: 'TK-2024-0140',
    title: 'Question sur les tarifs',
    description: 'Demande d\'information sur les nouvelles grilles tarifaires.',
    priority: 'medium',
    status: 'open',
    category: 'commercial',
    client: { id: 'c3', name: 'GlobalInc', email: 'info@globalinc.com', company: 'Global Inc' },
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    messages: 1,
    attachments: 0,
    tags: ['info'],
  },
  {
    id: '4',
    reference: 'TK-2024-0139',
    title: 'Modification de contrat',
    description: 'Demande de modification des termes contractuels.',
    priority: 'low',
    status: 'pending',
    category: 'commercial',
    client: { id: 'c4', name: 'StartupXYZ', email: 'hello@startupxyz.com', company: 'StartupXYZ' },
    assignee: { id: 'a3', name: 'Sophie Laurent' },
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    messages: 3,
    attachments: 1,
    tags: ['contrat'],
  },
  {
    id: '5',
    reference: 'TK-2024-0138',
    title: 'Réclamation produit défectueux',
    description: 'Produit livré avec défaut de fabrication.',
    priority: 'high',
    status: 'open',
    category: 'qualite',
    client: { id: 'c5', name: 'MegaCorp', email: 'support@megacorp.com', company: 'MegaCorp Ltd', vip: true },
    assignee: { id: 'a1', name: 'Marie Dupont' },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    slaDeadline: new Date(Date.now() - 30 * 60000).toISOString(),
    slaBreached: true,
    messages: 6,
    attachments: 4,
    tags: ['qualite', 'urgent', 'vip'],
  },
  {
    id: '6',
    reference: 'TK-2024-0137',
    title: 'Support technique installation',
    description: 'Aide à l\'installation du logiciel sur serveur client.',
    priority: 'medium',
    status: 'resolved',
    category: 'technique',
    client: { id: 'c6', name: 'DataFlow', email: 'tech@dataflow.io', company: 'DataFlow' },
    assignee: { id: 'a4', name: 'Lucas Martin' },
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    responseTime: 15,
    resolutionTime: 180,
    messages: 12,
    attachments: 2,
    tags: ['technique', 'installation'],
  },
];

const mockStats: TicketStats = {
  total: 42,
  open: 15,
  inProgress: 12,
  pending: 8,
  resolved: 156,
  critical: 5,
  slaBreached: 3,
  avgResponseTime: 24,
  avgResolutionTime: 480,
  satisfactionScore: 4.6,
  resolvedToday: 28,
  newToday: 12,
};

// Hook simulé pour charger les données
function useTicketsData() {
  const [data, setData] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(mockTickets);
    setStats(mockStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, stats, loading, reload };
}

// ================================
// Main Router
// ================================
interface TicketsContentRouterProps {
  category: string;
  subCategory: string;
  filter?: string;
  onOpenTicket?: (ticketId: string) => void;
  onOpenModal?: (modalId: string, data?: any) => void;
}

export const TicketsContentRouter = React.memo(function TicketsContentRouter({
  category,
  subCategory,
  filter,
  onOpenTicket,
  onOpenModal,
}: TicketsContentRouterProps) {
  switch (category) {
    case 'overview':
      return <OverviewView onOpenTicket={onOpenTicket} onOpenModal={onOpenModal} />;
    case 'inbox':
      return <InboxView subCategory={subCategory} filter={filter} onOpenTicket={onOpenTicket} onOpenModal={onOpenModal} />;
    case 'critical':
      return <CriticalView subCategory={subCategory} onOpenTicket={onOpenTicket} onOpenModal={onOpenModal} />;
    case 'pending':
      return <PendingView subCategory={subCategory} onOpenTicket={onOpenTicket} onOpenModal={onOpenModal} />;
    case 'resolved':
      return <ResolvedView subCategory={subCategory} onOpenTicket={onOpenTicket} />;
    case 'conversations':
      return <ConversationsView onOpenTicket={onOpenTicket} />;
    case 'analytics':
      return <AnalyticsView subCategory={subCategory} />;
    case 'clients':
      return <ClientsView subCategory={subCategory} onOpenTicket={onOpenTicket} />;
    case 'settings':
      return <SettingsView subCategory={subCategory} />;
    default:
      return <OverviewView onOpenTicket={onOpenTicket} onOpenModal={onOpenModal} />;
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// VIEW COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function OverviewView({ 
  onOpenTicket, 
  onOpenModal 
}: { 
  onOpenTicket?: (id: string) => void;
  onOpenModal?: (modalId: string, data?: any) => void;
}) {
  const { data, stats, loading, reload } = useTicketsData();

  const kpis = [
    {
      id: 'open',
      label: 'Tickets ouverts',
      value: stats?.open ?? 0,
      trend: stats?.newToday ?? 0,
      icon: Inbox,
      color: 'blue',
    },
    {
      id: 'critical',
      label: 'Critiques',
      value: stats?.critical ?? 0,
      trend: stats?.critical && stats.critical > 0 ? stats.critical : 0,
      icon: AlertCircle,
      color: stats?.critical && stats.critical > 0 ? 'rose' : 'slate',
    },
    {
      id: 'response',
      label: 'Temps réponse',
      value: `${stats?.avgResponseTime ?? 0}min`,
      trend: stats?.avgResponseTime && stats.avgResponseTime < 30 ? -5 : 2,
      icon: Clock,
      color: stats?.avgResponseTime && stats.avgResponseTime > 60 ? 'amber' : 'emerald',
    },
    {
      id: 'sla',
      label: 'SLA dépassés',
      value: stats?.slaBreached ?? 0,
      trend: stats?.slaBreached && stats.slaBreached > 0 ? stats.slaBreached : 0,
      icon: Shield,
      color: stats?.slaBreached && stats.slaBreached > 0 ? 'rose' : 'emerald',
    },
  ];

  const criticalTickets = data.filter(t => t.priority === 'critical').slice(0, 4);
  const recentTickets = [...data].slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Critical Alert Banner */}
      {stats?.critical && stats.critical > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
                <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-slate-100">
                  {stats.critical} ticket(s) critique(s) en attente
                </p>
                <p className="text-sm text-slate-400">
                  Action immédiate requise — SLA en risque
                </p>
              </div>
            </div>
            <Button
              onClick={() => onOpenModal?.('critical-queue')}
              className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5"
            >
              Traiter maintenant
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Section KPIs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Indicateurs Clés
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenModal?.('stats')}
            className="text-slate-400 hover:text-slate-200"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const iconColorClasses: Record<string, string> = {
              blue: 'text-blue-400',
              emerald: 'text-emerald-400',
              amber: 'text-amber-400',
              rose: 'text-rose-400',
              slate: 'text-slate-400',
            };

            return (
              <button
                key={kpi.id}
                onClick={() => {
                  if (kpi.id === 'critical') onOpenModal?.('critical-queue');
                  else if (kpi.id === 'sla') onOpenModal?.('sla-breached');
                }}
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
                          <TrendingUp className={cn('w-3 h-3', kpi.color === 'rose' || kpi.color === 'amber' ? 'text-rose-400' : 'text-emerald-400')} />
                          <span className={kpi.color === 'rose' || kpi.color === 'amber' ? 'text-rose-400' : 'text-emerald-400'}>
                            +{Math.abs(kpi.trend)}
                          </span>
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

      {/* Section Tickets Critiques + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets Critiques */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Tickets Critiques
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{stats?.critical ?? 0}</Badge>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {criticalTickets.length > 0 ? (
              criticalTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => onOpenTicket?.(ticket.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">{ticket.reference}</span>
                      {ticket.client.vip && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">VIP</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-200 truncate">{ticket.title}</p>
                    <p className="text-xs text-slate-400 truncate">{ticket.client.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket.slaBreached && (
                      <Badge variant="destructive" className="text-xs">SLA</Badge>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm text-slate-400">Aucun ticket critique</p>
              </div>
            )}
          </div>
        </section>

        {/* Performance temps réel */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Performance Temps Réel
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Satisfaction */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-slate-300">Satisfaction client</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                    style={{ width: `${(stats?.satisfactionScore ?? 0) * 20}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-200">{stats?.satisfactionScore}/5</span>
              </div>
            </div>

            {/* Temps de réponse */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Temps de réponse moyen</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{stats?.avgResponseTime}min</span>
            </div>

            {/* Taux de résolution */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">Résolus aujourd'hui</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{stats?.resolvedToday}</span>
            </div>

            {/* SLA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-slate-300">Conformité SLA</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                stats?.slaBreached && stats.slaBreached > 0 ? 'text-amber-400' : 'text-emerald-400'
              )}>
                {stats ? Math.round(((stats.total - stats.slaBreached) / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Section Actions Rapides + Derniers tickets */}
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
              icon={Ticket}
              title="Nouveau ticket"
              description="Créer un ticket manuellement"
              color="purple"
              onClick={() => onOpenModal?.('create-ticket')}
            />
            <QuickActionButton
              icon={MessageSquare}
              title="Réponse rapide"
              description="Répondre aux tickets en attente"
              color="blue"
              onClick={() => onOpenModal?.('quick-reply')}
            />
            <QuickActionButton
              icon={ArrowUpRight}
              title="Escalader"
              description="Escalader des tickets critiques"
              color="orange"
              onClick={() => onOpenModal?.('escalate')}
            />
            <QuickActionButton
              icon={BarChart3}
              title="Statistiques"
              description="Analyses et tendances"
              color="emerald"
              onClick={() => onOpenModal?.('stats')}
            />
          </div>
        </section>

        {/* Derniers Tickets */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Derniers Tickets
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="default">{stats?.newToday ?? 0} nouveaux</Badge>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {recentTickets.map((ticket) => (
              <TicketRow 
                key={ticket.id} 
                ticket={ticket} 
                onClick={() => onOpenTicket?.(ticket.id)} 
              />
            ))}
          </div>
        </section>
      </div>

      {/* Analytics Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Analytics & Tendances
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenModal?.('analytics')}
            className="text-slate-400 hover:text-slate-200 text-xs gap-1.5"
          >
            <Eye className="w-4 h-4" />
            Voir détails
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Volume hebdomadaire"
            value="234"
            change="+12%"
            trend="up"
            color="blue"
            sparkline={[45, 52, 48, 61, 58, 65, 72]}
          />
          <AnalyticsCard
            title="Temps résolution"
            value="4.2h"
            change="-8%"
            trend="down"
            color="emerald"
            sparkline={[5.2, 4.8, 4.6, 4.5, 4.3, 4.2, 4.2]}
          />
          <AnalyticsCard
            title="First Response"
            value="24min"
            change="-15%"
            trend="down"
            color="purple"
            sparkline={[35, 32, 28, 26, 25, 24, 24]}
          />
          <AnalyticsCard
            title="CSAT Score"
            value="4.6/5"
            change="+0.2"
            trend="up"
            color="pink"
            sparkline={[4.2, 4.3, 4.4, 4.4, 4.5, 4.5, 4.6]}
          />
        </div>
      </section>

      {/* Info Bar */}
      <section className="rounded-xl border border-slate-700/50 bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">
              Centre de Support Intelligent
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Les suggestions IA et la priorisation automatique sont activées. 
              Les tickets critiques sont automatiquement escaladés après 2h sans réponse.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InboxView({ 
  subCategory, 
  filter, 
  onOpenTicket,
  onOpenModal,
}: { 
  subCategory: string; 
  filter?: string;
  onOpenTicket?: (id: string) => void;
  onOpenModal?: (modalId: string, data?: any) => void;
}) {
  const { data, loading } = useTicketsData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'sla'>('date');

  const filteredTickets = useMemo(() => {
    let filtered = [...data];
    
    // Filter by subcategory
    switch (subCategory) {
      case 'unread':
        filtered = filtered.filter(t => t.status === 'open');
        break;
      case 'assigned':
        filtered = filtered.filter(t => t.assignee?.name === 'Marie Dupont');
        break;
      case 'unassigned':
        filtered = filtered.filter(t => !t.assignee);
        break;
    }

    // Filter by priority
    if (filter && filter !== 'all-priority') {
      filtered = filtered.filter(t => t.priority === filter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'sla') {
        if (a.slaBreached && !b.slaBreached) return -1;
        if (!a.slaBreached && b.slaBreached) return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [data, subCategory, filter, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredTickets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTickets.map(t => t.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className={cn(
                'w-4 h-4 rounded border transition-colors',
                selectedIds.size === filteredTickets.length && filteredTickets.length > 0
                  ? 'bg-purple-500 border-purple-500'
                  : 'border-slate-600 hover:border-slate-500'
              )}
            />
            <span className="text-sm text-slate-400">
              {selectedIds.size > 0 
                ? `${selectedIds.size} sélectionné(s)`
                : `${filteredTickets.length} ticket(s)`
              }
            </span>
            
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Reply className="w-3 h-3 mr-1" />
                  Répondre
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Forward className="w-3 h-3 mr-1" />
                  Assigner
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  Archiver
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-rose-400">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-7 px-2 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-300"
            >
              <option value="date">Trier par date</option>
              <option value="priority">Trier par priorité</option>
              <option value="sla">Trier par SLA</option>
            </select>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Filter className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketRowSelectable
              key={ticket.id}
              ticket={ticket}
              selected={selectedIds.has(ticket.id)}
              onSelect={() => toggleSelect(ticket.id)}
              onClick={() => onOpenTicket?.(ticket.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-lg font-medium text-slate-400">Aucun ticket</p>
            <p className="text-sm text-slate-400">Cette file d'attente est vide</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CriticalView({ 
  subCategory, 
  onOpenTicket,
  onOpenModal,
}: { 
  subCategory: string;
  onOpenTicket?: (id: string) => void;
  onOpenModal?: (modalId: string, data?: any) => void;
}) {
  const { data, stats, loading } = useTicketsData();
  const criticalTickets = data.filter(t => t.priority === 'critical' || t.slaBreached);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header Alert */}
      <div className="rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30">
            <AlertCircle className="w-8 h-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {criticalTickets.length} tickets critiques
            </h1>
            <p className="text-slate-400">
              Nécessitent une action immédiate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={AlertCircle}
            label="Urgents"
            value={stats?.critical ?? 0}
            color="rose"
            onClick={() => {}}
          />
          <StatCard
            icon={Timer}
            label="SLA dépassés"
            value={stats?.slaBreached ?? 0}
            color="amber"
            onClick={() => {}}
          />
          <StatCard
            icon={Clock}
            label="À traiter sous 1h"
            value={2}
            color="orange"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Liste des tickets critiques */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Tickets Critiques
          </h2>
          <Button
            onClick={() => onOpenModal?.('batch-action')}
            size="sm"
            className="bg-rose-500 hover:bg-rose-600 text-white gap-1.5"
          >
            <Zap className="w-3 h-3" />
            Traiter en lot
          </Button>
        </div>

        <div className="divide-y divide-slate-800/50">
          {criticalTickets.length > 0 ? (
            criticalTickets.map((ticket) => (
              <TicketRowDetailed
                key={ticket.id}
                ticket={ticket}
                onClick={() => onOpenTicket?.(ticket.id)}
              />
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="text-lg font-medium text-slate-300">Aucun ticket critique</p>
              <p className="text-sm text-slate-400">Tous les tickets sont sous contrôle</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PendingView({ 
  subCategory, 
  onOpenTicket,
  onOpenModal,
}: { 
  subCategory: string;
  onOpenTicket?: (id: string) => void;
  onOpenModal?: (modalId: string, data?: any) => void;
}) {
  const { data, loading } = useTicketsData();
  const pendingTickets = data.filter(t => t.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Tickets en attente
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {pendingTickets.length} tickets en attente de réponse
          </p>
        </div>
        <Button
          onClick={() => onOpenModal?.('send-reminder')}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
        >
          <Send className="w-4 h-4" />
          Envoyer rappels
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Attente client"
          value={pendingTickets.filter(t => true).length}
          color="amber"
          onClick={() => {}}
        />
        <StatCard
          icon={Building2}
          label="Attente interne"
          value={0}
          color="blue"
          onClick={() => {}}
        />
        <StatCard
          icon={Calendar}
          label="Planifiés"
          value={0}
          color="purple"
          onClick={() => {}}
        />
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {pendingTickets.length > 0 ? (
            pendingTickets.map((ticket) => (
              <TicketRowDetailed
                key={ticket.id}
                ticket={ticket}
                onClick={() => onOpenTicket?.(ticket.id)}
              />
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <p className="text-lg font-medium text-slate-300">Aucun ticket en attente</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ResolvedView({ 
  subCategory,
  onOpenTicket,
}: { 
  subCategory: string;
  onOpenTicket?: (id: string) => void;
}) {
  const { data, stats, loading } = useTicketsData();
  const resolvedTickets = data.filter(t => t.status === 'resolved');

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Tickets Résolus
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {stats?.resolved ?? 0} tickets résolus ce mois
          </p>
        </div>
        <Button variant="outline" className="gap-1.5">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Résolus aujourd'hui"
          value={stats?.resolvedToday ?? 0}
          color="emerald"
          onClick={() => {}}
        />
        <StatCard
          icon={Clock}
          label="Temps moyen"
          value={`${Math.round((stats?.avgResolutionTime ?? 0) / 60)}h`}
          color="blue"
          onClick={() => {}}
        />
        <StatCard
          icon={ThumbsUp}
          label="Satisfaction"
          value={`${stats?.satisfactionScore ?? 0}/5`}
          color="pink"
          onClick={() => {}}
        />
        <StatCard
          icon={Target}
          label="First Contact Res."
          value="68%"
          color="purple"
          onClick={() => {}}
        />
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {resolvedTickets.map((ticket) => (
            <TicketRowDetailed
              key={ticket.id}
              ticket={ticket}
              onClick={() => onOpenTicket?.(ticket.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ConversationsView({ onOpenTicket }: { onOpenTicket?: (id: string) => void }) {
  const { data } = useTicketsData();
  const activeConversations = data.filter(t => t.messages > 3 && t.status !== 'resolved');

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Conversations Actives
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {activeConversations.length} conversations en cours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeConversations.map((ticket) => (
          <ConversationCard
            key={ticket.id}
            ticket={ticket}
            onClick={() => onOpenTicket?.(ticket.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AnalyticsView({ subCategory }: { subCategory: string }) {
  const { stats } = useTicketsData();

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyses et tendances des tickets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Cette semaine</Button>
          <Button variant="outline" size="sm">Ce mois</Button>
          <Button variant="outline" size="sm">Personnalisé</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Volume total"
          value={stats?.total.toString() ?? '0'}
          change="+12%"
          trend="up"
          color="blue"
          sparkline={[35, 42, 38, 45, 42, 48, 52]}
        />
        <AnalyticsCard
          title="Temps résolution"
          value={`${Math.round((stats?.avgResolutionTime ?? 0) / 60)}h`}
          change="-8%"
          trend="down"
          color="emerald"
          sparkline={[6, 5.5, 5.2, 4.8, 4.5, 4.3, 4]}
        />
        <AnalyticsCard
          title="Satisfaction"
          value={`${stats?.satisfactionScore ?? 0}/5`}
          change="+0.2"
          trend="up"
          color="pink"
          sparkline={[4.2, 4.3, 4.4, 4.4, 4.5, 4.5, 4.6]}
        />
        <AnalyticsCard
          title="SLA Compliance"
          value={stats ? `${Math.round(((stats.total - stats.slaBreached) / stats.total) * 100)}%` : '0%'}
          change="+3%"
          trend="up"
          color="purple"
          sparkline={[88, 89, 90, 91, 92, 93, 95]}
        />
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 h-80">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Volume par jour</h3>
          <div className="flex items-center justify-center h-full text-slate-400">
            Graphique des volumes
          </div>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 h-80">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Distribution par catégorie</h3>
          <div className="flex items-center justify-center h-full text-slate-400">
            Graphique des catégories
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientsView({ 
  subCategory,
  onOpenTicket,
}: { 
  subCategory: string;
  onOpenTicket?: (id: string) => void;
}) {
  const { data } = useTicketsData();
  
  // Group by client
  const clientsMap = data.reduce((acc, ticket) => {
    if (!acc[ticket.client.id]) {
      acc[ticket.client.id] = {
        ...ticket.client,
        tickets: [],
      };
    }
    acc[ticket.client.id].tickets.push(ticket);
    return acc;
  }, {} as Record<string, any>);

  const clients = Object.values(clientsMap).sort((a: any, b: any) => b.tickets.length - a.tickets.length);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Clients
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {clients.length} clients avec tickets actifs
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="divide-y divide-slate-800/50">
          {clients.map((client: any) => (
            <button
              key={client.id}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-200">{client.name}</p>
                  {client.vip && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">VIP</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">{client.company || client.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-300">{client.tickets.length}</p>
                  <p className="text-xs text-slate-400">tickets</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsView({ subCategory }: { subCategory: string }) {
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Paramètres du module Tickets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingsCard
          icon={Tag}
          title="Catégories"
          description="Gérer les catégories de tickets"
        />
        <SettingsCard
          icon={Shield}
          title="Règles SLA"
          description="Configurer les délais de réponse"
        />
        <SettingsCard
          icon={MessageSquare}
          title="Modèles de réponse"
          description="Créer des réponses prédéfinies"
        />
        <SettingsCard
          icon={Zap}
          title="Automatisations"
          description="Règles d'assignation automatique"
        />
        <SettingsCard
          icon={Users}
          title="Équipes"
          description="Gérer les équipes support"
        />
        <SettingsCard
          icon={Bell}
          title="Notifications"
          description="Configurer les alertes"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function QuickActionButton({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: 'orange' | 'green' | 'purple' | 'blue' | 'emerald';
  onClick: () => void;
}) {
  const colorClasses: Record<string, string> = {
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-opacity-20',
        colorClasses[color]
      )}
    >
      <div className={cn('p-2 rounded-lg', colorClasses[color].split(' ')[1])}>
        <Icon className={cn('w-4 h-4', colorClasses[color].split(' ')[0])} />
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: 'rose' | 'amber' | 'emerald' | 'blue' | 'purple' | 'orange' | 'pink';
  onClick: () => void;
}) {
  const colorClasses: Record<string, string> = {
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border transition-all hover:scale-[1.02]',
        colorClasses[color]
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn('w-5 h-5', colorClasses[color].split(' ')[0])} />
        <div className="text-left">
          <p className="text-2xl font-bold text-slate-200">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </button>
  );
}

function TicketRow({ 
  ticket, 
  onClick 
}: { 
  ticket: TicketData; 
  onClick: () => void;
}) {
  const priorityColors = {
    critical: 'bg-rose-500 animate-pulse',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-500',
  };

  const statusColors = {
    open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 60) return `il y a ${diff}min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return `il y a ${Math.floor(diff / 1440)}j`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
    >
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityColors[ticket.priority])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono text-slate-400">{ticket.reference}</span>
          <Badge variant="outline" className={cn('text-xs', statusColors[ticket.status])}>
            {ticket.status === 'open' ? 'Ouvert' : 
             ticket.status === 'in_progress' ? 'En cours' :
             ticket.status === 'pending' ? 'En attente' :
             ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
          </Badge>
          {ticket.client.vip && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">VIP</Badge>
          )}
        </div>
        <p className="text-sm font-medium text-slate-200 truncate">{ticket.title}</p>
        <p className="text-xs text-slate-400 truncate">{ticket.client.name}</p>
      </div>
      <div className="flex items-center gap-3">
        {ticket.messages > 0 && (
          <div className="flex items-center gap-1 text-slate-400">
            <MessageSquare className="w-3 h-3" />
            <span className="text-xs">{ticket.messages}</span>
          </div>
        )}
        <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(ticket.createdAt)}</span>
        <ArrowRight className="w-4 h-4 text-slate-600" />
      </div>
    </button>
  );
}

function TicketRowSelectable({ 
  ticket, 
  selected,
  onSelect,
  onClick 
}: { 
  ticket: TicketData;
  selected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const priorityColors = {
    critical: 'bg-rose-500 animate-pulse',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-500',
  };

  return (
    <div className={cn(
      'flex items-center gap-4 px-4 py-3 hover:bg-slate-800/40 transition-colors',
      selected && 'bg-purple-500/10'
    )}>
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={cn(
          'w-4 h-4 rounded border flex-shrink-0 transition-colors',
          selected ? 'bg-purple-500 border-purple-500' : 'border-slate-600 hover:border-slate-500'
        )}
      />
      <button onClick={onClick} className="flex-1 flex items-center gap-4 text-left">
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityColors[ticket.priority])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono text-slate-400">{ticket.reference}</span>
            {ticket.slaBreached && (
              <Badge variant="destructive" className="text-xs">SLA</Badge>
            )}
            {ticket.client.vip && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">VIP</Badge>
            )}
          </div>
          <p className="text-sm font-medium text-slate-200 truncate">{ticket.title}</p>
          <p className="text-xs text-slate-400">{ticket.client.name} • {ticket.category}</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          {ticket.assignee && (
            <div className="text-xs text-slate-400">
              {ticket.assignee.name}
            </div>
          )}
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </div>
      </button>
    </div>
  );
}

function TicketRowDetailed({ 
  ticket, 
  onClick 
}: { 
  ticket: TicketData; 
  onClick: () => void;
}) {
  const priorityColors = {
    critical: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-500',
  };

  const priorityLabels = {
    critical: 'Critique',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-800/40 transition-colors text-left"
    >
      <div className={cn(
        'w-3 h-3 rounded-full flex-shrink-0',
        priorityColors[ticket.priority],
        ticket.priority === 'critical' && 'animate-pulse'
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-400">{ticket.reference}</span>
          <Badge
            variant={ticket.priority === 'critical' ? 'destructive' : ticket.priority === 'high' ? 'warning' : 'default'}
            className="text-xs"
          >
            {priorityLabels[ticket.priority]}
          </Badge>
          {ticket.slaBreached && (
            <Badge variant="destructive" className="text-xs">SLA dépassé</Badge>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-200">{ticket.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{ticket.description}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
          <span>{ticket.client.name}</span>
          <span>•</span>
          <span>{ticket.category}</span>
          {ticket.assignee && (
            <>
              <span>•</span>
              <span>{ticket.assignee.name}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs">{ticket.messages}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600" />
      </div>
    </button>
  );
}

function AnalyticsCard({
  title,
  value,
  change,
  trend,
  color,
  sparkline,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: 'blue' | 'emerald' | 'purple' | 'pink';
  sparkline: number[];
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
  };

  const bgClasses: Record<string, string> = {
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400',
  };

  const maxVal = Math.max(...sparkline);

  return (
    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
      <p className="text-xs text-slate-400 mb-2">{title}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className={cn('text-2xl font-bold', colorClasses[color])}>{value}</span>
        <span className={cn(
          'text-xs font-medium flex items-center gap-1',
          trend === 'up' ? 'text-emerald-400' : 'text-emerald-400'
        )}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </span>
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {sparkline.map((val, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-sm transition-all',
              i === sparkline.length - 1 ? bgClasses[color] : 'bg-slate-700/60'
            )}
            style={{ height: `${(val / maxVal) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ConversationCard({ 
  ticket, 
  onClick 
}: { 
  ticket: TicketData; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
          {ticket.client.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-200">{ticket.client.name}</p>
            {ticket.client.vip && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">VIP</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400">{ticket.reference}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {ticket.messages} messages
        </Badge>
      </div>
      <p className="text-sm text-slate-300 mb-3">{ticket.title}</p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Dernière activité: il y a 15min</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <button className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all text-left flex items-center gap-4">
      <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600" />
    </button>
  );
}

// Needed icon for notifications
function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
