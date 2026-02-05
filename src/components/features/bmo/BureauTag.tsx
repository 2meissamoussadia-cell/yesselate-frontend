'use client';

import { cn } from '@/lib/cn';

interface BureauTagProps {
  bureau: string;
  icon?: string;
  className?: string;
}

const bureauColors: Record<string, string> = {
  BMO: 'bg-orange-500/20 text-orange-400',
  BF: 'bg-blue-500/20 text-blue-400',
  BM: 'bg-emerald-500/20 text-emerald-400',
  BA: 'bg-cyan-500/20 text-cyan-400',
  BCT: 'bg-red-500/20 text-red-400',
  BJ: 'bg-purple-500/20 text-purple-400',
  BQC: 'bg-pink-500/20 text-pink-400',
  BT: 'bg-indigo-500/20 text-indigo-400',
};

export function BureauTag({ bureau, icon, className }: BureauTagProps) {
  return (
    <span
      className={cn(
        'px-1.5 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1',
        bureauColors[bureau] || 'bg-slate-600/20 text-slate-400',
        className
      )}
    >
      {icon && <span>{icon}</span>}
      {bureau}
    </span>
  );
}
