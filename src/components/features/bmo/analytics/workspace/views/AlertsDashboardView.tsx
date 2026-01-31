'use client';

/**
 * AlertsDashboardView
 * Vue dashboard pour les alertes analytics avec informations contextuelles selon le filtre
 */

import { useMemo } from 'react';
import { useAlerts } from '@/lib/api/hooks/useAnalytics';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VirtualizedList } from '@/presentation/components/VirtualizedList';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Target,
  Activity,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface AlertsDashboardViewProps {
  subCategory?: string;
}

const COLORS = {
  critical: '#EF4444',
  warning: '#F59E0B',
  resolved: '#10B981',
  info: '#3B82F6',
};

export function AlertsDashboardView({ subCategory = 'all' }: AlertsDashboardViewProps) {
  const { data: alertsResponse, isLoading, error } = useAlerts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-2">Erreur de chargement</p>
          <p className="text-slate-400 text-sm">{error instanceof Error ? error.message : String(error) || 'Erreur inconnue'}</p>
        </div>
      </div>
    );
  }

  const allAlerts = alertsResponse?.alerts || [];

  // Filtrer les alertes selon la sous-catégorie
  const filteredAlerts = useMemo(() => {
    if (!Array.isArray(allAlerts)) return [];
    
    if (subCategory === 'all') {
      return allAlerts;
    }
    
    if (subCategory === 'critical') {
      return allAlerts.filter((a) => a.severity === 'critical');
    }
    
    if (subCategory === 'warning') {
      return allAlerts.filter((a) => a.severity === 'warning');
    }
    
    if (subCategory === 'resolved') {
      return allAlerts.filter((a) => (a as any).status === 'resolved');
    }
    
    return allAlerts;
  }, [allAlerts, subCategory]);

  // Calculer les statistiques spécifiques au filtre
  const stats = useMemo(() => {
    const alerts = filteredAlerts;
    
    // Bureaux affectés
    const affectedBureaux = new Set<string>();
    alerts.forEach((a: any) => {
      if (a.affectedBureaux && Array.isArray(a.affectedBureaux)) {
        a.affectedBureaux.forEach((b: string) => affectedBureaux.add(b));
      }
      if (a.bureauId) {
        affectedBureaux.add(a.bureauId);
      }
    });

    // Catégories
    const categories = alerts.reduce((acc: Record<string, number>, a: any) => {
      const cat = a.category || 'autre';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Temps moyen depuis création (pour critiques/avertissements)
    const avgAge = alerts.length > 0
      ? alerts.reduce((sum: number, a: any) => {
          const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
          return sum + (Date.now() - createdAt);
        }, 0) / alerts.length
      : 0;

    // Temps moyen de résolution (pour résolues)
    const avgResolutionTime = subCategory === 'resolved' && alerts.length > 0
      ? alerts.reduce((sum: number, a: any) => {
          const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
          const resolvedAt = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
          return sum + (resolvedAt - createdAt);
        }, 0) / alerts.length
      : 0;

    // Priorités
    const priorities = alerts.reduce((acc: Record<string, number>, a: any) => {
      const prio = a.priority || 'medium';
      acc[prio] = (acc[prio] || 0) + 1;
      return acc;
    }, {});

    return {
      total: alerts.length,
      affectedBureaux: Array.from(affectedBureaux),
      affectedBureauxCount: affectedBureaux.size,
      categories,
      avgAgeHours: Math.round(avgAge / (1000 * 60 * 60)),
      avgResolutionHours: Math.round(avgResolutionTime / (1000 * 60 * 60)),
      priorities,
    };
  }, [filteredAlerts, subCategory]);

  // Données pour graphiques
  const categoryData = useMemo(() => {
    return Object.entries(stats.categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number,
    }));
  }, [stats.categories]);

  const bureauData = useMemo(() => {
    const bureauCounts: Record<string, number> = {};
    filteredAlerts.forEach((a: any) => {
      if (a.affectedBureaux && Array.isArray(a.affectedBureaux)) {
        a.affectedBureaux.forEach((b: string) => {
          bureauCounts[b] = (bureauCounts[b] || 0) + 1;
        });
      }
      if (a.bureauId) {
        bureauCounts[a.bureauId] = (bureauCounts[a.bureauId] || 0) + 1;
      }
    });
    return Object.entries(bureauCounts)
      .map(([name, value]) => ({ name: name.toUpperCase(), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredAlerts]);

  // Configuration selon le filtre
  const config = useMemo(() => {
    if (subCategory === 'critical') {
      return {
        title: 'Alertes Critiques',
        description: 'Situations nécessitant une intervention immédiate',
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        recommendations: [
          'Intervention urgente requise',
          'Contacter les responsables des bureaux affectés',
          'Mettre en place un plan d\'action immédiat',
          'Surveiller l\'évolution en temps réel',
        ],
      };
    }
    if (subCategory === 'warning') {
      return {
        title: 'Avertissements',
        description: 'Situations nécessitant une attention particulière',
        icon: AlertTriangle,
        color: 'amber',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400',
        recommendations: [
          'Analyser les causes des écarts',
          'Planifier des actions correctives',
          'Renforcer le suivi des indicateurs',
          'Anticiper les risques de dégradation',
        ],
      };
    }
    if (subCategory === 'resolved') {
      return {
        title: 'Alertes Résolues',
        description: 'Situations qui ont été traitées avec succès',
        icon: CheckCircle2,
        color: 'emerald',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
        recommendations: [
          'Analyser les actions correctives efficaces',
          'Capitaliser sur les bonnes pratiques',
          'Documenter les solutions appliquées',
          'Prévenir les récurrences',
        ],
      };
    }
    return {
      title: 'Toutes les Alertes',
      description: 'Vue d\'ensemble de toutes les alertes actives',
      icon: AlertTriangle,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      recommendations: [
        'Prioriser les alertes critiques',
        'Suivre l\'évolution des avertissements',
        'Analyser les tendances globales',
      ],
    };
  }, [subCategory]);

  const Icon = config.icon;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header avec titre et description */}
      <div className={cn('p-6 rounded-xl border', config.bgColor, config.borderColor)}>
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-lg', config.bgColor)}>
            <Icon className={cn('w-8 h-8', config.textColor)} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-200 mb-2">{config.title}</h1>
            <p className="text-slate-400">{config.description}</p>
          </div>
          <Badge
            variant={subCategory === 'critical' ? 'urgent' : subCategory === 'warning' ? 'warning' : 'default'}
            className="text-lg px-4 py-2"
          >
            {stats.total} alerte{stats.total > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-200">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </FluentCardContent>
        </FluentCard>

        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Bureaux affectés</p>
                <p className="text-2xl font-bold text-slate-200">{stats.affectedBureauxCount}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </FluentCardContent>
        </FluentCard>

        {subCategory === 'resolved' ? (
          <FluentCard>
            <FluentCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Temps moyen de résolution</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.avgResolutionHours}h</p>
                </div>
                <Clock className="w-8 h-8 text-emerald-400" />
              </div>
            </FluentCardContent>
          </FluentCard>
        ) : (
          <FluentCard>
            <FluentCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Âge moyen</p>
                  <p className="text-2xl font-bold text-slate-200">{stats.avgAgeHours}h</p>
                </div>
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
            </FluentCardContent>
          </FluentCard>
        )}

        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Catégories</p>
                <p className="text-2xl font-bold text-slate-200">{Object.keys(stats.categories).length}</p>
              </div>
              <Activity className="w-8 h-8 text-indigo-400" />
            </div>
          </FluentCardContent>
        </FluentCard>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par catégorie */}
        {categoryData.length > 0 && (
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-slate-200">Répartition par Catégorie</FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.keys(COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#e2e8f0',
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </FluentCardContent>
          </FluentCard>
        )}

        {/* Répartition par bureau */}
        {bureauData.length > 0 && (
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-slate-200">Top Bureaux Affectés</FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bureauData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      color: '#e2e8f0',
                    }}
                  />
                  <Bar dataKey="value" fill={subCategory === 'critical' ? COLORS.critical : subCategory === 'warning' ? COLORS.warning : COLORS.info} />
                </BarChart>
              </ResponsiveContainer>
            </FluentCardContent>
          </FluentCard>
        )}
      </div>

      {/* Recommandations */}
      <FluentCard className={cn('border-l-4', config.borderColor)}>
        <FluentCardHeader>
          <FluentCardTitle className="text-slate-200 flex items-center gap-2">
            <ArrowRight className={cn('w-5 h-5', config.textColor)} />
            Recommandations d'Action
          </FluentCardTitle>
        </FluentCardHeader>
        <FluentCardContent>
          <ul className="space-y-3">
            {config.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', config.bgColor)}>
                  <span className={cn('text-sm font-bold', config.textColor)}>{idx + 1}</span>
                </div>
                <p className="text-slate-300 flex-1">{rec}</p>
              </li>
            ))}
          </ul>
        </FluentCardContent>
      </FluentCard>

      {/* Liste des alertes */}
      <FluentCard>
        <FluentCardHeader>
          <FluentCardTitle className="text-slate-200">
            Liste des Alertes ({filteredAlerts.length})
          </FluentCardTitle>
        </FluentCardHeader>
        <FluentCardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Aucune alerte {subCategory !== 'all' ? subCategory : ''} disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    alert.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/30'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : alert.status === 'resolved'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-200 mb-1">{alert.title}</h3>
                      <p className="text-sm text-slate-400">{alert.description || alert.message}</p>
                    </div>
                    <Badge
                      variant={
                        alert.severity === 'critical'
                          ? 'urgent'
                          : alert.severity === 'warning'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {alert.severity || alert.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                    {alert.category && <span>Catégorie: {alert.category}</span>}
                    {alert.affectedBureaux && Array.isArray(alert.affectedBureaux) && alert.affectedBureaux.length > 0 && (
                      <span>Bureaux: {alert.affectedBureaux.join(', ')}</span>
                    )}
                    {alert.createdAt && (
                      <span>
                        Créée: {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    {alert.resolvedAt && (
                      <span className="text-emerald-400">
                        Résolue: {new Date(alert.resolvedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FluentCardContent>
      </FluentCard>
    </div>
  );
}
