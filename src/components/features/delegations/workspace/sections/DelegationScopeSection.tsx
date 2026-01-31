'use client';

import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  LayoutList,
  CheckCircle2,
  XCircle,
  Globe,
  Info,
} from 'lucide-react';
import type { DelegationUIState } from '@/lib/stores/delegationWorkspaceStore';

interface Props {
  delegation: any;
  sub?: DelegationUIState['sub'];
}

export function DelegationScopeSection({ delegation, sub }: Props) {
  // Message d'aide si pas de données
  if (!delegation) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Info className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-400 dark:text-slate-400">Chargement des données...</p>
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
          Si le problème persiste, vérifiez la connexion API.
        </p>
      </div>
    );
  }

  // Affichage par défaut (tous les périmètres)
  if (!sub) {
    return (
      <div className="space-y-6">
        <ScopeCard
          title="Projets"
          icon={<Building2 className="w-4 h-4 text-blue-500" />}
          mode={delegation.projectScopeMode}
          list={delegation.projectScopeList}
        />
        <ScopeCard
          title="Bureaux"
          icon={<Building2 className="w-4 h-4 text-purple-500" />}
          mode={delegation.bureauScopeMode}
          list={delegation.bureauScopeList}
        />
        <ScopeCard
          title="Fournisseurs"
          icon={<Users className="w-4 h-4 text-amber-500" />}
          mode={delegation.supplierScopeMode}
          list={delegation.supplierScopeList}
        />
        <ScopeCard
          title="Catégories d'achats"
          icon={<LayoutList className="w-4 h-4 text-emerald-500" />}
          mode="INCLUDE"
          list={delegation.categoryScopeList}
          emptyLabel="Toutes catégories"
        />

        {/* Policies */}
        {delegation.policies && delegation.policies.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Politiques d&apos;autorisation</h3>
            <div className="space-y-2">
              {delegation.policies.map((p: any) => (
                <div
                  key={p.id}
                  className={cn(
                    "p-3 rounded-xl border",
                    p.enabled
                      ? "border-slate-200/70 dark:border-slate-700"
                      : "border-slate-200/50 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{p.action?.replace(/_/g, ' ')}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      p.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                    )}>
                      {p.enabled ? 'Actif' : 'Désactivé'}
                    </span>
                  </div>
                  {p.maxAmount && (
                    <div className="text-sm text-slate-400">
                      Plafond : {new Intl.NumberFormat('fr-FR').format(p.maxAmount)} {p.currency}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sous-section spécifique
  switch (sub) {
    case 'projects':
      return (
        <ScopeDetail
          title="Périmètre — Projets"
          icon={<Building2 className="w-5 h-5 text-blue-500" />}
          mode={delegation.projectScopeMode}
          list={delegation.projectScopeList}
          description="Définit sur quels projets cette délégation peut être utilisée."
        />
      );
    case 'bureaux':
      return (
        <ScopeDetail
          title="Périmètre — Bureaux"
          icon={<Building2 className="w-5 h-5 text-purple-500" />}
          mode={delegation.bureauScopeMode}
          list={delegation.bureauScopeList}
          description="Définit dans quels bureaux cette délégation peut être utilisée."
        />
      );
    case 'suppliers':
      return (
        <ScopeDetail
          title="Périmètre — Fournisseurs"
          icon={<Users className="w-5 h-5 text-amber-500" />}
          mode={delegation.supplierScopeMode}
          list={delegation.supplierScopeList}
          description="Définit avec quels fournisseurs cette délégation peut être utilisée."
        />
      );
    case 'categories':
      return (
        <ScopeDetail
          title="Périmètre — Catégories"
          icon={<LayoutList className="w-5 h-5 text-emerald-500" />}
          mode="INCLUDE"
          list={delegation.categoryScopeList}
          description="Définit quelles catégories d'achats sont couvertes."
          emptyLabel="Toutes les catégories sont autorisées."
        />
      );
    default:
      return <div className="text-slate-400">Sous-section inconnue</div>;
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ScopeCard({
  title,
  icon,
  mode,
  list,
  emptyLabel = 'Tous autorisés',
}: {
  title: string;
  icon: React.ReactNode;
  mode: string;
  list: string[] | string | null | undefined;
  emptyLabel?: string;
}) {
  const items = parseList(list);

  return (
    <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/20">
      <h4 className="font-medium mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
        {icon}
        {title}
      </h4>
      
      {renderScopeContent(mode, items, emptyLabel)}
    </div>
  );
}

function ScopeDetail({
  title,
  icon,
  mode,
  list,
  description,
  emptyLabel = 'Tous autorisés',
}: {
  title: string;
  icon: React.ReactNode;
  mode: string;
  list: string[] | string | null | undefined;
  description: string;
  emptyLabel?: string;
}) {
  const items = parseList(list);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
        {renderScopeContent(mode, items, emptyLabel)}
      </div>
    </div>
  );
}

function parseList(list: string[] | string | null | undefined): string[] {
  if (!list) return [];
  if (Array.isArray(list)) return list;
  try {
    const parsed = JSON.parse(list);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderScopeContent(mode: string, items: string[], emptyLabel: string) {
  if (mode === 'ALL' || items.length === 0) {
    return (
      <div className="flex items-center gap-2 text-emerald-600/80 dark:text-emerald-400/80">
        <Globe className="w-4 h-4" />
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div>
      <div className={cn(
        "flex items-center gap-2 mb-3",
        mode === 'INCLUDE' 
          ? "text-blue-600/80 dark:text-blue-400/80" 
          : "text-rose-600/80 dark:text-rose-400/80"
      )}>
        {mode === 'INCLUDE' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        <span className="font-medium">
          {mode === 'INCLUDE' ? 'Liste blanche (uniquement)' : 'Liste noire (exclus)'}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm border",
              mode === 'INCLUDE'
                ? "bg-blue-50/50 text-blue-700/90 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-300/90 dark:border-blue-700/30"
                : "bg-rose-50/50 text-rose-700/90 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-300/90 dark:border-rose-700/30"
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

