/**
 * Dropdown Component
 * Menu déroulant amélioré
 */

'use client';

import { ReactNode, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/application/hooks/useClickOutside';
import { FadeIn } from '../Animations';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  variant?: 'default' | 'danger';
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
  align?: 'left' | 'right';
  onItemClick?: (item: DropdownItem) => void;
}

export function Dropdown({
  trigger,
  items,
  placement = 'bottom-start',
  className,
  align = 'left',
  onItemClick,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onItemClick?.(item);
    setIsOpen(false);
  };

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
        type="button"
      >
        {trigger}
      </button>

      {isOpen && (
        <FadeIn>
          <div
            className={cn(
              'absolute z-50 min-w-[200px] rounded-lg border border-slate-700/50 bg-slate-900 shadow-xl py-1',
              placementClasses[placement],
              align === 'right' && 'right-0'
            )}
          >
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="my-1 border-t border-slate-700/50"
                  />
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    item.variant === 'danger'
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-slate-300 hover:bg-slate-800',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            })}
          </div>
        </FadeIn>
      )}
    </div>
  );
}

/**
 * DropdownButton - Bouton avec dropdown intégré
 */
interface DropdownButtonProps {
  label: string;
  items: DropdownItem[];
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

export function DropdownButton({
  label,
  items,
  variant = 'default',
  size = 'md',
  icon,
  className,
}: DropdownButtonProps) {
  const variantClasses = {
    default: 'bg-slate-800 text-slate-200 hover:bg-slate-700',
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <Dropdown
      trigger={
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border border-slate-700/50 transition-colors',
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
        >
          {icon && icon}
          <span>{label}</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      }
      items={items}
    />
  );
}

