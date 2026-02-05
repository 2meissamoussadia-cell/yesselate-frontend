'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { darkMode, setDarkMode } = useAppStore();
  const [selectedTheme, setSelectedTheme] = useState<Theme>('auto');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bmo.theme');
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        setSelectedTheme(saved as Theme);
        if (saved === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark);
        } else {
          setDarkMode(saved === 'dark');
        }
      }
    } catch {
      // silent
    }
  }, [setDarkMode]);

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('bmo.theme', theme);

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    } else {
      setDarkMode(theme === 'dark');
    }
  };

  if (!isOpen) return null;

  const themes: Array<{ value: Theme; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'light',
      label: 'Clair',
      icon: <Sun className="w-4 h-4" />,
      description: 'Thème clair',
    },
    {
      value: 'dark',
      label: 'Sombre',
      icon: <Moon className="w-4 h-4" />,
      description: 'Thème sombre',
    },
    {
      value: 'auto',
      label: 'Automatique',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Suivre les préférences système',
    },
  ];

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
            'w-full max-w-md pointer-events-auto',
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Personnaliser le Thème
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                    selectedTheme === theme.value
                      ? 'border-blue-400 bg-blue-400/10'
                      : darkMode
                      ? 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  )}
                >
                  <div className={cn(selectedTheme === theme.value ? 'text-blue-400' : 'text-slate-400')}>
                    {theme.icon}
                  </div>
                  <div className="text-xs font-semibold">{theme.label}</div>
                  <div className="text-[9px] text-slate-400 text-center">{theme.description}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-700">
              <Button onClick={onClose} className="w-full text-xs" size="sm">
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

