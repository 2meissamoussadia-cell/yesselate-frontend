/**
 * ====================================================================
 * VUE AVANCÉE : Trésorerie & Flux de Paiements
 * Dashboard complet pour suivi trésorerie et prévisions
 * ====================================================================
 */

'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PieChart,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PeriodType = '30d' | '60d' | '90d' | '6m' | '1y';

interface TresorerieFlux {
  date: string;
  entrees: number;
  sorties: number;
  solde: number;
  paiements: number;
  recettes: number;
}

interface SeuillAlert {
  type: 'critical' | 'warning' | 'info';
  message: string;
  seuil: number;
  soldeActuel: number;
}

interface PaiementsTresorerieViewProps {
  className?: string;
}

export function PaiementsTresorerieView({ className }: PaiementsTresorerieViewProps) {
  const [period, setPeriod] = useState<PeriodType>('30d');
  const [showProjections, setShowProjections] = useState(true);
  const [hideSensitiveData, setHideSensitiveData] = useState(false);

  // Mock data - Flux trésorerie
  const fluxData: TresorerieFlux[] = useMemo(() => {
    const data: TresorerieFlux[] = [];
    let solde = 450000000; // 450M FCFA solde initial
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      const entrees = Math.random() * 50000000 + 10000000; // 10M-60M
      const sorties = Math.random() * 40000000 + 15000000; // 15M-55M
      const paiements = Math.floor(Math.random() * 8) + 3; // 3-10 paiements
      const recettes = Math.floor(Math.random() * 5) + 2; // 2-6 recettes
      
      solde = solde + entrees - sorties;
      
      data.push({
        date: date.toISOString().split('T')[0],
        entrees: Math.round(entrees),
        sorties: Math.round(sorties),
        solde: Math.round(solde),
        paiements,
        recettes,
      });
    }
    
    return data;
  }, []);

  // Données prévisionnelles
  const projectionData = useMemo(() => {
    const lastFlux = fluxData[fluxData.length - 1];
    let solde = lastFlux.solde;
    const data: TresorerieFlux[] = [];
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Tendances prévisionnelles (légèrement décroissantes)
      const entrees = Math.random() * 45000000 + 8000000;
      const sorties = Math.random() * 45000000 + 18000000;
      const paiements = Math.floor(Math.random() * 7) + 2;
      const recettes = Math.floor(Math.random() * 4) + 1;
      
      solde = solde + entrees - sorties;
      
      data.push({
        date: date.toISOString().split('T')[0],
        entrees: Math.round(entrees),
        sorties: Math.round(sorties),
        solde: Math.round(solde),
        paiements,
        recettes,
      });
    }
    
    return data;
  }, [fluxData]);

  // Combiner historique + projection
  const combinedData = useMemo(() => {
    return [...fluxData, ...projectionData];
  }, [fluxData, projectionData]);

  // Stats actuelles
  const stats = useMemo(() => {
    const lastFlux = fluxData[fluxData.length - 1];
    const firstFlux = fluxData[0];
    
    const soldeActuel = lastFlux.solde;
    const entreesTotales = fluxData.reduce((sum, f) => sum + f.entrees, 0);
    const sortiesTotales = fluxData.reduce((sum, f) => sum + f.sorties, 0);
    const soldeMoyenne = fluxData.reduce((sum, f) => sum + f.solde, 0) / fluxData.length;
    
    const variation = ((soldeActuel - firstFlux.solde) / firstFlux.solde) * 100;
    const fluxNet = entreesTotales - sortiesTotales;
    
    const lastProjection = projectionData[projectionData.length - 1];
    const soldePrevisionnel30j = lastProjection.solde;
    const variationPrevisionnelle = ((soldePrevisionnel30j - soldeActuel) / soldeActuel) * 100;
    
    return {
      soldeActuel,
      entreesTotales,
      sortiesTotales,
      soldeMoyenne,
      variation,
      fluxNet,
      soldePrevisionnel30j,
      variationPrevisionnelle,
    };
  }, [fluxData, projectionData]);

  // Alertes seuils
  const alertes: SeuillAlert[] = useMemo(() => {
    const alerts: SeuillAlert[] = [];
    const solde = stats.soldeActuel;
    
    // Seuil critique: < 200M
    if (solde < 200000000) {
      alerts.push({
        type: 'critical',
        message: 'Solde critique ! Sous seuil minimum de 200M FCFA',
        seuil: 200000000,
        soldeActuel: solde,
      });
    }
    // Seuil warning: < 300M
    else if (solde < 300000000) {
      alerts.push({
        type: 'warning',
        message: 'Attention : Solde proche du seuil minimum (300M FCFA)',
        seuil: 300000000,
        soldeActuel: solde,
      });
    }
    
    // Prévision négative à 30j
    if (stats.variationPrevisionnelle < -15) {
      alerts.push({
        type: 'warning',
        message: `Prévision défavorable à 30j: ${stats.variationPrevisionnelle.toFixed(1)}% de baisse`,
        seuil: 0,
        soldeActuel: stats.soldePrevisionnel30j,
      });
    }
    
    // Flux négatif
    if (stats.fluxNet < 0) {
      alerts.push({
        type: 'info',
        message: `Flux net négatif sur la période: ${(stats.fluxNet / 1000000).toFixed(1)}M FCFA`,
        seuil: 0,
        soldeActuel: stats.fluxNet,
      });
    }
    
    return alerts;
  }, [stats]);

  // Formater montant
  const formatMontant = (value: number) => {
    if (hideSensitiveData) return '•••••';
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const formatFullMontant = (value: number) => {
    if (hideSensitiveData) return '•••••••••';
    return value.toLocaleString('fr-FR');
  };

  const getAlertColor = (type: SeuillAlert['type']) => {
    switch (type) {
      case 'critical': return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'warning': return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'info': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
    }
  };

  const getAlertIcon = (type: SeuillAlert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      case 'warning': return <Activity className="h-5 w-5" />;
      case 'info': return <TrendingDown className="h-5 w-5" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header avec stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde actuel */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <Wallet className="h-4 w-4" />
              <span>Solde Actuel</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideSensitiveData(!hideSensitiveData)}
              className="h-6 w-6 p-0"
            >
              {hideSensitiveData ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatMontant(stats.soldeActuel)}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {stats.variation >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-green-400">+{stats.variation.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-red-400">{stats.variation.toFixed(1)}%</span>
              </>
            )}
            <span className="text-slate-400">vs. début période</span>
          </div>
        </div>

        {/* Entrées totales */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
            <ArrowDownLeft className="h-4 w-4" />
            <span>Entrées (30j)</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatMontant(stats.entreesTotales)}
          </div>
          <div className="text-xs text-slate-400">Recettes et encaissements</div>
        </div>

        {/* Sorties totales */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
            <ArrowUpRight className="h-4 w-4" />
            <span>Sorties (30j)</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatMontant(stats.sortiesTotales)}
          </div>
          <div className="text-xs text-slate-400">Paiements effectués</div>
        </div>

        {/* Prévision 30j */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
            <Calendar className="h-4 w-4" />
            <span>Prévision 30j</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatMontant(stats.soldePrevisionnel30j)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {stats.variationPrevisionnelle >= 0 ? (
              <span className="text-green-400">+{stats.variationPrevisionnelle.toFixed(1)}%</span>
            ) : (
              <span className="text-red-400">{stats.variationPrevisionnelle.toFixed(1)}%</span>
            )}
            <span className="text-slate-400">tendance</span>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="space-y-2">
          {alertes.map((alerte, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border',
                getAlertColor(alerte.type)
              )}
            >
              {getAlertIcon(alerte.type)}
              <div className="flex-1">
                <div className="font-medium">{alerte.message}</div>
                {alerte.seuil > 0 && (
                  <div className="text-sm opacity-80 mt-1">
                    Seuil: {formatFullMontant(alerte.seuil)} FCFA
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Période:</span>
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            {[
              { value: '30d', label: '30j' },
              { value: '60d', label: '60j' },
              { value: '90d', label: '90j' },
              { value: '6m', label: '6 mois' },
              { value: '1y', label: '1 an' },
            ].map(p => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p.value as PeriodType)}
                className="h-7 px-3"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showProjections ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowProjections(!showProjections)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Projections
          </Button>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Graphique principal - Évolution solde */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Évolution Trésorerie</h3>
            <p className="text-sm text-slate-400">Historique et prévisions (30 jours)</p>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
            <Activity className="h-3 w-3 mr-1" />
            Prévisionnel activé
          </Badge>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={showProjections ? combinedData : fluxData}>
            <defs>
              <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
              formatter={(value: number | undefined) => [`${formatFullMontant(value ?? 0)} FCFA`, 'Solde']}
            />
            <Area 
              type="monotone" 
              dataKey="solde" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorSolde)" 
            />
            {/* Ligne verticale séparation historique/prévision */}
            {showProjections && (
              <line
                x1="50%"
                y1="0"
                x2="50%"
                y2="100%"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flux entrants/sortants */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Flux Entrants/Sortants</h3>
            <p className="text-sm text-slate-400">Comparaison journalière</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fluxData.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit' })}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number | undefined) => `${formatFullMontant(value ?? 0)} FCFA`}
              />
              <Legend />
              <Bar dataKey="entrees" fill="#10b981" name="Entrées" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sorties" fill="#ef4444" name="Sorties" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activité paiements/recettes */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-1">Volume Transactions</h3>
            <p className="text-sm text-slate-400">Nombre de paiements et recettes</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fluxData.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit' })}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number | undefined) => [`${value ?? 0} transactions`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="paiements" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Paiements"
                dot={{ fill: '#f59e0b', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="recettes" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="Recettes"
                dot={{ fill: '#06b6d4', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Résumé période */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Résumé Période (30 jours)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-slate-400 mb-2">Flux Net</div>
            <div className={cn(
              'text-2xl font-bold',
              stats.fluxNet >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {stats.fluxNet >= 0 ? '+' : ''}{formatMontant(stats.fluxNet)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {stats.fluxNet >= 0 ? 'Excédent' : 'Déficit'} sur la période
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-2">Solde Moyen</div>
            <div className="text-2xl font-bold text-white">
              {formatMontant(stats.soldeMoyenne)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Moyenne sur 30 jours
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-2">Tendance Globale</div>
            <div className={cn(
              'text-2xl font-bold',
              stats.variation >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {stats.variation >= 0 ? '+' : ''}{stats.variation.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Évolution du solde
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

