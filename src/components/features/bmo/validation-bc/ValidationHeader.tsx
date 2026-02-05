'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

type TabType = 'bc' | 'factures' | 'avenants';

interface ValidationHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  stats: {
    bc: number;
    factures: number;
    avenants: number;
    total: number;
    urgent: number;
  };
  onAIAssistantClick?: () => void;
}

export function ValidationHeader({
  activeTab,
  onTabChange,
  stats,
  onAIAssistantClick,
}: ValidationHeaderProps) {
  const tabs = [
    { id: 'bc' as TabType, label: 'Bons de Commande', shortLabel: 'BC', count: stats.bc, icon: '📋', color: 'emerald' },
    { id: 'factures' as TabType, label: 'Factures', shortLabel: 'Factures', count: stats.factures, icon: '🧾', color: 'blue' },
    { id: 'avenants' as TabType, label: 'Avenants', shortLabel: 'Avenants', count: stats.avenants, icon: '📝', color: 'purple' },
  ];

  return (
    <div className="space-y-4">
      {/* Header principal avec titre */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">✅</span>
            Validation BC / Factures / Avenants
            <Badge variant="warning" className="text-base px-3 py-1">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Outil de validation moderne, intelligent et interactif • Verrou RACI actif • Hash SHA3-256 sur chaque validation
          </p>
        </div>
        <Button
          variant="default"
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={onAIAssistantClick}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Assistant IA
        </Button>
      </div>

      {/* Trois boutons principaux en évidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <Card
            key={tab.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-xl hover:scale-105',
              activeTab === tab.id
                ? tab.color === 'emerald'
                  ? 'border-emerald-500 border-2 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 shadow-lg shadow-emerald-500/20'
                  : tab.color === 'blue'
                  ? 'border-blue-500 border-2 bg-gradient-to-br from-blue-500/20 to-blue-500/5 shadow-lg shadow-blue-500/20'
                  : 'border-purple-500 border-2 bg-gradient-to-br from-purple-500/20 to-purple-500/5 shadow-lg shadow-purple-500/20'
                : 'border-slate-700/30 hover:border-slate-600'
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{tab.icon}</span>
                {activeTab === tab.id && (
                  <Badge
                    variant={tab.color === 'emerald' ? 'success' : tab.color === 'blue' ? 'info' : 'default'}
                    className="text-xs px-2 py-1"
                  >
                    Actif
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold mb-1">{tab.label}</h2>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-400">{tab.shortLabel}</span>
                <Badge
                  variant={tab.color === 'emerald' ? 'success' : tab.color === 'blue' ? 'info' : 'default'}
                  className="text-base px-3 py-1 font-bold"
                >
                  {tab.count}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

