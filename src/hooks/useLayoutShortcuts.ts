/**
 * Hook pour raccourcis clavier du layout Outlook-like
 * Format simplifié: Record<shortcutKey, handler>
 */

import { useEffect, useCallback } from 'react';

export type ShortcutMap = Record<string, () => void>;

export function useLayoutShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      parts.push(e.key);

      const key = parts.join('+');
      const handler = shortcuts[key];
      if (handler) {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
