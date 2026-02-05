'use client';

import { useState, useEffect } from 'react';
import { projetsApiService, type Projet } from '@/lib/services/projetsApiService';
import { Building2, Users, DollarSign, Clock, CheckCircle, AlertTriangle, FileText, TrendingUp, Edit, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props {
  tabId: string;
  data: Record<string, unknown>;
}

const STATUS_STYLES = {
  active: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
  blocked: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500' },
  pending: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-400' },
};

export function ProjetsDetailView({ tabId, data }: Props) {
  const [projet, setProjet] = useState<Projet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'budget' | 'equipe' | 'risques'>('overview');

  const projetId = data.projetId as string;

  useEffect(() => {
    const load = async () => {
      if (!projetId) return;
      setLoading(true);
      try {
        const result = await projetsApiService.getById(projetId);
        setProjet(result || null);
      } catch (error) {
        logger.error('Projets detail load failed', error as Error, { context: 'ProjetsDetailView' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projetId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>;
  if (!projet) return <div className="text-center py-12 text-slate-400"><Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Projet non trouvé</p></div>;

  const style = STATUS_STYLES[projet.status];
  const progressColor = projetsApiService.getProgressColor(projet.progress);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className={cn("rounded-xl border-l-4 p-6", style.border, "bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-orange-500">{projet.id}</span>
              <span className={cn("px-3 py-1 rounded text-sm font-medium", style.bg, style.text)}>{projetsApiService.getStatusLabel(projet.status).toUpperCase()}</span>
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">{projet.bureau}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{projet.name}</h1>
            <p className="text-slate-400 mt-1">Client: {projet.client}</p>
          </div>
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
            <Edit className="w-4 h-4" />Modifier
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Avancement global</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{projet.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
            <div className={cn("h-full rounded-full transition-all", progressColor === 'emerald' ? 'bg-emerald-500' : progressColor === 'amber' ? 'bg-amber-500' : 'bg-orange-500')} style={{ width: `${projet.progress}%` }} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{projet.budget}</p>
            <p className="text-xs text-slate-400">Budget FCFA</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-amber-500" />
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{projet.spent}</p>
            <p className="text-xs text-slate-400">Dépensé FCFA</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Users className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{projet.team}</p>
            <p className="text-xs text-slate-400">Agents</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: FileText },
          { id: 'budget', label: 'Budget', icon: DollarSign },
          { id: 'equipe', label: 'Équipe', icon: Users },
          { id: 'risques', label: 'Risques', icon: AlertTriangle },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id as typeof activeSection)} className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeSection === id ? "border-orange-500 text-orange-600 dark:text-orange-400" : "border-transparent text-slate-400 hover:text-slate-700")}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800 p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Description</h3>
              <p className="text-slate-400">{projet.description || 'Aucune description disponible.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400 mb-1">Bureau responsable</p><p className="font-medium text-slate-900 dark:text-slate-100">{projet.bureau}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Client</p><p className="font-medium text-slate-900 dark:text-slate-100">{projet.client}</p></div>
            </div>
          </div>
        )}
        {activeSection === 'budget' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-400 mb-1">Budget total</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{projet.budget} FCFA</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10">
                <p className="text-xs text-slate-400 mb-1">Dépensé</p>
                <p className="text-xl font-bold text-amber-600">{projet.spent} FCFA</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10">
                <p className="text-xs text-slate-400 mb-1">Reste</p>
                <p className="text-xl font-bold text-emerald-600">
                  {projetsApiService.formatMontant(
                    parseFloat(projet.budget.replace(/[M,]/g, '')) * 1000000 -
                    parseFloat(projet.spent.replace(/[M,]/g, '')) * 1000000
                  )} FCFA
                </p>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'equipe' && (
          <div className="text-center py-8 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{projet.team} agents affectés à ce projet</p>
          </div>
        )}
        {activeSection === 'risques' && (
          <div className="text-center py-8 text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Analyse des risques en cours de développement</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {projet.status === 'blocked' && (
        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400">⚠️ Projet bloqué</h3>
              <p className="text-sm text-slate-400">Ce projet nécessite une action de déblocage.</p>
            </div>
            <button className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600">
              Débloquer le projet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

