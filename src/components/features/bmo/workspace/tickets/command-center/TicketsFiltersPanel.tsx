/**
 * Panneau de filtres avancés pour Tickets
 * Filtres sauvegardables, recherche avancée, tags
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';
import { logger } from '@/lib/utils/logger';
import { ticketsApi, type TicketPriority, type TicketStatus, type TicketCategory } from '@/lib/services/ticketsApiService';
import {
  X,
  Filter,
  Search,
  Star,
  Calendar,
  User,
  Building2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Trash2,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

// Type exporté pour compatibilité avec la page
export interface TicketsActiveFilters {
  status: TicketStatus[];
  priority: TicketPriority[];
  category: TicketCategory[];
  assigneeId: string | null;
  clientId: string | null;
  tags: string[];
  slaBreached: boolean | null;
  unassigned: boolean | null;
  vipOnly: boolean;
  dateFrom: string;
  dateTo: string;
  search: string;
}

interface FilterState {
  status: TicketStatus[];
  priority: TicketPriority[];
  category: TicketCategory[];
  assigneeId: string | null;
  clientId: string | null;
  tags: string[];
  slaBreached: boolean | null;
  unassigned: boolean | null;
  vipOnly: boolean;
  dateFrom: string;
  dateTo: string;
  search: string;
}

// Utilitaire pour compter les filtres actifs
export function countActiveTicketsFilters(filters: TicketsActiveFilters): number {
  let count = 0;
  count += filters.status?.length || 0;
  count += filters.priority?.length || 0;
  count += filters.category?.length || 0;
  if (filters.assigneeId) count++;
  if (filters.clientId) count++;
  count += filters.tags?.length || 0;
  if (filters.slaBreached !== null) count++;
  if (filters.unassigned !== null) count++;
  if (filters.vipOnly) count++;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.search) count++;
  return count;
}

const defaultFilters: FilterState = {
  status: [],
  priority: [],
  category: [],
  assigneeId: null,
  clientId: null,
  tags: [],
  slaBreached: null,
  unassigned: null,
  vipOnly: false,
  dateFrom: '',
  dateTo: '',
  search: '',
};

export function TicketsFiltersPanel() {
  const { filtersPanelOpen, toggleFiltersPanel } = useTicketsWorkspaceStore();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status', 'priority']));
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string }>>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load data
  useEffect(() => {
    Promise.all([
      ticketsApi.getAssignees(),
      ticketsApi.getClients(),
    ]).then(([agts, clts]) => {
      setAssignees(agts.map(a => ({ id: a.id, name: a.name })));
      setClients(clts.map(c => ({ id: c.id, name: c.name })));
      setAvailableTags(['urgent', 'vip', 'escalade', 'remboursement', 'technique', 'facturation', 'contrat', 'livraison', 'qualite']);
    });
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K] extends Array<infer T> ? T : never
  ) => {
    setFilters(prev => {
      const arr = prev[key] as any[];
      return {
        ...prev,
        [key]: arr.includes(value) 
          ? arr.filter(v => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleApply = () => {
    logger.debug('Applying filters', { component: 'TicketsFiltersPanel', filters });
    // TODO: Apply filters to the ticket list
    toggleFiltersPanel();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.category.length > 0 ||
      filters.assigneeId !== null ||
      filters.clientId !== null ||
      filters.tags.length > 0 ||
      filters.slaBreached !== null ||
      filters.unassigned !== null ||
      filters.vipOnly ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.search !== ''
    );
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.status.length > 0) count += filters.status.length;
    if (filters.priority.length > 0) count += filters.priority.length;
    if (filters.category.length > 0) count += filters.category.length;
    if (filters.assigneeId) count++;
    if (filters.clientId) count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    if (filters.slaBreached !== null) count++;
    if (filters.unassigned !== null) count++;
    if (filters.vipOnly) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.search) count++;
    return count;
  };

  if (!filtersPanelOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={toggleFiltersPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-100">Filtres</h2>
            {hasActiveFilters() && (
              <Badge variant="default" className="text-xs">
                {activeFiltersCount()}
              </Badge>
            )}
          </div>
          <button
            onClick={toggleFiltersPanel}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Recherche
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Rechercher dans les tickets..."
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Status Section */}
          <FilterSection
            title="Statut"
            icon={CheckCircle2}
            expanded={expandedSections.has('status')}
            onToggle={() => toggleSection('status')}
            count={filters.status.length}
          >
            <div className="space-y-2">
              {(['open', 'in_progress', 'pending', 'resolved', 'closed'] as TicketStatus[]).map(status => (
                <FilterCheckbox
                  key={status}
                  label={statusLabels[status]}
                  checked={filters.status.includes(status)}
                  onChange={() => toggleArrayFilter('status', status)}
                  color={statusColors[status]}
                />
              ))}
            </div>
          </FilterSection>

          {/* Priority Section */}
          <FilterSection
            title="Priorité"
            icon={AlertCircle}
            expanded={expandedSections.has('priority')}
            onToggle={() => toggleSection('priority')}
            count={filters.priority.length}
          >
            <div className="space-y-2">
              {(['critical', 'high', 'medium', 'low'] as TicketPriority[]).map(priority => (
                <FilterCheckbox
                  key={priority}
                  label={priorityLabels[priority]}
                  checked={filters.priority.includes(priority)}
                  onChange={() => toggleArrayFilter('priority', priority)}
                  color={priorityColors[priority]}
                />
              ))}
            </div>
          </FilterSection>

          {/* Category Section */}
          <FilterSection
            title="Catégorie"
            icon={Tag}
            expanded={expandedSections.has('category')}
            onToggle={() => toggleSection('category')}
            count={filters.category.length}
          >
            <div className="space-y-2">
              {(['technique', 'commercial', 'facturation', 'livraison', 'qualite', 'autre'] as TicketCategory[]).map(cat => (
                <FilterCheckbox
                  key={cat}
                  label={categoryLabels[cat]}
                  checked={filters.category.includes(cat)}
                  onChange={() => toggleArrayFilter('category', cat)}
                />
              ))}
            </div>
          </FilterSection>

          {/* Assignee Section */}
          <FilterSection
            title="Assigné à"
            icon={User}
            expanded={expandedSections.has('assignee')}
            onToggle={() => toggleSection('assignee')}
            count={filters.assigneeId ? 1 : 0}
          >
            <select
              value={filters.assigneeId || ''}
              onChange={e => setFilters(prev => ({ ...prev, assigneeId: e.target.value || null }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">Tous les agents</option>
              {assignees.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <FilterCheckbox
              label="Non assignés uniquement"
              checked={filters.unassigned === true}
              onChange={() => setFilters(prev => ({ 
                ...prev, 
                unassigned: prev.unassigned ? null : true,
                assigneeId: null,
              }))}
            />
          </FilterSection>

          {/* Client Section */}
          <FilterSection
            title="Client"
            icon={Building2}
            expanded={expandedSections.has('client')}
            onToggle={() => toggleSection('client')}
            count={filters.clientId || filters.vipOnly ? 1 : 0}
          >
            <select
              value={filters.clientId || ''}
              onChange={e => setFilters(prev => ({ ...prev, clientId: e.target.value || null }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">Tous les clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <FilterCheckbox
              label="Clients VIP uniquement"
              checked={filters.vipOnly}
              onChange={() => setFilters(prev => ({ ...prev, vipOnly: !prev.vipOnly }))}
              icon={<Star className="w-3 h-3 text-amber-400" />}
            />
          </FilterSection>

          {/* SLA Section */}
          <FilterSection
            title="SLA"
            icon={Clock}
            expanded={expandedSections.has('sla')}
            onToggle={() => toggleSection('sla')}
            count={filters.slaBreached !== null ? 1 : 0}
          >
            <div className="space-y-2">
              <FilterCheckbox
                label="SLA dépassés"
                checked={filters.slaBreached === true}
                onChange={() => setFilters(prev => ({ 
                  ...prev, 
                  slaBreached: prev.slaBreached === true ? null : true 
                }))}
                color="rose"
              />
              <FilterCheckbox
                label="SLA conformes"
                checked={filters.slaBreached === false}
                onChange={() => setFilters(prev => ({ 
                  ...prev, 
                  slaBreached: prev.slaBreached === false ? null : false 
                }))}
                color="emerald"
              />
            </div>
          </FilterSection>

          {/* Tags Section */}
          <FilterSection
            title="Tags"
            icon={Tag}
            expanded={expandedSections.has('tags')}
            onToggle={() => toggleSection('tags')}
            count={filters.tags.length}
          >
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleArrayFilter('tags', tag)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md border transition-all',
                    filters.tags.includes(tag)
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Date Range Section */}
          <FilterSection
            title="Période"
            icon={Calendar}
            expanded={expandedSections.has('date')}
            onToggle={() => toggleSection('date')}
            count={filters.dateFrom || filters.dateTo ? 1 : 0}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Du</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Au</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="w-full gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Réinitialiser
            </Button>
          )}
          <Button
            onClick={handleApply}
            className="w-full gap-2 bg-purple-600 hover:bg-purple-500"
          >
            <Filter className="w-4 h-4" />
            Appliquer les filtres
            {hasActiveFilters() && ` (${activeFiltersCount()})`}
          </Button>
        </div>
      </div>
    </>
  );
}

// Helper Components
interface FilterSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}

function FilterSection({ title, icon: Icon, expanded, onToggle, count, children }: FilterSectionProps) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-slate-200">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge variant="default" className="text-xs">
              {count}
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="p-3 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  color?: 'rose' | 'amber' | 'blue' | 'emerald' | 'purple' | 'slate';
  icon?: React.ReactNode;
}

function FilterCheckbox({ label, checked, onChange, color = 'purple', icon }: FilterCheckboxProps) {
  const colors = {
    rose: 'border-rose-500 bg-rose-500',
    amber: 'border-amber-500 bg-amber-500',
    blue: 'border-blue-500 bg-blue-500',
    emerald: 'border-emerald-500 bg-emerald-500',
    purple: 'border-purple-500 bg-purple-500',
    slate: 'border-slate-500 bg-slate-500',
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className={cn(
        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
        checked ? colors[color] : 'border-slate-600 group-hover:border-slate-500'
      )}>
        {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className="text-sm text-slate-300 group-hover:text-slate-200 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </label>
  );
}

// Labels & Colors
const statusLabels: Record<TicketStatus, string> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  pending: 'En attente',
  resolved: 'Résolu',
  closed: 'Fermé',
};

const statusColors: Record<TicketStatus, 'blue' | 'purple' | 'amber' | 'emerald' | 'slate'> = {
  open: 'blue',
  in_progress: 'purple',
  pending: 'amber',
  resolved: 'emerald',
  closed: 'slate',
};

const priorityLabels: Record<TicketPriority, string> = {
  critical: 'Critique',
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
};

const priorityColors: Record<TicketPriority, 'rose' | 'amber' | 'blue' | 'slate'> = {
  critical: 'rose',
  high: 'amber',
  medium: 'blue',
  low: 'slate',
};

const categoryLabels: Record<TicketCategory, string> = {
  technique: 'Technique',
  commercial: 'Commercial',
  facturation: 'Facturation',
  livraison: 'Livraison',
  qualite: 'Qualité',
  autre: 'Autre',
};

