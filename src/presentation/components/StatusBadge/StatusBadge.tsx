/**
 * StatusBadge Component
 * Badge de statut réutilisable avec icônes et couleurs
 */

'use client';

import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Pause,
  Play,
  Loader2,
  Info,
} from 'lucide-react';

export type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'pending'
  | 'loading'
  | 'paused'
  | 'active';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { icon: typeof CheckCircle2; color: string; bgColor: string; textColor: string }
> = {
  success: {
    icon: CheckCircle2,
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
  },
  error: {
    icon: XCircle,
    color: 'red',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
  },
  pending: {
    icon: Clock,
    color: 'slate',
    bgColor: 'bg-slate-500/10',
    textColor: 'text-slate-400',
  },
  loading: {
    icon: Loader2,
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
  },
  paused: {
    icon: Pause,
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
  },
  active: {
    icon: Play,
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
  },
};

const sizeConfig = {
  sm: { icon: 'w-3 h-3', text: 'text-xs', padding: 'px-2 py-0.5' },
  md: { icon: 'w-4 h-4', text: 'text-sm', padding: 'px-3 py-1' },
  lg: { icon: 'w-5 h-5', text: 'text-base', padding: 'px-4 py-1.5' },
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeStyles = sizeConfig[size];

  const displayLabel =
    label ||
    {
      success: 'Succès',
      error: 'Erreur',
      warning: 'Avertissement',
      info: 'Information',
      pending: 'En attente',
      loading: 'Chargement',
      paused: 'En pause',
      active: 'Actif',
    }[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        config.bgColor,
        config.textColor,
        sizeStyles.padding,
        sizeStyles.text,
        'border-current/20',
        status === 'loading' && 'animate-spin',
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            sizeStyles.icon,
            'mr-1.5',
            status === 'loading' && 'animate-spin'
          )}
        />
      )}
      {displayLabel}
    </Badge>
  );
}

