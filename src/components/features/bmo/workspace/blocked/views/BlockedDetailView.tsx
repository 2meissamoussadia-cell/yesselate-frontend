'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, Building2, Clock, Calendar, User, FileText, 
  ArrowUpRight, Zap, Shield, ChevronLeft, ChevronRight, 
  CheckCircle2, MessageSquare, History, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blockedDossiers } from '@/lib/data';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  tabId: string;
  data?: {
    dossierId?: string;
    [key: string]: unknown;
  };
};

type DetailSection = 'overview' | 'context' | 'actions' | 'history';

// Design épuré: couleurs uniquement sur bordures et icônes
const IMPACT_STYLES: Record<string, { bg: string; text: string; border: string; iconColor: string }> = {
  critical: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-red-500', iconColor: 'text-red-500' },
  high: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-amber-500', iconColor: 'text-amber-500' },
  medium: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-blue-500', iconColor: 'text-blue-500' },
  low: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-400', iconColor: 'text-slate-400' },
};

const IMPACT_WEIGHT: Record<string, number> = { critical: 100, high: 50, medium: 20, low: 5 };

function parseAmountFCFA(amount: unknown): number {
  const s = String(amount ?? '').replace(/[^\d]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function computePriority(d: BlockedDossier): number {
  const w = IMPACT_WEIGHT[d.impact] ?? 1;
  const delay = Math.max(0, d.delay ?? 0) + 1;
  const amount = parseAmountFCFA(d.amount);
  const factor = 1 + amount / 1_000_000;
  return Math.round(w * delay * factor);
}

export function BlockedDetailView({ tabId, data }: Props) {
  const { closeTab } = useBlockedWorkspaceStore();
  const [activeSection, setActiveSection] = useState<DetailSection>('overview');

  const allData = blockedDossiers as unknown as BlockedDossier[];
  const dossier = useMemo(() => {
    return allData.find(d => d.id === data?.dossierId);
  }, [allData, data?.dossierId]);

  if (!dossier) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Dossier non trouvé</p>
          <p className="text-sm mt-1">{data?.dossierId}</p>
        </div>
      </div>
    );
  }

  const style = IMPACT_STYLES[dossier.impact] || IMPACT_STYLES.low;
  const priority = computePriority(dossier);

  const sections: { id: DetailSection; label: string; icon: typeof Eye }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
    { id: 'context', label: 'Contexte', icon: FileText },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'history', label: 'Historique', icon: History },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={cn(
        "rounded-xl border-l-4 p-6",
        style.border,
        "bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800"
      )}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800">
                {dossier.id}
              </span>
              <span className={cn("px-3 py-1 rounded text-sm font-medium", style.bg, style.text)}>
                {dossier.impact.toUpperCase()}
              </span>
              <span className="text-sm text-slate-400">{dossier.type}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{dossier.subject}</h1>
            <p className="text-slate-400 mt-1">{dossier.reason}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">{dossier.amount}</p>
            <p className="text-sm text-slate-400 mt-1">
              Priorité: <span className={cn("font-bold", priority > 5000 ? "text-red-500" : "text-amber-500")}>{priority}</span>
            </p>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/70 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Building2 className="w-3 h-3" />
              Bureau
            </div>
            <p className="font-medium">{dossier.bureau}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <User className="w-3 h-3" />
              Responsable
            </div>
            <p className="font-medium">{dossier.responsible || '—'}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Clock className="w-3 h-3" />
              Délai
            </div>
            <p className={cn(
              "font-medium",
              (dossier.delay ?? 0) > 14 ? "text-red-500" : (dossier.delay ?? 0) > 7 ? "text-amber-500" : ""
            )}>
              J+{dossier.delay} jours
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <FileText className="w-3 h-3" />
              Projet
            </div>
            <Link 
              href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`}
              className="font-medium text-orange-600 hover:underline"
            >
              {dossier.project}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex items-center gap-1 border-b border-slate-200/70 dark:border-slate-800">
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Alerte si critique - design épuré */}
            {dossier.impact === 'critical' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Blocage critique</p>
                  <p className="text-sm text-slate-400">Ce dossier nécessite une action immédiate du BMO</p>
                </div>
              </div>
            )}

            {/* Raison détaillée */}
            <div>
              <h3 className="font-semibold mb-2">Raison du blocage</h3>
              <p className="text-slate-600 dark:text-slate-400">{dossier.reason}</p>
            </div>

            {/* Analyse d'impact */}
            <div>
              <h3 className="font-semibold mb-3">Analyse d'impact</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">Impact financier</p>
                  <p className="text-lg font-bold">{dossier.amount}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">Retard accumulé</p>
                  <p className="text-lg font-bold">{dossier.delay}j</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400 mb-1">Score priorité</p>
                  <p className="text-lg font-bold">{priority}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'context' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Projet associé</h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{dossier.project}</p>
                    <p className="text-sm text-slate-400">Bureau: {dossier.bureau}</p>
                  </div>
                  <Link 
                    href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`}
                    className="flex items-center gap-1 text-sm text-orange-600 hover:underline"
                  >
                    Voir le projet
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Workflow de validation</h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-400">
                  Ce dossier est bloqué dans le processus de validation {dossier.type}.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'actions' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Actions disponibles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('blocked:open-decision-center'))}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left bg-white dark:bg-slate-900/50"
              >
                <ArrowUpRight className="w-6 h-6 text-orange-500 mb-2" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Escalader au CODIR</p>
                <p className="text-sm text-slate-400 mt-1">Remonter le blocage au comité de direction</p>
              </button>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent('blocked:open-decision-center'))}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left bg-white dark:bg-slate-900/50"
              >
                <Shield className="w-6 h-6 text-purple-500 mb-2" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Substitution BMO</p>
                <p className="text-sm text-slate-400 mt-1">Exercer le pouvoir de substitution</p>
              </button>

              <button className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left bg-white dark:bg-slate-900/50">
                <FileText className="w-6 h-6 text-slate-400 mb-2" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Demander pièce</p>
                <p className="text-sm text-slate-400 mt-1">Solliciter un document complémentaire</p>
              </button>

              <button className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left bg-white dark:bg-slate-900/50">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Résoudre</p>
                <p className="text-sm text-slate-400 mt-1">Marquer comme résolu avec justification</p>
              </button>
            </div>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Historique des actions</h3>
            
            <div className="text-center py-8 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune action enregistrée</p>
              <p className="text-sm mt-1">Les futures actions seront tracées ici</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

