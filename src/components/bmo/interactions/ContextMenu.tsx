'use client';

/**
 * ContextMenu — Menu contextuel type Outlook (clic droit)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  onAction?: (itemId: string) => void;
}

export function ContextMenu({ children, items, onAction }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const onClose = () => handleClose();
      document.addEventListener('click', onClose);
      document.addEventListener('contextmenu', onClose);
      return () => {
        document.removeEventListener('click', onClose);
        document.removeEventListener('contextmenu', onClose);
      };
    }
  }, [isOpen, handleClose]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    onAction?.(item.id);
    handleClose();
  };

  if (typeof document === 'undefined') {
    return <div onContextMenu={handleContextMenu}>{children}</div>;
  }

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {isOpen &&
        createPortal(
          <div
            className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150"
            style={{ left: position.x, top: position.y }}
          >
            <div
              className={cn(
                'min-w-[200px] py-1 rounded-lg border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-900 shadow-lg'
              )}
            >
              {items.map((item, index) => (
                <div key={item.id}>
                  {item.divider ? (
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      disabled={item.disabled}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
                        'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                        item.disabled && 'opacity-50 cursor-not-allowed',
                        item.danger && 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                      )}
                    >
                      {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-slate-500">{item.shortcut}</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
