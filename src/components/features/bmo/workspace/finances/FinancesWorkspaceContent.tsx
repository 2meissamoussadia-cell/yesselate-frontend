'use client';

import { useFinancesWorkspaceStore } from '@/lib/stores/financesWorkspaceStore';
import { FinancesDashboardView } from './views/FinancesDashboardView';
import { FinancesTresorerieView } from './views/FinancesTresorerieView';
import { LayoutDashboard, PiggyBank, TrendingUp, Shield, CreditCard } from 'lucide-react';

export function FinancesWorkspaceContent() {
  const { tabs, activeTabId } = useFinancesWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  switch (activeTab.type) {
    case 'dashboard': return <FinancesDashboardView />;
    case 'tresorerie': return <FinancesTresorerieView />;
    case 'budget': return <PlaceholderView icon={<PiggyBank className="w-12 h-12" />} title="Gestion du budget" />;
    case 'compte': return <PlaceholderView icon={<CreditCard className="w-12 h-12" />} title="Détail du compte" />;
    case 'previsions': return <PlaceholderView icon={<TrendingUp className="w-12 h-12" />} title="Prévisions financières" />;
    case 'audit': return <PlaceholderView icon={<Shield className="w-12 h-12" />} title="Historique" />;
    default: return <div className="text-center py-12 text-slate-400">Vue non supportée</div>;
  }
}

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p><p className="text-xs mt-4 text-slate-400">En cours de développement</p></div></div>;
}

