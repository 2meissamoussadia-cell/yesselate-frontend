'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePaiementsWorkspaceStore } from '@/lib/stores/paiementsWorkspaceStore';
import { Search, ArrowRight, ClipboardList, FileText, Calendar, DollarSign, Building2, CheckCircle, Shield, BarChart3, Download, RefreshCw, Filter, AlertTriangle, Ban } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'navigation' | 'action' | 'filter';
  shortcut?: string;
  action: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenStats: () => void;
  onOpenExport: () => void;
  onRefresh: () => void;
}

export function PaiementsCommandPalette({ open, onClose, onOpenStats, onOpenExport, onRefresh }: Props) {
  const { openTab, setFilter, clearFilter } = usePaiementsWorkspaceStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => [
    { id: 'nav-inbox', label: 'Paiements à valider', description: 'Liste des paiements en attente', icon: ClipboardList, category: 'navigation', shortcut: '⌘1', action: () => { openTab({ type: 'inbox', title: 'À valider', icon: '📋', data: { queue: 'pending' } }); onClose(); } },
    { id: 'nav-urgent', label: 'Paiements urgents', description: 'Paiements à échéance proche', icon: AlertTriangle, category: 'navigation', shortcut: '⌘2', action: () => { openTab({ type: 'inbox', id: 'inbox:urgent', title: 'Urgents', icon: '🚨', data: { queue: 'critical' } }); onClose(); } },
    { id: 'nav-blocked', label: 'Paiements bloqués', description: 'Paiements en attente de déblocage', icon: Ban, category: 'navigation', action: () => { openTab({ type: 'inbox', id: 'inbox:blocked', title: 'Bloqués', icon: '🚫', data: { queue: 'blocked' } }); onClose(); } },
    { id: 'nav-validated', label: 'Paiements validés', description: 'Historique des validations', icon: CheckCircle, category: 'navigation', action: () => { openTab({ type: 'inbox', id: 'inbox:validated', title: 'Validés', icon: '✅', data: { queue: 'validated' } }); onClose(); } },
    { id: 'nav-echeancier', label: 'Échéancier', description: 'Vue calendrier des échéances', icon: Calendar, category: 'navigation', action: () => { openTab({ type: 'echeancier', title: 'Échéancier', icon: '📅', data: {} }); onClose(); } },
    { id: 'nav-tresorerie', label: 'Trésorerie', description: 'État de la trésorerie', icon: DollarSign, category: 'navigation', action: () => { openTab({ type: 'tresorerie', title: 'Trésorerie', icon: '💰', data: {} }); onClose(); } },
    { id: 'nav-fournisseurs', label: 'Par fournisseur', description: 'Vue par fournisseur', icon: Building2, category: 'navigation', action: () => { openTab({ type: 'fournisseurs', title: 'Fournisseurs', icon: '🏢', data: {} }); onClose(); } },
    { id: 'nav-audit', label: 'Audit', description: 'Registre des décisions', icon: Shield, category: 'navigation', action: () => { openTab({ type: 'audit', title: 'Audit', icon: '🔍', data: {} }); onClose(); } },
    { id: 'nav-analytics', label: 'Analytics', description: 'Statistiques', icon: BarChart3, category: 'navigation', shortcut: '⌘I', action: () => { onOpenStats(); onClose(); } },
    { id: 'action-refresh', label: 'Rafraîchir', icon: RefreshCw, category: 'action', shortcut: '⌘R', action: () => { onRefresh(); onClose(); } },
    { id: 'action-export', label: 'Exporter', icon: Download, category: 'action', shortcut: '⌘X', action: () => { onOpenExport(); onClose(); } },
    { id: 'filter-clear', label: 'Effacer les filtres', icon: Filter, category: 'filter', action: () => { clearFilter(); onClose(); } },
    { id: 'filter-montant-high', label: 'Filtrer: Montant > 50M', icon: Filter, category: 'filter', action: () => { setFilter({ minMontant: 50000000 }); onClose(); } },
  ], [openTab, onClose, onOpenStats, onOpenExport, onRefresh, clearFilter, setFilter]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd => cmd.label.toLowerCase().includes(q) || cmd.description?.toLowerCase().includes(q));
  }, [commands, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filteredCommands[selectedIndex]) filteredCommands[selectedIndex].action(); }
    else if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    if (open) { setQuery(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  if (!open) return null;

  const categoryLabels: Record<string, string> = { navigation: 'Navigation', action: 'Actions', filter: 'Filtres' };
  const groupedCommands = ['navigation', 'action', 'filter'].map(cat => ({
    category: cat,
    items: filteredCommands.filter(c => c.category === cat),
  })).filter(g => g.items.length > 0);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-[#1f1f1f]/95 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <Search className="w-5 h-5 text-emerald-500 flex-none" />
          <input ref={inputRef} type="text" placeholder="Rechercher une action..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent outline-none text-lg placeholder:text-slate-400" />
          <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-400">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun résultat</p>
            </div>
          ) : (
            <div className="py-2">
              {groupedCommands.map(({ category, items }) => (
                <div key={category} className="mb-1">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">{categoryLabels[category]}</div>
                  {items.map(cmd => {
                    const globalIdx = filteredCommands.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = cmd.icon;
                    return (
                      <button key={cmd.id} onClick={cmd.action} onMouseEnter={() => setSelectedIndex(globalIdx)} className={cn("w-full flex items-center gap-3 px-4 py-3 transition-all text-left", isSelected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "hover:bg-slate-100 dark:hover:bg-slate-800/60")}>
                        <div className={cn("p-2 rounded-lg", isSelected ? "bg-emerald-500/20" : "bg-slate-100 dark:bg-slate-800")}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{cmd.label}</div>
                          {cmd.description && <div className="text-xs text-slate-400 truncate">{cmd.description}</div>}
                        </div>
                        {cmd.shortcut && <kbd className={cn("px-2 py-1 rounded text-xs font-mono", isSelected ? "bg-emerald-500/20 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>{cmd.shortcut}</kbd>}
                        <ArrowRight className={cn("w-4 h-4 transition-all", isSelected ? "opacity-100" : "opacity-0")} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-400">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↑↓</kbd> naviguer • <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↵</kbd> sélectionner
        </div>
      </div>
    </div>,
    document.body
  );
}

