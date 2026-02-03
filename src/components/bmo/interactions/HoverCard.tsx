'use client';

/**
 * HoverCard — Preview au survol type Outlook
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface HoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  delay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function HoverCard({
  trigger,
  content,
  delay = 500,
  placement = 'right',
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const updatePosition = () => {
    if (triggerRef.current && typeof document !== 'undefined') {
      const rect = triggerRef.current.getBoundingClientRect();
      const gap = 8;
      const pad = 16;
      let top = 0;
      let left = 0;
      switch (placement) {
        case 'right':
          top = rect.top;
          left = rect.right + gap;
          break;
        case 'left':
          top = rect.top;
          left = rect.left - 300 - gap;
          break;
        case 'top':
          top = rect.top - 200 - gap;
          left = rect.left;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left;
          break;
        default:
          top = rect.top;
          left = rect.right + gap;
      }
      setPosition({
        top: Math.max(pad, Math.min(top, window.innerHeight - 220)),
        left: Math.max(pad, Math.min(left, window.innerWidth - 320)),
      });
    }
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (typeof document === 'undefined') return <div ref={triggerRef}>{trigger}</div>;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            style={{ top: position.top, left: position.left }}
            className="fixed z-50 w-80 max-w-[calc(100vw-32px)] animate-in fade-in-0 zoom-in-95 duration-150"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={cn(
                'rounded-lg border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 shadow-lg p-4'
              )}
            >
              {content}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
