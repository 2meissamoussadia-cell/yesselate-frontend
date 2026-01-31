'use client';

import { useContratsWorkspaceStore } from '@/lib/stores/contratsWorkspaceStore';
import { ContratsInboxView } from './views/ContratsInboxView';
import { ContratsDetailView } from './views/ContratsDetailView';
import { FileText, Clock, GitCompare, MessageSquare, CheckCircle, Shield, BarChart3 } from 'lucide-react';

export function ContratsWorkspaceContent() {
  const { tabs, activeTabId } = useContratsWorkspaceStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun onglet sélectionné</p>
          <p className="text-sm mt-1">Utilisez ⌘K pour ouvrir une vue</p>
        </div>
      </div>
    );
  }

  switch (activeTab.type) {
    case 'inbox':
      return <ContratsInboxView tabId={activeTab.id} data={activeTab.data} />;
    
    case 'contrat':
      return <ContratsDetailView tabId={activeTab.id} data={activeTab.data} />;
    
    case 'timeline':
      return <PlaceholderView icon={<Clock className="w-12 h-12" />} title="Timeline" description="Vue chronologique des contrats" />;
    
    case 'comparison':
      return <PlaceholderView icon={<GitCompare className="w-12 h-12" />} title="Comparaison" description="Comparer les versions du contrat" />;
    
    case 'negociation':
      return <PlaceholderView icon={<MessageSquare className="w-12 h-12" />} title="Négociation" description="Workflow de négociation" />;
    
    case 'validation':
      return <PlaceholderView icon={<CheckCircle className="w-12 h-12" />} title="Validation" description="Workflow de validation" />;
    
    case 'audit':
      return <PlaceholderView icon={<Shield className="w-12 h-12" />} title="Audit" description="Registre des décisions" />;
    
    case 'analytics':
      return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Analytics" description="Statistiques et tendances" />;
    
    default:
      return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Type de vue non supporté</p>
          </div>
        </div>
      );
  }
}

function PlaceholderView({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="text-center">
        <div className="mx-auto mb-4 opacity-30">{icon}</div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm mt-1">{description}</p>
        <p className="text-xs mt-4 text-slate-400">En cours de développement</p>
      </div>
    </div>
  );
}

