'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FluentTabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function FluentTabs({ 
  value: controlledValue, 
  defaultValue, 
  onValueChange, 
  children,
  className 
}: FluentTabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  // Extraire les triggers et les contents
  const childrenArray = React.Children.toArray(children);
  const triggers: React.ReactElement[] = [];
  const contents: React.ReactElement[] = [];
  const otherChildren: React.ReactNode[] = [];

  childrenArray.forEach((child) => {
    if (React.isValidElement(child)) {
      if (child.type === FluentTabsTrigger || (child.props as { role?: string })?.role === 'trigger') {
        triggers.push(child);
      } else if (child.type === FluentTabsContent || (child.props as { role?: string })?.role === 'content') {
        contents.push(child);
      } else if (child.type === FluentTabsList) {
        // Si c'est un TabsList, extraire ses enfants
        React.Children.forEach((child.props as { children?: React.ReactNode }).children, (listChild) => {
          if (React.isValidElement(listChild)) {
            triggers.push(listChild);
          }
        });
      } else {
        otherChildren.push(child);
      }
    }
  });

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-[rgb(var(--surface-2)/0.8)] backdrop-blur-sm rounded-lg p-1 border border-[rgb(var(--border)/0.3)]">
          {triggers.map((trigger) => {
            if (React.isValidElement(trigger)) {
              const tabValue = (trigger.props as { value?: string }).value ?? '';
              const isActive = value === tabValue;
              return React.cloneElement(trigger as React.ReactElement<FluentTabsTriggerProps>, {
                key: tabValue,
                isActive,
                onClick: () => handleValueChange(tabValue),
              });
            }
            return trigger;
          })}
        </div>
        {/* Actions à droite */}
        {otherChildren.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {otherChildren}
          </div>
        )}
      </div>
      
      {/* Contenu avec animation */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {contents.map((content) => {
            if (React.isValidElement(content) && value === (content.props as { value?: string }).value) {
              const contentValue = (content.props as { value?: string }).value;
              return (
                <motion.div
                  key={contentValue}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {content}
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface FluentTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function FluentTabsTrigger({ 
  children, 
  isActive, 
  onClick, 
  disabled 
}: FluentTabsTriggerProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-md font-medium relative transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
        isActive
          ? 'text-[rgb(var(--text))] bg-[rgb(var(--surface)/0.5)]'
          : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--surface)/0.3)]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-x-1 bottom-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}

interface FluentTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function FluentTabsContent({ children, className }: FluentTabsContentProps) {
  return <div className={className}>{children}</div>;
}

// Composants pour compatibilité avec l'ancienne API
interface FluentTabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function FluentTabsList({ children, className }: FluentTabsListProps) {
  return (
    <div className={cn('flex bg-[rgb(var(--surface-2)/0.8)] backdrop-blur-sm rounded-lg p-1 border border-[rgb(var(--border)/0.3)]', className)}>
      {children}
    </div>
  );
}
