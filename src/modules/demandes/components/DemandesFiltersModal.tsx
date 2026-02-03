/**
 * Modal de filtres avancés pour Demandes
 */

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Filter, X, RotateCcw } from 'lucide-react';
import { useDemandesFilters } from '../hooks/useDemandesFilters';
import type { DemandeStatus, DemandePriority, DemandeService } from '../types/demandesTypes';

interface DemandesFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemandesFiltersModal({ isOpen, onClose }: DemandesFiltersModalProps) {
  const { filters, setFilter, resetFilters } = useDemandesFilters();

  const statusOptions: DemandeStatus[] = ['pending', 'urgent', 'validated', 'rejected', 'overdue'];
  const priorityOptions: DemandePriority[] = ['low', 'normal', 'high', 'critical'];
  const serviceOptions: DemandeService[] = ['achats', 'finance', 'juridique', 'rh', 'autre'];

  const activeCount = 
    (filters.status?.length || 0) +
    (filters.priority?.length || 0) +
    (filters.service?.length || 0) +
    (filters.dateRange ? 1 : 0) +
    (filters.search ? 1 : 0);

  const handleStatusToggle = (status: DemandeStatus) => {
    const current = filters.status || [];
    const newStatus = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    setFilter('status', newStatus.length > 0 ? newStatus : undefined);
  };

  const handlePriorityToggle = (priority: DemandePriority) => {
    const current = filters.priority || [];
    const newPriority = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    setFilter('priority', newPriority.length > 0 ? newPriority : undefined);
  };

  const handleServiceToggle = (service: DemandeService) => {
    const current = filters.service || [];
    const newService = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    setFilter('service', newService.length > 0 ? newService : undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-lg font-semibold text-slate-200">Filtres avancés</DialogTitle>
              {activeCount > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {activeCount} actif{activeCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-1">
          {/* Statut */}
          <div>
            <Label className="text-xs font-medium text-slate-400 mb-3 block">Statut</Label>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.status?.includes(status) || false}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <Label className="text-sm text-slate-300 capitalize cursor-pointer">{status}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priorité */}
          <div>
            <Label className="text-xs font-medium text-slate-400 mb-3 block">Priorité</Label>
            <div className="flex flex-wrap gap-3">
              {priorityOptions.map((priority) => (
                <div key={priority} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.priority?.includes(priority) || false}
                    onCheckedChange={() => handlePriorityToggle(priority)}
                  />
                  <Label className="text-sm text-slate-300 capitalize cursor-pointer">{priority}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Service */}
          <div>
            <Label className="text-xs font-medium text-slate-400 mb-3 block">Service</Label>
            <div className="flex flex-wrap gap-3">
              {serviceOptions.map((service) => (
                <div key={service} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.service?.includes(service) || false}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label className="text-sm text-slate-300 capitalize cursor-pointer">{service}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Recherche */}
          <div>
            <Label className="text-xs font-medium text-slate-400 mb-2 block">Recherche</Label>
            <Input
              value={filters.search || ''}
              onChange={(e) => setFilter('search', e.target.value || undefined)}
              placeholder="Rechercher par titre, référence..."
              className="bg-slate-800/50 border-slate-700 text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
          <Button size="sm" onClick={onClose}>
            Appliquer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

