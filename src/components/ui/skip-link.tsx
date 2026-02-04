// ============================================
// Composant Skip Link pour l'accessibilité
// ============================================

import Link from 'next/link';
import { cn } from '@/lib/cn';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Skip Link pour permettre aux utilisateurs de clavier de sauter au contenu principal
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-3 focus:left-3 focus:z-[9999]',
        'focus:rounded focus:bg-orange-500 focus:px-4 focus:py-2',
        'focus:text-white focus:font-semibold focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </Link>
  );
}
