/**
 * Vue liste/inbox des activités RACI
 * Affiche les activités RACI selon la queue sélectionnée
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VirtualizedList } from '@/presentation/components/VirtualizedList/VirtualizedList';
import {
  Search,
  Filter,
  Users,
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  FileText,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { raciEnriched } from '@/lib/data';
import type { RACIEnriched } from '@/lib/types/bmo.types';
import { GovernanceActiveFilters } from '../GovernanceActiveFilters';
import { GovernanceListSkeleton } from '../GovernanceSkeletons';

const CRITICALITY_COLORS = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const CATEGORY_LABELS = {
  validation: 'Validation',
  execution: 'Exécution',
  controle: 'Contrôle',
  support: 'Support',
};

const CATEGORY_COLORS = {
  validation: 'bg-blue-500/20 text-blue-300',
  execution: 'bg-emerald-500/20 text-emerald-300',
  controle: 'bg-purple-500/20 text-purple-300',
  support: 'bg-amber-500/20 text-amber-300',
};

export function RACIInboxView() {
  const { raciQueue, searchTerm, setSearchTerm, openTab } = useGovernanceWorkspaceStore();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedCriticality, setSelectedCriticality] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simuler chargement initial
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [raciQueue]);
  
  // Filtrer les activités selon la queue
  const filteredActivities = useMemo(() => {
    let items = [...raciEnriched];
    
    // Filtrer par queue
    switch (raciQueue) {
      case 'conflicts':
        // Mock: Simuler des conflits (plusieurs R ou plusieurs A)
        items = items.filter(item => {
          const roles = Object.values(item.roles);
          const rCount = roles.filter(r => r === 'R').length;
          const aCount = roles.filter(r => r === 'A').length;
          return rCount > 1 || aCount > 1 || aCount === 0;
        });
        break;
      
      case 'incomplete':
        // Activités sans R ou sans A
        items = items.filter(item => {
          const roles = Object.values(item.roles);
          return !roles.includes('R') || !roles.includes('A');
        });
        break;
      
      case 'critical':
        items = items.filter(item => item.criticality === 'critical');
        break;
      
      case 'unassigned':
        // Activités avec beaucoup de "-"
        items = items.filter(item => {
          const roles = Object.values(item.roles);
          const unassignedCount = roles.filter(r => r === '-').length;
          return unassignedCount > 4;
        });
        break;
      
      case 'all':
      default:
        break;
    }
    
    // Recherche textuelle
    if (localSearch.trim()) {
      const searchLower = localSearch.toLowerCase();
      items = items.filter(item =>
        item.activity.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrer par rôle
    if (selectedRole) {
      items = items.filter(item =>
        Object.values(item.roles).includes(selectedRole as any)
      );
    }
    
    // Filtrer par criticité
    if (selectedCriticality) {
      items = items.filter(item => item.criticality === selectedCriticality);
    }
    
    return items;
  }, [raciQueue, localSearch, selectedRole, selectedCriticality]);
  
  const handleOpenActivity = (activity: RACIEnriched) => {
    openTab('raci-activity', activity.activity, { activity });
  };
  
  const queueTitle = {
    all: 'Toutes les activités',
    conflicts: 'Conflits de rôles',
    incomplete: 'RACI incomplets',
    critical: 'Activités critiques',
    unassigned: 'Non assignés',
  }[raciQueue];
  
  // Construire les filtres actifs
  const activeFilters = [];
  if (selectedRole) {
    activeFilters.push({
      id: 'role',
      label: 'Rôle',
      value: selectedRole,
      onRemove: () => setSelectedRole(null),
    });
  }
  if (selectedCriticality) {
    activeFilters.push({
      id: 'criticality',
      label: 'Criticité',
      value: selectedCriticality,
      onRemove: () => setSelectedCriticality(null),
    });
  }
  if (localSearch) {
    activeFilters.push({
      id: 'search',
      label: 'Recherche',
      value: localSearch,
      onRemove: () => setLocalSearch(''),
    });
  }
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };
  
  if (isLoading) {
    return <GovernanceListSkeleton />;
  }
  
  return (
    <div className="flex h-full">
      {/* Liste principale */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-400" />
                {queueTitle}
              </h2>
              <p className="text-white/60 text-sm mt-1">
                {filteredActivities.length} activité(s)
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          {/* Filtres */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Recherche */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Rechercher une activité..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            
            {/* Filtres rôle */}
            <div className="flex items-center gap-2">
              {['R', 'A', 'C', 'I'].map(role => (
                <Button
                  key={role}
                  variant={selectedRole === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  className={cn(
                    'h-8',
                    selectedRole === role && 'bg-blue-500 hover:bg-blue-600'
                  )}
                >
                  {role}
                </Button>
              ))}
            </div>
            
            {/* Reset filtres */}
            {(selectedRole || selectedCriticality || localSearch) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedRole(null);
                  setSelectedCriticality(null);
                  setLocalSearch('');
                }}
                className="text-white/60 hover:text-white"
              >
                Réinitialiser
              </Button>
            )}
          </div>
          
          {/* Active Filters */}
          <GovernanceActiveFilters
            filters={activeFilters}
            onClearAll={() => {
              setSelectedRole(null);
              setSelectedCriticality(null);
              setLocalSearch('');
            }}
          />
          
          {/* Liste des activités - ✅ Virtualisée pour performance */}
          {filteredActivities.length === 0 ? (
            <Card className="border-white/10 bg-slate-900/50">
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Aucune activité trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <VirtualizedList
              items={filteredActivities}
              estimateSize={180} // Hauteur estimée d'une carte activité
              overscan={5}
              containerClassName="h-[600px]"
              className="space-y-3"
              getItemKey={(activity, index) => activity.activity || index}
              renderItem={(activity, index) => (
                <div className="px-1">
                  <Card
                    className="group border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl hover:border-blue-500/30 transition-all cursor-pointer"
                    onClick={() => handleOpenActivity(activity)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold text-lg">
                              {activity.activity}
                            </h3>
                            {activity.locked && (
                              <Lock className="h-4 w-4 text-amber-400" aria-label="Verrouillé" />
                            )}
                          </div>
                          
                          {activity.description && (
                            <p className="text-white/60 text-sm mb-3">
                              {activity.description}
                            </p>
                          )}
                          
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="default"
                              className={CATEGORY_COLORS[activity.category]}
                            >
                              {CATEGORY_LABELS[activity.category]}
                            </Badge>
                            
                            <Badge
                              variant="default"
                              className={CRITICALITY_COLORS[activity.criticality]}
                            >
                              {activity.criticality}
                            </Badge>
                            
                            {activity.linkedProcedure && (
                              <Badge variant="default" className="bg-slate-500/20 text-slate-300">
                                <FileText className="h-3 w-3 mr-1" />
                                {activity.linkedProcedure}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Rôles */}
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {Object.entries(activity.roles).map(([bureau, role]) => {
                              if (role === '-') return null;
                              return (
                                <div
                                  key={bureau}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs"
                                >
                                  <span className="text-white/60">{bureau}:</span>
                                  <span className={cn(
                                    'font-semibold',
                                    role === 'R' && 'text-emerald-400',
                                    role === 'A' && 'text-blue-400',
                                    role === 'C' && 'text-amber-400',
                                    role === 'I' && 'text-slate-400'
                                  )}>
                                    {role}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Action */}
                        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
                        <span>Modifié par {activity.modifiedBy}</span>
                        <span>{activity.lastModified}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            />
          )}
        </div>
      </div>
      
      {/* Sidebar stats (optionnel) */}
      <div className="w-80 border-l border-white/10 bg-slate-900/30 p-4 space-y-4 hidden xl:block">
        <h3 className="text-white font-semibold mb-4">Statistiques</h3>
        
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Par criticité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Critique" value={raciEnriched.filter(a => a.criticality === 'critical').length} color="text-red-400" />
            <StatRow label="Haute" value={raciEnriched.filter(a => a.criticality === 'high').length} color="text-orange-400" />
            <StatRow label="Moyenne" value={raciEnriched.filter(a => a.criticality === 'medium').length} color="text-yellow-400" />
            <StatRow label="Basse" value={raciEnriched.filter(a => a.criticality === 'low').length} color="text-slate-400" />
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Validation" value={raciEnriched.filter(a => a.category === 'validation').length} />
            <StatRow label="Exécution" value={raciEnriched.filter(a => a.category === 'execution').length} />
            <StatRow label="Contrôle" value={raciEnriched.filter(a => a.category === 'controle').length} />
            <StatRow label="Support" value={raciEnriched.filter(a => a.category === 'support').length} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: number;
  color?: string;
}

function StatRow({ label, value, color = 'text-white' }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={cn('font-semibold', color)}>{value}</span>
    </div>
  );
}

