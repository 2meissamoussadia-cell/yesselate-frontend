/**
 * AnalyticsComparisonView.tsx
 * ============================
 * 
 * Vue comparaison bureaux et périodes
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpDown, DollarSign, Activity, AlertTriangle, XCircle, CheckCircle2, Calendar, Clock, Bell, Plus, FileText, Download, Zap, Target, Users, BarChart3, ArrowRight } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/presentation/components/Animations';
import { EnhancedTooltip } from '@/presentation/components/Tooltip';
import { calculateBureauPerformance, calculateFinancialPerformance } from '@/lib/data/analytics';
import { formatFCFA } from '@/lib/utils/format-currency';
import { bureaux } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { AnalyticsMainCategory } from '@/lib/stores/analyticsCommandCenterStore';
import { useAlerts } from '@/lib/api/hooks/useAnalytics';
import { useTrendAnalysis, useRecommendations, usePeriodActions } from '@/application/hooks';
import type { PeriodData } from '@/domain/analytics/entities/Period';

type ComparisonType = 'bureaux' | 'periods';

interface AnalyticsComparisonViewProps {
  category?: AnalyticsMainCategory;
  subCategory?: string;
}

export function AnalyticsComparisonView({ category, subCategory = 'all' }: AnalyticsComparisonViewProps = {}) {
  const [comparisonType, setComparisonType] = useState<ComparisonType>('bureaux');
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>([]);
  
  const bureauPerf = useMemo(() => calculateBureauPerformance(), []);
  const { data: alertsData } = useAlerts();

  const toggleBureau = (code: string) => {
    setSelectedBureaux(prev => 
      prev.includes(code) 
        ? prev.filter(b => b !== code)
        : [...prev, code]
    );
  };

  const selectedData = useMemo(() => {
    const selected = selectedBureaux.length > 0 
      ? bureauPerf.filter(b => selectedBureaux.includes(b.bureauCode))
      : bureauPerf.slice(0, 5);

    return selected;
  }, [bureauPerf, selectedBureaux]);

  // Si on est sur la catégorie "alerts", calculer les données d'alertes par bureau
  const alertsByBureau = useMemo(() => {
    if (category !== 'alerts' || !alertsData?.alerts) return {};
    
    const allAlerts = alertsData.alerts;
    let filteredAlerts = allAlerts;
    
    // Filtrer selon subCategory
    if (subCategory === 'critical') {
      filteredAlerts = allAlerts.filter((a: any) => a.severity === 'critical');
    } else if (subCategory === 'warning') {
      filteredAlerts = allAlerts.filter((a: any) => a.severity === 'warning');
    } else if (subCategory === 'resolved') {
      filteredAlerts = allAlerts.filter((a: any) => a.status === 'resolved');
    }
    
    // Grouper par bureau
    const byBureau: Record<string, any[]> = {};
    filteredAlerts.forEach((alert: any) => {
      if (alert.affectedBureaux && Array.isArray(alert.affectedBureaux)) {
        alert.affectedBureaux.forEach((bureau: string) => {
          if (!byBureau[bureau]) byBureau[bureau] = [];
          byBureau[bureau].push(alert);
        });
      }
      if (alert.bureauId) {
        if (!byBureau[alert.bureauId]) byBureau[alert.bureauId] = [];
        byBureau[alert.bureauId].push(alert);
      }
    });
    
    return byBureau;
  }, [category, subCategory, alertsData]);

  // Données pour graphique comparatif selon la catégorie
  const comparisonData = useMemo(() => {
    if (category === 'alerts') {
      // Pour les alertes, comparer selon le filtre sélectionné
      return selectedData.map(b => {
        const bureauAlerts = alertsByBureau[b.bureauCode] || [];
        
        // Si on filtre par un type spécifique, afficher uniquement ce type
        if (subCategory === 'critical') {
          const criticalAlerts = bureauAlerts.filter((a: any) => a.severity === 'critical');
          return {
            bureau: b.bureauCode,
            count: criticalAlerts.length,
            // Métriques spécifiques aux critiques
            avgAge: criticalAlerts.length > 0
              ? Math.round(criticalAlerts.reduce((sum: number, a: any) => {
                  const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                  return sum + (Date.now() - createdAt);
                }, 0) / criticalAlerts.length / (1000 * 60 * 60)) // En heures
              : 0,
            highPriority: criticalAlerts.filter((a: any) => a.priority === 'high').length,
            categories: Object.keys(criticalAlerts.reduce((acc: Record<string, boolean>, a: any) => {
              if (a.category) acc[a.category] = true;
              return acc;
            }, {})).length,
          };
        } else if (subCategory === 'warning') {
          const warningAlerts = bureauAlerts.filter((a: any) => a.severity === 'warning');
          return {
            bureau: b.bureauCode,
            count: warningAlerts.length,
            // Métriques spécifiques aux avertissements
            avgAge: warningAlerts.length > 0
              ? Math.round(warningAlerts.reduce((sum: number, a: any) => {
                  const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                  return sum + (Date.now() - createdAt);
                }, 0) / warningAlerts.length / (1000 * 60 * 60)) // En heures
              : 0,
            mediumPriority: warningAlerts.filter((a: any) => a.priority === 'medium').length,
            categories: Object.keys(warningAlerts.reduce((acc: Record<string, boolean>, a: any) => {
              if (a.category) acc[a.category] = true;
              return acc;
            }, {})).length,
          };
        } else if (subCategory === 'resolved') {
          const resolvedAlerts = bureauAlerts.filter((a: any) => a.status === 'resolved');
          return {
            bureau: b.bureauCode,
            count: resolvedAlerts.length,
            // Métriques spécifiques aux résolues
            avgResolutionTime: resolvedAlerts.length > 0
              ? Math.round(resolvedAlerts.reduce((sum: number, a: any) => {
                  const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                  const resolvedAt = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
                  return sum + (resolvedAt - createdAt);
                }, 0) / resolvedAlerts.length / (1000 * 60 * 60)) // En heures
              : 0,
            resolvedThisWeek: resolvedAlerts.filter((a: any) => {
              const resolvedAt = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
              const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
              return resolvedAt >= weekAgo;
            }).length,
            categories: Object.keys(resolvedAlerts.reduce((acc: Record<string, boolean>, a: any) => {
              if (a.category) acc[a.category] = true;
              return acc;
            }, {})).length,
          };
        }
        
        // Par défaut (all), afficher toutes les alertes
        const criticalCount = bureauAlerts.filter((a: any) => a.severity === 'critical').length;
        const warningCount = bureauAlerts.filter((a: any) => a.severity === 'warning').length;
        const resolvedCount = bureauAlerts.filter((a: any) => a.status === 'resolved').length;
        
        return {
          bureau: b.bureauCode,
          total: bureauAlerts.length,
          critical: criticalCount,
          warning: warningCount,
          resolved: resolvedCount,
        };
      });
    }
    
    if (category === 'financial') {
      const financialPerf = calculateFinancialPerformance();
      return selectedData.map(b => {
        const fin = financialPerf.find(f => f.bureauCode === b.bureauCode);
        return {
          bureau: b.bureauCode,
          budget: fin ? fin.budgetTotal / 1000000 : 0,
          depenses: fin ? fin.expenses / 1000000 : 0,
          revenus: fin ? fin.revenues / 1000000 : 0,
        };
      });
    }
    
    // Par défaut (performance)
    return selectedData.map(b => ({
      bureau: b.bureauCode,
      score: b.score,
      validation: b.validationRate,
      sla: b.slaCompliance,
      delai: Math.max(0, 10 - b.avgDelay) * 10,
    }));
  }, [category, selectedData, alertsByBureau]);

  // Données pour radar selon la catégorie
  const radarData = useMemo(() => {
    if (category === 'alerts') {
      // Si on filtre par un type spécifique, afficher des métriques pertinentes à ce type
      if (subCategory === 'critical') {
        return [
          {
            metric: 'Total Critiques',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              return [b.bureauCode, alerts.filter((a: any) => a.severity === 'critical').length];
            })),
          },
          {
            metric: 'Priorité Haute',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              return [b.bureauCode, alerts.filter((a: any) => a.severity === 'critical' && a.priority === 'high').length];
            })),
          },
          {
            metric: 'Catégories',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical');
              const categories = new Set(criticalAlerts.map((a: any) => a.category).filter(Boolean));
              return [b.bureauCode, categories.size];
            })),
          },
          {
            metric: 'Âge Moyen (h)',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical');
              if (criticalAlerts.length === 0) return [b.bureauCode, 0];
              const avgAge = criticalAlerts.reduce((sum: number, a: any) => {
                const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                return sum + (Date.now() - createdAt);
              }, 0) / criticalAlerts.length / (1000 * 60 * 60);
              return [b.bureauCode, Math.round(avgAge)];
            })),
          },
        ];
      } else if (subCategory === 'warning') {
        return [
          {
            metric: 'Total Avertissements',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              return [b.bureauCode, alerts.filter((a: any) => a.severity === 'warning').length];
            })),
          },
          {
            metric: 'Priorité Moyenne',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              return [b.bureauCode, alerts.filter((a: any) => a.severity === 'warning' && a.priority === 'medium').length];
            })),
          },
          {
            metric: 'Catégories',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              const warningAlerts = alerts.filter((a: any) => a.severity === 'warning');
              const categories = new Set(warningAlerts.map((a: any) => a.category).filter(Boolean));
              return [b.bureauCode, categories.size];
            })),
          },
          {
            metric: 'Âge Moyen (h)',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              const warningAlerts = alerts.filter((a: any) => a.severity === 'warning');
              if (warningAlerts.length === 0) return [b.bureauCode, 0];
              const avgAge = warningAlerts.reduce((sum: number, a: any) => {
                const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                return sum + (Date.now() - createdAt);
              }, 0) / warningAlerts.length / (1000 * 60 * 60);
              return [b.bureauCode, Math.round(avgAge)];
            })),
          },
        ];
      } else if (subCategory === 'resolved') {
        return [
          {
            metric: 'Total Résolues',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              return [b.bureauCode, alerts.filter((a: any) => a.status === 'resolved').length];
            })),
          },
          {
            metric: 'Résolues Semaine',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              const resolvedAlerts = alerts.filter((a: any) => a.status === 'resolved');
              const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
              return [b.bureauCode, resolvedAlerts.filter((a: any) => {
                const resolvedAt = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
                return resolvedAt >= weekAgo;
              }).length];
            })),
          },
          {
            metric: 'Temps Résolution (h)',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              const resolvedAlerts = alerts.filter((a: any) => a.status === 'resolved');
              if (resolvedAlerts.length === 0) return [b.bureauCode, 0];
              const avgTime = resolvedAlerts.reduce((sum: number, a: any) => {
                const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                const resolvedAt = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
                return sum + (resolvedAt - createdAt);
              }, 0) / resolvedAlerts.length / (1000 * 60 * 60);
              return [b.bureauCode, Math.round(avgTime)];
            })),
          },
          {
            metric: 'Catégories',
            ...Object.fromEntries(selectedData.map(b => {
              const alerts = alertsByBureau[b.bureauCode] || [];
              const resolvedAlerts = alerts.filter((a: any) => a.status === 'resolved');
              const categories = new Set(resolvedAlerts.map((a: any) => a.category).filter(Boolean));
              return [b.bureauCode, categories.size];
            })),
          },
        ];
      }
      
      // Par défaut (all), afficher toutes les métriques
      return [
        {
          metric: 'Total Alertes',
          ...Object.fromEntries(selectedData.map(b => {
            const alerts = alertsByBureau[b.bureauCode] || [];
            return [b.bureauCode, alerts.length];
          })),
        },
        {
          metric: 'Critiques',
          ...Object.fromEntries(selectedData.map(b => {
            const alerts = alertsByBureau[b.bureauCode] || [];
            return [b.bureauCode, alerts.filter((a: any) => a.severity === 'critical').length];
          })),
        },
        {
          metric: 'Avertissements',
          ...Object.fromEntries(selectedData.map(b => {
            const alerts = alertsByBureau[b.bureauCode] || [];
            return [b.bureauCode, alerts.filter((a: any) => a.severity === 'warning').length];
          })),
        },
        {
          metric: 'Résolues',
          ...Object.fromEntries(selectedData.map(b => {
            const alerts = alertsByBureau[b.bureauCode] || [];
            return [b.bureauCode, alerts.filter((a: any) => a.status === 'resolved').length];
          })),
        },
      ];
    }
    
    // Par défaut (performance)
    return [
      {
        metric: 'Score',
        ...Object.fromEntries(selectedData.map(b => [b.bureauCode, b.score])),
      },
      {
        metric: 'Validation %',
        ...Object.fromEntries(selectedData.map(b => [b.bureauCode, b.validationRate])),
      },
      {
        metric: 'SLA %',
        ...Object.fromEntries(selectedData.map(b => [b.bureauCode, b.slaCompliance])),
      },
      {
        metric: 'Efficacité',
        ...Object.fromEntries(selectedData.map(b => [b.bureauCode, Math.max(0, 100 - b.avgDelay * 10)])),
      },
    ];
  }, [category, selectedData, alertsByBureau]);

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
  
  // Configuration selon category et subCategory
  const config = useMemo(() => {
    if (category === 'alerts') {
      if (subCategory === 'critical') {
        return {
          title: 'Comparaison Alertes Critiques',
          description: 'Analyse comparative des alertes critiques entre bureaux',
          icon: XCircle,
          color: 'red',
        };
      }
      if (subCategory === 'warning') {
        return {
          title: 'Comparaison Avertissements',
          description: 'Analyse comparative des avertissements entre bureaux',
          icon: AlertTriangle,
          color: 'amber',
        };
      }
      if (subCategory === 'resolved') {
        return {
          title: 'Comparaison Alertes Résolues',
          description: 'Analyse comparative des alertes résolues entre bureaux',
          icon: CheckCircle2,
          color: 'emerald',
        };
      }
      return {
        title: 'Comparaison Alertes',
        description: 'Analyse comparative de toutes les alertes entre bureaux',
        icon: AlertTriangle,
        color: 'blue',
      };
    }
    return null;
  }, [category, subCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Comparaisons & Benchmarks
            {category && category !== 'overview' && (
              <span className="ml-2 text-lg font-normal text-slate-400">
                • {category === 'performance' ? 'Performance' : 
                    category === 'trends' ? 'Tendances' : 
                    category === 'financial' ? 'Financier' : 
                    category === 'alerts' ? 'Alertes' : 
                    category === 'reports' ? 'Rapports' : 
                    category === 'kpis' ? 'KPIs' : 
                    category === 'bureaux' ? 'Bureaux' : category}
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">
            {config
              ? config.description
              : category === 'performance' 
              ? 'Comparez les performances des KPIs entre bureaux'
              : category === 'trends'
              ? 'Comparez les tendances entre bureaux ou périodes'
              : category === 'financial'
              ? 'Comparez les données financières entre bureaux'
              : category === 'alerts'
              ? 'Comparez les alertes entre bureaux'
              : category === 'reports'
              ? 'Comparez les rapports entre bureaux'
              : category === 'kpis'
              ? 'Comparez les KPIs entre bureaux'
              : 'Comparez les performances entre bureaux ou périodes'}
          </p>
          {config && (
            <div className={cn(
              'mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
              config.color === 'red' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
              config.color === 'amber' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
              config.color === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
              'bg-blue-500/10 border border-blue-500/30 text-blue-400'
            )}>
              <config.icon className="w-4 h-4" />
              <span className="text-xs font-medium">
                {subCategory === 'critical' ? 'Critiques' :
                 subCategory === 'warning' ? 'Avertissements' :
                 subCategory === 'resolved' ? 'Résolues' : 'Toutes'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <FluentButton
            size="sm"
            variant={comparisonType === 'bureaux' ? 'primary' : 'secondary'}
            onClick={() => setComparisonType('bureaux')}
          >
            🏢 Bureaux
          </FluentButton>
          <FluentButton
            size="sm"
            variant={comparisonType === 'periods' ? 'primary' : 'secondary'}
            onClick={() => setComparisonType('periods')}
          >
            📅 Périodes
          </FluentButton>
        </div>
      </div>

      {comparisonType === 'bureaux' && (
        <>
          {/* Sélection bureaux */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                Sélectionner les bureaux à comparer ({selectedBureaux.length || 'Top 5'} sélectionnés)
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {bureaux.map((bureau) => {
                  const perf = bureauPerf.find(b => b.bureauCode === bureau.code);
                  const isSelected = selectedBureaux.includes(bureau.code);
                  
                  return (
                    <button
                      key={bureau.code}
                      onClick={() => toggleBureau(bureau.code)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{bureau.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{bureau.code}</div>
                          <div className="text-xs text-slate-400 truncate">{bureau.name}</div>
                        </div>
                      </div>
                      {perf && (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={perf.score >= 80 ? 'success' : perf.score >= 60 ? 'warning' : 'urgent'}
                            className="text-xs"
                          >
                            {perf.score}
                          </Badge>
                          <span className="text-xs text-slate-400">{perf.totalDemands} dem.</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </FluentCardContent>
          </FluentCard>

          {/* Graphique comparatif */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                📊 Comparaison Multi-Critères
                {category === 'alerts' && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({subCategory === 'critical' ? 'Critiques' : subCategory === 'warning' ? 'Avertissements' : subCategory === 'resolved' ? 'Résolues' : 'Toutes'})
                  </span>
                )}
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="bureau" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#475569' }}
                      tickLine={{ stroke: '#475569' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e2e8f0',
                      }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    {category === 'alerts' ? (
                      <>
                        {subCategory === 'critical' ? (
                          <>
                            <Bar dataKey="count" fill="#EF4444" name="Alertes Critiques" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="highPriority" fill="#DC2626" name="Priorité Haute" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgAge" fill="#991B1B" name="Âge Moyen (h)" radius={[4, 4, 0, 0]} />
                          </>
                        ) : subCategory === 'warning' ? (
                          <>
                            <Bar dataKey="count" fill="#F59E0B" name="Avertissements" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="mediumPriority" fill="#D97706" name="Priorité Moyenne" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgAge" fill="#B45309" name="Âge Moyen (h)" radius={[4, 4, 0, 0]} />
                          </>
                        ) : subCategory === 'resolved' ? (
                          <>
                            <Bar dataKey="count" fill="#10B981" name="Alertes Résolues" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="resolvedThisWeek" fill="#059669" name="Résolues Semaine" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgResolutionTime" fill="#047857" name="Temps Résolution (h)" radius={[4, 4, 0, 0]} />
                          </>
                        ) : (
                          <>
                            <Bar dataKey="total" fill={COLORS[0]} name="Total Alertes" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="critical" fill="#EF4444" name="Critiques" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="warning" fill="#F59E0B" name="Avertissements" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="resolved" fill="#10B981" name="Résolues" radius={[4, 4, 0, 0]} />
                          </>
                        )}
                      </>
                    ) : category === 'financial' ? (
                      <>
                        <Bar dataKey="budget" fill={COLORS[0]} name="Budget (M FCFA)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="depenses" fill={COLORS[1]} name="Dépenses (M FCFA)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenus" fill={COLORS[2]} name="Revenus (M FCFA)" radius={[4, 4, 0, 0]} />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="score" fill={COLORS[0]} name="Score /100" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="validation" fill={COLORS[1]} name="Validation %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="sla" fill={COLORS[2]} name="SLA %" radius={[4, 4, 0, 0]} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FluentCardContent>
          </FluentCard>

          {/* Radar Chart */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                🎯 Analyse Radar
                {category === 'alerts' ? ' (Alertes)' : category === 'financial' ? ' (Financier)' : ' (Performance globale)'}
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={category === 'alerts' ? [0, 'auto'] : [0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    {selectedData.map((bureau, idx) => (
                      <Radar
                        key={bureau.bureauCode}
                        name={bureau.bureauCode}
                        dataKey={bureau.bureauCode}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#e2e8f0',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </FluentCardContent>
          </FluentCard>

          {/* Tableau comparatif */}
          <FluentCard>
            <FluentCardHeader>
              <FluentCardTitle className="text-sm">
                Résumé Comparatif
                {category === 'alerts' && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({subCategory === 'critical' ? 'Critiques' : subCategory === 'warning' ? 'Avertissements' : subCategory === 'resolved' ? 'Résolues' : 'Toutes'})
                  </span>
                )}
              </FluentCardTitle>
            </FluentCardHeader>
            <FluentCardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/50">
                      <th className="text-left py-2 px-3 font-semibold text-slate-200">Bureau</th>
                      {category === 'alerts' ? (
                        <>
                          {subCategory === 'critical' ? (
                            <>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Total Critiques</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Priorité Haute</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Âge Moyen (h)</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Catégories</th>
                            </>
                          ) : subCategory === 'warning' ? (
                            <>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Total Avertissements</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Priorité Moyenne</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Âge Moyen (h)</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Catégories</th>
                            </>
                          ) : subCategory === 'resolved' ? (
                            <>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Total Résolues</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Résolues Semaine</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Temps Résolution (h)</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Catégories</th>
                            </>
                          ) : (
                            <>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Total</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Critiques</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Avertissements</th>
                              <th className="text-center py-2 px-3 font-semibold text-slate-200">Résolues</th>
                            </>
                          )}
                        </>
                      ) : category === 'financial' ? (
                        <>
                          <th className="text-right py-2 px-3 font-semibold text-slate-200">Budget</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-200">Dépenses</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-200">Revenus</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-200">Résultat</th>
                        </>
                      ) : (
                        <>
                          <th className="text-center py-2 px-3 font-semibold text-slate-200">Score</th>
                          <th className="text-center py-2 px-3 font-semibold text-slate-200">Valid. %</th>
                          <th className="text-center py-2 px-3 font-semibold text-slate-200">SLA %</th>
                          <th className="text-center py-2 px-3 font-semibold text-slate-200">Délai</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.map((bureau) => {
                      const bureauInfo = bureaux.find(b => b.code === bureau.bureauCode);
                      const alerts = alertsByBureau[bureau.bureauCode] || [];
                      
                      return (
                        <tr 
                          key={bureau.bureauCode}
                          className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{bureauInfo?.icon}</span>
                              <span className="font-semibold text-slate-200">{bureau.bureauCode}</span>
                            </div>
                          </td>
                          {category === 'alerts' ? (
                            <>
                              {subCategory === 'critical' ? (
                                <>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="urgent" className="text-xs">
                                      {alerts.filter((a: any) => a.severity === 'critical').length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="urgent" className="text-xs">
                                      {alerts.filter((a: any) => a.severity === 'critical' && a.priority === 'high').length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {(() => {
                                      const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical');
                                      if (criticalAlerts.length === 0) return '0';
                                      const avgAge = criticalAlerts.reduce((sum: number, a: any) => {
                                        const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                                        return sum + (Date.now() - createdAt);
                                      }, 0) / criticalAlerts.length / (1000 * 60 * 60);
                                      return Math.round(avgAge) + 'h';
                                    })()}
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {(() => {
                                      const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical');
                                      const categories = new Set(criticalAlerts.map((a: any) => a.category).filter(Boolean));
                                      return categories.size;
                                    })()}
                                  </td>
                                </>
                              ) : subCategory === 'warning' ? (
                                <>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="warning" className="text-xs">
                                      {alerts.filter((a: any) => a.severity === 'warning').length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="warning" className="text-xs">
                                      {alerts.filter((a: any) => a.severity === 'warning' && a.priority === 'medium').length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {(() => {
                                      const warningAlerts = alerts.filter((a: any) => a.severity === 'warning');
                                      if (warningAlerts.length === 0) return '0';
                                      const avgAge = warningAlerts.reduce((sum: number, a: any) => {
                                        const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                                        return sum + (Date.now() - createdAt);
                                      }, 0) / warningAlerts.length / (1000 * 60 * 60);
                                      return Math.round(avgAge) + 'h';
                                    })()}
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {(() => {
                                      const warningAlerts = alerts.filter((a: any) => a.severity === 'warning');
                                      const categories = new Set(warningAlerts.map((a: any) => a.category).filter(Boolean));
                                      return categories.size;
                                    })()}
                                  </td>
                                </>
                              ) : subCategory === 'resolved' ? (
                                <>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="success" className="text-xs">
                                      {alerts.filter((a: any) => a.status === 'resolved').length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {(() => {
                                      const resolvedAlerts = alerts.filter((a: any) => a.status === 'resolved');
                                      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                                      return resolvedAlerts.filter((a: any) => {
                                        const resolvedAt = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
                                        return resolvedAt >= weekAgo;
                                      }).length;
                                    })()}
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {(() => {
                                      const resolvedAlerts = alerts.filter((a: any) => a.status === 'resolved');
                                      if (resolvedAlerts.length === 0) return '0h';
                                      const avgTime = resolvedAlerts.reduce((sum: number, a: any) => {
                                        const createdAt = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
                                        const resolvedAt = a.resolvedAt ? new Date(a.resolvedAt).getTime() : Date.now();
                                        return sum + (resolvedAt - createdAt);
                                      }, 0) / resolvedAlerts.length / (1000 * 60 * 60);
                                      return Math.round(avgTime) + 'h';
                                    })()}
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {(() => {
                                      const resolvedAlerts = alerts.filter((a: any) => a.status === 'resolved');
                                      const categories = new Set(resolvedAlerts.map((a: any) => a.category).filter(Boolean));
                                      return categories.size;
                                    })()}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="default" className="text-xs">
                                      {alerts.length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="urgent" className="text-xs">
                                      {alerts.filter((a: any) => a.severity === 'critical').length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="warning" className="text-xs">
                                      {alerts.filter((a: any) => a.severity === 'warning').length}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Badge variant="success" className="text-xs">
                                      {alerts.filter((a: any) => a.status === 'resolved').length}
                                    </Badge>
                                  </td>
                                </>
                              )}
                            </>
                          ) : category === 'financial' ? (
                            <>
                              {(() => {
                                const financialPerf = calculateFinancialPerformance();
                                const fin = financialPerf.find(f => f.bureauCode === bureau.bureauCode);
                                return (
                                  <>
                                    <td className="py-2 px-3 text-right font-mono text-slate-200">
                                      {fin ? formatFCFA(fin.budgetTotal) : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-amber-400">
                                      {fin ? formatFCFA(fin.expenses) : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-emerald-400">
                                      {fin ? formatFCFA(fin.revenues) : '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono">
                                      <span className={cn(
                                        'font-semibold',
                                        fin && fin.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'
                                      )}>
                                        {fin ? formatFCFA(fin.netResult) : '-'}
                                      </span>
                                    </td>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-3 text-center">
                                <Badge 
                                  variant={bureau.score >= 80 ? 'success' : bureau.score >= 60 ? 'warning' : 'urgent'}
                                  className="text-xs"
                                >
                                  {bureau.score}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-center text-slate-300">{bureau.validationRate}%</td>
                              <td className="py-2 px-3 text-center text-slate-300">{bureau.slaCompliance}%</td>
                              <td className="py-2 px-3 text-center">
                                <span className={cn(
                                  'font-medium text-xs',
                                  bureau.avgDelay <= 3 ? 'text-emerald-500' :
                                  bureau.avgDelay <= 5 ? 'text-amber-500' :
                                  'text-red-500'
                                )}>
                                  {bureau.avgDelay}j
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </FluentCardContent>
          </FluentCard>
        </>
      )}

      {comparisonType === 'periods' && (
        <PeriodsComparisonView 
          category={category} 
          subCategory={subCategory}
          alertsData={alertsData}
        />
      )}
    </div>
  );
}

// ================================
// Periods Comparison View
// ================================
function PeriodsComparisonView({ 
  category, 
  subCategory,
  alertsData 
}: { 
  category?: AnalyticsMainCategory;
  subCategory?: string;
  alertsData?: any;
}) {
  const [periodType, setPeriodType] = useState<'months' | 'quarters' | 'years'>('months');

  // Générer des données historiques selon le type de période
  const periodData = useMemo((): PeriodData[] => {
    const now = new Date();
    const data: PeriodData[] = [];

    if (periodType === 'months') {
      // 6 derniers mois
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        
        // Générer des données réalistes avec variation
        const baseValue = category === 'alerts' 
          ? (subCategory === 'critical' ? 2 : subCategory === 'warning' ? 6 : subCategory === 'resolved' ? 3 : 8)
          : 50;
        const variation = Math.random() * 3 - 1.5;
        const value = Math.max(0, Math.round(baseValue + variation + (i * 0.2)));
        
        data.push({
          period: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          label: monthLabel,
          value,
          critical: category === 'alerts' ? (subCategory === 'critical' ? value : Math.round(value * 0.25)) : undefined,
          warning: category === 'alerts' ? (subCategory === 'warning' ? value : Math.round(value * 0.5)) : undefined,
          resolved: category === 'alerts' ? (subCategory === 'resolved' ? value : Math.round(value * 0.3)) : undefined,
          trend: i > 0 ? (value - (data[data.length - 1]?.value || baseValue)) : 0,
        });
      }
    } else if (periodType === 'quarters') {
      // 4 derniers trimestres
      for (let i = 3; i >= 0; i--) {
        const quarter = Math.floor(now.getMonth() / 3) - i;
        const year = now.getFullYear() + (quarter < 0 ? -1 : 0);
        const actualQuarter = ((quarter % 4) + 4) % 4;
        const quarterLabel = `T${actualQuarter + 1} ${String(year).slice(-2)}`;
        
        const baseValue = category === 'alerts'
          ? (subCategory === 'critical' ? 6 : subCategory === 'warning' ? 18 : subCategory === 'resolved' ? 9 : 24)
          : 150;
        const variation = Math.random() * 5 - 2.5;
        const value = Math.max(0, Math.round(baseValue + variation + (i * 0.5)));
        
        data.push({
          period: `${year}-Q${actualQuarter + 1}`,
          label: quarterLabel,
          value,
          critical: category === 'alerts' ? (subCategory === 'critical' ? value : Math.round(value * 0.25)) : undefined,
          warning: category === 'alerts' ? (subCategory === 'warning' ? value : Math.round(value * 0.5)) : undefined,
          resolved: category === 'alerts' ? (subCategory === 'resolved' ? value : Math.round(value * 0.3)) : undefined,
          trend: i > 0 ? (value - (data[data.length - 1]?.value || baseValue)) : 0,
        });
      }
    } else {
      // 2 dernières années
      for (let i = 1; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yearLabel = String(year);
        
        const baseValue = category === 'alerts'
          ? (subCategory === 'critical' ? 24 : subCategory === 'warning' ? 72 : subCategory === 'resolved' ? 36 : 96)
          : 600;
        const variation = Math.random() * 10 - 5;
        const value = Math.max(0, Math.round(baseValue + variation));
        
        data.push({
          period: String(year),
          label: yearLabel,
          value,
          critical: category === 'alerts' ? (subCategory === 'critical' ? value : Math.round(value * 0.25)) : undefined,
          warning: category === 'alerts' ? (subCategory === 'warning' ? value : Math.round(value * 0.5)) : undefined,
          resolved: category === 'alerts' ? (subCategory === 'resolved' ? value : Math.round(value * 0.3)) : undefined,
          trend: i > 0 ? (value - (data[data.length - 1]?.value || baseValue)) : 0,
        });
      }
    }

    return data;
  }, [periodType, category, subCategory]);

  // Configuration selon category et subCategory
  const config = useMemo(() => {
    if (category === 'alerts') {
      if (subCategory === 'critical') {
        return {
          title: 'Évolution Alertes Critiques',
          description: 'Analyse de l\'évolution des alertes critiques sur différentes périodes',
          color: 'red',
          dataKey: 'value',
        };
      }
      if (subCategory === 'warning') {
        return {
          title: 'Évolution Avertissements',
          description: 'Analyse de l\'évolution des avertissements sur différentes périodes',
          color: 'amber',
          dataKey: 'value',
        };
      }
      if (subCategory === 'resolved') {
        return {
          title: 'Évolution Alertes Résolues',
          description: 'Analyse de l\'évolution des alertes résolues sur différentes périodes',
          color: 'emerald',
          dataKey: 'value',
        };
      }
      return {
        title: 'Évolution Alertes',
        description: 'Analyse de l\'évolution de toutes les alertes sur différentes périodes',
        color: 'blue',
        dataKey: 'total',
      };
    }
    return {
      title: 'Évolution Performance',
      description: 'Analyse de l\'évolution des performances sur différentes périodes',
      color: 'blue',
      dataKey: 'value',
    };
  }, [category, subCategory]);

  const currentPeriod = periodData[periodData.length - 1];
  const previousPeriod = periodData[periodData.length - 2];
  const change = previousPeriod ? currentPeriod.value - previousPeriod.value : 0;
  const changePercent = previousPeriod && previousPeriod.value > 0
    ? ((change / previousPeriod.value) * 100).toFixed(1)
    : '0';

  // Utiliser les hooks personnalisés pour l'analyse et les actions
  const trendAnalysis = useTrendAnalysis(periodData, subCategory || 'all');
  const periodActions = usePeriodActions(currentPeriod, category, subCategory);
  
  const recommendations = useRecommendations(trendAnalysis, {
    category,
    subCategory: subCategory || 'all',
    currentPeriodValue: currentPeriod?.value || 0,
  });
  
  // Mapper les recommandations pour inclure les icônes React
  const recommendationsWithIcons = useMemo(() => {
    const iconMap: Record<string, React.ElementType> = {
      'rec-degrading': AlertTriangle,
      'rec-worst-period': BarChart3,
      'rec-problematic': Target,
      'rec-improving': TrendingUp,
      'rec-critical-action': XCircle,
      'rec-warning-monitoring': Bell,
    };
    
    return recommendations.map(rec => ({
      ...rec,
      icon: iconMap[rec.id] || AlertTriangle,
    }));
  }, [recommendations]);
  
  // Wrapper pour les actions avec mapping des types
  const handleQuickAction = useCallback((actionType: string, period?: PeriodData) => {
    switch (actionType) {
      case 'create-alert':
        periodActions.createAlert({ period });
        break;
      case 'create-task':
        periodActions.createTask({ period });
        break;
      case 'schedule-meeting':
        periodActions.scheduleMeeting({ period });
        break;
      case 'generate-report':
        periodActions.generateReport(periodData);
        break;
      case 'export-data':
        periodActions.exportData(periodData);
        break;
      default:
        break;
    }
  }, [periodActions, periodData]);

  return (
    <div className="space-y-6">
      {/* Header avec sélection de période */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">{config.title}</h3>
          <p className="text-slate-400 text-sm">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <FluentButton
            size="sm"
            variant={periodType === 'months' ? 'primary' : 'secondary'}
            onClick={() => setPeriodType('months')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Mois
          </FluentButton>
          <FluentButton
            size="sm"
            variant={periodType === 'quarters' ? 'primary' : 'secondary'}
            onClick={() => setPeriodType('quarters')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Trimestres
          </FluentButton>
          <FluentButton
            size="sm"
            variant={periodType === 'years' ? 'primary' : 'secondary'}
            onClick={() => setPeriodType('years')}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Années
          </FluentButton>
        </div>
      </div>

      {/* Statistiques de comparaison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Période Actuelle</p>
                <p className="text-2xl font-bold text-slate-200">{currentPeriod?.value || 0}</p>
                <p className="text-xs text-slate-400 mt-1">{currentPeriod?.label}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </FluentCardContent>
        </FluentCard>

        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Période Précédente</p>
                <p className="text-2xl font-bold text-slate-200">{previousPeriod?.value || 0}</p>
                <p className="text-xs text-slate-400 mt-1">{previousPeriod?.label}</p>
              </div>
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
          </FluentCardContent>
        </FluentCard>

        <FluentCard>
          <FluentCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Évolution</p>
                <div className="flex items-baseline gap-2">
                  {change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <p className={cn(
                    'text-2xl font-bold',
                    change >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {change >= 0 ? '+' : ''}{change}
                  </p>
                </div>
                <p className={cn(
                  'text-xs mt-1',
                  change >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {changePercent}% vs période précédente
                </p>
              </div>
              {change >= 0 ? (
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </FluentCardContent>
        </FluentCard>
      </div>

      {/* Graphique d'évolution */}
      <FluentCard>
        <FluentCardHeader>
          <FluentCardTitle className="text-sm">
            📈 Évolution sur les {periodType === 'months' ? '6 derniers mois' : periodType === 'quarters' ? '4 derniers trimestres' : '2 dernières années'}
          </FluentCardTitle>
        </FluentCardHeader>
        <FluentCardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={periodData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color === 'red' ? '#EF4444' : config.color === 'amber' ? '#F59E0B' : config.color === 'emerald' ? '#10B981' : '#3B82F6'} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={config.color === 'red' ? '#EF4444' : config.color === 'amber' ? '#F59E0B' : config.color === 'emerald' ? '#10B981' : '#3B82F6'} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={{ stroke: '#475569' }}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={{ stroke: '#475569' }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={config.color === 'red' ? '#EF4444' : config.color === 'amber' ? '#F59E0B' : config.color === 'emerald' ? '#10B981' : '#3B82F6'}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  name={subCategory === 'critical' ? 'Critiques' : subCategory === 'warning' ? 'Avertissements' : subCategory === 'resolved' ? 'Résolues' : 'Total'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FluentCardContent>
      </FluentCard>

      {/* Actions Rapides avec animations */}
      <FadeIn delay={0.1}>
        <FluentCard className={cn('border-l-4', config.color === 'red' ? 'border-red-500/30' : config.color === 'amber' ? 'border-amber-500/30' : config.color === 'emerald' ? 'border-emerald-500/30' : 'border-blue-500/30')}>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Actions Rapides
            </FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StaggerItem>
                <EnhancedTooltip
                  content="Créer une alerte pour surveiller cette période"
                  side="top"
                >
                  <button
                    onClick={() => handleQuickAction('create-alert')}
                    className={cn(
                      'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
                      'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400',
                      'hover:scale-105 active:scale-95'
                    )}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="text-xs font-medium">Créer Alerte</span>
                  </button>
                </EnhancedTooltip>
              </StaggerItem>
              <StaggerItem>
                <EnhancedTooltip
                  content="Créer une tâche pour corriger les écarts observés"
                  side="top"
                >
                  <button
                    onClick={() => handleQuickAction('create-task')}
                    className={cn(
                      'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
                      'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-400',
                      'hover:scale-105 active:scale-95'
                    )}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-medium">Nouvelle Tâche</span>
                  </button>
                </EnhancedTooltip>
              </StaggerItem>
              <StaggerItem>
                <EnhancedTooltip
                  content="Planifier une réunion d'analyse pour cette période"
                  side="top"
                >
                  <button
                    onClick={() => handleQuickAction('schedule-meeting')}
                    className={cn(
                      'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
                      'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-400',
                      'hover:scale-105 active:scale-95'
                    )}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-medium">Planifier Réunion</span>
                  </button>
                </EnhancedTooltip>
              </StaggerItem>
              <StaggerItem>
                <EnhancedTooltip
                  content="Générer un rapport d'analyse pour cette période"
                  side="top"
                >
                  <button
                    onClick={() => handleQuickAction('generate-report')}
                    className={cn(
                      'flex flex-col items-center gap-2 h-auto py-4 rounded-xl border transition-all',
                      'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400',
                      'hover:scale-105 active:scale-95'
                    )}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-medium">Générer Rapport</span>
                  </button>
                </EnhancedTooltip>
              </StaggerItem>
            </StaggerContainer>
          </FluentCardContent>
        </FluentCard>
      </FadeIn>

      {/* Recommandations Intelligentes */}
      {recommendationsWithIcons.length > 0 && (
        <FluentCard>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Recommandations Automatiques
            </FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <div className="space-y-3">
              {recommendationsWithIcons.map((rec) => {
                const Icon = rec.icon;
                return (
                  <div
                    key={rec.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      rec.priority === 'high'
                        ? 'bg-red-500/10 border-red-500/30'
                        : rec.priority === 'medium'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={cn(
                          'w-5 h-5 mt-0.5',
                          rec.priority === 'high' ? 'text-red-400' :
                          rec.priority === 'medium' ? 'text-amber-400' :
                          'text-blue-400'
                        )} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-slate-200">{rec.title}</h4>
                            <Badge
                              variant={rec.priority === 'high' ? 'urgent' : rec.priority === 'medium' ? 'warning' : 'default'}
                              className="text-xs"
                            >
                              {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Suggestion'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">{rec.description}</p>
                        </div>
                      </div>
                      <FluentButton
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          const actionMap: Record<string, string> = {
                            'alert': 'create-alert',
                            'task': 'create-task',
                            'meeting': 'schedule-meeting',
                            'report': 'generate-report',
                            'review': 'create-task',
                          };
                          handleQuickAction(actionMap[rec.actionType] || 'create-task');
                        }}
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Agir
                      </FluentButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </FluentCardContent>
        </FluentCard>
      )}

      {/* Analyse de Tendance */}
      {trendAnalysis && (
        <FluentCard>
          <FluentCardHeader>
            <FluentCardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Analyse de Tendance
            </FluentCardTitle>
          </FluentCardHeader>
          <FluentCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">Tendance Globale</p>
                <div className="flex items-center gap-2">
                  {trendAnalysis.isImproving ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : trendAnalysis.isDegrading ? (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  ) : (
                    <Activity className="w-5 h-5 text-slate-400" />
                  )}
                  <span className={cn(
                    'text-lg font-bold',
                    trendAnalysis.isImproving ? 'text-emerald-400' :
                    trendAnalysis.isDegrading ? 'text-red-400' :
                    'text-slate-400'
                  )}>
                    {trendAnalysis.isImproving ? '+' : ''}{trendAnalysis.globalTrendPercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {trendAnalysis.isImproving ? 'Amélioration' : trendAnalysis.isDegrading ? 'Dégradation' : 'Stable'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">Périodes Problématiques</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    trendAnalysis.problematicPeriods.length > 0 ? 'text-red-400' : 'text-emerald-400'
                  )} />
                  <span className="text-lg font-bold text-slate-200">
                    {trendAnalysis.problematicPeriods.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {trendAnalysis.problematicPeriods.length > 0 ? 'Action requise' : 'Aucun problème'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-2">Période la Plus Problématique</p>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    {trendAnalysis.worstPeriod?.label || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {trendAnalysis.worstPeriod ? `${trendAnalysis.worstPeriod.value} alertes` : 'Aucune'}
                </p>
              </div>
            </div>
            
            {trendAnalysis.needsAction && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <p className="text-sm text-amber-400 font-medium">
                    Action recommandée : {trendAnalysis.isDegrading ? 'Intervention pour inverser la tendance' : 'Capitaliser sur l\'amélioration'}
                  </p>
                </div>
              </div>
            )}
          </FluentCardContent>
        </FluentCard>
      )}

      {/* Tableau détaillé avec actions */}
      <FluentCard>
        <FluentCardHeader>
          <div className="flex items-center justify-between w-full">
            <FluentCardTitle className="text-sm">
              Détail par Période
            </FluentCardTitle>
            <FluentButton
              size="sm"
              variant="secondary"
              onClick={() => handleQuickAction('export-data')}
            >
              <Download className="w-4 h-4 mr-1" />
              Exporter
            </FluentButton>
          </div>
        </FluentCardHeader>
        <FluentCardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/50">
                  <th className="text-left py-2 px-3 font-semibold text-slate-200">Période</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-200">
                    {subCategory === 'critical' ? 'Critiques' : subCategory === 'warning' ? 'Avertissements' : subCategory === 'resolved' ? 'Résolues' : 'Total'}
                  </th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-200">Évolution</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-200">Tendance</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {periodData.map((period, idx) => {
                  const prevValue = idx > 0 ? periodData[idx - 1].value : period.value;
                  const periodChange = period.value - prevValue;
                  const periodChangePercent = prevValue > 0 ? ((periodChange / prevValue) * 100).toFixed(1) : '0';
                  const isProblematic = trendAnalysis?.problematicPeriods.some(p => p.period === period.period) || false;
                  
                  // Pour résolues, une augmentation est positive, pour critiques/avertissements, une augmentation est négative
                  const isPositiveChange = subCategory === 'resolved' ? periodChange >= 0 : periodChange <= 0;
                  
                  return (
                    <tr 
                      key={period.period}
                      className={cn(
                        'border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors',
                        isProblematic && 'bg-red-500/5'
                      )}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold text-slate-200">{period.label}</div>
                            <div className="text-xs text-slate-400">{period.period}</div>
                          </div>
                          {isProblematic && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge 
                          variant={subCategory === 'critical' ? 'urgent' : subCategory === 'warning' ? 'warning' : 'default'}
                          className="text-xs"
                        >
                          {period.value}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {idx > 0 && (
                          <span className={cn(
                            'text-sm font-medium',
                            isPositiveChange ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {isPositiveChange ? '+' : ''}{periodChange} ({periodChangePercent}%)
                          </span>
                        )}
                        {idx === 0 && <span className="text-slate-400 text-xs">-</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {idx > 0 && (
                          isPositiveChange ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400 mx-auto" />
                          )
                        )}
                        {idx === 0 && <span className="text-slate-400 text-xs">-</span>}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleQuickAction('create-alert', period)}
                            className="p-1.5 rounded hover:bg-slate-700/50 text-amber-400 hover:text-amber-300 transition-colors"
                            title="Créer une alerte pour cette période"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleQuickAction('create-task', period)}
                            className="p-1.5 rounded hover:bg-slate-700/50 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Créer une tâche pour cette période"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          {isProblematic && (
                            <button
                              onClick={() => handleQuickAction('schedule-meeting', period)}
                              className="p-1.5 rounded hover:bg-slate-700/50 text-purple-400 hover:text-purple-300 transition-colors"
                              title="Planifier une réunion d'urgence"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FluentCardContent>
      </FluentCard>
    </div>
  );
}

