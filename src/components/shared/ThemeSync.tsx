'use client';

/**
 * ThemeSync — Applique la classe dark/light sur <html> selon le store.
 * Permet aux variantes Tailwind dark: de réagir au changement de thème.
 */

import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';

export function ThemeSync() {
  const darkMode = useAppStore((s) => s.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return null;
}
