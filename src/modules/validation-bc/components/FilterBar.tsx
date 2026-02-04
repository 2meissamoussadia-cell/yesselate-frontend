/**
 * Barre de filtres avancés pour Validation-BC
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useValidationFilters } from '../hooks';
import type { TypeDocument, StatutDocument, Service } from '../types/validationTypes';

interface FilterBarProps {
  open?: boolean;
  onToggle?: () => void;
}

export function FilterBar({ open = false, onToggle }: FilterBarProps) {
  const { filtres, setFiltres, resetFiltres } = useValidationFilters();

  const hasActiveFilters =
    filtres.types?.length > 0 ||
    filtres.statuts?.length > 0 ||
    filtres.services?.length > 0 ||
    filtres.recherche ||
    filtres.montantMin ||
    filtres.montantMax;

  const handleTypeChange = (type: TypeDocument, checked: boolean) => {
    const currentTypes = filtres.types || [];
    setFiltres({
      ...filtres,
      types: checked
        ? [...currentTypes, type]
        : currentTypes.filter((t) => t !== type),
    });
  };

  const handleStatutChange = (statut: StatutDocument, checked: boolean) => {
    const currentStatuts = filtres.statuts || [];
    setFiltres({
      ...filtres,
      statuts: checked
        ? [...currentStatuts, statut]
        : currentStatuts.filter((s) => s !== statut),
    });
  };

  const handleServiceChange = (service: Service, checked: boolean) => {
    const currentServices = filtres.services || [];
    setFiltres({
      ...filtres,
      services: checked
        ? [...currentServices, service]
        : currentServices.filter((s) => s !== service),
    });
  };

  if (!open) {
    return (
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">Filtres</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
              {Object.values(filtres).filter(Boolean).length} actif
              {Object.values(filtres).filter(Boolean).length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-7 px-2 text-slate-400 hover:text-slate-300"
          >
            Ouvrir
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-slate-700/50 bg-slate-900/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filtres avancés</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFiltres}
              className="h-7 px-2 text-xs text-slate-400 hover:text-slate-300"
            >
              <X className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-7 px-2 text-slate-400 hover:text-slate-300"
            >
              Fermer
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recherche */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-slate-300">
            Recherche
          </Label>
          <Input
            id="search"
            placeholder="Numéro, titre, demandeur..."
            value={filtres.recherche || ''}
            onChange={(e) =>
              setFiltres({ ...filtres, recherche: e.target.value || undefined })
            }
            className="bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500"
          />
        </div>

        {/* Types */}
        <div className="space-y-2">
          <Label className="text-slate-300">Types de documents</Label>
          <div className="flex flex-col gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
            {(['BC', 'FACTURE', 'AVENANT'] as TypeDocument[]).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filtres.types?.includes(type) || false}
                  onCheckedChange={(checked) =>
                    handleTypeChange(type, checked === true)
                  }
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Statuts */}
        <div className="space-y-2">
          <Label className="text-slate-300">Statuts</Label>
          <div className="flex flex-col gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
            {(
              [
                'EN_ATTENTE',
                'VALIDE',
                'REJETE',
                'URGENT',
              ] as StatutDocument[]
            ).map((statut) => (
              <div key={statut} className="flex items-center gap-2">
                <Checkbox
                  id={`statut-${statut}`}
                  checked={filtres.statuts?.includes(statut) || false}
                  onCheckedChange={(checked) =>
                    handleStatutChange(statut, checked === true)
                  }
                />
                <label
                  htmlFor={`statut-${statut}`}
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  {statut.replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <Label className="text-slate-300">Services</Label>
          <div className="flex flex-col gap-2 p-2 bg-slate-800/50 rounded border border-slate-700/50">
            {(['ACHATS', 'FINANCE', 'JURIDIQUE', 'AUTRES'] as Service[]).map((service) => (
              <div key={service} className="flex items-center gap-2">
                <Checkbox
                  id={`service-${service}`}
                  checked={filtres.services?.includes(service) || false}
                  onCheckedChange={(checked) =>
                    handleServiceChange(service, checked === true)
                  }
                />
                <label
                  htmlFor={`service-${service}`}
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  {service}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Montant */}
        <div className="space-y-2">
          <Label className="text-slate-300">Montant</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filtres.montantMin || ''}
              onChange={(e) =>
                setFiltres({
                  ...filtres,
                  montantMin: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
            <span className="text-slate-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filtres.montantMax || ''}
              onChange={(e) =>
                setFiltres({
                  ...filtres,
                  montantMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <Label className="text-slate-300">Période</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={
                filtres.dateDebut ? filtres.dateDebut.toISOString().split('T')[0] : ''
              }
              onChange={(e) =>
                setFiltres({
                  ...filtres,
                  dateDebut: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
            <span className="text-slate-400">-</span>
            <Input
              type="date"
              value={
                filtres.dateFin ? filtres.dateFin.toISOString().split('T')[0] : ''
              }
              onChange={(e) =>
                setFiltres({
                  ...filtres,
                  dateFin: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex flex-wrap gap-2">
            {filtres.types?.map((type) => (
              <span
                key={type}
                className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs"
              >
                Type: {type}
              </span>
            ))}
            {filtres.statuts?.map((statut) => (
              <span
                key={statut}
                className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs"
              >
                Statut: {statut}
              </span>
            ))}
            {filtres.recherche && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
                Recherche: {filtres.recherche}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
