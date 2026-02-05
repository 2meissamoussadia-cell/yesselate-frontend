'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { FluentButton } from '@/components/ui/fluent-button';
import { useDelegationWorkspaceStore, type DelegationUIState } from '@/lib/stores/delegationWorkspaceStore';
import { useHotkeys } from '@/hooks/useHotkeys';
import {
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  FileText,
  Target,
  Shield,
  Users,
  ListChecks,
  Activity,
  Zap,
  Building2,
  Banknote,
  UserCheck,
  Bell,
  Clock,
  Hash,
  Download,
  AlertTriangle,
  FlaskConical,
  LayoutList,
  RefreshCw,
  Plus,
  Pause,
  XCircle,
  Calendar,
} from 'lucide-react';

// Import des sections
import { DelegationOverviewSection } from './sections/DelegationOverviewSection';
import { DelegationScopeSection } from './sections/DelegationScopeSection';
import { DelegationLimitsSection } from './sections/DelegationLimitsSection';
import { DelegationActorsSection } from './sections/DelegationActorsSection';
import { DelegationCommitmentsSection } from './sections/DelegationCommitmentsSection';
import { DelegationAuditSection } from './sections/DelegationAuditSection';
import { DelegationSimulatorSection } from './sections/DelegationSimulatorSection';
import { DelegationSearchBar } from './DelegationSearchBar';

// ============================================
// TYPES
// ============================================

export type DelegationModalType = 
  | 'extend' 
  | 'suspend' 
  | 'revoke' 
  | 'add_actor' 
  | 'add_policy' 
  | 'export_audit'
  | 'add_engagement'
  | null;

interface Props {
  tabId: string;
  delegationId: string;
  onOpenModal?: (modal: DelegationModalType) => void;
}

// ============================================
// EXPLORER STRUCTURE
// ============================================

type ExplorerNode = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  section: DelegationUIState['section'];
  sub?: DelegationUIState['sub'];
  children?: ExplorerNode[];
};

const EXPLORER_TREE: ExplorerNode[] = [
  {
    id: 'overview',
    label: 'Résumé',
    icon: <FileText className="w-4 h-4" />,
    section: 'overview',
  },
  {
    id: 'scope',
    label: 'Périmètre',
    icon: <Target className="w-4 h-4" />,
    section: 'scope',
    children: [
      { id: 'scope-projects', label: 'Projets', section: 'scope', sub: 'projects', icon: <Building2 className="w-3.5 h-3.5" /> },
      { id: 'scope-bureaux', label: 'Bureaux', section: 'scope', sub: 'bureaux', icon: <Building2 className="w-3.5 h-3.5" /> },
      { id: 'scope-suppliers', label: 'Fournisseurs', section: 'scope', sub: 'suppliers', icon: <Users className="w-3.5 h-3.5" /> },
      { id: 'scope-categories', label: 'Catégories', section: 'scope', sub: 'categories', icon: <LayoutList className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'limits',
    label: 'Limites & contrôles',
    icon: <Shield className="w-4 h-4" />,
    section: 'limits',
    children: [
      { id: 'limits-thresholds', label: 'Seuils', section: 'limits', sub: 'thresholds', icon: <Banknote className="w-3.5 h-3.5" /> },
      { id: 'limits-dual', label: 'Co-signature', section: 'limits', sub: 'dual', icon: <UserCheck className="w-3.5 h-3.5" /> },
      { id: 'limits-exclusions', label: 'Exclusions', section: 'limits', sub: 'exclusions', icon: <XCircle className="w-3.5 h-3.5" /> },
      { id: 'limits-exceptions', label: 'Exceptions', section: 'limits', sub: 'exceptions', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'actors',
    label: 'Acteurs',
    icon: <Users className="w-4 h-4" />,
    section: 'actors',
    children: [
      { id: 'actors-raci', label: 'Matrice RACI', section: 'actors', sub: 'raci', icon: <LayoutList className="w-3.5 h-3.5" /> },
      { id: 'actors-approvers', label: 'Co-validateurs', section: 'actors', sub: 'approvers', icon: <UserCheck className="w-3.5 h-3.5" /> },
      { id: 'actors-controllers', label: 'Contrôleurs', section: 'actors', sub: 'controllers', icon: <Shield className="w-3.5 h-3.5" /> },
      { id: 'actors-notifications', label: 'Notifications', section: 'actors', sub: 'notifications', icon: <Bell className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'commitments',
    label: 'Engagements',
    icon: <ListChecks className="w-4 h-4" />,
    section: 'commitments',
  },
  {
    id: 'audit',
    label: 'Audit',
    icon: <Activity className="w-4 h-4" />,
    section: 'audit',
    children: [
      { id: 'audit-timeline', label: 'Timeline', section: 'audit', sub: 'timeline', icon: <Clock className="w-3.5 h-3.5" /> },
      { id: 'audit-hashchain', label: 'Chaîne de hash', section: 'audit', sub: 'hashchain', icon: <Hash className="w-3.5 h-3.5" /> },
      { id: 'audit-exports', label: 'Exports', section: 'audit', sub: 'exports', icon: <Download className="w-3.5 h-3.5" /> },
      { id: 'audit-anomalies', label: 'Anomalies', section: 'audit', sub: 'anomalies', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    ],
  },
  {
    id: 'simulator',
    label: 'Simulateur',
    icon: <Zap className="w-4 h-4" />,
    section: 'simulator',
    children: [
      { id: 'simulator-test', label: "Test d'acte", section: 'simulator', sub: 'test', icon: <FlaskConical className="w-3.5 h-3.5" /> },
      { id: 'simulator-scenarios', label: 'Scénarios', section: 'simulator', sub: 'scenarios', icon: <LayoutList className="w-3.5 h-3.5" /> },
    ],
  },
];

const SECTION_LABELS: Record<DelegationUIState['section'], string> = {
  overview: 'Résumé',
  scope: 'Périmètre',
  limits: 'Limites & contrôles',
  actors: 'Acteurs',
  commitments: 'Engagements',
  audit: 'Audit',
  simulator: 'Simulateur',
};

// ============================================
// COMPONENT
// ============================================

export function DelegationViewer({ tabId, delegationId, onOpenModal }: Props) {
  const { setTabUI, getTabUI } = useDelegationWorkspaceStore();
  
  // État UI depuis le store
  const ui = getTabUI(tabId) ?? { section: 'overview', explorerOpen: true };
  
  // Groupes dépliés dans l'explorer
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['scope', 'limits', 'actors', 'audit', 'simulator'])
  );
  
  // Données de la délégation
  const [delegation, setDelegation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // CHARGEMENT
  // ================================
  const loadDelegation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/delegations/${encodeURIComponent(delegationId)}/full`);
      if (res.ok) {
        setDelegation(await res.json());
      }
    } catch (e) {
      logger.error('Erreur chargement délégation', e instanceof Error ? e : undefined, { component: 'DelegationViewer' });
    } finally {
      setLoading(false);
    }
  }, [delegationId]);

  useEffect(() => {
    loadDelegation();
  }, [loadDelegation]);

  // ================================
  // NAVIGATION
  // ================================
  const handleNavigate = useCallback((section: DelegationUIState['section'], sub?: DelegationUIState['sub']) => {
    setTabUI(tabId, { section, sub });
  }, [tabId, setTabUI]);

  const toggleExplorer = useCallback(() => {
    setTabUI(tabId, { explorerOpen: !ui.explorerOpen });
  }, [tabId, ui.explorerOpen, setTabUI]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // ================================
  // HOTKEYS (navigation rapide)
  // ================================
  useHotkeys('ctrl+f', (e) => {
    e.preventDefault();
    // Focus sur la barre de recherche (sera implémenté)
  }, { enableOnFormTags: true }, []);

  useHotkeys('ctrl+1', (e) => {
    e.preventDefault();
    handleNavigate('overview');
  }, { enableOnFormTags: true }, []);

  useHotkeys('ctrl+2', (e) => {
    e.preventDefault();
    handleNavigate('scope');
  }, { enableOnFormTags: true }, []);

  useHotkeys('ctrl+3', (e) => {
    e.preventDefault();
    handleNavigate('limits');
  }, { enableOnFormTags: true }, []);

  useHotkeys('ctrl+4', (e) => {
    e.preventDefault();
    handleNavigate('actors');
  }, { enableOnFormTags: true }, []);

  useHotkeys('ctrl+5', (e) => {
    e.preventDefault();
    handleNavigate('audit');
  }, { enableOnFormTags: true }, []);

  // ================================
  // BREADCRUMBS
  // ================================
  const breadcrumbs = useMemo(() => {
    const parts = [delegationId, SECTION_LABELS[ui.section]];
    if (ui.sub) {
      parts.push(ui.sub);
    }
    return parts.join(' › ');
  }, [delegationId, ui.section, ui.sub]);

  // ================================
  // RENDER
  // ================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px] overflow-hidden">
      <div className="h-full grid grid-cols-12 gap-3">
        
        {/* ========================================
            EXPLORER (Panneau gauche)
        ======================================== */}
        {ui.explorerOpen && (
          <aside className="col-span-12 lg:col-span-3 h-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-[#1f1f1f]/70">
            {/* Header Explorer */}
            <div className="p-3 border-b border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between">
              <span className="font-semibold text-sm">Explorer</span>
              <button
                onClick={toggleExplorer}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                title="Réduire l'explorer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Tree Navigation */}
            <nav className="p-2 overflow-auto h-[calc(100%-56px)]">
              {EXPLORER_TREE.map(node => (
                <ExplorerNodeComponent
                  key={node.id}
                  node={node}
                  currentSection={ui.section}
                  currentSub={ui.sub}
                  expanded={expandedGroups.has(node.id)}
                  onToggle={() => toggleGroup(node.id)}
                  onNavigate={handleNavigate}
                />
              ))}
            </nav>
          </aside>
        )}

        {/* ========================================
            ZONE DE TRAVAIL (Panneau principal)
        ======================================== */}
        <section className={cn(
          "h-full overflow-hidden",
          ui.explorerOpen ? "col-span-12 lg:col-span-9" : "col-span-12"
        )}>
          <div className="h-full rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-[#1f1f1f]/70 flex flex-col overflow-hidden">
            
            {/* Header avec breadcrumbs + actions */}
            <div className="p-3 border-b border-slate-200/70 dark:border-slate-700/50 space-y-3">
              {/* Ligne 1: Breadcrumbs + Actions */}
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Bouton ouvrir explorer */}
                  {!ui.explorerOpen && (
                    <button
                      onClick={toggleExplorer}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                      title="Ouvrir l'explorer"
                    >
                      <PanelLeft className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400 truncate">{breadcrumbs}</div>
                    <div className="font-semibold truncate">
                      {delegation?.title || 'Délégation'}
                    </div>
                  </div>
                </div>

                {/* Actions métier = ouvrent des modals (gérées par le parent) */}
                <div className="flex flex-wrap gap-2">
                <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal?.('add_actor')}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Acteur
                </FluentButton>
                <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal?.('add_policy')}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Règle
                </FluentButton>
                <FluentButton size="sm" variant="warning" onClick={() => onOpenModal?.('extend')}>
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Prolonger
                </FluentButton>
                <FluentButton size="sm" variant="secondary" onClick={() => onOpenModal?.('suspend')}>
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  Suspendre
                </FluentButton>
                <FluentButton size="sm" variant="destructive" onClick={() => onOpenModal?.('revoke')}>
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Révoquer
                </FluentButton>
                </div>
              </div>

              {/* Ligne 2: Barre de recherche */}
              <div className="max-w-md">
                <DelegationSearchBar
                  delegationId={delegationId}
                  onResultClick={(result) => {
                    // Naviguer vers la section appropriée selon le type de résultat
                    if (result.type === 'event') {
                      setTabUI(tabId, { section: 'audit', sub: 'timeline' });
                    } else if (result.type === 'usage') {
                      setTabUI(tabId, { section: 'overview' });
                    } else if (result.type === 'actor') {
                      setTabUI(tabId, { section: 'actors' });
                    }
                  }}
                />
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 min-h-0 overflow-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                  <span className="ml-3 text-slate-400">Chargement de la délégation...</span>
                </div>
              ) : (
                <SectionRouter
                  delegationId={delegationId}
                  delegation={delegation}
                  section={ui.section}
                  sub={ui.sub}
                  onRefresh={loadDelegation}
                  onOpenModal={onOpenModal}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================
// EXPLORER NODE COMPONENT
// ============================================

function ExplorerNodeComponent({
  node,
  currentSection,
  currentSub,
  expanded,
  onToggle,
  onNavigate,
}: {
  node: ExplorerNode;
  currentSection: DelegationUIState['section'];
  currentSub?: DelegationUIState['sub'];
  expanded: boolean;
  onToggle: () => void;
  onNavigate: (section: DelegationUIState['section'], sub?: DelegationUIState['sub']) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.section === currentSection && (!node.sub || node.sub === currentSub);
  const isParentActive = node.section === currentSection && hasChildren;

  return (
    <div className="mb-1">
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
          isActive && !hasChildren
            ? 'bg-slate-200/60 text-slate-900 dark:bg-slate-700/50 dark:text-slate-100'
            : isParentActive
            ? 'text-slate-800 dark:text-slate-200'
            : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/50'
        )}
        onClick={() => {
          if (hasChildren) {
            onToggle();
          } else {
            onNavigate(node.section, node.sub);
          }
        }}
      >
        {/* Chevron pour les groupes */}
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center text-slate-400 dark:text-slate-400">
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-4" />
        )}
        
        {/* Icône */}
        {node.icon && (
          <span className={cn(
            isActive ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-400'
          )}>
            {node.icon}
          </span>
        )}
        
        {/* Label */}
        <span className="text-sm truncate">{node.label}</span>
      </div>

      {/* Enfants */}
      {hasChildren && expanded && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200/50 dark:border-slate-700/50 pl-2">
          {node.children!.map(child => (
            <div
              key={child.id}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
                currentSection === child.section && currentSub === child.sub
                  ? 'bg-slate-200/60 text-slate-900 dark:bg-slate-700/50 dark:text-slate-100'
                  : 'text-slate-400 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-800/50'
              )}
              onClick={() => onNavigate(child.section, child.sub)}
            >
              {child.icon && (
                <span className={cn(
                  currentSection === child.section && currentSub === child.sub
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-400'
                )}>
                  {child.icon}
                </span>
              )}
              <span className="text-sm truncate">{child.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SECTION ROUTER
// ============================================

function SectionRouter({
  delegationId,
  delegation,
  section,
  sub,
  onRefresh,
  onOpenModal,
}: {
  delegationId: string;
  delegation: any;
  section: DelegationUIState['section'];
  sub?: DelegationUIState['sub'];
  onRefresh: () => void;
  onOpenModal?: (modal: DelegationModalType) => void;
}) {
  switch (section) {
    case 'overview':
      return <DelegationOverviewSection delegation={delegation} onRefresh={onRefresh} />;
    case 'scope':
      return <DelegationScopeSection delegation={delegation} sub={sub} />;
    case 'limits':
      return <DelegationLimitsSection delegation={delegation} sub={sub} />;
    case 'actors':
      return <DelegationActorsSection delegation={delegation} sub={sub} onAddActor={() => onOpenModal?.('add_actor')} />;
    case 'commitments':
      return <DelegationCommitmentsSection delegation={delegation} onAddEngagement={() => onOpenModal?.('add_engagement')} />;
    case 'audit':
      return <DelegationAuditSection delegationId={delegationId} delegation={delegation} sub={sub} />;
    case 'simulator':
      return <DelegationSimulatorSection delegationId={delegationId} delegation={delegation} sub={sub} />;
    default:
      return <div className="text-slate-400 text-center py-8">Section inconnue</div>;
  }
}

