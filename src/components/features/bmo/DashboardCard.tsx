'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'urgent' | 'warning' | 'success' | 'info';
  href?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  borderColor?: string;
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  badge,
  badgeVariant = 'default',
  href,
  onClick,
  className,
  children,
  footer,
  borderColor,
}: DashboardCardProps) {
  const { darkMode } = useAppStore();
  const isClickable = href || onClick;

  const content = (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-lg hover:scale-[1.01]',
        darkMode
          ? 'bg-slate-800/60 border-slate-700/50'
          : 'bg-white border-gray-200',
        isClickable && darkMode && 'hover:border-slate-600 hover:bg-slate-800',
        isClickable && !darkMode && 'hover:border-gray-300 hover:bg-gray-50',
        borderColor && `border-t-4`,
        className
      )}
      style={borderColor ? { borderTopColor: borderColor } : undefined}
      onClick={!href ? onClick : undefined}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{title}</h3>
              {subtitle && (
                <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge !== undefined && (
              <Badge variant={badgeVariant} className="text-[9px]">
                {badge}
              </Badge>
            )}
            {isClickable && (
              <ArrowRight
                className={cn(
                  'w-4 h-4 transition-transform',
                  darkMode ? 'text-slate-400' : 'text-gray-400'
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="p-3 border-t border-slate-700/30 bg-slate-900/30">
          {footer}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

