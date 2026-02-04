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
 * Returns ⌘ on Mac, Ctrl on Windows/Linux
 */
export function formatKeyboardShortcut(shortcut: string): string {
  if (typeof window === 'undefined') return shortcut;
  const isMacPlatform = isMac();
  if (isMacPlatform) {
    return shortcut;
  }
  // Replace ⌘ with Ctrl on Windows/Linux
  return shortcut.replace(/⌘/g, 'Ctrl');
}