/**
 * Accordion Component
 * Composant accordion amélioré
 */

'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
  variant?: 'default' | 'bordered' | 'ghost';
}

export function Accordion({
  items,
  allowMultiple = false,
  className,
  variant = 'default',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  const variantStyles = {
    default: 'bg-slate-800/50',
    bordered: 'border border-slate-700/50 bg-slate-900',
    ghost: 'bg-transparent',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map(item => {
        const isOpen = openItems.has(item.id);

        return (
          <div
            key={item.id}
            className={cn(
              'rounded-lg overflow-hidden',
              variantStyles[variant]
            )}
          >
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center justify-between p-4 text-left transition-colors',
                'hover:bg-slate-800/50',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="font-medium text-slate-200">{item.title}</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-slate-400 transition-transform flex-shrink-0',
                  isOpen && 'transform rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-slate-300">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

