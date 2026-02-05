import { cn } from '@/lib/cn';

type FluentButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'ghost';

/**
 * Palette de couleurs professionnelle (optimisée - moins saturée)
 * - Mode clair : couleurs subtiles et pastel
 * - Mode sombre : couleurs désaturées et douces
 * - Hiérarchie claire : ghost/secondary pour actions secondaires
 */
const variantClasses: Record<FluentButtonVariant, string> = {
  // Bleu professionnel (légèrement réduit)
  primary: cn(
    'text-white shadow-sm hover:shadow-md',
    'bg-blue-500/80 hover:bg-blue-500/90',
    'dark:bg-blue-500/70 dark:hover:bg-blue-500/80'
  ),
  // Neutre (favorisé pour actions secondaires)
  secondary: cn(
    'text-[rgb(var(--text))] border border-[rgb(var(--border)/0.5)] shadow-sm hover:shadow-md',
    'bg-slate-100/80 hover:bg-slate-200/80',
    'dark:bg-slate-800/60 dark:hover:bg-slate-700/70 dark:border-slate-600/40'
  ),
  // Vert doux (succès - réduit)
  success: cn(
    'text-white shadow-sm hover:shadow-md',
    'bg-emerald-500/75 hover:bg-emerald-500/85',
    'dark:bg-emerald-500/60 dark:hover:bg-emerald-500/70'
  ),
  // Orange/ambre doux (avertissement - réduit, utiliser avec parcimonie)
  warning: cn(
    'text-white shadow-sm hover:shadow-md',
    'bg-amber-500/75 hover:bg-amber-500/85',
    'dark:bg-amber-500/60 dark:hover:bg-amber-500/70'
  ),
  // Rouge doux (destructif - réduit, utiliser avec parcimonie)
  destructive: cn(
    'text-white shadow-sm hover:shadow-md',
    'bg-rose-500/75 hover:bg-rose-500/85',
    'dark:bg-rose-500/60 dark:hover:bg-rose-500/70'
  ),
  // Ghost (transparent - FAVORISER pour actions secondaires)
  ghost: cn(
    'text-[rgb(var(--text))] hover:bg-slate-100 dark:hover:bg-slate-800/50',
    'border-none shadow-none'
  ),
};

interface FluentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FluentButtonVariant;
  size?: 'sm' | 'md' | 'xs';
}

export function FluentButton({
  className,
  variant = 'secondary',
  size = 'md',
  children,
  ...props
}: FluentButtonProps) {
  const sizeClasses = {
    xs: 'text-xs px-2 py-1 h-6',
    sm: 'text-sm px-3 py-1.5 h-8',
    md: 'text-sm px-4 py-2 h-9',
  };

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

