/**
 * Dashboard 360° - Vue d'ensemble Validation BC
 * Tableau de bord complet avec alertes, actions, statistiques et graphiques
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  Users,
  Calendar,
  Activity,
  ArrowRight,
  BarChart3,
  PieChart,
  Zap,
  Eye,
} from 'lucide-react';
import { getValidationStats } from '@/lib/services/validation-bc-api';
import type { ValidationStats, ValidationDocument } from '@/lib/services/validation-bc-api';
import {
  LineChart,
  Line,
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
} from 'recharts';

// ================================
// Types
// ================================
interface DashboardAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  action?: string;
}

// ================================
// Component
// ================================
export function Dashboard360() {
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mesActions, setMesActions] = useState<ValidationDocument[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsData = await getValidationStats('init');
      setStats(statsData);

      // Mock mes actions
      setMesActions([
        {
          id: 'BC-2024-001',
          type: 'bc',
          status: 'pending',
          bureau: 'DRE',
          fournisseur: 'SENELEC',
          objet: 'Fourniture équipements électriques',
          montantHT: 8500000,
          montantTTC: 10030000,
          tva: 18,
          dateEmission: '2024-01-15',
          dateLimite: '2024-01-20',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-18',
          urgent: true,
          demandeur: {
            nom: 'A. DIALLO',
            fonction: 'Chef Service',
            bureau: 'DRE',
          },
        },
        {
          id: 'FC-2024-015',
          type: 'facture',
          status: 'pending',
          bureau: 'DAAF',
          fournisseur: 'EIFFAGE',
          objet: 'Travaux construction',
          montantHT: 25000000,
          montantTTC: 29500000,
          tva: 18,
          dateEmission: '2024-01-16',
          dateLimite: '2024-01-22',
          createdAt: '2024-01-16',
          updatedAt: '2024-01-18',
          demandeur: {
            nom: 'M. KANE',
            fonction: 'DAF',
            bureau: 'DAAF',
          },
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Alertes critiques
  const alerts: DashboardAlert[] = [
    {
      id: 'alert-1',
      type: 'critical',
      title: 'Documents SLA dépassé',
      description: '5 documents ont dépassé leur délai de validation',
      count: 5,
      action: 'Voir les documents',
    },
    {
      id: 'alert-2',
      type: 'warning',
      title: 'Budget projet dépassé',
      description: '2 projets ont dépassé 90% de leur budget',
      count: 2,
      action: 'Voir les projets',
    },
    {
      id: 'alert-3',
      type: 'warning',
      title: 'Pièces manquantes',
      description: '8 documents ont des pièces justificatives manquantes',
      count: 8,
      action: 'Voir les documents',
    },
  ];

  // Top 5 urgents
  const topUrgents = mesActions.filter(doc => doc.urgent).slice(0, 5);

  // Données pour graphiques
  const evolutionData = [
    { date: 'Lun', validated: 12, rejected: 2, pending: 8 },
    { date: 'Mar', validated: 15, rejected: 3, pending: 10 },
    { date: 'Mer', validated: 18, rejected: 1, pending: 7 },
    { date: 'Jeu', validated: 14, rejected: 4, pending: 12 },
    { date: 'Ven', validated: 20, rejected: 2, pending: 9 },
    { date: 'Sam', validated: 8, rejected: 1, pending: 3 },
    { date: 'Dim', validated: 5, rejected: 0, pending: 2 },
  ];

  const repartitionData = [
    { name: 'Bons de Commande', value: stats?.byType.find(t => t.type.includes('commande'))?.count || 0, color: '#3b82f6' },
    { name: 'Factures', value: stats?.byType.find(t => t.type === 'Factures')?.count || 0, color: '#8b5cf6' },
    { name: 'Avenants', value: stats?.byType.find(t => t.type === 'Avenants')?.count || 0, color: '#06b6d4' },
  ];

  const delaisData = [
    { bureau: 'DRE', delai: 2.3 },
    { bureau: 'DAAF', delai: 1.8 },
    { bureau: 'DSI', delai: 3.2 },
    { bureau: 'DG', delai: 2.1 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDelaiRestant = (dateLimite?: string) => {
    if (!dateLimite) return null;
    const now = new Date();
    const limite = new Date(dateLimite);
    const diff = limite.getTime() - now.getTime();
    const jours = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (jours < 0) return { text: `${Math.abs(jours)}j de retard`, color: 'text-red-400' };
    if (jours === 0) return { text: 'Aujourd\'hui', color: 'text-amber-400' };
    if (jours === 1) return { text: 'Demain', color: 'text-amber-400' };
    return { text: `${jours} jours`, color: 'text-slate-400' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Dashboard 360°</h1>
          <p className="text-slate-400 mt-1">Vue d'ensemble de la validation BC</p>
        </div>
        <Button onClick={loadData}>
          <Activity className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Alertes Critiques */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Alertes Critiques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  'border-2',
                  alert.type === 'critical' && 'bg-red-500/5 border-red-500/30',
                  alert.type === 'warning' && 'bg-amber-500/5 border-amber-500/30',
                  alert.type === 'info' && 'bg-blue-500/5 border-blue-500/30'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={cn(
                            'h-5 w-5',
                            alert.type === 'critical' && 'text-red-400',
                            alert.type === 'warning' && 'text-amber-400',
                            alert.type === 'info' && 'text-blue-400'
                          )}
                        />
                        <h3 className="font-semibold text-slate-200">{alert.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{alert.description}</p>
                      {alert.action && (
                        <Button size="sm" variant="outline" className="text-xs">
                          {alert.action}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'ml-2',
                        alert.type === 'critical' && 'bg-red-500/10 text-red-400 border-red-500/30',
                        alert.type === 'warning' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                        alert.type === 'info' && 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      )}
                    >
                      {alert.count}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* KPIs Rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">En Attente</p>
                <p className="text-2xl font-bold text-amber-400">{stats?.pending || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Validés</p>
                <p className="text-2xl font-bold text-emerald-400">{stats?.validated || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Urgents</p>
                <p className="text-2xl font-bold text-red-400">{stats?.urgent || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Taux Validation</p>
                <p className="text-2xl font-bold text-blue-400">
                  {stats ? Math.round((stats.validated / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mes Actions + Top 5 Urgents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mes Actions ({mesActions.length})
              </span>
              <Button size="sm" variant="ghost">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mesActions.map((doc) => {
                const delai = getDelaiRestant(doc.dateLimite);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700 hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-slate-200">{doc.id}</span>
                        {doc.urgent && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">{doc.objet}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-slate-400">{doc.fournisseur}</span>
                        <span className="text-xs font-medium text-blue-400">
                          {formatCurrency(doc.montantTTC)}
                        </span>
                        {delai && (
                          <span className={cn('text-xs font-medium', delai.color)}>
                            {delai.text}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activité Récente */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50"
                >
                  <div className="flex-shrink-0 mt-1">
                    {activity.action === 'Validé' && (
                      <div className="p-1.5 rounded-full bg-emerald-500/10">
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                      </div>
                    )}
                    {activity.action === 'Rejeté' && (
                      <div className="p-1.5 rounded-full bg-red-500/10">
                        <XCircle className="h-3 w-3 text-red-400" />
                      </div>
                    )}
                    {activity.action === 'Soumis' && (
                      <div className="p-1.5 rounded-full bg-blue-500/10">
                        <FileText className="h-3 w-3 text-blue-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">
                      <span className="font-medium">{activity.documentType} {activity.documentId}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-xs text-slate-400">
                      Par {activity.actorName} • {new Date(activity.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution sur 7 jours */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution (7 derniers jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="validated" name="Validés" fill="#10b981" />
                <Bar dataKey="rejected" name="Rejetés" fill="#ef4444" />
                <Bar dataKey="pending" name="En attente" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Répartition par Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={repartitionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {repartitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Délais moyens par bureau */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Délais Moyens par Bureau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={delaisData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" label={{ value: 'Jours', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="bureau" stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="delai" name="Délai moyen (jours)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Raccourcis Rapides */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Raccourcis Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Créer un BC</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">Créer Facture</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">Recherche Avancée</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Export Global</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

