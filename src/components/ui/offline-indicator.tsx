// ============================================
// Indicateur de statut hors ligne
// ============================================

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingActionsCount?: number;
  className?: string;
}

export function OfflineIndicator({
  isOnline,
  pendingActionsCount = 0,
  className,
}: OfflineIndicatorProps) {
  if (isOnline && pendingActionsCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'flex items-center gap-2',
        'px-3 py-2 rounded-lg shadow-lg',
        isOnline
          ? 'bg-blue-500/90 text-white'
          : 'bg-red-500/90 text-white',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'En ligne' : 'Hors ligne'}
    >
      <span className="text-sm font-semibold">
        {isOnline ? '🟢' : '🔴'} {isOnline ? 'En ligne' : 'Hors ligne'}
      </span>
      {pendingActionsCount > 0 && (
        <Badge variant="default" className="bg-white/20 text-white">
          {pendingActionsCount} en attente
        </Badge>
      )}
    </div>
  );
}

