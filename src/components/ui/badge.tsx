import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-600 text-white',
        outline: 'border border-slate-500/50 bg-transparent text-slate-200',
        urgent: 'bg-red-500 text-white',
        warning: 'bg-amber-500 text-slate-900',
        success: 'bg-emerald-500 text-white',
        info: 'bg-blue-500 text-white',
        gold: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900',
        gray: 'bg-slate-500 text-white',
        secondary: 'bg-slate-600/80 text-slate-200',
        destructive: 'bg-rose-600 text-white',
      },
      pulse: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      pulse: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, pulse, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, pulse }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
