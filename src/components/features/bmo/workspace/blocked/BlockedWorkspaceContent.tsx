'use client';

import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import { BlockedInboxView } from './views/BlockedInboxView';
import { BlockedDetailView } from './views/BlockedDetailView';
import { BlockedMatrixView } from './views/BlockedMatrixView';
import { BlockedAuditView } from './views/BlockedAuditView';
import { BlockedTimelineView } from './views/BlockedTimelineView';
import { BlockedResolutionWizard } from './views/BlockedResolutionWizard';
import { BlockedBureauView } from './views/BlockedBureauView';
import { cn } from '@/lib/cn';
import { AlertCircle, LayoutGrid, Clock, Building2, FileText, Zap, Shield, Eye, BarChart3 } from 'lucide-react';

export function BlockedWorkspaceContent() {
  const { tabs, activeTabId } = useBlockedWorkspaceStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun onglet sélectionné</p>
          <p className="text-sm mt-1">Utilisez ⌘K pour ouvrir une vue</p>
        </div>
      </div>
    );
  }

  const tabData = activeTab.data ?? {};

  // Render based on tab type
  switch (activeTab.type) {
    case 'inbox':
      return <BlockedInboxView tabId={activeTab.id} data={tabData} />;
    
    case 'dossier':
      return <BlockedDetailView tabId={activeTab.id} data={tabData} />;
    
    case 'matrix':
      return <BlockedMatrixView tabId={activeTab.id} data={tabData} />;
    
    case 'timeline':
      return <BlockedTimelineView tabId={activeTab.id} data={tabData} />;
    
    case 'bureau':
      return <BlockedBureauView tabId={activeTab.id} data={tabData} />;
    
    case 'resolution':
      return <BlockedResolutionWizard tabId={activeTab.id} data={tabData} />;
    
    case 'escalation':
      return (
        <PlaceholderView 
          icon={<Zap className="w-12 h-12" />}
          title="Workflow d'escalade"
          description="Escalade au CODIR"
        />
      );
    
    case 'substitution':
      return (
        <PlaceholderView 
          icon={<Shield className="w-12 h-12" />}
          title="Substitution BMO"
          description="Exercer le pouvoir de substitution"
        />
      );
    
    case 'audit':
      return <BlockedAuditView tabId={activeTab.id} data={tabData} />;
    
    case 'analytics':
      return (
        <PlaceholderView 
          icon={<BarChart3 className="w-12 h-12" />}
          title="Analytics prédictive"
          description="Analyse et prédiction des blocages"
        />
      );
    
    default:
      return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Type de vue non supporté</p>
            <p className="text-sm mt-1">{activeTab.type}</p>
          </div>
        </div>
      );
  }
}

function PlaceholderView({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="text-center">
        <div className="mx-auto mb-4 opacity-30">
          {icon}
        </div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm mt-1">{description}</p>
        <p className="text-xs mt-4 text-slate-400">En cours de développement</p>
      </div>
    </div>
  );
}

