'use client';

import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';

const REFRESH_MS = 5 * 60 * 1000; // 5 min

const severityConfig = {
  CRITICAL: { icon: '🚨', className: 'text-danger' },
  WARNING: { icon: '⚠️', className: 'text-warning' },
  OK: { icon: '✅', className: 'text-success' },
} as const;

export function AiBriefing() {
  const { data, isSuccess } = useQuery({
    queryKey: ['ai', 'briefing'],
    queryFn: () => endpoints.ai.briefing(),
    refetchInterval: REFRESH_MS,
    staleTime: REFRESH_MS,
  });

  const severity = (data?.severity ?? 'OK') as keyof typeof severityConfig;
  const config = severityConfig[severity] ?? severityConfig.OK;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm animate-fade-in',
        config.className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="shrink-0" aria-hidden>
        {config.icon}
      </span>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
        {isSuccess && data?.phrases?.length
          ? data.phrases.slice(0, 3).map((phrase, i) => (
              <span key={i} className="truncate">
                {phrase}
              </span>
            ))
          : (
              <span className="text-muted-foreground">Chargement du briefing…</span>
            )}
      </div>
    </div>
  );
}
