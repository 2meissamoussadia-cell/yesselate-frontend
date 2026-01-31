'use client';

import { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  FileText, Download, Calendar, Clock, Play, Pause,
  Plus, Edit2, Trash2, RefreshCw, Mail, CheckCircle2,
  AlertCircle, BarChart3, PieChart, LineChart, Table2
} from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

type ReportType = 'standard' | 'custom' | 'scheduled';
type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';
type ReportCategory = 'global' | 'congés' | 'dépenses' | 'effectifs' | 'performance' | 'budget';

type Report = {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  category: ReportCategory;
  format: ReportFormat;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  lastGenerated?: string;
  nextScheduled?: string;
  generationCount: number;
  createdBy: string;
};

// Données simulées
const MOCK_REPORTS: Report[] = [
  {
    id: 'RPT-001',
    name: 'Bilan mensuel des congés',
    description: 'Rapport complet des congés pris et restants par bureau',
    type: 'scheduled',
    category: 'congés',
    format: 'pdf',
    isScheduled: true,
    scheduleFrequency: 'monthly',
    lastGenerated: '2026-01-01T08:00:00Z',
    nextScheduled: '2026-02-01T08:00:00Z',
    generationCount: 12,
    createdBy: 'Sarah Martin',
  },
  {
    id: 'RPT-002',
    name: 'Suivi des dépenses par catégorie',
    description: 'Analyse des dépenses RH ventilées par type et bureau',
    type: 'standard',
    category: 'dépenses',
    format: 'excel',
    isScheduled: false,
    lastGenerated: '2026-01-09T14:00:00Z',
    generationCount: 8,
    createdBy: 'Sarah Martin',
  },
  {
    id: 'RPT-003',
    name: 'Tableau de bord effectifs',
    description: 'Vue d\'ensemble des effectifs, absences et disponibilités',
    type: 'standard',
    category: 'effectifs',
    format: 'pdf',
    isScheduled: false,
    lastGenerated: '2026-01-08T10:00:00Z',
    generationCount: 15,
    createdBy: 'Thomas Dubois',
  },
  {
    id: 'RPT-004',
    name: 'Rapport hebdomadaire d\'activité',
    description: 'Synthèse des demandes traitées et en attente',
    type: 'scheduled',
    category: 'global',
    format: 'pdf',
    isScheduled: true,
    scheduleFrequency: 'weekly',
    lastGenerated: '2026-01-06T09:00:00Z',
    nextScheduled: '2026-01-13T09:00:00Z',
    generationCount: 52,
    createdBy: 'Système',
  },
  {
    id: 'RPT-005',
    name: 'Analyse des performances RH',
    description: 'KPIs de traitement: délais moyens, taux de validation, etc.',
    type: 'custom',
    category: 'performance',
    format: 'pdf',
    isScheduled: false,
    lastGenerated: '2026-01-05T16:00:00Z',
    generationCount: 3,
    createdBy: 'Direction',
  },
  {
    id: 'RPT-006',
    name: 'État budgétaire consolidé',
    description: 'Consommation budgétaire par bureau et catégorie',
    type: 'scheduled',
    category: 'budget',
    format: 'excel',
    isScheduled: true,
    scheduleFrequency: 'monthly',
    lastGenerated: '2026-01-01T07:00:00Z',
    nextScheduled: '2026-02-01T07:00:00Z',
    generationCount: 6,
    createdBy: 'Comptabilité',
  },
];

const CATEGORY_CONFIG: Record<ReportCategory, { label: string; icon: typeof BarChart3; color: string }> = {
  global: { label: 'Global', icon: BarChart3, color: 'text-blue-500 bg-blue-500/10' },
  congés: { label: 'Congés', icon: Calendar, color: 'text-emerald-500 bg-emerald-500/10' },
  dépenses: { label: 'Dépenses', icon: PieChart, color: 'text-purple-500 bg-purple-500/10' },
  effectifs: { label: 'Effectifs', icon: Table2, color: 'text-amber-500 bg-amber-500/10' },
  performance: { label: 'Performance', icon: LineChart, color: 'text-rose-500 bg-rose-500/10' },
  budget: { label: 'Budget', icon: PieChart, color: 'text-cyan-500 bg-cyan-500/10' },
};

const FORMAT_CONFIG: Record<ReportFormat, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: 'bg-red-500' },
  excel: { label: 'Excel', color: 'bg-emerald-500' },
  csv: { label: 'CSV', color: 'bg-blue-500' },
  json: { label: 'JSON', color: 'bg-amber-500' },
};

export function RHReportsModal({ open, onClose }: Props) {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'all'>('all');
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filtrer les rapports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterType !== 'all' && r.type !== filterType) return false;
      return true;
    });
  }, [reports, filterCategory, filterType]);

  // Stats
  const stats = useMemo(() => ({
    total: reports.length,
    scheduled: reports.filter(r => r.isScheduled).length,
    totalGenerations: reports.reduce((sum, r) => sum + r.generationCount, 0),
  }), [reports]);

  const handleGenerate = async (report: Report) => {
    setGeneratingId(report.id);
    
    // Simuler la génération
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setReports(prev => prev.map(r => 
      r.id === report.id 
        ? { ...r, lastGenerated: new Date().toISOString(), generationCount: r.generationCount + 1 }
        : r
    ));
    
    setGeneratingId(null);
  };

  const handleToggleSchedule = (id: string) => {
    setReports(prev => prev.map(r =>
      r.id === id ? { ...r, isScheduled: !r.isScheduled } : r
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce rapport ?')) {
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <FluentModal
      open={open}
      title="Rapports & Exports"
      onClose={onClose}
      className="max-w-5xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-slate-400">Rapports</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-slate-400">Planifiés</span>
            </div>
            <p className="text-2xl font-bold">{stats.scheduled}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-slate-400">Générations</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalGenerations}</p>
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre catégorie */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as ReportCategory | 'all')}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 
                       bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="all">Toutes catégories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            {/* Filtre type */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {(['all', 'standard', 'scheduled', 'custom'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    filterType === type
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-700"
                  )}
                >
                  {type === 'all' ? 'Tous' : type === 'standard' ? 'Standard' : type === 'scheduled' ? 'Planifiés' : 'Personnalisés'}
                </button>
              ))}
            </div>
          </div>
          
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rapport
          </Button>
        </div>

        {/* Liste des rapports */}
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun rapport trouvé</p>
            </div>
          ) : (
            filteredReports.map(report => {
              const catConfig = CATEGORY_CONFIG[report.category];
              const formatConfig = FORMAT_CONFIG[report.format];
              const CatIcon = catConfig.icon;
              const isGenerating = generatingId === report.id;

              return (
                <div
                  key={report.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    "border-slate-200 dark:border-slate-700",
                    "hover:border-orange-500/50 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", catConfig.color)}>
                      <CatIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{report.name}</span>
                        <Badge className={cn("text-white text-[10px]", formatConfig.color)}>
                          {formatConfig.label}
                        </Badge>
                        {report.isScheduled && (
                          <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {report.scheduleFrequency}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-1 mb-2">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        {report.lastGenerated && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Dernier: {new Date(report.lastGenerated).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {report.isScheduled && report.nextScheduled && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Prochain: {new Date(report.nextScheduled).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        <span>Généré {report.generationCount}x</span>
                        <span>Par {report.createdBy}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGenerate(report)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            Générer
                          </>
                        )}
                      </Button>

                      {report.type === 'scheduled' && (
                        <button
                          onClick={() => handleToggleSchedule(report.id)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            report.isScheduled
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                          title={report.isScheduled ? "Désactiver la planification" : "Activer la planification"}
                        >
                          {report.isScheduled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      )}

                      <button
                        onClick={() => {/* Edit */}}
                        className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rapports rapides */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            ⚡ Génération rapide
          </h4>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Demandes du jour', icon: '📊' },
              { label: 'Absences en cours', icon: '🏖️' },
              { label: 'Budget résumé', icon: '💰' },
              { label: 'Alertes actives', icon: '⚠️' },
            ].map(quick => (
              <button
                key={quick.label}
                className={cn(
                  "p-3 rounded-lg border transition-all text-left",
                  "border-slate-200 dark:border-slate-700",
                  "hover:border-orange-500 hover:bg-orange-500/5"
                )}
              >
                <span className="text-2xl">{quick.icon}</span>
                <p className="text-sm font-medium mt-2">{quick.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </FluentModal>
  );
}

