'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X as XIcon, Command, Zap, Maximize2, PanelRightOpen } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Shortcut {
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'views' | 'system';
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['⌘', 'K'], description: 'Palette de commandes', category: 'navigation' },
  { keys: ['⌘', '1-5'], description: 'Accès rapide vues', category: 'navigation' },
  { keys: ['⌘', '/'], description: 'Recherche globale', category: 'navigation' },
  { keys: ['⌘', '←'], description: 'Période précédente', category: 'navigation' },
  { keys: ['⌘', '→'], description: 'Période suivante', category: 'navigation' },
  { keys: ['⌘', 'Home'], description: "Retour à aujourd'hui", category: 'navigation' },
  
  // Actions
  { keys: ['⌘', 'S'], description: 'Statistiques', category: 'actions' },
  { keys: ['⌘', 'E'], description: 'Exporter données', category: 'actions' },
  { keys: ['⌘', 'N'], description: 'Nouveau document', category: 'actions' },
  { keys: ['⌘', 'R'], description: 'Actualiser', category: 'actions' },
  { keys: ['⌘', 'P'], description: 'Imprimer / Personnaliser', category: 'actions' },
  { keys: ['⌘', 'F'], description: 'Filtres avancés / Mode Focus', category: 'actions' },
  
  // Vues
  { keys: ['F11'], description: 'Plein écran', category: 'views' },
  { keys: ['⌘', 'D'], description: 'Mode Dashboard', category: 'views' },
  { keys: ['⌘', 'W'], description: 'Mode Workspace', category: 'views' },
  { keys: ['⌘', 'B'], description: 'Toggle Sidebar', category: 'views' },
  { keys: ['⌘', 'Tab'], description: 'Onglet suivant', category: 'views' },
  { keys: ['⌘', '⇧', 'Tab'], description: 'Onglet précédent', category: 'views' },
  
  // Système
  { keys: ['?'], description: 'Aide (ce menu)', category: 'system' },
  { keys: ['Esc'], description: 'Fermer modales/panels', category: 'system' },
  { keys: ['/'], description: 'Focus recherche', category: 'system' },
];

const CATEGORY_CONFIG = {
  navigation: {
    title: 'Navigation',
    icon: Command,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  actions: {
    title: 'Actions Rapides',
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  views: {
    title: 'Affichage',
    icon: Maximize2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  system: {
    title: 'Système',
    icon: PanelRightOpen,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
};

export function GlobalShortcutsMenu() {
  const [open, setOpen] = useState(false);

  // Écouter la touche "?" pour ouvrir le menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si dans input/textarea
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      
      if (e.key === '?' && !isInput && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen(true);
      }

      // Fermer avec Escape
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      {/* Bouton Header */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          'text-slate-600 dark:text-slate-400',
          'relative group'
        )}
        title="Raccourcis clavier (?)"
        aria-label="Ouvrir les raccourcis clavier"
      >
        <Keyboard className="w-5 h-5" />
        
        {/* Tooltip au hover */}
        <span className={cn(
          'absolute top-full right-0 mt-2 px-2 py-1 rounded',
          'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900',
          'text-xs whitespace-nowrap opacity-0 group-hover:opacity-100',
          'transition-opacity pointer-events-none z-50'
        )}>
          Raccourcis <kbd className="ml-1 font-mono">?</kbd>
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div 
            className={cn(
              'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl',
              'max-w-3xl w-full max-h-[85vh] overflow-hidden',
              'border border-slate-200 dark:border-slate-700'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                    <Keyboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      Raccourcis Clavier
                    </h2>
                    <p className="text-sm text-slate-400 dark:text-slate-400">
                      Gagnez du temps avec ces raccourcis
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setOpen(false)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                  aria-label="Fermer"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              <div className="space-y-8">
                {(['navigation', 'actions', 'views', 'system'] as const).map((category) => {
                  const config = CATEGORY_CONFIG[category];
                  const Icon = config.icon;
                  const categoryShortcuts = SHORTCUTS.filter(s => s.category === category);

                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn('p-2 rounded-lg', config.bgColor)}>
                          <Icon className={cn('w-5 h-5', config.color)} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {config.title}
                        </h3>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                      </div>

                      {/* Shortcuts List */}
                      <div className="grid gap-2">
                        {categoryShortcuts.map((shortcut, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg',
                              'bg-slate-50 dark:bg-slate-800/50',
                              'hover:bg-slate-100 dark:hover:bg-slate-800',
                              'transition-colors'
                            )}
                          >
                            <span className="text-slate-700 dark:text-slate-300">
                              {shortcut.description}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIdx) => (
                                <kbd
                                  key={keyIdx}
                                  className={cn(
                                    'px-2.5 py-1 rounded border font-mono text-sm',
                                    'bg-white dark:bg-slate-900',
                                    'border-slate-300 dark:border-slate-600',
                                    'text-slate-900 dark:text-slate-100',
                                    'shadow-sm'
                                  )}
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Info */}
              <div className={cn(
                'mt-8 p-4 rounded-lg',
                'bg-blue-50 dark:bg-blue-900/20',
                'border border-blue-200 dark:border-blue-800'
              )}>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-blue-500 text-white">
                    <Command className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Note pour Windows/Linux
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Remplacez <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-blue-900 border border-blue-300 dark:border-blue-700 font-mono text-xs">⌘</kbd> par{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-blue-900 border border-blue-300 dark:border-blue-700 font-mono text-xs">Ctrl</kbd> sur votre système.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

