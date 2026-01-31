'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Maximize2,
  Minimize2,
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
  links?: { type: string; ref: string; title: string }[];
};

type DayCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
};

type ViewMode = 'month' | 'week' | 'day' | 'agenda';
type FilterCategory = 'all' | 'meeting' | 'site_visit' | 'deadline' | 'validation' | 'payment' | 'absence';
type FilterPriority = 'all' | 'critical' | 'urgent' | 'high' | 'normal' | 'low';
type FilterStatus = 'all' | 'open' | 'in_progress' | 'completed' | 'cancelled';
type SortField = 'start' | 'priority' | 'category' | 'title';
type SortDirection = 'asc' | 'desc';

interface ActiveFilters {
  category: FilterCategory;
  priority: FilterPriority;
  status: FilterStatus;
  bureau: string;
  search: string;
  showConflictsOnly: boolean;
  showOverdueOnly: boolean;
}

interface MonthStats {
  total: number;
  byCategory: Record<string, number>;
  conflicts: number;
  overdue: number;
  completed: number;
  upcoming: number;
}

// ================================
// Constants
// ================================
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_FULL_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const CATEGORIES = [
  { id: 'all', label: 'Toutes', color: 'bg-slate-500' },
  { id: 'meeting', label: 'Réunions', color: 'bg-blue-500' },
  { id: 'site_visit', label: 'Visites', color: 'bg-emerald-500' },
  { id: 'deadline', label: 'Échéances', color: 'bg-amber-500' },
  { id: 'validation', label: 'Validations', color: 'bg-purple-500' },
  { id: 'payment', label: 'Paiements', color: 'bg-green-500' },
  { id: 'absence', label: 'Absences', color: 'bg-slate-400' },
];

const PRIORITIES = [
  { id: 'all', label: 'Toutes' },
  { id: 'critical', label: 'Critique', color: 'rose' },
  { id: 'urgent', label: 'Urgent', color: 'amber' },
  { id: 'high', label: 'Haute', color: 'orange' },
  { id: 'normal', label: 'Normal', color: 'blue' },
  { id: 'low', label: 'Basse', color: 'slate' },
];

const DEFAULT_FILTERS: ActiveFilters = {
  category: 'all',
  priority: 'all',
  status: 'all',
  bureau: '',
  search: '',
  showConflictsOnly: false,
  showOverdueOnly: false,
};

// ================================
// Helpers
// ================================
function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function getMonthDays(year: number, month: number, selectedDate: Date | null): DayCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: DayCell[] = [];

  const prevMonthLastDay = new Date(year, month, 0);
  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      events: [],
    });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      events: [],
    });
  }

  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      events: [],
    });
  }

  return days;
}

function getCategoryColor(category?: string): string {
  const cat = CATEGORIES.find(c => c.id === category?.toLowerCase());
  return cat?.color || 'bg-indigo-500';
}

function getCategoryLabel(category?: string): string {
  const cat = CATEGORIES.find(c => c.id === category?.toLowerCase());
  return cat?.label || category || 'Autre';
}

function getPriorityColor(priority?: string): string {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'border-l-4 border-l-rose-500';
    case 'urgent': return 'border-l-4 border-l-amber-500';
    case 'high': return 'border-l-4 border-l-orange-500';
    default: return '';
  }
}

function getStatusBadge(status?: string): { label: string; bg: string; text: string } {
  switch (status?.toLowerCase()) {
    case 'completed': return { label: 'Terminé', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' };
    case 'cancelled': return { label: 'Annulé', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-400' };
    case 'in_progress': return { label: 'En cours', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' };
    default: return { label: 'Planifié', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// ================================
// Pinned dates (localStorage)
// ================================
const LS_PINNED_DATES = 'bmo.calendar.pinnedDates.v1';

function readPinnedDates(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_PINNED_DATES);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function writePinnedDates(dates: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PINNED_DATES, JSON.stringify(dates.slice(0, 20)));
  } catch {}
}

// ================================
// Sub-components
// ================================
const ActionLabel = ({ icon, text, right }: { icon?: React.ReactNode; text: React.ReactNode; right?: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 whitespace-nowrap leading-none">
    {icon}
    <span className="leading-none">{text}</span>
    {right}
  </span>
);

const CountChip = ({ v, color = 'default' }: { v: number; color?: 'default' | 'rose' | 'amber' | 'emerald' }) => {
  const colors = {
    default: 'bg-white/10 dark:bg-black/20 border-slate-200/20 dark:border-slate-700/40',
    rose: 'bg-rose-500/20 border-rose-500/30 text-rose-600',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-600',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600',
  };
  return (
    <span className={cn("ml-1 px-2 py-0.5 rounded-full text-xs border", colors[color])}>
      {v}
    </span>
  );
};

// ================================
// Component
// ================================
interface CalendarMonthViewProps {
  tabId?: string;
}

export function CalendarMonthView({ tabId }: CalendarMonthViewProps) {
  const { openTab } = useCalendarWorkspaceStore();

  // ================================
  // State
  // ================================
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // View
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [expandedDay, setExpandedDay] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Selection & Bulk actions
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Pinned dates
  const [pinnedDates, setPinnedDates] = useState<string[]>([]);

  // Modals
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<CalendarEvent | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ================================
  // Load events
  // ================================
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { calendarEvents, detectConflicts } = await import('@/lib/data/calendar');
      
      // Detect conflicts
      const conflictIds = detectConflicts(calendarEvents);
      const now = Date.now();

      const mapped: CalendarEvent[] = calendarEvents.map((e: any) => {
        const hasConflict = conflictIds.has(e.id);
        const slaOverdue = e.slaDueAt && new Date(e.slaDueAt).getTime() < now && e.status === 'open';
        
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

        return {
          id: e.id,
          title: e.title,
          description: e.description,
          start: new Date(e.start),
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
          links: e.linkedTo ? [{ type: e.linkedTo.type, ref: e.linkedTo.id, title: e.linkedTo.label }] : [],
        };
      });

      setEvents(mapped);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError('Erreur lors du chargement des événements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => loadEvents(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadEvents]);

  // Load pinned dates
  useEffect(() => {
    setPinnedDates(readPinnedDates());
  }, []);

  useEffect(() => {
    writePinnedDates(pinnedDates);
  }, [pinnedDates]);

  // ================================
  // Filtered events
  // ================================
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filters.category !== 'all' && e.category?.toLowerCase() !== filters.category) return false;
      if (filters.priority !== 'all' && e.priority?.toLowerCase() !== filters.priority) return false;
      if (filters.status !== 'all' && e.status?.toLowerCase() !== filters.status) return false;
      if (filters.bureau && e.bureau?.toLowerCase() !== filters.bureau.toLowerCase()) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q)) return false;
      }
      if (filters.showConflictsOnly && !e.hasConflict) return false;
      if (filters.showOverdueOnly && !e.isOverdue) return false;
      return true;
    });
  }, [events, filters]);

  // ================================
  // Month stats
  // ================================
  const monthStats = useMemo<MonthStats>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthEvents = filteredEvents.filter(e =>
      e.start.getFullYear() === year && e.start.getMonth() === month
    );

    const byCategory: Record<string, number> = {};
    monthEvents.forEach(e => {
      const cat = e.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return {
      total: monthEvents.length,
      byCategory,
      conflicts: monthEvents.filter(e => e.hasConflict).length,
      overdue: monthEvents.filter(e => e.isOverdue).length,
      completed: monthEvents.filter(e => e.status === 'completed').length,
      upcoming: monthEvents.filter(e => e.start > new Date()).length,
    };
  }, [currentDate, filteredEvents]);

  // ================================
  // Days with events
  // ================================
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayCells = getMonthDays(year, month, selectedDate);

    return dayCells.map(day => {
      const dayEvents = filteredEvents.filter(e => isSameDay(e.start, day.date));
      return { ...day, events: dayEvents };
    });
  }, [currentDate, filteredEvents, selectedDate]);

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter(e => isSameDay(e.start, selectedDate));
  }, [selectedDate, filteredEvents]);

  // ================================
  // Actions
  // ================================
  const goToPrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(prev => prev && isSameDay(prev, date) ? null : date);
    setSelectedEvents(new Set());
  }, []);

  const handleQuickCreate = useCallback((date: Date) => {
    setQuickCreateDate(date);
    setQuickCreateOpen(true);
  }, []);

  const handleCreateEvent = useCallback((date?: Date) => {
    openTab({
      id: `wizard:create:${Date.now()}`,
      type: 'wizard',
      title: 'Nouvel événement',
      icon: '➕',
      data: {
        action: 'create',
        prefillDate: date?.toISOString(),
      },
    });
    setQuickCreateOpen(false);
  }, [openTab]);

  const handleOpenEvent = useCallback((event: CalendarEvent) => {
    openTab({
      id: `event:${event.id}`,
      type: 'viewer',
      title: event.title,
      icon: '📅',
      data: { eventId: event.id },
    });
  }, [openTab]);

  const handleViewEventDetail = useCallback((event: CalendarEvent) => {
    setSelectedEventDetail(event);
    setEventDetailOpen(true);
  }, []);

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

  const selectAllDayEvents = useCallback(() => {
    setSelectedEvents(new Set(selectedDayEvents.map(e => e.id)));
  }, [selectedDayEvents]);

  const clearSelection = useCallback(() => {
    setSelectedEvents(new Set());
  }, []);

  const togglePinDate = useCallback((dateStr: string) => {
    setPinnedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      }
      return [dateStr, ...prev].slice(0, 20);
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.bureau) count++;
    if (filters.search) count++;
    if (filters.showConflictsOnly) count++;
    if (filters.showOverdueOnly) count++;
    return count;
  }, [filters]);

  // Get unique bureaus from events
  const bureauOptions = useMemo(() => {
    const bureaus = new Set<string>();
    events.forEach(e => {
      if (e.bureau) bureaus.add(e.bureau);
    });
    return Array.from(bureaus).sort();
  }, [events]);

  // ================================
  // Render
  // ================================
  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
      {/* ============================================
          HEADER
      ============================================ */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <FluentButton size="sm" variant="secondary" onClick={goToPrevMonth} title="Mois précédent">
                <ChevronLeft className="w-4 h-4" />
              </FluentButton>
              <FluentButton size="sm" variant="secondary" onClick={goToNextMonth} title="Mois suivant">
                <ChevronRight className="w-4 h-4" />
              </FluentButton>
            </div>

            {/* Month title */}
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {MONTHS_FR[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <FluentButton size="sm" variant="secondary" onClick={goToToday}>
              Aujourd&apos;hui
            </FluentButton>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats badges */}
            <div className="hidden lg:flex items-center gap-2 mr-4">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {monthStats.total} événements
              </span>
              {monthStats.conflicts > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {monthStats.conflicts} conflits
                </span>
              )}
              {monthStats.overdue > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {monthStats.overdue} retards
                </span>
              )}
            </div>

            {/* View mode */}
            <div className="hidden md:flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === 'month' ? 'bg-blue-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800')}
                onClick={() => setViewMode('month')}
              >
                Mois
              </button>
              <button
                className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === 'agenda' ? 'bg-blue-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800')}
                onClick={() => setViewMode('agenda')}
              >
                Agenda
              </button>
            </div>

            {/* Filter button */}
            <FluentButton
              size="sm"
              variant={activeFiltersCount > 0 ? 'warning' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Filtres</span>
              {activeFiltersCount > 0 && <CountChip v={activeFiltersCount} color="amber" />}
            </FluentButton>

            {/* Refresh */}
            <FluentButton size="sm" variant="secondary" onClick={loadEvents} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </FluentButton>

            {/* Export */}
            <FluentButton size="sm" variant="secondary" onClick={() => setExportOpen(true)}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Export</span>
            </FluentButton>

            {/* New event */}
            <FluentButton size="sm" variant="primary" onClick={() => handleCreateEvent()}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Nouveau</span>
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
                onChange={e => setFilters(f => ({ ...f, category: e.target.value as FilterCategory }))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              {/* Priority */}
              <select
                value={filters.priority}
                onChange={e => setFilters(f => ({ ...f, priority: e.target.value as FilterPriority }))}
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

              {/* Quick filters */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showConflictsOnly}
                  onChange={e => setFilters(f => ({ ...f, showConflictsOnly: e.target.checked }))}
                  className="rounded"
                />
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Conflits
                </span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showOverdueOnly}
                  onChange={e => setFilters(f => ({ ...f, showOverdueOnly: e.target.checked }))}
                  className="rounded"
                />
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  Retards
                </span>
              </label>

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

        {/* Pinned dates */}
        {pinnedDates.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto">
            <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs text-slate-400 flex-shrink-0">Épinglées:</span>
            {pinnedDates.map(dateStr => {
              const d = new Date(dateStr);
              return (
                <button
                  key={dateStr}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  onClick={() => {
                    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                    setSelectedDate(d);
                  }}
                >
                  <span>{d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                  <X
                    className="w-3 h-3 text-slate-400 hover:text-rose-500"
                    onClick={e => { e.stopPropagation(); togglePinDate(dateStr); }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================
          MAIN CONTENT
      ============================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar grid */}
        <div className={cn("flex-1 flex flex-col overflow-hidden", selectedDate && !isCompact ? 'lg:w-2/3' : 'w-full')}>
          {loading && !events.length ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-slate-400">Chargement du calendrier...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400">{error}</p>
                <FluentButton size="sm" variant="secondary" onClick={loadEvents} className="mt-3">
                  Réessayer
                </FluentButton>
              </div>
            </div>
          ) : viewMode === 'agenda' ? (
            /* Agenda view */
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-3">
                {filteredEvents
                  .filter(e => e.start >= new Date())
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 50)
                  .map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        "p-4 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer",
                        getPriorityColor(event.priority)
                      )}
                      onClick={() => handleOpenEvent(event)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("w-2 h-2 rounded-full", getCategoryColor(event.category))} />
                            <span className="font-medium truncate">{event.title}</span>
                            {event.hasConflict && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                            {event.isOverdue && <Clock className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {event.start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(event.start)} - {formatTime(event.end)}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={cn("text-xs px-2 py-1 rounded-full", getStatusBadge(event.status).bg, getStatusBadge(event.status).text)}>
                          {getStatusBadge(event.status).label}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* Month view */
            <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-auto">
              {/* Days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_FR.map((day, idx) => (
                  <div
                    key={day}
                    className={cn(
                      "text-center text-xs sm:text-sm font-medium py-2",
                      idx >= 5 ? "text-slate-400" : "text-slate-600 dark:text-slate-300"
                    )}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
                {days.map((day, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[80px] sm:min-h-[100px] p-1 rounded-lg border transition-all cursor-pointer group relative",
                      day.isCurrentMonth
                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60",
                      day.isToday && "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900",
                      day.isSelected && "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
                      day.isWeekend && day.isCurrentMonth && "bg-slate-50/50 dark:bg-slate-800/30",
                      "hover:border-blue-300 dark:hover:border-blue-600"
                    )}
                    onClick={() => handleSelectDate(day.date)}
                    onDoubleClick={() => handleQuickCreate(day.date)}
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full transition-colors",
                          day.isToday
                            ? "bg-blue-500 text-white"
                            : day.isSelected
                            ? "bg-indigo-500 text-white"
                            : day.isCurrentMonth
                            ? "text-slate-700 dark:text-slate-200"
                            : "text-slate-400 dark:text-slate-400"
                        )}
                      >
                        {day.date.getDate()}
                      </span>

                      {/* Quick actions */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        {pinnedDates.includes(day.date.toISOString()) ? (
                          <button
                            className="w-5 h-5 flex items-center justify-center rounded-full text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                            onClick={e => { e.stopPropagation(); togglePinDate(day.date.toISOString()); }}
                            title="Retirer épingle"
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        ) : (
                          <button
                            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                            onClick={e => { e.stopPropagation(); togglePinDate(day.date.toISOString()); }}
                            title="Épingler"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                          onClick={e => { e.stopPropagation(); handleQuickCreate(day.date); }}
                          title="Créer événement"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Events */}
                    <div className="space-y-0.5 overflow-hidden">
                      {day.events.slice(0, isCompact ? 2 : 3).map(event => (
                        <button
                          key={event.id}
                          className={cn(
                            "w-full text-left text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded truncate transition-colors",
                            getCategoryColor(event.category),
                            "text-white hover:opacity-90",
                            getPriorityColor(event.priority)
                          )}
                          onClick={e => { e.stopPropagation(); handleViewEventDetail(event); }}
                          title={`${event.title} - ${formatTime(event.start)}`}
                        >
                          <span className="flex items-center gap-0.5">
                            {event.hasConflict && <AlertTriangle className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />}
                            <span className="truncate">{event.title}</span>
                          </span>
                        </button>
                      ))}
                      {day.events.length > (isCompact ? 2 : 3) && (
                        <div className="text-[10px] sm:text-xs text-slate-400 pl-1">
                          +{day.events.length - (isCompact ? 2 : 3)} autres
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================
            SIDE PANEL (Selected day detail)
        ============================================ */}
        {selectedDate && !isCompact && (
          <div className="hidden lg:flex w-1/3 min-w-[320px] max-w-[450px] flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {/* Panel header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  {formatDateFull(selectedDate)}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedDayEvents.length} événement{selectedDayEvents.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <FluentButton size="sm" variant="secondary" onClick={() => handleCreateEvent(selectedDate)}>
                  <Plus className="w-4 h-4" />
                </FluentButton>
                <FluentButton size="sm" variant="secondary" onClick={() => setSelectedDate(null)}>
                  <X className="w-4 h-4" />
                </FluentButton>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedEvents.size > 0 && (
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {selectedEvents.size} sélectionné{selectedEvents.size > 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <FluentButton size="sm" variant="secondary" onClick={() => setExportOpen(true)}>
                      <Download className="w-3.5 h-3.5" />
                    </FluentButton>
                    <FluentButton size="sm" variant="secondary" onClick={clearSelection}>
                      <X className="w-3.5 h-3.5" />
                    </FluentButton>
                  </div>
                </div>
              </div>
            )}

            {/* Select all */}
            {selectedDayEvents.length > 1 && (
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEvents.size === selectedDayEvents.length}
                    onChange={e => e.target.checked ? selectAllDayEvents() : clearSelection()}
                    className="rounded"
                  />
                  Tout sélectionner
                </label>
              </div>
            )}

            {/* Events list */}
            <div className="flex-1 overflow-auto p-4">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">Aucun événement ce jour</p>
                  <FluentButton size="sm" variant="primary" onClick={() => handleCreateEvent(selectedDate)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un événement
                  </FluentButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          "p-3 rounded-xl border transition-all",
                          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                          "hover:shadow-md cursor-pointer",
                          selectedEvents.has(event.id) && "ring-2 ring-blue-500",
                          getPriorityColor(event.priority)
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            className="mt-1 flex-shrink-0"
                            onClick={e => { e.stopPropagation(); toggleEventSelection(event.id); }}
                          >
                            {selectedEvents.has(event.id) ? (
                              <CheckSquare className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0" onClick={() => handleOpenEvent(event)}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getCategoryColor(event.category))} />
                              <span className="font-medium text-sm truncate">{event.title}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(event.start)} - {formatTime(event.end)}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              )}
                              {event.attendees && event.attendees.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {event.attendees.length}
                                </span>
                              )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-1">
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded", getStatusBadge(event.status).bg, getStatusBadge(event.status).text)}>
                                {getStatusBadge(event.status).label}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {getCategoryLabel(event.category)}
                              </span>
                              {event.hasConflict && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Conflit
                                </span>
                              )}
                              {event.isOverdue && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  Retard
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"
                              onClick={e => { e.stopPropagation(); handleViewEventDetail(event); }}
                              title="Aperçu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600"
                              onClick={e => { e.stopPropagation(); handleOpenEvent(event); }}
                              title="Ouvrir"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Double-clic pour créer</span>
              <span>
                {lastRefresh && `MAJ ${lastRefresh.toLocaleTimeString('fr-FR')}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          FOOTER
      ============================================ */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 px-4 py-2 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400 overflow-x-auto">
          {CATEGORIES.slice(1).map(cat => (
            <span key={cat.id} className="flex items-center gap-1 flex-shrink-0">
              <span className={cn("w-2.5 h-2.5 rounded", cat.color)} />
              {cat.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
          <span className="hidden sm:inline">Double-clic = créer</span>
          <span>•</span>
          <button
            className="flex items-center gap-1 hover:text-slate-600"
            onClick={() => setIsCompact(!isCompact)}
          >
            {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            {isCompact ? 'Étendre' : 'Compact'}
          </button>
        </div>
      </div>

      {/* ============================================
          MODALS
      ============================================ */}

      {/* Quick create modal */}
      <FluentModal
        open={quickCreateOpen}
        title={`Créer un événement - ${quickCreateDate?.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        onClose={() => setQuickCreateOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Créez rapidement un événement pour cette date ou ouvrez l&apos;assistant complet.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.slice(1).map(cat => (
              <button
                key={cat.id}
                className={cn(
                  "p-3 rounded-xl border border-slate-200 dark:border-slate-700",
                  "hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800",
                  "transition-colors text-left"
                )}
                onClick={() => {
                  // TODO: Quick create with category
                  handleCreateEvent(quickCreateDate || undefined);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("w-3 h-3 rounded", cat.color)} />
                  <span className="font-medium text-sm">{cat.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setQuickCreateOpen(false)}>
              Annuler
            </FluentButton>
            <FluentButton size="sm" variant="primary" onClick={() => handleCreateEvent(quickCreateDate || undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              Assistant complet
            </FluentButton>
          </div>
        </div>
      </FluentModal>

      {/* Event detail modal */}
      <FluentModal
        open={eventDetailOpen}
        title={selectedEventDetail?.title || 'Détail événement'}
        onClose={() => setEventDetailOpen(false)}
      >
        {selectedEventDetail && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <span className={cn("w-4 h-4 rounded mt-1", getCategoryColor(selectedEventDetail.category))} />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedEventDetail.title}</h3>
                {selectedEventDetail.description && (
                  <p className="text-sm text-slate-400 mt-1">{selectedEventDetail.description}</p>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{selectedEventDetail.start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{formatTime(selectedEventDetail.start)} - {formatTime(selectedEventDetail.end)}</span>
              </div>
              {selectedEventDetail.location && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEventDetail.location}</span>
                </div>
              )}
              {selectedEventDetail.bureau && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Building2 className="w-4 h-4" />
                  <span>{selectedEventDetail.bureau}</span>
                </div>
              )}
              {selectedEventDetail.organizerName && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                  <Users className="w-4 h-4" />
                  <span>Organisé par {selectedEventDetail.organizerName}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className={cn("text-xs px-2 py-1 rounded-full", getStatusBadge(selectedEventDetail.status).bg, getStatusBadge(selectedEventDetail.status).text)}>
                {getStatusBadge(selectedEventDetail.status).label}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {getCategoryLabel(selectedEventDetail.category)}
              </span>
              {selectedEventDetail.priority && selectedEventDetail.priority !== 'normal' && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700">
                  Priorité: {selectedEventDetail.priority}
                </span>
              )}
              {selectedEventDetail.hasConflict && (
                <span className="text-xs px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Conflit détecté
                </span>
              )}
              {selectedEventDetail.isOverdue && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  En retard SLA
                </span>
              )}
            </div>

            {/* Attendees */}
            {selectedEventDetail.attendees && selectedEventDetail.attendees.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Participants ({selectedEventDetail.attendees.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEventDetail.attendees.slice(0, 5).map((a, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                      {a.name}
                    </span>
                  ))}
                  {selectedEventDetail.attendees.length > 5 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                      +{selectedEventDetail.attendees.length - 5} autres
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <FluentButton size="sm" variant="secondary" onClick={() => setEventDetailOpen(false)}>
                Fermer
              </FluentButton>
              <FluentButton size="sm" variant="primary" onClick={() => { handleOpenEvent(selectedEventDetail); setEventDetailOpen(false); }}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir en onglet
              </FluentButton>
            </div>
          </div>
        )}
      </FluentModal>

      {/* Export modal */}
      <FluentModal
        open={exportOpen}
        title="Exporter le calendrier"
        onClose={() => setExportOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Exportez les événements du mois de {MONTHS_FR[currentDate.getMonth()]} {currentDate.getFullYear()}.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => {
                window.open(`/api/calendar/export?format=ical&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`, '_blank');
                setExportOpen(false);
              }}
            >
              <div className="font-medium">iCal (.ics)</div>
              <div className="text-xs text-slate-400 mt-1">Outlook, Google Calendar</div>
            </button>
            <button
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => {
                window.open(`/api/calendar/export?format=csv&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`, '_blank');
                setExportOpen(false);
              }}
            >
              <div className="font-medium">CSV</div>
              <div className="text-xs text-slate-400 mt-1">Excel, Sheets</div>
            </button>
            <button
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => {
                window.open(`/api/calendar/export?format=pdf&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`, '_blank');
                setExportOpen(false);
              }}
            >
              <div className="font-medium">PDF</div>
              <div className="text-xs text-slate-400 mt-1">Document imprimable</div>
            </button>
            <button
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => {
                window.open(`/api/calendar/export?format=json&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`, '_blank');
                setExportOpen(false);
              }}
            >
              <div className="font-medium">JSON</div>
              <div className="text-xs text-slate-400 mt-1">Données brutes</div>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <FluentButton size="sm" variant="secondary" onClick={() => setExportOpen(false)}>
              Annuler
            </FluentButton>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

export default CalendarMonthView;
