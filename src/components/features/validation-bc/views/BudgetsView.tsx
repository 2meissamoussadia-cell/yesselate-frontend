/**
 * Vue Budgets - Validation BC
 * Suivi budgétaire par projet avec alertes et graphiques
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportDataAsCSV } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Eye,
  Filter,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

// ================================
// Types
// ================================
interface ProjectBudget {
  id: string;
  code: string;
  nom: string;
  budgetInitial: number;
  budgetRevise?: number;
  montantEngage: number;
  montantFacture: number;
  montantPaye: number;
  budgetRestant: number;
  tauxConsommation: number;
  tauxEngagement: number;
  nbDocuments: {
    bc: number;
    factures: number;
    avenants: number;
  };
  statut: 'ok' | 'warning' | 'critical';
  responsable: string;
  bureau: string;
  dateDebut: string;
  dateFin: string;
}

// ================================
// Component
// ================================
export function BudgetsView() {
  const [projects, setProjects] = useState<ProjectBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBureau, setFilterBureau] = useState('all');
  const [filterStatut, setFilterStatut] = useState('all');
  const [sortBy, setSortBy] = useState<keyof ProjectBudget>('tauxConsommation');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockProjects: ProjectBudget[] = [
        {
          id: 'proj-1',
          code: 'PROJ-2024-001',
          nom: 'Construction Route Nationale 2',
          budgetInitial: 500000000,
          budgetRevise: 550000000,
          montantEngage: 485000000,
          montantFacture: 420000000,
          montantPaye: 380000000,
          budgetRestant: 65000000,
          tauxConsommation: 88.2,
          tauxEngagement: 88.2,
          nbDocuments: { bc: 25, factures: 18, avenants: 3 },
          statut: 'warning',
          responsable: 'A. DIALLO',
          bureau: 'DRE',
          dateDebut: '2024-01-01',
          dateFin: '2024-12-31',
        },
        {
          id: 'proj-2',
          code: 'PROJ-2024-002',
          nom: 'Réhabilitation Écoles',
          budgetInitial: 150000000,
          montantEngage: 145000000,
          montantFacture: 130000000,
          montantPaye: 120000000,
          budgetRestant: 5000000,
          tauxConsommation: 96.7,
          tauxEngagement: 96.7,
          nbDocuments: { bc: 12, factures: 10, avenants: 1 },
          statut: 'critical',
          responsable: 'M. KANE',
          bureau: 'DAAF',
          dateDebut: '2024-02-01',
          dateFin: '2024-08-31',
        },
        {
          id: 'proj-3',
          code: 'PROJ-2024-003',
          nom: 'Infrastructure Réseau Télécom',
          budgetInitial: 80000000,
          montantEngage: 45000000,
          montantFacture: 38000000,
          montantPaye: 35000000,
          budgetRestant: 35000000,
          tauxConsommation: 56.3,
          tauxEngagement: 56.3,
          nbDocuments: { bc: 8, factures: 6, avenants: 2 },
          statut: 'ok',
          responsable: 'B. SOW',
          bureau: 'DSI',
          dateDebut: '2024-03-01',
          dateFin: '2024-11-30',
        },
        {
          id: 'proj-4',
          code: 'PROJ-2024-004',
          nom: 'Fourniture Équipements Médicaux',
          budgetInitial: 200000000,
          montantEngage: 125000000,
          montantFacture: 98000000,
          montantPaye: 85000000,
          budgetRestant: 75000000,
          tauxConsommation: 62.5,
          tauxEngagement: 62.5,
          nbDocuments: { bc: 15, factures: 11, avenants: 0 },
          statut: 'ok',
          responsable: 'F. NDIAYE',
          bureau: 'DRE',
          dateDebut: '2024-01-15',
          dateFin: '2024-09-30',
        },
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyCompact = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(amount) + ' FCFA';
  };

  const getStatutBadge = (statut: ProjectBudget['statut']) => {
    switch (statut) {
      case 'ok':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">OK</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Alerte</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critique</Badge>;
      default:
        return null;
    }
  };

  const getProgressColor = (taux: number) => {
    if (taux >= 90) return 'bg-red-500';
    if (taux >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const filteredProjects = projects
    .filter(p => {
      if (filterBureau !== 'all' && p.bureau !== filterBureau) return false;
      if (filterStatut !== 'all' && p.statut !== filterStatut) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const multiplier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * multiplier;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }
      return 0;
    });

  // Statistiques globales
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetRevise || p.budgetInitial), 0);
  const totalEngage = projects.reduce((sum, p) => sum + p.montantEngage, 0);
  const totalFacture = projects.reduce((sum, p) => sum + p.montantFacture, 0);
  const totalPaye = projects.reduce((sum, p) => sum + p.montantPaye, 0);
  const totalRestant = projects.reduce((sum, p) => sum + p.budgetRestant, 0);
  const tauxGlobalEngagement = totalBudget > 0 ? (totalEngage / totalBudget) * 100 : 0;

  const nbCritical = projects.filter(p => p.statut === 'critical').length;
  const nbWarning = projects.filter(p => p.statut === 'warning').length;
  const nbOk = projects.filter(p => p.statut === 'ok').length;

  // Données graphiques
  const budgetFlowData = filteredProjects.map(p => ({
    name: p.code,
    Budget: p.budgetRevise || p.budgetInitial,
    Engagé: p.montantEngage,
    Facturé: p.montantFacture,
    Payé: p.montantPaye,
  }));

  const statutData = [
    { name: 'OK', value: nbOk, color: '#10b981' },
    { name: 'Alerte', value: nbWarning, color: '#f59e0b' },
    { name: 'Critique', value: nbCritical, color: '#ef4444' },
  ];

  const handleExport = () => {
    const rows = projects.map((p: ProjectBudget) => ({
      code: p.code,
      nom: p.nom,
      budgetInitial: p.budgetInitial,
      budgetRevise: p.budgetRevise ?? '',
      engage: p.montantEngage,
      facture: p.montantFacture,
      paye: p.montantPaye,
      tauxConsommation: p.tauxConsommation,
      statut: p.statut,
    }));
    exportDataAsCSV(rows, 'budgets-validation-bc');
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
          <h1 className="text-3xl font-bold text-slate-200">Suivi Budgétaire</h1>
          <p className="text-slate-400 mt-1">Budgets par projet</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadBudgets}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs Globaux */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Budget Total</p>
                <p className="text-xl font-bold text-slate-200">{formatCurrencyCompact(totalBudget)}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Engagé</p>
                <p className="text-xl font-bold text-amber-400">{formatCurrencyCompact(totalEngage)}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Facturé</p>
                <p className="text-xl font-bold text-purple-400">{formatCurrencyCompact(totalFacture)}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Restant</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrencyCompact(totalRestant)}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ArrowDownRight className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Taux Engagement</p>
                <p className="text-xl font-bold text-blue-400">{tauxGlobalEngagement.toFixed(1)}%</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <PieChart className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {(nbCritical > 0 || nbWarning > 0) && (
        <Card className="bg-red-500/5 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-semibold text-red-400">Alertes budgétaires</p>
                <p className="text-sm text-slate-300">
                  {nbCritical > 0 && `${nbCritical} projet(s) en dépassement critique`}
                  {nbCritical > 0 && nbWarning > 0 && ' • '}
                  {nbWarning > 0 && `${nbWarning} projet(s) en alerte`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-3">
        <Select value={filterBureau} onValueChange={setFilterBureau}>
          <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
            <SelectValue placeholder="Tous les bureaux" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="all">Tous les bureaux</SelectItem>
            <SelectItem value="DRE">DRE</SelectItem>
            <SelectItem value="DAAF">DAAF</SelectItem>
            <SelectItem value="DSI">DSI</SelectItem>
            <SelectItem value="DG">DG</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatut} onValueChange={setFilterStatut}>
          <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="warning">Alerte</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Plus de filtres
        </Button>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flux budgétaires */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Flux Budgétaires par Projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="Budget" fill="#3b82f6" />
                <Bar dataKey="Engagé" fill="#f59e0b" />
                <Bar dataKey="Facturé" fill="#8b5cf6" />
                <Bar dataKey="Payé" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par statut */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Répartition par Statut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={statutData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statutData.map((entry, index) => (
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

      {/* Table Projets */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Détail par Projet ({filteredProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50 hover:bg-slate-800/40">
                <TableHead className="text-slate-300">Projet</TableHead>
                <TableHead className="text-slate-300">Bureau</TableHead>
                <TableHead className="text-slate-300 text-right">Budget</TableHead>
                <TableHead className="text-slate-300 text-right">Engagé</TableHead>
                <TableHead className="text-slate-300 text-right">Facturé</TableHead>
                <TableHead className="text-slate-300 text-right">Restant</TableHead>
                <TableHead className="text-slate-300">Consommation</TableHead>
                <TableHead className="text-slate-300">Statut</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="border-slate-700/50 hover:bg-slate-800/40 transition-colors"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-200">{project.code}</div>
                      <div className="text-sm text-slate-400 truncate max-w-xs">{project.nom}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-700/50">
                      {project.bureau}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-slate-200">
                      {formatCurrencyCompact(project.budgetRevise || project.budgetInitial)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-amber-400 font-medium">
                      {formatCurrencyCompact(project.montantEngage)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-purple-400 font-medium">
                      {formatCurrencyCompact(project.montantFacture)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-medium',
                      project.budgetRestant < 0 ? 'text-red-400' : 'text-emerald-400'
                    )}>
                      {formatCurrencyCompact(project.budgetRestant)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{project.tauxConsommation.toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={project.tauxConsommation}
                        className="h-2"
                        indicatorClassName={getProgressColor(project.tauxConsommation)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{getStatutBadge(project.statut)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

