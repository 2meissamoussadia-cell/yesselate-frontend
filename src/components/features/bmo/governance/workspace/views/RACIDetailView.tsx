/**
 * Vue détail d'une activité RACI
 * Affiche tous les détails d'une activité avec ses rôles assignés
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Shield,
  Lock,
  Unlock,
  FileText,
  Clock,
  User,
  Edit,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { RACIEnriched } from '@/lib/types/bmo.types';

const RACI_LABELS = {
  'R': 'Responsible',
  'A': 'Accountable',
  'C': 'Consulted',
  'I': 'Informed',
  '-': 'Non impliqué',
};

const RACI_COLORS = {
  'R': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'A': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'C': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'I': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  '-': 'bg-slate-700/20 text-slate-400 border-slate-700/30',
};

const CRITICALITY_COLORS = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-slate-400',
};

interface RACIDetailViewProps {
  activityId?: string;
}

export function RACIDetailView({ activityId }: RACIDetailViewProps) {
  const { getActiveTab } = useGovernanceWorkspaceStore();
  const activeTab = getActiveTab();
  const activity: RACIEnriched | undefined = activeTab?.metadata?.activity;
  
  if (!activity) {
    return (
      <div className="p-6">
        <Card className="border-white/10 bg-slate-900/50">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Activité non trouvée</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Analyser les rôles
  const roles = Object.entries(activity.roles);
  const hasResponsible = Object.values(activity.roles).includes('R');
  const hasAccountable = Object.values(activity.roles).includes('A');
  const responsibleCount = Object.values(activity.roles).filter(r => r === 'R').length;
  const accountableCount = Object.values(activity.roles).filter(r => r === 'A').length;
  
  // Détecter les conflits
  const hasConflicts = responsibleCount > 1 || accountableCount > 1 || accountableCount === 0;
  
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{activity.activity}</h1>
            {activity.locked && (
              <Lock className="h-6 w-6 text-amber-400" aria-label="Activité verrouillée" />
            )}
          </div>
          
          {activity.description && (
            <p className="text-white/70 text-lg mb-4">{activity.description}</p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="default"
              className={cn(
                'text-sm',
                activity.criticality === 'critical' && 'bg-red-500/20 text-red-300 border-red-500/30',
                activity.criticality === 'high' && 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                activity.criticality === 'medium' && 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                activity.criticality === 'low' && 'bg-slate-500/20 text-slate-300 border-slate-500/30'
              )}
            >
              {activity.criticality.toUpperCase()}
            </Badge>
            
            <Badge variant="default" className="bg-blue-500/20 text-blue-300 text-sm">
              {activity.category}
            </Badge>
            
            {activity.linkedProcedure && (
              <Badge variant="default" className="bg-slate-500/20 text-slate-300 text-sm">
                <FileText className="h-3 w-3 mr-1" />
                {activity.linkedProcedure}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!activity.locked && (
            <Button variant="default" className="border-white/10 text-white hover:bg-white/10">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>
      
      {/* Alertes */}
      {hasConflicts && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-300 font-semibold mb-1">Conflits détectés</h3>
                <ul className="text-red-200/80 text-sm space-y-1">
                  {responsibleCount > 1 && (
                    <li>• Plusieurs rôles "Responsible" ({responsibleCount})</li>
                  )}
                  {accountableCount > 1 && (
                    <li>• Plusieurs rôles "Accountable" ({accountableCount})</li>
                  )}
                  {accountableCount === 0 && (
                    <li>• Aucun rôle "Accountable" assigné</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Matrice RACI */}
      <Card className="border-white/10 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Matrice des Responsabilités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(([bureau, role]) => (
              <div
                key={bureau}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  role === 'R' && 'border-emerald-500/30 bg-emerald-500/10',
                  role === 'A' && 'border-blue-500/30 bg-blue-500/10',
                  role === 'C' && 'border-amber-500/30 bg-amber-500/10',
                  role === 'I' && 'border-slate-500/30 bg-slate-500/10',
                  role === '-' && 'border-slate-700/20 bg-slate-800/20 opacity-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{bureau}</h3>
                  <Badge
                    variant="default"
                    className={RACI_COLORS[role]}
                  >
                    {role}
                  </Badge>
                </div>
                
                <p className={cn(
                  'text-sm',
                  role === 'R' && 'text-emerald-300/80',
                  role === 'A' && 'text-blue-300/80',
                  role === 'C' && 'text-amber-300/80',
                  role === 'I' && 'text-slate-300/80',
                  role === '-' && 'text-slate-400'
                )}>
                  {RACI_LABELS[role]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Détails additionnels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations */}
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow 
              label="Catégorie" 
              value={activity.category} 
              icon={FileText} 
            />
            <InfoRow 
              label="Criticité" 
              value={activity.criticality} 
              icon={AlertTriangle}
              valueColor={CRITICALITY_COLORS[activity.criticality]}
            />
            <InfoRow 
              label="Dernière modification" 
              value={activity.lastModified} 
              icon={Clock} 
            />
            <InfoRow 
              label="Modifié par" 
              value={activity.modifiedBy} 
              icon={User} 
            />
            <InfoRow 
              label="Statut" 
              value={activity.locked ? 'Verrouillé' : 'Modifiable'} 
              icon={activity.locked ? Lock : Unlock}
              valueColor={activity.locked ? 'text-amber-400' : 'text-emerald-400'}
            />
          </CardContent>
        </Card>
        
        {/* Légende RACI */}
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">Légende RACI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <LegendRow
              role="R"
              label="Responsible"
              description="Réalise l'activité"
              color="emerald"
            />
            <LegendRow
              role="A"
              label="Accountable"
              description="Responsable final, approuve"
              color="blue"
            />
            <LegendRow
              role="C"
              label="Consulted"
              description="Consulté pour avis"
              color="amber"
            />
            <LegendRow
              role="I"
              label="Informed"
              description="Informé des résultats"
              color="slate"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Procédure liée */}
      {activity.linkedProcedure && (
        <Card className="border-white/10 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Procédure Associée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold mb-1">{activity.linkedProcedure}</p>
                <p className="text-white/60 text-sm">Document de référence pour cette activité</p>
              </div>
              <Button variant="default" className="border-white/10 text-white hover:bg-white/10">
                Consulter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  valueColor?: string;
}

function InfoRow({ label, value, icon: Icon, valueColor = 'text-white' }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2 text-white/60">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className={cn('font-semibold', valueColor)}>{value}</span>
    </div>
  );
}

interface LegendRowProps {
  role: string;
  label: string;
  description: string;
  color: 'emerald' | 'blue' | 'amber' | 'slate';
}

function LegendRow({ role, label, description, color }: LegendRowProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };
  
  return (
    <div className="flex items-start gap-3">
      <Badge variant="default" className={cn('text-sm mt-0.5', colorClasses[color])}>
        {role}
      </Badge>
      <div className="flex-1">
        <p className="text-white font-medium">{label}</p>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
    </div>
  );
}

