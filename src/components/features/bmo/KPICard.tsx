'use client';

import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';

interface KPICardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  up?: boolean;
  color: string;
  sub?: string;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  icon,
  label,
  value,
  trend,
  up,
  color,
  sub,
  onClick,
  className,
}: KPICardProps) {
  const { darkMode } = useAppStore();

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl p-3 cursor-pointer transition-all duration-300 hover:scale-[1.02] border',
        darkMode
          ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/50'
          : 'bg-white border-gray-200',
        className
      )}
      style={{ borderTopColor: color, borderTopWidth: '3px' }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${color}20` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-[10px] uppercase tracking-wide',
              darkMode ? 'text-slate-400' : 'text-gray-500'
            )}
          >
            {label}
          </p>
          <p className="text-xl font-extrabold">
            {value}
            {sub && (
              <span className="text-xs font-normal text-slate-400 ml-1">
                {sub}
              </span>
            )}
          </p>
          {trend && (
            <p
              className={cn(
                'text-[10px]',
                up === true
                  ? 'text-emerald-400'
                  : up === false
                  ? 'text-red-400'
                  : 'text-slate-400'
              )}
            >
              {up !== undefined && (up ? '↗' : '↘')} {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
