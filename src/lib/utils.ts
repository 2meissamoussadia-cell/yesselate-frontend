// Re-export cn from dedicated module to avoid HMR issues
export { cn } from './cn';

/**
 * Detect if the platform is Mac
 */
export function isMac(): boolean {
  if (typeof window === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) || 
         /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Format keyboard shortcut for display
 * Returns ⌘ on Mac, Ctrl+ on Windows/Linux (ex. ⌘S → Ctrl+S, ⌘⇧Z → Ctrl+Shift+Z)
 */
export function formatKeyboardShortcut(shortcut: string): string {
  if (typeof window === 'undefined') return shortcut;
  const isMacPlatform = isMac();
  if (isMacPlatform) {
    return shortcut;
  }
  // Replace ⌘ with Ctrl+ on Windows/Linux
  let out = shortcut.replace(/⌘/g, 'Ctrl+');
  // ⇧ = Shift
  out = out.replace(/⇧/g, 'Shift+');
  // Remove trailing + if any
  return out.replace(/\+$/, '') || shortcut;
}