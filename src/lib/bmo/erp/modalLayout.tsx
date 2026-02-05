'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export function ErpModalLayout({
  className,
  header,
  footer,
  children,
}: {
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex max-h-[90vh] w-full flex-col overflow-hidden bg-slate-900/60 text-slate-100',
        className
      )}
    >
      {header ? (
        <div className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur">
          {header}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto">{children}</div>

      {footer ? (
        <div className="sticky bottom-0 z-10 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
