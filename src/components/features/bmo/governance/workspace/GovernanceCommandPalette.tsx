/**
 * Palette de commandes pour le Workspace Gouvernance
 * Recherche fuzzy et navigation rapide
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useGovernanceWorkspaceStore } from '@/lib/stores/governanceWorkspaceStore';
import {
  Search,
  Users,
  AlertTriangle,
  Shield,
  Activity,
  Settings,
  Sun,
  Moon,
  RefreshCw,
  Download,
  BarChart3,
  Zap,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/lib/stores';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: 'navigation' | 'action' | 'settings';
  action: () => void;
}

export function GovernanceCommandPalette() {
  const { 
    commandPaletteOpen, 
    toggleCommandPalette,
    openTab,
    setRACIQueue,
    setAlertQueue,
  } = useGovernanceWorkspaceStore();
  
  const { darkMode, toggleDarkMode } = useAppStore();
  
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Définir toutes les commandes disponibles
  const allCommands: Command[] = [
    // Navigation
    {
      id: 'goto-raci',
      label: 'Matrice RACI',
      description: 'Voir toutes les activités RACI',
      icon: Users,
      shortcut: '⌘1',
      category: 'navigation',
      action: () => {
        setRACIQueue('all');
        openTab('raci-inbox', 'Matrice RACI');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-alerts',
      label: 'Alertes',
      description: 'Voir toutes les alertes',
      icon: AlertTriangle,
      shortcut: '⌘2',
      category: 'navigation',
      action: () => {
        setAlertQueue('all');
        openTab('alerts-inbox', 'Alertes');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-conflicts',
      label: 'Conflits RACI',
      description: 'Voir les conflits de rôles',
      icon: Shield,
      shortcut: '⌘3',
      category: 'navigation',
      action: () => {
        setRACIQueue('conflicts');
        openTab('raci-inbox', 'Conflits RACI');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-critical',
      label: 'Alertes Critiques',
      description: 'Alertes haute priorité',
      icon: Zap,
      shortcut: '⌘4',
      category: 'navigation',
      action: () => {
        setAlertQueue('critical');
        openTab('alerts-inbox', 'Alertes Critiques');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-system',
      label: 'Alertes Système',
      description: 'Alertes système',
      icon: Activity,
      category: 'navigation',
      action: () => {
        setAlertQueue('system');
        openTab('alerts-inbox', 'Alertes Système');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-blocked',
      label: 'Dossiers Bloqués',
      description: 'Dossiers nécessitant déblocage',
      icon: XCircle,
      category: 'navigation',
      action: () => {
        setAlertQueue('blocked');
        openTab('alerts-inbox', 'Dossiers Bloqués');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-payment',
      label: 'Paiements N-1',
      description: 'Paiements en attente',
      icon: FileText,
      category: 'navigation',
      action: () => {
        setAlertQueue('payment');
        openTab('alerts-inbox', 'Paiements N-1');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-contract',
      label: 'Contrats à Signer',
      description: 'Contrats en attente de signature',
      icon: CheckCircle2,
      category: 'navigation',
      action: () => {
        setAlertQueue('contract');
        openTab('alerts-inbox', 'Contrats à Signer');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-incomplete',
      label: 'RACI Incomplets',
      description: 'Activités avec rôles manquants',
      icon: Users,
      category: 'navigation',
      action: () => {
        setRACIQueue('incomplete');
        openTab('raci-inbox', 'RACI Incomplets');
        toggleCommandPalette();
      },
    },
    {
      id: 'goto-unassigned',
      label: 'RACI Non Assignés',
      description: 'Activités sans responsable',
      icon: Users,
      category: 'navigation',
      action: () => {
        setRACIQueue('unassigned');
        openTab('raci-inbox', 'RACI Non Assignés');
        toggleCommandPalette();
      },
    },
    // Actions
    {
      id: 'refresh',
      label: 'Actualiser les données',
      description: 'Recharger toutes les données',
      icon: RefreshCw,
      shortcut: '⌘R',
      category: 'action',
      action: () => {
        window.location.reload();
      },
    },
    {
      id: 'export',
      label: 'Exporter',
      description: 'Exporter les données',
      icon: Download,
      shortcut: '⌘E',
      category: 'action',
      action: () => {
        // TODO: Implémenter export
        toggleCommandPalette();
      },
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'Voir les rapports et analyses',
      icon: BarChart3,
      shortcut: '⌘A',
      category: 'action',
      action: () => {
        openTab('analytics', 'Analytics');
        toggleCommandPalette();
      },
    },
    // Settings
    {
      id: 'toggle-theme',
      label: darkMode ? 'Mode Clair' : 'Mode Sombre',
      description: 'Changer le thème',
      icon: darkMode ? Sun : Moon,
      shortcut: '⌘T',
      category: 'settings',
      action: () => {
        toggleDarkMode();
        toggleCommandPalette();
      },
    },
  ];
  
  // Fuzzy search
  const filteredCommands = search.trim()
    ? allCommands.filter(cmd => {
        const searchLower = search.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchLower) ||
          cmd.description?.toLowerCase().includes(searchLower) ||
          cmd.category.toLowerCase().includes(searchLower)
        );
      })
    : allCommands;
  
  // Grouper par catégorie
  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    action: filteredCommands.filter(c => c.category === 'action'),
    settings: filteredCommands.filter(c => c.category === 'settings'),
  };
  
  // Navigation clavier
  useEffect(() => {
    if (!commandPaletteOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) cmd.action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, toggleCommandPalette]);
  
  // Focus input quand ouvert
  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);
  
  if (!commandPaletteOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm"
      onClick={() => toggleCommandPalette()}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search className="h-5 w-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher une commande..."
            className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none"
          />
          <kbd className="px-2 py-1 text-xs text-white/40 bg-white/10 rounded">ESC</kbd>
        </div>
        
        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              Aucune commande trouvée
            </div>
          ) : (
            <div className="py-2">
              {/* Navigation */}
              {groupedCommands.navigation.length > 0 && (
                <CommandGroup title="Navigation" commands={groupedCommands.navigation} selectedIndex={selectedIndex} />
              )}
              
              {/* Actions */}
              {groupedCommands.action.length > 0 && (
                <CommandGroup title="Actions" commands={groupedCommands.action} selectedIndex={selectedIndex} />
              )}
              
              {/* Settings */}
              {groupedCommands.settings.length > 0 && (
                <CommandGroup title="Paramètres" commands={groupedCommands.settings} selectedIndex={selectedIndex} />
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border-t border-white/10 text-xs text-white/40">
          <div className="flex items-center gap-4">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
            <span>ESC Fermer</span>
          </div>
          <span>{filteredCommands.length} commande(s)</span>
        </div>
      </div>
    </div>
  );
}

interface CommandGroupProps {
  title: string;
  commands: Command[];
  selectedIndex: number;
}

function CommandGroup({ title, commands, selectedIndex }: CommandGroupProps) {
  if (commands.length === 0) return null;
  
  return (
    <div className="mb-2">
      <div className="px-4 py-2 text-xs font-semibold text-white/40 uppercase">
        {title}
      </div>
      {commands.map((cmd, index) => {
        const Icon = cmd.icon;
        const isSelected = selectedIndex === index;
        
        return (
          <button
            key={cmd.id}
            onClick={cmd.action}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left',
              isSelected
                ? 'bg-blue-500/20 text-white'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{cmd.label}</div>
              {cmd.description && (
                <div className="text-xs text-white/40 truncate">{cmd.description}</div>
              )}
            </div>
            {cmd.shortcut && (
              <kbd className="px-2 py-1 text-xs bg-white/10 rounded flex-shrink-0">
                {cmd.shortcut}
              </kbd>
            )}
          </button>
        );
      })}
    </div>
  );
}

