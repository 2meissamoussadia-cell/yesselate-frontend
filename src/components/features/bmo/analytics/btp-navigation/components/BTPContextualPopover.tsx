/**
 * Popover Contextuel BTP
 * Popover intelligent avec informations contextuelles
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface BTPContextualPopoverProps {
  trigger: React.ReactNode;
  title?: string;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function BTPContextualPopover({
  trigger,
  title,
  content,
  position = 'bottom',
  className,
}: BTPContextualPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'absolute z-50 bg-slate-800 rounded-lg border border-slate-700 shadow-xl p-4 min-w-[200px] max-w-[300px]',
              positionClasses[position],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="text-sm text-slate-300">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

