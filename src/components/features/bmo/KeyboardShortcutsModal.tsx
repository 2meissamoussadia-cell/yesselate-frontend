'use client';

import { useEffect, Fragment } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  category: string;
  shortcuts: Array<{ keys: string[]; description: string; action?: string }>;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { darkMode } = useAppStore();

  const shortcuts: Shortcut[] = [
    {
      category: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', '1'], description: 'Aller à Performance Globale', action: 'section' },
        { keys: ['Ctrl', '2'], description: 'Aller à Actions Prioritaires', action: 'section' },
        { keys: ['Ctrl', '3'], description: 'Aller à Risques & Santé', action: 'section' },
        { keys: ['Ctrl', '4'], description: 'Aller à Décisions', action: 'section' },
        { keys: ['Ctrl', '5'], description: 'Aller à Indicateurs Temps Réel', action: 'section' },
        { keys: ['Ctrl', '6'], description: 'Aller à Analyses Avancées', action: 'section' },
        { keys: ['Ctrl', '←'], description: 'Période précédente', action: 'period' },
        { keys: ['Ctrl', '→'], description: 'Période suivante', action: 'period' },
        { keys: ['Ctrl', 'Home'], description: "Retour à aujourd'hui", action: 'period' },
      ],
    },
    {
      category: 'Actions Rapides',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Ouvrir palette de commandes', action: 'command' },
        { keys: ['Ctrl', 'E'], description: 'Exporter les données', action: 'export' },
        { keys: ['Ctrl', 'F'], description: 'Activer Mode Focus', action: 'focus' },
        { keys: ['Ctrl', 'S'], description: 'Sauvegarder la vue actuelle', action: 'save' },
        { keys: ['Ctrl', 'P'], description: 'Personnaliser le layout', action: 'layout' },
        { keys: ['Ctrl', 'N'], description: 'Ouvrir notifications', action: 'notifications' },
      ],
    },
    {
      category: 'Recherche',
      shortcuts: [
        { keys: ['/'], description: 'Focus sur la recherche', action: 'search' },
        { keys: ['Esc'], description: 'Fermer modales/panels', action: 'close' },
      ],
    },
    {
      category: 'Vues',
      shortcuts: [
        { keys: ['Ctrl', 'V'], description: 'Basculer vue compacte/étendue', action: 'view' },
        { keys: ['Ctrl', 'D'], description: 'Basculer mode sombre', action: 'theme' },
      ],
    },
    {
      category: 'Aide',
      shortcuts: [
        { keys: ['Ctrl', '?'], description: 'Afficher cette aide', action: 'help' },
      ],
    },
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getKeyDisplay = (key: string) => {
    const keyMap: Record<string, string> = {
      Ctrl: 'Ctrl',
      Meta: '⌘',
      Shift: '⇧',
      Alt: 'Alt',
      Esc: 'Esc',
      Home: 'Home',
      '←': '←',
      '→': '→',
      '/': '/',
      '?': '?',
    };
    return keyMap[key] || key.toUpperCase();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card
          className={cn(
            'w-full max-w-3xl pointer-events-auto max-h-[80vh] overflow-y-auto',
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Raccourcis Clavier
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {shortcuts.map((category) => (
              <div key={category.category} className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg',
                        darkMode ? 'bg-slate-800/30' : 'bg-gray-50'
                      )}
                    >
                      <span className="text-xs text-slate-300">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <Fragment key={keyIdx}>
                            <Badge
                              variant="default"
                              className={cn(
                                'text-[9px] font-mono px-1.5 py-0.5',
                                darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-800'
                              )}
                            >
                              {getKeyDisplay(key)}
                            </Badge>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-[9px] text-slate-400 mx-1">+</span>
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-700 text-[10px] text-slate-400 text-center">
              Astuce : Les raccourcis fonctionnent même quand les modales sont ouvertes
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

