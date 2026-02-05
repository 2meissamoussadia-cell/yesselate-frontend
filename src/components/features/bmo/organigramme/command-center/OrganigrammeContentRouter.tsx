/**
 * ContentRouter pour Organigramme
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { organigramme, orgChanges, bureauxGovernance } from '@/lib/data';
import { useBMOStore } from '@/lib/stores';
import { Users, Network, GitBranch, Briefcase, Building2, UserCheck, Award, History, BarChart3, Loader2 } from 'lucide-react';

interface ContentRouterProps {
  category: string;
  subCategory: string | null;
}

// Normalisation pour recherche
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const OrganigrammeContentRouter = React.memo(function OrganigrammeContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  const { addToast, addActionLog, currentUser } = useBMOStore();

  const handleUpdatePosition = useCallback((position: string) => {
    addActionLog({
      userId: currentUser?.id || 'USR-001',
      userName: currentUser?.name || 'A. DIALLO',
      userRole: currentUser?.role || 'Directeur Général',
      module: 'organigramme',
      action: 'update_position',
      targetId: position,
      targetType: 'Position',
      details: `Demande modification poste: ${position}`,
      bureau: 'BMO',
    });
    addToast('✏️ Demande de modification soumise au DG', 'success');
  }, [currentUser, addActionLog, addToast]);

  // Vue d'ensemble
  if (category === 'overview') {
    return <OverviewView />;
  }

  // Hiérarchie
  if (category === 'hierarchy') {
    return <HierarchyView onUpdatePosition={handleUpdatePosition} subCategory={subCategory} />;
  }

  // Changements
  if (category === 'changes') {
    return <ChangesView subCategory={subCategory} />;
  }

  // Postes
  if (category === 'positions') {
    return <PositionsView subCategory={subCategory} />;
  }

  // Bureaux
  if (category === 'bureaux') {
    return <BureauxView onUpdatePosition={handleUpdatePosition} subCategory={subCategory} />;
  }

  // Équipes
  if (category === 'teams') {
    return <TeamsView subCategory={subCategory} />;
  }

  // Compétences
  if (category === 'skills') {
    return <SkillsView subCategory={subCategory} />;
  }

  // Historique
  if (category === 'history') {
    return <HistoryView subCategory={subCategory} />;
  }

  // Analyse
  if (category === 'analytics') {
    return <AnalyticsView subCategory={subCategory} />;
  }

  // Default placeholder
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory || 'all'}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overview View
// ================================
function OverviewView() {
  const stats = useMemo(() => {
    const criticalBureaux = bureauxGovernance.filter(b => b.charge > 85 || (b.goulots && b.goulots.length > 0));
    const monoCompetenceAlerts: string[] = [];
    organigramme.bureaux.forEach(bureau => {
      const criticalSkills = bureau.members
        .map(m => m.skills || [])
        .flat()
        .filter(skill => ['budget', 'juridique', 'sécurité'].includes(skill))
        .filter((value, index, self) => self.indexOf(value) === index);
      if (criticalSkills.length === 1) {
        monoCompetenceAlerts.push(bureau.code);
      }
    });
    return {
      totalBureaux: organigramme.bureaux.length,
      critiques: criticalBureaux.length,
      risquesMono: monoCompetenceAlerts.length,
      totalMembers: organigramme.bureaux.reduce((acc, b) => acc + (b.members?.length || 0), 0) + 1, // +1 for DG
      totalChanges: orgChanges.length,
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Bureaux</p>
                <p className="text-2xl font-bold text-slate-200">{stats.totalBureaux}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Membres</p>
                <p className="text-2xl font-bold text-slate-200">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Changements</p>
                <p className="text-2xl font-bold text-slate-200">{stats.totalChanges}</p>
              </div>
              <GitBranch className="h-8 w-8 text-amber-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(stats.critiques > 0 && "border-red-400/30 bg-red-400/8")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Critiques</p>
                <p className="text-2xl font-bold text-slate-200">{stats.critiques}</p>
              </div>
              <Badge variant={stats.critiques > 0 ? "urgent" : "default"}>{stats.critiques}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(stats.risquesMono > 0 && "border-amber-400/30 bg-amber-400/8")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Risques</p>
                <p className="text-2xl font-bold text-slate-200">{stats.risquesMono}</p>
              </div>
              <Badge variant={stats.risquesMono > 0 ? "warning" : "default"}>{stats.risquesMono}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-blue-400/30 cursor-pointer transition-colors">
          <CardContent className="p-4">
            <Network className="h-6 w-6 text-blue-400 mb-2" />
            <h3 className="font-semibold text-slate-200 mb-1">Hiérarchie</h3>
            <p className="text-sm text-slate-400">Vue structurelle de l'organisation</p>
          </CardContent>
        </Card>
        <Card className="hover:border-amber-400/30 cursor-pointer transition-colors">
          <CardContent className="p-4">
            <GitBranch className="h-6 w-6 text-amber-400 mb-2" />
            <h3 className="font-semibold text-slate-200 mb-1">Changements</h3>
            <p className="text-sm text-slate-400">Journal des modifications</p>
          </CardContent>
        </Card>
        <Card className="hover:border-purple-400/30 cursor-pointer transition-colors">
          <CardContent className="p-4">
            <BarChart3 className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="font-semibold text-slate-200 mb-1">Analyse</h3>
            <p className="text-sm text-slate-400">Statistiques et tendances</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================================
// Hierarchy View
// ================================
function HierarchyView({ onUpdatePosition, subCategory }: { onUpdatePosition: (position: string) => void; subCategory: string | null }) {
  const criticalBureaux = useMemo(() =>
    bureauxGovernance.filter(b => b.charge > 85 || (b.goulots && b.goulots.length > 0)),
    []
  );

  const monoCompetenceAlerts = useMemo(() => {
    const risks: string[] = [];
    organigramme.bureaux.forEach(bureau => {
      const criticalSkills = bureau.members
        .map(m => m.skills || [])
        .flat()
        .filter(skill => ['budget', 'juridique', 'sécurité'].includes(skill))
        .filter((value, index, self) => self.indexOf(value) === index);
      if (criticalSkills.length === 1) {
        risks.push(bureau.code);
      }
    });
    return risks;
  }, []);

  return (
    <div className="p-6 space-y-4">
      {/* DG */}
      <Card key="dg" className="border-2 border-amber-400/30 bg-gradient-to-r from-amber-400/8 to-transparent">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400/80 to-amber-500/60 flex items-center justify-center text-xl sm:text-2xl font-bold text-white flex-shrink-0">
              {organigramme.dg.initials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <Badge variant="gold" className="mb-1">DIRECTION GÉNÉRALE</Badge>
              <h2 className="text-lg sm:text-xl font-bold">{organigramme.dg.name}</h2>
              <p className="text-sm text-slate-400">{organigramme.dg.role}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onUpdatePosition('DG')} className="w-full sm:w-auto">
              ✏️ Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bureaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {organigramme.bureaux.map((bureau) => {
          const govData = bureauxGovernance.find(b => b.code === bureau.code);
          const isCritical = criticalBureaux.some(b => b.code === bureau.code);
          const hasMonoRisk = monoCompetenceAlerts.includes(bureau.code);

          return (
            <Card
              key={bureau.code}
              className={cn(
                "transition-all hover:border-blue-400/30",
                isCritical && "border-l-4 border-l-red-400/60",
                hasMonoRisk && "ring-1 ring-amber-400/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-400/80 to-purple-500/70 flex items-center justify-center text-sm sm:text-base font-bold text-white flex-shrink-0">
                    {bureau.head.initials}
                  </div>
                  <div className="flex-1">
                    <Badge variant="info" className="mb-1">{bureau.code}</Badge>
                    <h3 className="font-bold">{bureau.head.name}</h3>
                    <p className="text-xs text-slate-400">{bureau.head.role}</p>
                  </div>
                </div>

                {bureau.members && bureau.members.length > 0 && (
                  <div className="border-t border-slate-700/50 pt-3 mt-3">
                    <p className="text-xs text-slate-400 mb-2">Équipe ({bureau.members.length})</p>
                    <div className="space-y-2">
                      {bureau.members.map((member) => (
                        <div key={member.id || member.name} className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-medium">
                            {member.initials}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {govData && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Charge</span>
                      <span className={cn("font-mono", govData.charge > 85 ? "text-red-300/80" : "text-emerald-300/80")}>
                        {govData.charge}%
                      </span>
                    </div>
                  </div>
                )}

                {hasMonoRisk && (
                  <div className="mt-2 p-2 rounded bg-amber-400/8 border border-amber-400/20">
                    <p className="text-[10px] text-amber-300/80">⚠️ Risque mono-compétence</p>
                  </div>
                )}

                <Button size="sm" variant="ghost" className="w-full mt-3" onClick={() => onUpdatePosition(bureau.code)}>
                  ✏️ Modifier
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ================================
// Changes View
// ================================
function ChangesView({ subCategory }: { subCategory: string | null }) {
  const filteredChanges = useMemo(() => {
    let result = [...orgChanges];
    if (subCategory && subCategory !== 'all') {
      result = result.filter(c => c.type === subCategory);
    }
    return result;
  }, [subCategory]);

  return (
    <div className="p-6 space-y-3">
      <Card className="bg-slate-800/50">
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">📜 Journal des modifications structurelles</h3>
          <p className="text-sm text-slate-400">
            Chaque modification est <strong>traçable, hashée, et liée à une décision BMO</strong>
          </p>
        </CardContent>
      </Card>

      {filteredChanges.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <span className="text-4xl mb-4 block">📜</span>
            <p className="text-slate-400">Aucun changement ne correspond aux filtres</p>
          </CardContent>
        </Card>
      )}

      {filteredChanges.map((change) => (
        <Card
          key={change.id}
          className={cn(
            "transition-all",
            change.type === 'promotion' && "border-l-4 border-l-emerald-400/60",
            change.type === 'mutation' && "border-l-4 border-l-blue-400/60",
            change.type === 'depart' && "border-l-4 border-l-red-400/60",
            change.type === 'arrivee' && "border-l-4 border-l-purple-400/60",
            change.type === 'restructuration' && "border-l-4 border-l-amber-400/60",
          )}
        >
          <CardContent className="p-4">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={
                  change.type === 'promotion' ? 'success' :
                  change.type === 'mutation' ? 'info' :
                  change.type === 'depart' ? 'urgent' :
                  change.type === 'arrivee' ? 'default' : 'warning'
                }>
                  {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                </Badge>
                <span className="font-mono text-xs text-slate-400">{change.id}</span>
              </div>
              <span className="text-sm text-slate-400">{change.date}</span>
            </div>

            <p className="font-medium mb-2">{change.description}</p>

            <div className="flex flex-wrap gap-1 mb-2">
              {change.affectedPositions.map((pos, idx) => (
                <Badge key={`${change.id}-${idx}`} variant="default">{pos}</Badge>
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/50">
              <span>Par: {change.author}</span>
              {change.decisionId && (
                <Badge variant="info">🔗 {change.decisionId}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ================================
// Placeholder Views
// ================================
function PositionsView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Postes</h3>
        <p className="text-slate-400">Vue des postes en cours de développement</p>
      </div>
    </div>
  );
}

function BureauxView({ onUpdatePosition, subCategory }: { onUpdatePosition: (position: string) => void; subCategory: string | null }) {
  return <HierarchyView onUpdatePosition={onUpdatePosition} subCategory={subCategory} />;
}

function TeamsView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <UserCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Équipes</h3>
        <p className="text-slate-400">Vue des équipes en cours de développement</p>
      </div>
    </div>
  );
}

function SkillsView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Compétences</h3>
        <p className="text-slate-400">Vue des compétences en cours de développement</p>
      </div>
    </div>
  );
}

function HistoryView({ subCategory }: { subCategory: string | null }) {
  return <ChangesView subCategory={subCategory} />;
}

function AnalyticsView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Analyse</h3>
        <p className="text-slate-400">Statistiques et analyses en cours de développement</p>
      </div>
    </div>
  );
}

