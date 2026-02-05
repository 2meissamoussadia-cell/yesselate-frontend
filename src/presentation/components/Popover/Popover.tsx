/**
 * Popover Component
 * Composant popover amélioré
 */

'use client';

import { ReactNode, useState, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/application/hooks/useClickOutside';
import { FadeIn } from '../Animations';

interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  placement?: 
    | 'top' 
    | 'top-start' 
    | 'top-end'
    | 'bottom' 
    | 'bottom-start' 
    | 'bottom-end'
    | 'left' 
    | 'left-start' 
    | 'left-end'
    | 'right' 
    | 'right-start' 
    | 'right-end';
  className?: string;
  closeOnClickOutside?: boolean;
  closeOnContentClick?: boolean;
}

const placementClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  'top-start': 'bottom-full left-0 mb-2',
  'top-end': 'bottom-full right-0 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  'bottom-start': 'top-full left-0 mt-2',
  'bottom-end': 'top-full right-0 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  'left-start': 'right-full top-0 mr-2',
  'left-end': 'right-full bottom-0 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  'right-start': 'left-full top-0 ml-2',
  'right-end': 'left-full bottom-0 ml-2',
};

export function Popover({
  trigger,
  content,
  placement = 'bottom-start',
  className,
  closeOnClickOutside = true,
  closeOnContentClick = false,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useClickOutside(popoverRef, () => {
    if (closeOnClickOutside && isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <div ref={popoverRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <FadeIn>
          <div
            className={cn(
              'absolute z-50 min-w-[200px] rounded-lg border border-slate-700/50',
              'bg-slate-900 shadow-xl p-3',
              placementClasses[placement],
              className
            )}
            onClick={() => {
              if (closeOnContentClick) {
                setIsOpen(false);
              }
            }}
          >
            {content}
          </div>
        </FadeIn>
      )}
    </div>
  );
}

