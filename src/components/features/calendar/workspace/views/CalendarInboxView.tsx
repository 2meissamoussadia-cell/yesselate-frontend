'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  Filter,
  X,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Star,
  StarOff,
  RefreshCw,
  LayoutGrid,
  List,
  Columns,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  Target,
  TrendingUp,
  Bell,
  Settings,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Building2,
  Tag,
  CalendarDays,
  Timer,
  CheckSquare,
  Square,
  ArrowUpDown,
  MoreVertical,
  Send,
  Archive,
  Flag,
  Inbox,
  AlertCircle,
} from 'lucide-react';

// ================================
// Types
// ================================
type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: string;
  priority?: string;
  status?: string;
  location?: string;
  bureau?: string;
  attendees?: { name: string; role: string }[];
  hasConflict?: boolean;
  conflictWith?: string[];
  isOverdue?: boolean;
  slaStatus?: string;
  slaDueAt?: Date;
  organizerName?: string;
  recurrence?: string;
  daysUntil?: number;
  urgencyScore?: number;
};

type QueueType = 'today' | 'week' | 'month' | 'overdue' | 'conflicts' | 'completed' | 'all';
type SortField = 'start' | 'priority' | 'title' | 'status' | 'urgencyScore';
type SortDirection = 'asc' | 'desc';
type ViewLayout = 'list' | 'cards' | 'table';
type BulkAction = 'complete' | 'reschedule' | 'cancel' | 'export' | 'archive';

interface InboxFilters {
  search: string;
  category: string;
  priority: string;
  bureau: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

// ================================
// Constants
// ================================
const QUEUE_CONFIG: Record<QueueType, { title: string; icon: string; color: string; emptyMessage: string }> = {
  today: { title: "Aujourd'hui", icon: '📅', color: 'blue', emptyMessage: "Aucun événement aujourd'hui" },
  week: { title: 'Cette semaine', icon: '📆', color: 'emerald', emptyMessage: 'Aucun événement cette semaine' },
  month: { title: 'Ce mois', icon: '🗓️', color: 'indigo', emptyMessage: 'Aucun événement ce mois' },
  overdue: { title: 'En retard SLA', icon: '⏰', color: 'amber', emptyMessage: 'Aucun événement en retard — Bravo ! 🎉' },
  conflicts: { title: 'Conflits', icon: '⚠️', color: 'rose', emptyMessage: 'Aucun conflit détecté — Planning sain ✅' },
  completed: { title: 'Terminés', icon: '✅', color: 'slate', emptyMessage: 'Aucun événement terminé' },
  all: { title: 'Tous les événements', icon: '📋', color: 'slate', emptyMessage: 'Aucun événement' },
};

const CATEGORIES = [
  { id: 'all', label: 'Toutes catégories' },
  { id: 'meeting', label: 'Réunions' },
  { id: 'site_visit', label: 'Visites' },
  { id: 'deadline', label: 'Échéances' },
  { id: 'validation', label: 'Validations' },
  { id: 'payment', label: 'Paiements' },
  { id: 'absence', label: 'Absences' },
];

const PRIORITIES = [
  { id: 'all', label: 'Toutes priorités' },
  { id: 'critical', label: 'Critique' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'high', label: 'Haute' },
  { id: 'normal', label: 'Normale' },
  { id: 'low', label: 'Basse' },
];

const DEFAULT_FILTERS: InboxFilters = {
  search: '',
  category: 'all',
  priority: 'all',
  bureau: '',
  dateRange: 'all',
};

// ================================
// Helpers
// ================================
function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return date >= startOfWeek && date <= endOfWeek;
}

function isThisMonth(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return `Il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`;
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days < 7) return `Dans ${days} jours`;
  return formatDateShort(date);
}

function getCategoryColor(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'meeting': return 'bg-blue-500';
    case 'site_visit': return 'bg-emerald-500';
    case 'deadline': return 'bg-amber-500';
    case 'validation': return 'bg-purple-500';
    case 'payment': return 'bg-green-500';
    case 'absence': return 'bg-slate-400';
    default: return 'bg-indigo-500';
  }
}

function getPriorityBadge(priority?: string): { label: string; bg: string; text: string } {
  switch (priority?.toLowerCase()) {
    case 'critical': return { label: 'Critique', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' };
    case 'urgent': return { label: 'Urgent', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' };
    case 'high': return { label: 'Haute', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' };
    case 'normal': return { label: 'Normale', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' };
    case 'low': return { label: 'Basse', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
    default: return { label: 'Normale', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
  }
}

function getStatusBadge(status?: string): { label: string; bg: string; text: string; icon: React.ReactNode } {
  switch (status?.toLowerCase()) {
    case 'completed': return { label: 'Terminé', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: <CheckCircle2 className="w-3 h-3" /> };
    case 'cancelled': return { label: 'Annulé', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-400', icon: <XCircle className="w-3 h-3" /> };
    case 'in_progress': return { label: 'En cours', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: <Play className="w-3 h-3" /> };
    default: return { label: 'Planifié', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', icon: <Calendar className="w-3 h-3" /> };
  }
}

// ================================
// Component
// ================================
interface CalendarInboxViewProps {
  tabId: string;
  queue: QueueType;
}

export function CalendarInboxView({ tabId, queue }: CalendarInboxViewProps) {
  const { openTab, closeTab } = useCalendarWorkspaceStore();

  const config = QUEUE_CONFIG[queue] || QUEUE_CONFIG.all;

  // ================================
  // State
  // ================================
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sort
  const [filters, setFilters] = useState<InboxFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('start');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // View
  const [viewLayout, setViewLayout] = useState<ViewLayout>('list');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Selection & Bulk
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Starred
  const [starredEvents, setStarredEvents] = useState<Set<string>>(new Set());

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // ================================
  // Load events
  // ================================
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { calendarEvents, detectConflicts } = await import('@/lib/data/calendar');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Detect conflicts
      const conflictIds = detectConflicts(calendarEvents);
      
      // Map 'kind' to 'category'
      const categoryMap: Record<string, string> = {
        'meeting': 'meeting',
        'site-visit': 'site_visit',
        'validation': 'validation',
        'payment': 'payment',
        'deadline': 'deadline',
        'absence': 'absence',
        'contract': 'validation',
      };
      
      // Map status
      const statusMap: Record<string, string> = {
        'open': 'open',
        'done': 'completed',
        'cancelled': 'cancelled',
      };

      const mapped: CalendarEvent[] = calendarEvents.map((e: any) => {
        const start = new Date(e.start);
        const daysUntil = Math.floor((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const hasConflict = conflictIds.has(e.id);
        const slaOverdue = e.slaDueAt && new Date(e.slaDueAt).getTime() < now.getTime() && e.status === 'open';
        
        // Calculate urgency score
        let urgencyScore = 50; // base
        if (e.priority === 'critical') urgencyScore += 40;
        else if (e.priority === 'urgent') urgencyScore += 30;
        else if (e.priority === 'high') urgencyScore += 20;
        if (slaOverdue) urgencyScore += 25;
        if (hasConflict) urgencyScore += 15;
        if (daysUntil <= 0) urgencyScore += 20;
        else if (daysUntil <= 1) urgencyScore += 10;
        else if (daysUntil <= 3) urgencyScore += 5;

        return {
          id: e.id,
          title: e.title,
          description: e.description,
          start,
          end: new Date(e.end),
          category: categoryMap[e.kind] || e.kind,
          priority: e.priority || 'normal',
          status: statusMap[e.status] || e.status,
          location: e.location || '',
          bureau: e.bureau || '',
          attendees: e.assignees?.map((a: any) => ({ name: a.name, role: 'participant' })) || [],
          hasConflict,
          conflictWith: [],
          isOverdue: slaOverdue,
          slaStatus: slaOverdue ? 'overdue' : 'ok',
          slaDueAt: e.slaDueAt ? new Date(e.slaDueAt) : undefined,
          organizerName: e.assignees?.[0]?.name || '',
          recurrence: undefined,
          daysUntil,
          urgencyScore,
        };
      });

      // Filter by queue
      let filtered = mapped;
      switch (queue) {
        case 'today':
          filtered = mapped.filter(e => isSameDay(e.start, today));
          break;
        case 'week':
          filtered = mapped.filter(e => isThisWeek(e.start));
          break;
        case 'month':
          filtered = mapped.filter(e => isThisMonth(e.start));
          break;
        case 'overdue':
          filtered = mapped.filter(e => e.isOverdue);
          break;
        case 'conflicts':
          filtered = mapped.filter(e => e.hasConflict);
          break;
        case 'completed':
          filtered = mapped.filter(e => e.status === 'completed');
          break;
      }

      setEvents(filtered);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError('Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [queue]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => loadEvents(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadEvents]);

  // ================================
  // Filtered & Sorted events
  // ================================
  const processedEvents = useMemo(() => {
    let result = [...events];

    // Apply filters
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'all') {
      result = result.filter(e => e.category?.toLowerCase() === filters.category);
    }
    if (filters.priority !== 'all') {
      result = result.filter(e => e.priority?.toLowerCase() === filters.priority);
    }
    if (filters.bureau) {
      result = result.filter(e => e.bureau?.toLowerCase().includes(filters.bureau.toLowerCase()));
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'start':
          cmp = a.start.getTime() - b.start.getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 0, urgent: 1, high: 2, normal: 3, low: 4 };
          cmp = (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
                (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3);
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title, 'fr');
          break;
        case 'urgencyScore':
          cmp = (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0);
          break;
        default:
          cmp = a.start.getTime() - b.start.getTime();
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [events, filters, sortField, sortDirection]);

  // Pagination
  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedEvents.slice(start, start + pageSize);
  }, [processedEvents, page, pageSize]);

  const totalPages = Math.ceil(processedEvents.length / pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: processedEvents.length,
    critical: processedEvents.filter(e => e.priority === 'critical').length,
    urgent: processedEvents.filter(e => e.priority === 'urgent').length,
    overdue: processedEvents.filter(e => e.isOverdue).length,
    conflicts: processedEvents.filter(e => e.hasConflict).length,
    starred: starredEvents.size,
  }), [processedEvents, starredEvents]);

  // Bureau options
  const bureauOptions = useMemo(() => {
    const bureaus = new Set<string>();
    events.forEach(e => { if (e.bureau) bureaus.add(e.bureau); });
    return Array.from(bureaus).sort();
  }, [events]);

  // ================================
  // Actions
  // ================================
  const handleOpenEvent = useCallback((event: CalendarEvent) => {
    openTab({
      id: `event:${event.id}`,
      type: 'viewer',
      title: event.title,
      icon: '📅',
      data: { eventId: event.id },
    });
  }, [openTab]);

  const toggleEventSelection = useCallback((eventId: string) => {
    setSelectedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedEvents(new Set(paginatedEvents.map(e => e.id)));
  }, [paginatedEvents]);

  const clearSelection = useCallback(() => {
    setSelectedEvents(new Set());
  }, []);

  const toggleStar = useCallback((eventId: string) => {
    setStarredEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleBulkAction = useCallback(async (action: BulkAction) => {
    setBulkProcessing(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      
      // TODO: Implement actual bulk actions
      console.log(`Bulk action ${action} on ${selectedEvents.size} events`);
      
      clearSelection();
      setBulkActionModalOpen(false);
      loadEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkProcessing(false);
    }
  }, [selectedEvents, clearSelection, loadEvents]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.bureau) count++;
    return count;
  }, [filters]);

  // ================================
  // Render
  // ================================
  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
      {/* ============================================
          HEADER
      ============================================ */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{config.title}</h2>
              <p className="text-sm text-slate-400">
                {processedEvents.length} événement{processedEvents.length !== 1 ? 's' : ''}
                {activeFiltersCount > 0 && ` (filtrés)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats badges */}
            <div className="hidden lg:flex items-center gap-2 mr-2">
              {stats.critical > 0 && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                  {stats.critical} critiques
                </span>
              )}
              {stats.overdue > 0 && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  {stats.overdue} retards
                </span>
              )}
              {stats.conflicts > 0 && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-600">
                  {stats.conflicts} conflits
                </span>
              )}
            </div>

            {/* View toggle */}
            <div className="hidden md:flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                className={cn("p-2 transition-colors", viewLayout === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-100')}
                onClick={() => setViewLayout('list')}
                title="Liste"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                className={cn("p-2 transition-colors", viewLayout === 'cards' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-100')}
                onClick={() => setViewLayout('cards')}
                title="Cartes"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                className={cn("p-2 transition-colors", viewLayout === 'table' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-100')}
                onClick={() => setViewLayout('table')}
                title="Tableau"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            {/* Filter button */}
            <FluentButton
              size="sm"
              variant={activeFiltersCount > 0 ? 'warning' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-500 text-white">
                  {activeFiltersCount}
                </span>
              )}
            </FluentButton>

            {/* Refresh */}
            <FluentButton size="sm" variant="secondary" onClick={loadEvents} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </FluentButton>

            {/* Export */}
            <FluentButton size="sm" variant="secondary">
              <Download className="w-4 h-4" />
            </FluentButton>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Category */}
              <select
                value={filters.category}
                onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              {/* Priority */}
              <select
                value={filters.priority}
                onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>

              {/* Bureau */}
              <select
                value={filters.bureau}
                onChange={e => setFilters(f => ({ ...f, bureau: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
              >
                <option value="">Tous les bureaux</option>
                {bureauOptions.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Reset */}
              {activeFiltersCount > 0 && (
                <FluentButton size="sm" variant="secondary" onClick={resetFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Réinitialiser
                </FluentButton>
              )}
            </div>
          </div>
        )}

        {/* Bulk actions bar */}
        {selectedEvents.size > 0 && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selectedEvents.size} sélectionné{selectedEvents.size > 1 ? 's' : ''}
              </span>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={selectAll}
              >
                Tout sélectionner ({paginatedEvents.length})
              </button>
            </div>
            <div className="flex items-center gap-2">
              <FluentButton
                size="sm"
                variant="secondary"
                onClick={() => { setBulkAction('complete'); setBulkActionModalOpen(true); }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Terminer
              </FluentButton>
              <FluentButton
                size="sm"
                variant="secondary"
                onClick={() => { setBulkAction('reschedule'); setBulkActionModalOpen(true); }}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Replanifier
              </FluentButton>
              <FluentButton
                size="sm"
                variant="secondary"
                onClick={() => { setBulkAction('export'); setBulkActionModalOpen(true); }}
              >
                <Download className="w-4 h-4 mr-1" />
                Exporter
              </FluentButton>
              <FluentButton size="sm" variant="secondary" onClick={clearSelection}>
                <X className="w-4 h-4" />
              </FluentButton>
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          CONTENT
      ============================================ */}
      <div className="flex-1 overflow-auto">
        {loading && !events.length ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-slate-400">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">{error}</p>
              <FluentButton size="sm" variant="secondary" onClick={loadEvents} className="mt-3">
                Réessayer
              </FluentButton>
            </div>
          </div>
        ) : processedEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Inbox className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">{config.emptyMessage}</p>
              {activeFiltersCount > 0 && (
                <FluentButton size="sm" variant="secondary" onClick={resetFilters} className="mt-2">
                  Réinitialiser les filtres
                </FluentButton>
              )}
            </div>
          </div>
        ) : viewLayout === 'list' ? (
          /* LIST VIEW */
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedEvents.map(event => (
              <div
                key={event.id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                  selectedEvents.has(event.id) && "bg-blue-50 dark:bg-blue-900/20",
                  event.priority === 'critical' && "border-l-4 border-l-rose-500",
                  event.priority === 'urgent' && "border-l-4 border-l-amber-500"
                )}
              >
                {/* Checkbox */}
                <button
                  className="flex-shrink-0"
                  onClick={e => { e.stopPropagation(); toggleEventSelection(event.id); }}
                >
                  {selectedEvents.has(event.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300" />
                  )}
                </button>

                {/* Star */}
                <button
                  className="flex-shrink-0"
                  onClick={e => { e.stopPropagation(); toggleStar(event.id); }}
                >
                  {starredEvents.has(event.id) ? (
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                  ) : (
                    <Star className="w-5 h-5 text-slate-300 hover:text-amber-400" />
                  )}
                </button>

                {/* Category dot */}
                <span className={cn("w-3 h-3 rounded-full flex-shrink-0", getCategoryColor(event.category))} />

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={() => handleOpenEvent(event)}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {event.title}
                    </span>
                    {event.hasConflict && (
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    {event.isOverdue && (
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateShort(event.start)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(event.start)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusBadge(event.status).bg, getStatusBadge(event.status).text)}>
                    {getStatusBadge(event.status).label}
                  </span>
                  {event.priority && event.priority !== 'normal' && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityBadge(event.priority).bg, getPriorityBadge(event.priority).text)}>
                      {getPriorityBadge(event.priority).label}
                    </span>
                  )}
                </div>

                {/* Relative date */}
                <div className="hidden md:block text-sm text-slate-400 flex-shrink-0 w-24 text-right">
                  {formatRelativeDate(event.start)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600"
                    onClick={e => { e.stopPropagation(); handleOpenEvent(event); }}
                    title="Ouvrir"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : viewLayout === 'cards' ? (
          /* CARDS VIEW */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedEvents.map(event => (
              <div
                key={event.id}
                className={cn(
                  "p-4 rounded-xl border bg-white dark:bg-slate-800 transition-all cursor-pointer",
                  "hover:shadow-lg border-slate-200 dark:border-slate-700",
                  selectedEvents.has(event.id) && "ring-2 ring-blue-500",
                  event.priority === 'critical' && "border-l-4 border-l-rose-500",
                  event.priority === 'urgent' && "border-l-4 border-l-amber-500"
                )}
                onClick={() => handleOpenEvent(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-3 h-3 rounded-full", getCategoryColor(event.category))} />
                    <span className="font-semibold truncate">{event.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); toggleStar(event.id); }}
                    >
                      {starredEvents.has(event.id) ? (
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      ) : (
                        <Star className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); toggleEventSelection(event.id); }}
                    >
                      {selectedEvents.has(event.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateShort(event.start)} • {formatTime(event.start)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees.length} participant{event.attendees.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", getStatusBadge(event.status).bg, getStatusBadge(event.status).text)}>
                    {getStatusBadge(event.status).icon}
                    {getStatusBadge(event.status).label}
                  </span>
                  {event.hasConflict && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Conflit
                    </span>
                  )}
                  {event.isOverdue && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Retard
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEvents.size === paginatedEvents.length && paginatedEvents.length > 0}
                      onChange={e => e.target.checked ? selectAll() : clearSelection()}
                      className="rounded"
                    />
                  </th>
                  <th className="w-10 px-2"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    <button className="flex items-center gap-1" onClick={() => handleSort('title')}>
                      Événement
                      {sortField === 'title' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    <button className="flex items-center gap-1" onClick={() => handleSort('start')}>
                      Date
                      {sortField === 'start' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Lieu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                    <button className="flex items-center gap-1" onClick={() => handleSort('priority')}>
                      Priorité
                      {sortField === 'priority' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Alertes</th>
                  <th className="w-10 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedEvents.map(event => (
                  <tr
                    key={event.id}
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer",
                      selectedEvents.has(event.id) && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => handleOpenEvent(event)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                        onClick={e => e.stopPropagation()}
                        className="rounded"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <button onClick={e => { e.stopPropagation(); toggleStar(event.id); }}>
                        {starredEvents.has(event.id) ? (
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                        ) : (
                          <Star className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full", getCategoryColor(event.category))} />
                        <span className="font-medium text-slate-800 dark:text-slate-100">{event.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      <div>{formatDateShort(event.start)}</div>
                      <div className="text-xs">{formatTime(event.start)} - {formatTime(event.end)}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 truncate max-w-[150px]">
                      {event.location || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {event.priority && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityBadge(event.priority).bg, getPriorityBadge(event.priority).text)}>
                          {getPriorityBadge(event.priority).label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1 w-fit", getStatusBadge(event.status).bg, getStatusBadge(event.status).text)}>
                        {getStatusBadge(event.status).icon}
                        {getStatusBadge(event.status).label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {event.hasConflict && <AlertTriangle className="w-4 h-4 text-rose-500" title="Conflit" />}
                        {event.isOverdue && <Clock className="w-4 h-4 text-amber-500" title="Retard SLA" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600"
                        onClick={e => { e.stopPropagation(); handleOpenEvent(event); }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================
          FOOTER / PAGINATION
      ============================================ */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 px-4 py-2 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Page {page} sur {totalPages} • {processedEvents.length} résultats
          </div>
          <div className="flex items-center gap-2">
            <FluentButton
              size="sm"
              variant="secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </FluentButton>
            <FluentButton
              size="sm"
              variant="secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </FluentButton>
          </div>
        </div>
      )}

      {/* ============================================
          BULK ACTION MODAL
      ============================================ */}
      <FluentModal
        open={bulkActionModalOpen}
        title={`Action groupée - ${selectedEvents.size} événement${selectedEvents.size > 1 ? 's' : ''}`}
        onClose={() => setBulkActionModalOpen(false)}
      >
        <div className="space-y-4">
          {bulkAction === 'complete' && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Vous êtes sur le point de marquer {selectedEvents.size} événement{selectedEvents.size > 1 ? 's' : ''} comme terminé{selectedEvents.size > 1 ? 's' : ''}.
            </p>
          )}
          {bulkAction === 'reschedule' && (
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Sélectionnez une nouvelle date pour {selectedEvents.size} événement{selectedEvents.size > 1 ? 's' : ''}.
              </p>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          )}
          {bulkAction === 'export' && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Exporter {selectedEvents.size} événement{selectedEvents.size > 1 ? 's' : ''} au format iCal.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setBulkActionModalOpen(false)}>
              Annuler
            </FluentButton>
            <FluentButton
              size="sm"
              variant="primary"
              onClick={() => handleBulkAction(bulkAction!)}
              disabled={bulkProcessing}
            >
              {bulkProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  En cours...
                </>
              ) : (
                'Confirmer'
              )}
            </FluentButton>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

export default CalendarInboxView;
