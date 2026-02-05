'use client';

/**
 * Filtres Avancés - Module, bureau, période, criticité, statut
 */

import React, { useState } from 'react';
import { Filter, X, Calendar, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import type { ModuleSource, Criticite, FiltresCalendrier } from '@/lib/types/calendrier.types';

interface FiltresAvancesProps {
  onClose?: () => void;
}

const MODULES: Array<{ id: ModuleSource; label: string }> = [
  { id: 'demandes', label: 'Demandes' },
  { id: 'validation-bc', label: 'Validation BC' },
  { id: 'validation-factures', label: 'Validation Factures' },
  { id: 'validation-contrats', label: 'Validation Contrats' },
  { id: 'validation-paiements', label: 'Validation Paiements' },
  { id: 'blocked', label: 'Dossiers bloqués' },
  { id: 'substitution', label: 'Substitution' },
  { id: 'arbitrages-vivants', label: 'Arbitrages' },
  { id: 'tickets-clients', label: 'Tickets clients' },
  { id: 'recouvrements', label: 'Recouvrements' },
  { id: 'litiges', label: 'Litiges' },
  { id: 'projets-en-cours', label: 'Projets' },
  { id: 'employes', label: 'Employés' },
  { id: 'missions', label: 'Missions' },
  { id: 'delegations', label: 'Délégations' },
  { id: 'conferences', label: 'Conférences' },
  { id: 'echanges-structures', label: 'Échanges structurés' },
  { id: 'messages-externes', label: 'Messages externes' },
];

const BUREAUX = ['BMO', 'BF', 'BJ', 'BD', 'BA', 'BC', 'BE', 'BG', 'BH', 'BI'];

const CRITICITES: Array<{ id: Criticite; label: string; color: string }> = [
  { id: 'critique', label: 'Critique', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'majeur', label: 'Majeur', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'mineur', label: 'Mineur', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
];

const STATUTS = [
  { id: 'a-traiter', label: 'À traiter' },
  { id: 'en-cours', label: 'En cours' },
  { id: 'termine', label: 'Terminé' },
  { id: 'en-retard', label: 'En retard' },
];

export function FiltresAvances({ onClose }: FiltresAvancesProps) {
  const { filtres, setFiltres, resetFiltres } = useCalendrierStore();
  const [localFiltres, setLocalFiltres] = useState<FiltresCalendrier>(filtres);

  const handleModuleToggle = (module: ModuleSource) => {
    setLocalFiltres((prev) => {
      const modules = prev.module || [];
      const newModules = modules.includes(module)
        ? modules.filter((m) => m !== module)
        : [...modules, module];
      return { ...prev, module: newModules.length > 0 ? newModules : undefined };
    });
  };

  const handleBureauToggle = (bureau: string) => {
    setLocalFiltres((prev) => {
      const bureaux = prev.bureau || [];
      const newBureaux = bureaux.includes(bureau)
        ? bureaux.filter((b) => b !== bureau)
        : [...bureaux, bureau];
      return { ...prev, bureau: newBureaux.length > 0 ? newBureaux : undefined };
    });
  };

  const handleCriticiteToggle = (criticite: Criticite) => {
    setLocalFiltres((prev) => {
      const criticites = prev.criticite || [];
      const newCriticites = criticites.includes(criticite)
        ? criticites.filter((c) => c !== criticite)
        : [...criticites, criticite];
      return { ...prev, criticite: newCriticites.length > 0 ? newCriticites : undefined };
    });
  };

  const handleStatutToggle = (statut: string) => {
    setLocalFiltres((prev) => {
      const statuts = prev.statut || [];
      const newStatuts = statuts.includes(statut)
        ? statuts.filter((s) => s !== statut)
        : [...statuts, statut];
      return { ...prev, statut: newStatuts.length > 0 ? newStatuts : undefined };
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setLocalFiltres((prev) => ({
      ...prev,
      periode: {
        start: field === 'start' ? value : prev.periode?.start || '',
        end: field === 'end' ? value : prev.periode?.end || '',
      },
    }));
  };

  const handleApply = () => {
    setFiltres(localFiltres);
    onClose?.();
  };

  const handleReset = () => {
    resetFiltres();
    setLocalFiltres({});
    onClose?.();
  };

  const countActiveFilters = () => {
    let count = 0;
    if (localFiltres.module && localFiltres.module.length > 0) count += localFiltres.module.length;
    if (localFiltres.bureau && localFiltres.bureau.length > 0) count += localFiltres.bureau.length;
    if (localFiltres.criticite && localFiltres.criticite.length > 0) count += localFiltres.criticite.length;
    if (localFiltres.statut && localFiltres.statut.length > 0) count += localFiltres.statut.length;
    if (localFiltres.periode?.start || localFiltres.periode?.end) count += 1;
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres avancés
            {countActiveFilters() > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {countActiveFilters()}
              </Badge>
            )}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Période */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Période</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date début</label>
              <Input
                type="date"
                value={localFiltres.periode?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date fin</label>
              <Input
                type="date"
                value={localFiltres.periode?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Modules */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Modules</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODULES.map((module) => {
              const isSelected = localFiltres.module?.includes(module.id);
              return (
                <Button
                  key={module.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModuleToggle(module.id)}
                  className={cn(
                    'text-xs',
                    isSelected && 'bg-blue-500 hover:bg-blue-600'
                  )}
                >
                  {module.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Bureaux */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Bureaux</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {BUREAUX.map((bureau) => {
              const isSelected = localFiltres.bureau?.includes(bureau);
              return (
                <Button
                  key={bureau}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBureauToggle(bureau)}
                  className={cn(
                    'text-xs',
                    isSelected && 'bg-blue-500 hover:bg-blue-600'
                  )}
                >
                  {bureau}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Criticité */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Criticité</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {CRITICITES.map((criticite) => {
              const isSelected = localFiltres.criticite?.includes(criticite.id);
              return (
                <Badge
                  key={criticite.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected ? criticite.color : 'bg-slate-700/50 text-slate-400 border-slate-600'
                  )}
                  onClick={() => handleCriticiteToggle(criticite.id)}
                >
                  {criticite.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Statut */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Statut</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUTS.map((statut) => {
              const isSelected = localFiltres.statut?.includes(statut.id);
              return (
                <Button
                  key={statut.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatutToggle(statut.id)}
                  className={cn(
                    'text-xs',
                    isSelected && 'bg-blue-500 hover:bg-blue-600'
                  )}
                >
                  {statut.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button variant="default" size="sm" onClick={handleApply}>
            Appliquer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

