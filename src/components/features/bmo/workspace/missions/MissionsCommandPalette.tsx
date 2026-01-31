'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useMissionsWorkspaceStore } from '@/lib/stores/missionsWorkspaceStore';
import { Search, ArrowRight, ClipboardList, Clock, CheckCircle, PlayCircle, Calendar, RefreshCw, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command { id: string; label: string; icon: React.ComponentType<{ className?: string }>; category: 'navigation' | 'action' | 'filter'; shortcut?: string; action: () => void; }

interface Props { open: boolean; onClose: () => void; onOpenStats: () => void; onRefresh: () => void; }

export function MissionsCommandPalette({ open, onClose, onOpenStats, onRefresh }: Props) {
  const { openTab, clearFilter } = useMissionsWorkspaceStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => [
    { id: 'nav-all', label: 'Toutes les missions', icon: ClipboardList, category: 'navigation', shortcut: '⌘1', action: () => { openTab({ type: 'inbox', title: 'Toutes', icon: '✈️', data: { queue: 'all' } }); onClose(); } },
    { id: 'nav-pending', label: 'En attente', icon: Clock, category: 'navigation', shortcut: '⌘2', action: () => { openTab({ type: 'inbox', id: 'inbox:pending', title: 'En attente', icon: '⏳', data: { queue: 'pending' } }); onClose(); } },
    { id: 'nav-approved', label: 'Approuvées', icon: CheckCircle, category: 'navigation', action: () => { openTab({ type: 'inbox', id: 'inbox:approved', title: 'Approuvées', icon: '✅', data: { queue: 'approved' } }); onClose(); } },
    { id: 'nav-in_progress', label: 'En cours', icon: PlayCircle, category: 'navigation', action: () => { openTab({ type: 'inbox', id: 'inbox:in_progress', title: 'En cours', icon: '🚀', data: { queue: 'in_progress' } }); onClose(); } },
    { id: 'nav-completed', label: 'Terminées', icon: CheckCircle, category: 'navigation', action: () => { openTab({ type: 'inbox', id: 'inbox:completed', title: 'Terminées', icon: '✅', data: { queue: 'completed' } }); onClose(); } },
    { id: 'nav-calendrier', label: 'Calendrier', icon: Calendar, category: 'navigation', action: () => { openTab({ type: 'calendrier', title: 'Calendrier', icon: '📅', data: {} }); onClose(); } },
    { id: 'action-refresh', label: 'Rafraîchir', icon: RefreshCw, category: 'action', shortcut: '⌘R', action: () => { onRefresh(); onClose(); } },
    { id: 'action-stats', label: 'Statistiques', icon: ClipboardList, category: 'action', shortcut: '⌘I', action: () => { onOpenStats(); onClose(); } },
    { id: 'action-export', label: 'Exporter', icon: Download, category: 'action', action: () => { onClose(); } },
    { id: 'filter-clear', label: 'Effacer les filtres', icon: Filter, category: 'filter', action: () => { clearFilter(); onClose(); } },
  ], [openTab, onClose, onOpenStats, onRefresh, clearFilter]);

  const filteredCommands = useMemo(() => !query.trim() ? commands : commands.filter(cmd => cmd.label.toLowerCase().includes(query.toLowerCase())), [commands, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filteredCommands[selectedIndex]) filteredCommands[selectedIndex].action(); }
    else if (e.key === 'Escape') onClose();
  };

  useEffect(() => { if (open) { setQuery(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => { setSelectedIndex(0); }, [query]);

  if (!open) return null;

  const categoryLabels: Record<string, string> = { navigation: 'Navigation', action: 'Actions', filter: 'Filtres' };
  const groupedCommands = ['navigation', 'action', 'filter'].map(cat => ({ category: cat, items: filteredCommands.filter(c => c.category === cat) })).filter(g => g.items.length > 0);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-[#1f1f1f]/95 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <Search className="w-5 h-5 text-cyan-500 flex-none" />
          <input ref={inputRef} type="text" placeholder="Rechercher..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent outline-none text-lg" />
          <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {groupedCommands.map(({ category, items }) => (
            <div key={category} className="mb-1">
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">{categoryLabels[category]}</div>
              {items.map(cmd => {
                const globalIdx = filteredCommands.indexOf(cmd);
                const isSelected = globalIdx === selectedIndex;
                const Icon = cmd.icon;
                return (
                  <button key={cmd.id} onClick={cmd.action} onMouseEnter={() => setSelectedIndex(globalIdx)} className={cn("w-full flex items-center gap-3 px-4 py-3 text-left", isSelected ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/60")}>
                    <div className={cn("p-2 rounded-lg", isSelected ? "bg-cyan-500/20" : "bg-slate-100 dark:bg-slate-800")}><Icon className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0"><div className="font-medium">{cmd.label}</div></div>
                    {cmd.shortcut && <kbd className={cn("px-2 py-1 rounded text-xs font-mono", isSelected ? "bg-cyan-500/20" : "bg-slate-100 dark:bg-slate-800")}>{cmd.shortcut}</kbd>}
                    <ArrowRight className={cn("w-4 h-4", isSelected ? "opacity-100" : "opacity-0")} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

