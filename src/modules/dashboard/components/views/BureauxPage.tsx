/**
 * Page Bureaux - VERSION OPTIMISÉE
 * Affiche les indicateurs de performance pour tous les bureaux métiers (10+)
 * 
 * Fonctionnalités:
 * - Affichage dynamique de tous les bureaux métiers
 * - KPIs enrichis (projets, budget, risques, validations, temps réponse)
 * - Badges de statut (Actif, Attention, Critique, Performant)
 * - Filtrage et tri (performance, criticité, type)
 * - Alertes visibles (surcharge, retard, blocage, risque critique)
 */

'use client';

import React, { useMemo, useState, useCallback, memo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  DollarSign, 
  Users, 
  FileCheck, 
  ArrowRight,
  Filter,
  Search,
  X,
  ChevronDown,
  Zap,
  AlertCircle,
  Target,
  BarChart3,
  SortAsc,
  SortDesc,
  Download,
  Eye,
  EyeOff,
  Info,
  RefreshCw,
  Table,
  Grid3x3,
  GitCompare,
  Sparkles,
  TrendingUp as TrendingUpIcon,
  Minus,
  Layers,
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';

// ============================================
// TYPES & INTERFACES
// ============================================

type BureauStatus = 'active' | 'warning' | 'critical' | 'performant';
type TrendDirection = 'up' | 'down' | 'neutral';
type SortOption = 'performance' | 'criticity' | 'name' | 'projects' | 'budget' | 'risks';
type FilterOption = 'all' | 'active' | 'warning' | 'critical' | 'performant';
type ViewMode = 'grid' | 'table' | 'compact';

interface BureauIndicator {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: TrendDirection;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'orange' | 'red' | 'emerald' | 'purple' | 'cyan';
  description: string;
  isCritical?: boolean;
}

interface Bureau {
  id: string;
  code: string;
  name: string;
  color: 'blue' | 'orange' | 'red' | 'emerald' | 'purple' | 'cyan' | 'amber' | 'indigo' | 'pink' | 'teal';
  status: BureauStatus;
  performanceScore: number; // Score de performance (0-100)
  alerts: {
    surcharge?: boolean;
    retard?: boolean;
    blocage?: boolean;
    risqueCritique?: boolean;
  };
  summary: {
    totalProjects: number;
    budgetConsumed: number;
    risks: number;
    risksCritiques: number;
    validations: number;
    validationsCeMois: number;
    tempsReponseMoyen: number; // en heures
    evolution: number; // % d'évolution
  };
  indicators: BureauIndicator[];
}

// ============================================
// DONNÉES DES BUREAUX
// ============================================

const ALL_BUREAUX: Bureau[] = [
  {
    id: 'bmo',
    code: 'BMO',
    name: 'Bureau Maître d\'Ouvrage',
    color: 'blue',
    status: 'performant',
    performanceScore: 92,
    alerts: {},
    summary: {
      totalProjects: 12,
      budgetConsumed: 68,
      risks: 2,
      risksCritiques: 0,
      validations: 45,
      validationsCeMois: 8,
      tempsReponseMoyen: 2.1,
      evolution: 5.2,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 12,
        trend: '+2',
        trendDirection: 'up',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '68%',
        trend: '+3%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '2',
        trend: '-1',
        trendDirection: 'down',
        icon: AlertTriangle,
        color: 'orange',
        description: 'dont 0 critiques',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '8',
        trend: '+2',
        trendDirection: 'up',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '2.1h',
        trend: '-0.2h',
        trendDirection: 'down',
        icon: Clock,
        color: 'cyan',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bf',
    code: 'BF',
    name: 'Bureau Financier',
    color: 'emerald',
    status: 'active',
    performanceScore: 87,
    alerts: {
      surcharge: true,
    },
    summary: {
      totalProjects: 8,
      budgetConsumed: 72,
      risks: 1,
      risksCritiques: 0,
      validations: 38,
      validationsCeMois: 5,
      tempsReponseMoyen: 1.8,
      evolution: 3.1,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 8,
        trend: '—',
        trendDirection: 'neutral',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '72%',
        trend: '+4%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '1',
        trend: '—',
        trendDirection: 'neutral',
        icon: AlertTriangle,
        color: 'orange',
        description: 'en attente',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '5',
        trend: '+1',
        trendDirection: 'up',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '1.8h',
        trend: '-0.1h',
        trendDirection: 'down',
        icon: Clock,
        color: 'cyan',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bj',
    code: 'BJ',
    name: 'Bureau Juridique',
    color: 'purple',
    status: 'warning',
    performanceScore: 75,
    alerts: {
      risqueCritique: true,
    },
    summary: {
      totalProjects: 6,
      budgetConsumed: 55,
      risks: 3,
      risksCritiques: 1,
      validations: 29,
      validationsCeMois: 4,
      tempsReponseMoyen: 3.2,
      evolution: -2.3,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 6,
        trend: '—',
        trendDirection: 'neutral',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '55%',
        trend: '+2%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '3',
        trend: '+1',
        trendDirection: 'up',
        icon: AlertTriangle,
        color: 'red',
        description: 'dont 1 critique',
        isCritical: true,
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '4',
        trend: '—',
        trendDirection: 'neutral',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '3.2h',
        trend: '+0.3h',
        trendDirection: 'up',
        icon: Clock,
        color: 'orange',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bct',
    code: 'BCT',
    name: 'Bureau Technique',
    color: 'cyan',
    status: 'active',
    performanceScore: 84,
    alerts: {},
    summary: {
      totalProjects: 10,
      budgetConsumed: 65,
      risks: 2,
      risksCritiques: 0,
      validations: 42,
      validationsCeMois: 7,
      tempsReponseMoyen: 2.5,
      evolution: 4.8,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 10,
        trend: '+1',
        trendDirection: 'up',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '65%',
        trend: '+2%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '2',
        trend: '—',
        trendDirection: 'neutral',
        icon: AlertTriangle,
        color: 'orange',
        description: 'en attente',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '7',
        trend: '+1',
        trendDirection: 'up',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '2.5h',
        trend: '-0.1h',
        trendDirection: 'down',
        icon: Clock,
        color: 'cyan',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bop',
    code: 'BOP',
    name: 'Bureau Opérationnel',
    color: 'amber',
    status: 'warning',
    performanceScore: 78,
    alerts: {
      retard: true,
      blocage: true,
    },
    summary: {
      totalProjects: 9,
      budgetConsumed: 78,
      risks: 4,
      risksCritiques: 1,
      validations: 52,
      validationsCeMois: 6,
      tempsReponseMoyen: 3.8,
      evolution: -5.1,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 9,
        trend: '—',
        trendDirection: 'neutral',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '78%',
        trend: '+5%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'orange',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '4',
        trend: '+2',
        trendDirection: 'up',
        icon: AlertTriangle,
        color: 'red',
        description: 'dont 1 critique',
        isCritical: true,
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '6',
        trend: '-1',
        trendDirection: 'down',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '3.8h',
        trend: '+0.5h',
        trendDirection: 'up',
        icon: Clock,
        color: 'red',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bcg',
    code: 'BCG',
    name: 'Bureau Gestion',
    color: 'indigo',
    status: 'active',
    performanceScore: 81,
    alerts: {},
    summary: {
      totalProjects: 7,
      budgetConsumed: 62,
      risks: 1,
      risksCritiques: 0,
      validations: 38,
      validationsCeMois: 5,
      tempsReponseMoyen: 2.3,
      evolution: 2.7,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 7,
        trend: '—',
        trendDirection: 'neutral',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '62%',
        trend: '+1%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '1',
        trend: '—',
        trendDirection: 'neutral',
        icon: AlertTriangle,
        color: 'orange',
        description: 'en attente',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '5',
        trend: '+1',
        trendDirection: 'up',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '2.3h',
        trend: '-0.1h',
        trendDirection: 'down',
        icon: Clock,
        color: 'cyan',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bja',
    code: 'BJA',
    name: 'Bureau Achats',
    color: 'pink',
    status: 'active',
    performanceScore: 79,
    alerts: {},
    summary: {
      totalProjects: 8,
      budgetConsumed: 71,
      risks: 2,
      risksCritiques: 0,
      validations: 35,
      validationsCeMois: 5,
      tempsReponseMoyen: 2.7,
      evolution: 1.9,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 8,
        trend: '+1',
        trendDirection: 'up',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '71%',
        trend: '+3%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '2',
        trend: '—',
        trendDirection: 'neutral',
        icon: AlertTriangle,
        color: 'orange',
        description: 'en attente',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '5',
        trend: '+1',
        trendDirection: 'up',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '2.7h',
        trend: '-0.2h',
        trendDirection: 'down',
        icon: Clock,
        color: 'cyan',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'brc',
    code: 'BRC',
    name: 'Bureau Ressources',
    color: 'teal',
    status: 'active',
    performanceScore: 83,
    alerts: {},
    summary: {
      totalProjects: 6,
      budgetConsumed: 58,
      risks: 1,
      risksCritiques: 0,
      validations: 31,
      validationsCeMois: 4,
      tempsReponseMoyen: 2.2,
      evolution: 3.4,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 6,
        trend: '—',
        trendDirection: 'neutral',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '58%',
        trend: '+2%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '1',
        trend: '—',
        trendDirection: 'neutral',
        icon: AlertTriangle,
        color: 'orange',
        description: 'en attente',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '4',
        trend: '+1',
        trendDirection: 'up',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '2.2h',
        trend: '-0.1h',
        trendDirection: 'down',
        icon: Clock,
        color: 'cyan',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bpl',
    code: 'BPL',
    name: 'Bureau Planification',
    color: 'indigo',
    status: 'performant',
    performanceScore: 89,
    alerts: {},
    summary: {
      totalProjects: 5,
      budgetConsumed: 52,
      risks: 0,
      risksCritiques: 0,
      validations: 28,
      validationsCeMois: 4,
      tempsReponseMoyen: 1.9,
      evolution: 6.2,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 5,
        trend: '—',
        trendDirection: 'neutral',
        icon: Building2,
        color: 'blue',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '52%',
        trend: '+1%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'emerald',
        description: 'du budget',
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '0',
        trend: '—',
        trendDirection: 'neutral',
        icon: CheckCircle,
        color: 'emerald',
        description: 'aucun',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '4',
        trend: '+1',
        trendDirection: 'up',
        icon: FileCheck,
        color: 'blue',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '1.9h',
        trend: '-0.2h',
        trendDirection: 'down',
        icon: Clock,
        color: 'cyan',
        description: 'moyen',
      },
    ],
  },
  {
    id: 'bex',
    code: 'BEX',
    name: 'Bureau Exécution',
    color: 'orange',
    status: 'critical',
    performanceScore: 68,
    alerts: {
      surcharge: true,
      retard: true,
      blocage: true,
      risqueCritique: true,
    },
    summary: {
      totalProjects: 11,
      budgetConsumed: 85,
      risks: 5,
      risksCritiques: 2,
      validations: 48,
      validationsCeMois: 3,
      tempsReponseMoyen: 4.5,
      evolution: -8.3,
    },
    indicators: [
      {
        id: 'projets',
        label: 'Projets actifs',
        value: 11,
        trend: '-1',
        trendDirection: 'down',
        icon: Building2,
        color: 'red',
        description: 'en cours',
      },
      {
        id: 'budget',
        label: 'Budget consommé',
        value: '85%',
        trend: '+7%',
        trendDirection: 'up',
        icon: DollarSign,
        color: 'red',
        description: 'du budget',
        isCritical: true,
      },
      {
        id: 'risques',
        label: 'Risques',
        value: '5',
        trend: '+2',
        trendDirection: 'up',
        icon: AlertTriangle,
        color: 'red',
        description: 'dont 2 critiques',
        isCritical: true,
      },
      {
        id: 'validations',
        label: 'Validations',
        value: '3',
        trend: '-2',
        trendDirection: 'down',
        icon: FileCheck,
        color: 'red',
        description: 'ce mois',
      },
      {
        id: 'temps',
        label: 'Temps réponse',
        value: '4.5h',
        trend: '+0.8h',
        trendDirection: 'up',
        icon: Clock,
        color: 'red',
        description: 'moyen',
        isCritical: true,
      },
    ],
  },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const BureauxPage = memo(function BureauxPage() {
  const { leaf } = useDashboardNavigationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('performance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [expandedBureaux, setExpandedBureaux] = useState<Set<string>>(new Set());
  const [selectedBureaux, setSelectedBureaux] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [minBudgetFilter, setMinBudgetFilter] = useState<number>(0);
  const [maxRisksFilter, setMaxRisksFilter] = useState<number>(100);

  // Filtrer par bureau spécifique si leaf est défini
  const filteredByLeaf = useMemo(() => {
    if (!leaf || leaf === 'all') return ALL_BUREAUX;
    return ALL_BUREAUX.filter(b => b.id === leaf);
  }, [leaf]);

  // Filtrer par recherche
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return filteredByLeaf;
    const query = searchQuery.toLowerCase();
    return filteredByLeaf.filter(b => 
      b.code.toLowerCase().includes(query) ||
      b.name.toLowerCase().includes(query)
    );
  }, [filteredByLeaf, searchQuery]);

  // Filtrer par statut
  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'all') return filteredBySearch;
    return filteredBySearch.filter(b => b.status === statusFilter);
  }, [filteredBySearch, statusFilter]);

  // Filtrer par budget et risques
  const filteredByAdvanced = useMemo(() => {
    return filteredByStatus.filter(b => {
      const budgetOk = b.summary.budgetConsumed >= minBudgetFilter;
      const risksOk = b.summary.risks <= maxRisksFilter;
      return budgetOk && risksOk;
    });
  }, [filteredByStatus, minBudgetFilter, maxRisksFilter]);

  // Trier les bureaux
  const sortedBureaux = useMemo(() => {
    const sorted = [...filteredByAdvanced];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'performance':
          comparison = a.performanceScore - b.performanceScore;
          break;
        case 'criticity':
          comparison = (a.summary.risksCritiques + a.summary.risks) - (b.summary.risksCritiques + b.summary.risks);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'projects':
          comparison = a.summary.totalProjects - b.summary.totalProjects;
          break;
      case 'budget':
          comparison = a.summary.budgetConsumed - b.summary.budgetConsumed;
          break;
      case 'risks':
          comparison = (a.summary.risks + a.summary.risksCritiques) - (b.summary.risks + b.summary.risksCritiques);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredByAdvanced, sortBy, sortDirection]);

  // Statistiques globales
  const stats = useMemo(() => {
    const total = sortedBureaux.length;
    const actifs = sortedBureaux.filter(b => b.status === 'active' || b.status === 'performant').length;
    const enAttention = sortedBureaux.filter(b => b.status === 'warning').length;
    const critiques = sortedBureaux.filter(b => b.status === 'critical').length;
    const totalRisques = sortedBureaux.reduce((sum, b) => sum + b.summary.risks, 0);
    const totalRisquesCritiques = sortedBureaux.reduce((sum, b) => sum + b.summary.risksCritiques, 0);
    
    return {
      total,
      actifs,
      enAttention,
      critiques,
      totalRisques,
      totalRisquesCritiques,
    };
  }, [sortedBureaux]);

  // Handlers avec useCallback pour la performance
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleToggleBureauSelection = useCallback((bureauId: string) => {
    setSelectedBureaux(prev => {
      const next = new Set(prev);
      if (next.has(bureauId)) {
        next.delete(bureauId);
      } else {
        next.add(bureauId);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBureaux(new Set());
    setShowComparison(false);
  }, []);

  const handleCompareSelected = useCallback(() => {
    if (selectedBureaux.size >= 2) {
      setShowComparison(true);
    }
  }, [selectedBureaux]);

  const handleToggleBureau = useCallback((bureauId: string) => {
    setExpandedBureaux(prev => {
      const next = new Set(prev);
      if (next.has(bureauId)) {
        next.delete(bureauId);
      } else {
        next.add(bureauId);
      }
      return next;
    });
  }, []);

  const handleExportData = useCallback((format: 'csv' | 'json' = 'csv') => {
    const data = sortedBureaux.map(bureau => ({
      Code: bureau.code,
      Nom: bureau.name,
      Statut: bureau.status,
      'Score Performance': bureau.performanceScore,
      'Projets Actifs': bureau.summary.totalProjects,
      'Budget Consommé (%)': bureau.summary.budgetConsumed,
      'Risques': bureau.summary.risks,
      'Risques Critiques': bureau.summary.risksCritiques,
      'Validations Total': bureau.summary.validations,
      'Validations Ce Mois': bureau.summary.validationsCeMois,
      'Temps Réponse Moyen (h)': bureau.summary.tempsReponseMoyen,
      'Évolution (%)': bureau.summary.evolution,
      'Surcharge': bureau.alerts.surcharge || false,
      'Retard': bureau.alerts.retard || false,
      'Blocage': bureau.alerts.blocage || false,
      'Risque Critique': bureau.alerts.risqueCritique || false,
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bureaux-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bureaux-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [sortedBureaux]);

  const getStatusBadge = useCallback((status: BureauStatus) => {
    const badges = {
      active: { label: 'Actif', className: 'bg-emerald-600 text-white', icon: CheckCircle },
      warning: { label: 'Attention', className: 'bg-amber-600 text-white', icon: AlertTriangle },
      critical: { label: 'Critique', className: 'bg-red-600 text-white', icon: AlertCircle },
      performant: { label: 'Performant', className: 'bg-blue-600 text-white', icon: Zap },
    };
    
    const badge = badges[status];
    const Icon = badge.icon;
    
    return (
      <Badge className={cn(badge.className, 'flex items-center gap-1')}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  }, []);

  const getGradientClasses = (color: Bureau['color']) => {
    const gradients = {
      blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
      emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/50',
      purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/50',
      cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/50',
      amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/50',
      indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/50',
      pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/50',
      teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/50',
      orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/50',
      red: 'from-red-500/20 to-red-600/10 border-red-500/50',
    };
    return gradients[color] || gradients.blue;
  };

  const getIconBgClasses = (color: Bureau['color']) => {
    const backgrounds = {
      blue: 'bg-blue-600',
      emerald: 'bg-emerald-600',
      purple: 'bg-purple-600',
      cyan: 'bg-cyan-600',
      amber: 'bg-amber-600',
      indigo: 'bg-indigo-600',
      pink: 'bg-pink-600',
      teal: 'bg-teal-600',
      orange: 'bg-orange-600',
      red: 'bg-red-600',
    };
    return backgrounds[color] || backgrounds.blue;
  };

  // Mini graphique sparkline pour les tendances
  const SparklineChart = memo(({ 
    data, 
    color 
  }: { 
    data: number[]; 
    color: string;
  }) => {
    const width = 60;
    const height = 20;
    const padding = 2;
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
      const y = padding + height - padding * 2 - ((value - minValue) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  });
  SparklineChart.displayName = 'SparklineChart';

  const renderBureauCard = useCallback((bureau: Bureau) => {
    const gradientClasses = getGradientClasses(bureau.color);
    const iconBgClasses = getIconBgClasses(bureau.color);
    
    const hasAlerts = Object.values(bureau.alerts).some(Boolean);
    const isExpanded = expandedBureaux.has(bureau.id);
    const isSelected = selectedBureaux.has(bureau.id);
    const shouldShowDetails = viewMode !== 'compact' || isExpanded;
    
    return (
      <div
        key={bureau.id}
        className={cn(
          'bg-gradient-to-br rounded-xl p-6 border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
          gradientClasses,
          hasAlerts && 'ring-2 ring-amber-500/30',
          isSelected && 'ring-4 ring-blue-500/50 border-blue-500',
          'group cursor-pointer'
        )}
        role="article"
        aria-label={`Bureau ${bureau.code}: ${bureau.name}`}
        aria-selected={isSelected}
        tabIndex={0}
        onClick={(e) => {
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            e.stopPropagation();
            handleToggleBureauSelection(bureau.id);
          } else {
            handleToggleBureau(bureau.id);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleBureau(bureau.id);
          }
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110',
                      iconBgClasses
                    )}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{bureau.name}</p>
                  <p className="text-xs text-slate-300">Score: {bureau.performanceScore}/100</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-xl font-bold text-white truncate min-w-0">{bureau.code}</h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{bureau.code}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-slate-300 truncate min-w-0">{bureau.name}</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{bureau.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(bureau.status)}
            {hasAlerts && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-amber-600 text-white text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Alertes
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 text-xs">
                      {bureau.alerts.surcharge && <p>⚠️ Surcharge</p>}
                      {bureau.alerts.retard && <p>⏱️ Retard</p>}
                      {bureau.alerts.blocage && <p>🚫 Blocage</p>}
                      {bureau.alerts.risqueCritique && <p>🔴 Risque critique</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Score de performance */}
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mb-4 pb-4 border-b border-slate-700/50 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300">Score de performance</span>
                  <span className={cn(
                    'text-lg font-bold',
                    bureau.performanceScore >= 85 && 'text-emerald-400',
                    bureau.performanceScore >= 75 && bureau.performanceScore < 85 && 'text-amber-400',
                    bureau.performanceScore < 75 && 'text-red-400'
                  )}>
                    {bureau.performanceScore}/100
                  </span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      bureau.performanceScore >= 85 && 'bg-emerald-500',
                      bureau.performanceScore >= 75 && bureau.performanceScore < 85 && 'bg-amber-500',
                      bureau.performanceScore < 75 && 'bg-red-500'
                    )}
                    style={{ width: `${bureau.performanceScore}%` }}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1 text-xs">
                <p>Score calculé sur la base de:</p>
                <p>• Performance opérationnelle</p>
                <p>• Respect des délais</p>
                <p>• Gestion des risques</p>
                <p>• Conformité budgétaire</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Alertes */}
        {hasAlerts && shouldShowDetails && (
          <div className="mb-4 pb-4 border-b border-slate-700/50">
            <div className="flex flex-wrap gap-2">
              {bureau.alerts.surcharge && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs">
                  Surcharge
                </Badge>
              )}
              {bureau.alerts.retard && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                  Retard
                </Badge>
              )}
              {bureau.alerts.blocage && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                  Blocage
                </Badge>
              )}
              {bureau.alerts.risqueCritique && (
                <Badge className="bg-red-600/20 text-red-400 border-red-600/50 text-xs">
                  Risque critique
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {shouldShowDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-700/50 min-w-0">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-300 mb-1">Projets</p>
            <p className="text-lg font-bold text-white">{bureau.summary.totalProjects}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Budget</p>
            <p className="text-lg font-bold text-white">{bureau.summary.budgetConsumed}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-300 mb-1">Risques</p>
            <p className="text-lg font-bold text-white">
              {bureau.summary.risks}
              {bureau.summary.risksCritiques > 0 && (
                <span className="text-red-400 ml-1">({bureau.summary.risksCritiques})</span>
              )}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Validations</p>
            <p className="text-lg font-bold text-white">
              {bureau.summary.validationsCeMois}
              <span className="text-xs text-slate-400 ml-1">/{bureau.summary.validations}</span>
            </p>
          </div>
        </div>
        )}

        {/* Indicateurs */}
        {shouldShowDetails && (
          <div className="space-y-3">
          {bureau.indicators.map((indicator) => {
            const Icon = indicator.icon;
            const isPositive = indicator.trendDirection === 'up' && (indicator.id === 'validations' || indicator.id === 'projets');
            const isNegative = indicator.trendDirection === 'down' && (indicator.id === 'risques' || indicator.id === 'temps');
            const isNeutral = indicator.trendDirection === 'neutral';

            return (
              <div
                key={indicator.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg bg-slate-800/30 transition-all duration-200 hover:bg-slate-800/50',
                  indicator.isCritical && 'ring-2 ring-red-500/50 bg-red-500/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      indicator.color === 'blue' && 'bg-blue-500/20',
                      indicator.color === 'orange' && 'bg-orange-500/20',
                      indicator.color === 'red' && 'bg-red-500/20',
                      indicator.color === 'emerald' && 'bg-emerald-500/20',
                      indicator.color === 'purple' && 'bg-purple-500/20',
                      indicator.color === 'cyan' && 'bg-cyan-500/20'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        indicator.color === 'blue' && 'text-blue-400',
                        indicator.color === 'orange' && 'text-orange-400',
                        indicator.color === 'red' && 'text-red-400',
                        indicator.color === 'emerald' && 'text-emerald-400',
                        indicator.color === 'purple' && 'text-purple-400',
                        indicator.color === 'cyan' && 'text-cyan-400'
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">{indicator.label}</p>
                    <p className="text-xs text-slate-400">{indicator.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{indicator.value}</p>
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs',
                        isPositive && 'text-emerald-400',
                        isNegative && 'text-red-400',
                        isNeutral && 'text-slate-300'
                      )}
                    >
                      {!isNeutral && (
                        <>
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{indicator.trend}</span>
                        </>
                      )}
                      {isNeutral && <span>{indicator.trend}</span>}
                    </div>
                  </div>
                  {indicator.isCritical && (
                    <Badge className="bg-red-600 text-white text-xs">!</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBureauSelection(bureau.id);
                }}
                className={cn(
                  'text-sm px-3 py-1.5 rounded-md transition-all',
                  isSelected 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                )}
              >
                {isSelected ? '✓ Sélectionné' : 'Sélectionner'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
              <span>{viewMode === 'compact' ? (isExpanded ? 'Réduire' : 'Voir le détail') : 'Informations complètes'}</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
            </div>
          </div>
        </div>
      </div>
    );
  }, [viewMode, expandedBureaux, selectedBureaux, handleToggleBureau, handleToggleBureauSelection, getStatusBadge]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fadeIn min-w-0 overflow-hidden" role="main" aria-label="Vue des bureaux métiers">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">Bureaux Métiers</h1>
            <p className="text-slate-300 text-sm sm:text-lg break-words">
              Indicateurs de performance par bureau ({sortedBureaux.length} bureau{sortedBureaux.length > 1 ? 'x' : ''} affiché{sortedBureaux.length > 1 ? 's' : ''})
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {/* Sélection multiple */}
            {selectedBureaux.size > 0 && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-blue-500/10 border border-blue-500/50 min-w-0">
                <span className="text-sm text-blue-400">{selectedBureaux.size} sélectionné{selectedBureaux.size > 1 ? 's' : ''}</span>
                <button
                  onClick={handleCompareSelected}
                  disabled={selectedBureaux.size < 2}
                  className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitCompare className="w-3 h-3 inline mr-1" />
                  Comparer
                </button>
                <button
                  onClick={handleClearSelection}
                  className="text-xs px-2 py-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {/* Mode de vue */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded transition-all',
                      viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:text-white'
                    )}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Vue grille</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('table')}
                    className={cn(
                      'p-2 rounded transition-all',
                      viewMode === 'table' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:text-white'
                    )}
                  >
                    <Table className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Vue tableau</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={cn(
                      'p-2 rounded transition-all',
                      viewMode === 'compact' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:text-white'
                    )}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Vue compacte</TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleFilters}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                    'bg-slate-800/50 border border-slate-700/50 text-slate-300',
                    'hover:bg-slate-800 hover:border-slate-600',
                    viewMode === 'compact' && 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                  )}
                  aria-label="Afficher/masquer les filtres"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtres</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Afficher/masquer les filtres</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                onClick={(e) => {
                  e.preventDefault();
                  handleExportData(e.ctrlKey || e.metaKey ? 'json' : 'csv');
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                  'bg-slate-800/50 border border-slate-700/50 text-slate-300',
                  'hover:bg-slate-800 hover:border-slate-600'
                )}
                aria-label="Exporter les données"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter</span>
              </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <p>Exporter les données</p>
                  <p className="text-slate-400">Cliquez pour CSV, Ctrl+Click pour JSON</p>
                </div>
              </TooltipContent>
            </Tooltip>
            <button
              onClick={handleToggleFilters}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                'bg-slate-800/50 border border-slate-700/50 text-slate-300',
                'hover:bg-slate-800 hover:border-slate-600',
                showFilters && 'bg-blue-500/10 border-blue-500/50 text-blue-400'
              )}
              aria-label="Afficher/masquer les filtres"
              aria-expanded={showFilters}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
            </button>
          </div>
        </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 min-w-0" role="region" aria-label="Statistiques globales">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-help">
                <p className="text-xs text-slate-300 mb-1">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nombre total de bureaux affichés</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-help">
                <p className="text-xs text-emerald-400 mb-1">Actifs</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.actifs}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bureaux avec statut Actif ou Performant</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20 hover:border-amber-500/40 transition-colors cursor-help">
                <p className="text-xs text-amber-400 mb-1">Attention</p>
                <p className="text-2xl font-bold text-amber-400">{stats.enAttention}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bureaux nécessitant une attention</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20 hover:border-red-500/40 transition-colors cursor-help">
                <p className="text-xs text-red-400 mb-1">Critiques</p>
                <p className="text-2xl font-bold text-red-400">{stats.critiques}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bureaux en situation critique</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-help">
                <p className="text-xs text-orange-400 mb-1">Risques</p>
                <p className="text-2xl font-bold text-orange-400">{stats.totalRisques}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nombre total de risques identifiés</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-red-600/10 rounded-lg p-4 border border-red-600/20 hover:border-red-600/40 transition-colors cursor-help">
                <p className="text-xs text-red-400 mb-1">Risques critiques</p>
                <p className="text-2xl font-bold text-red-400">{stats.totalRisquesCritiques}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nombre de risques critiques nécessitant une action immédiate</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Filtres et recherche */}
      {showFilters && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un bureau..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 min-h-[44px] bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtre par statut */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300 whitespace-nowrap">Statut:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterOption)}
                className="px-3 py-2 min-h-[44px] bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <option value="all">Tous</option>
                <option value="performant">Performant</option>
                <option value="active">Actif</option>
                <option value="warning">Attention</option>
                <option value="critical">Critique</option>
              </select>
            </div>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400 whitespace-nowrap">Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="performance">Performance</option>
                <option value="criticity">Criticité</option>
                <option value="name">Nom</option>
                <option value="projects">Projets</option>
                <option value="budget">Budget</option>
                <option value="risks">Risques</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label={`Trier ${sortDirection === 'asc' ? 'décroissant' : 'croissant'}`}
                title={sortDirection === 'asc' ? 'Croissant' : 'Décroissant'}
              >
                {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Filtres avancés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-slate-700/50 min-w-0">
            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget consommé minimum (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minBudgetFilter}
                  onChange={(e) => setMinBudgetFilter(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-slate-300 w-12 text-right">{minBudgetFilter}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Risques maximum
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={maxRisksFilter}
                  onChange={(e) => setMaxRisksFilter(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-slate-300 w-12 text-right">{maxRisksFilter}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grille des bureaux */}
      {sortedBureaux.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center" role="status" aria-live="polite">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-lg font-semibold text-slate-300 mb-2">Aucun bureau trouvé</p>
          <p className="text-sm text-slate-500">
            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucun bureau ne correspond aux filtres sélectionnés'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label={`Liste de ${sortedBureaux.length} bureau${sortedBureaux.length > 1 ? 'x' : ''}`}
        >
          {sortedBureaux.map(renderBureauCard)}
        </div>
      )}

      {/* Section contexte */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-400" />
          Vue d'ensemble des bureaux métiers
        </h2>
        <p className="text-slate-300">
          Cette section présente les indicateurs de performance pour tous les bureaux métiers de l'organisation.
          Les métriques sont mises à jour en temps réel et permettent un suivi détaillé de l'activité de chaque bureau.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 min-w-0">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Activité</h3>
            </div>
            <p className="text-sm text-slate-400">Suivi des validations et temps de réponse par bureau</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-white">Risques</h3>
            </div>
            <p className="text-sm text-slate-400">Identification et suivi des risques critiques</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">Budget</h3>
            </div>
            <p className="text-sm text-slate-400">Consommation budgétaire et conformité</p>
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
});
