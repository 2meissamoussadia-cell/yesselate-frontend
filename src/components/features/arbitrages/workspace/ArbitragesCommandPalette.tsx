'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  Command, Search, Scale, Building2, Plus, BarChart3, Download, 
  HelpCircle, FileText, AlertTriangle, CheckCircle, Clock 
} from 'lucide-react';
import { cn } from '@/lib/cn';

type CommandItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
};

export function ArbitragesCommandPalette() {
  const { openTab } = useArbitragesWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Écouter l'événement custom
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('arbitrages:open-command-palette', handleOpen);
    return () => window.removeEventListener('arbitrages:open-command-palette', handleOpen);
  }, []);

  // Raccourci Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands: CommandItem[] = useMemo(() => [
    {
      id: 'arbitrages-ouverts',
      label: 'Arbitrages ouverts',
      description: 'Voir tous les arbitrages en cours',
      icon: <Scale className="w-4 h-4 text-amber-500" />,
      keywords: ['arbitrages', 'ouverts', 'en cours', 'pending'],
      action: () => {
        openTab({
          id: 'inbox:ouverts',
          type: 'inbox',
          title: 'Ouverts',
          icon: '⏳',
          data: { queue: 'ouverts', type: 'arbitrages' }
        });
        setOpen(false);
      },
    },
    {
      id: 'arbitrages-critiques',
      label: 'Arbitrages critiques',
      description: 'Voir les arbitrages à risque critique',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      keywords: ['arbitrages', 'critiques', 'risque', 'danger'],
      action: () => {
        openTab({
          id: 'inbox:critiques',
          type: 'inbox',
          title: 'Critiques',
          icon: '🚨',
          data: { queue: 'critiques', type: 'arbitrages' }
        });
        setOpen(false);
      },
    },
    {
      id: 'arbitrages-urgents',
      label: 'Arbitrages urgents',
      description: 'Voir les arbitrages urgents (échéance proche)',
      icon: <Clock className="w-4 h-4 text-orange-500" />,
      keywords: ['arbitrages', 'urgents', 'deadline', 'échéance'],
      action: () => {
        openTab({
          id: 'inbox:urgents',
          type: 'inbox',
          title: 'Urgents',
          icon: '⏰',
          data: { queue: 'urgents', type: 'arbitrages' }
        });
        setOpen(false);
      },
    },
    {
      id: 'arbitrages-tranches',
      label: 'Arbitrages tranchés',
      description: 'Voir les arbitrages déjà décidés',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      keywords: ['arbitrages', 'tranchés', 'terminés', 'décidés', 'resolved'],
      action: () => {
        openTab({
          id: 'inbox:tranches',
          type: 'inbox',
          title: 'Tranchés',
          icon: '✅',
          data: { queue: 'tranches', type: 'arbitrages' }
        });
        setOpen(false);
      },
    },
    {
      id: 'bureaux-surcharge',
      label: 'Bureaux en surcharge',
      description: 'Voir les bureaux avec charge > 85%',
      icon: <Building2 className="w-4 h-4 text-rose-500" />,
      keywords: ['bureaux', 'surcharge', 'charge', 'overload'],
      action: () => {
        openTab({
          id: 'inbox:bureaux-surcharge',
          type: 'inbox',
          title: 'Bureaux en surcharge',
          icon: '🔥',
          data: { queue: 'surcharge', type: 'bureaux' }
        });
        setOpen(false);
      },
    },
    {
      id: 'bureaux-goulots',
      label: 'Bureaux avec goulots',
      description: 'Voir les bureaux ayant des goulots identifiés',
      icon: <Building2 className="w-4 h-4 text-amber-500" />,
      keywords: ['bureaux', 'goulots', 'blocages', 'bottleneck'],
      action: () => {
        openTab({
          id: 'inbox:bureaux-goulots',
          type: 'inbox',
          title: 'Goulots',
          icon: '⚠️',
          data: { queue: 'goulots', type: 'bureaux' }
        });
        setOpen(false);
      },
    },
    {
      id: 'create-arbitrage',
      label: 'Créer un arbitrage',
      description: 'Ouvrir l\'assistant de création',
      icon: <Plus className="w-4 h-4 text-purple-500" />,
      keywords: ['créer', 'nouveau', 'arbitrage', 'create', 'new'],
      action: () => {
        openTab({
          id: `wizard:create:${Date.now()}`,
          type: 'detail',
          title: 'Nouvel arbitrage',
          icon: '➕',
          data: { action: 'create' },
        });
        setOpen(false);
      },
    },
    {
      id: 'stats',
      label: 'Statistiques',
      description: 'Ouvrir les statistiques globales',
      icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
      keywords: ['stats', 'statistiques', 'analytics'],
      action: () => {
        window.dispatchEvent(new CustomEvent('arbitrages:open-stats'));
        setOpen(false);
      },
    },
    {
      id: 'export',
      label: 'Exporter',
      description: 'Exporter les données',
      icon: <Download className="w-4 h-4 text-indigo-500" />,
      keywords: ['export', 'exporter', 'download'],
      action: () => {
        window.dispatchEvent(new CustomEvent('arbitrages:open-export'));
        setOpen(false);
      },
    },
    {
      id: 'decision-center',
      label: 'Centre de décision',
      description: 'Ouvrir le centre de décision pour arbitrer rapidement',
      icon: <Scale className="w-4 h-4 text-red-500" />,
      keywords: ['décision', 'decision', 'center', 'arbitrer', 'trancher'],
      action: () => {
        window.dispatchEvent(new CustomEvent('arbitrages:open-decision-center'));
        setOpen(false);
      },
    },
    {
      id: 'help',
      label: 'Aide',
      description: 'Voir les raccourcis clavier et l\'aide',
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
      keywords: ['aide', 'help', 'raccourcis', 'shortcuts'],
      action: () => {
        window.dispatchEvent(new CustomEvent('arbitrages:open-help'));
        setOpen(false);
      },
    },
  ], [openTab]);

  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;

    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some(k => k.includes(q))
    );
  }, [commands, query]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  return (
    <FluentModal open={open} title="" onClose={handleClose}>
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une commande..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/70 bg-white/90 outline-none 
                       focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Commands list */}
        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p>Aucune commande trouvée</p>
            </div>
          ) : (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors
                           hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex-none">{cmd.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{cmd.label}</div>
                  <div className="text-xs text-slate-400">{cmd.description}</div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span>⌘K pour ouvrir</span>
          <span>ESC pour fermer</span>
        </div>
      </div>
    </FluentModal>
  );
}


