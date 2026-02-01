'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Context for dropdown state
interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenChange?: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within DropdownMenu');
  }
  return context;
}

// DropdownMenu Root
interface DropdownMenuProps {
  children: React.ReactNode;
  /** Appelé quand le menu s'ouvre ou se ferme (utile pour réinitialiser un sous-menu). */
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({ children, onOpenChange }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  const setOpenWithCallback = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) onOpenChange?.(false);
    },
    [onOpenChange]
  );

  return (
    <DropdownContext.Provider value={{ open, setOpen: setOpenWithCallback, onOpenChange }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

// DropdownMenuTrigger
interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { open, setOpen, onOpenChange } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !open;
    setOpen(next);
    if (next) onOpenChange?.(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        (children as React.ReactElement<any>).props?.onClick?.(e);
      },
      'aria-expanded': open,
      'aria-haspopup': true,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {children}
    </button>
  );
}

// DropdownMenuContent
interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
}

function DropdownMenuContent({
  align = 'end',
  sideOffset,
  className,
  children,
}: DropdownMenuContentProps) {
  const { open, setOpen, onOpenChange } = useDropdownContext();
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const marginTop = sideOffset !== undefined ? sideOffset : 4;
  return (
    <div
      ref={ref}
      style={{ marginTop: `${marginTop}px` }}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-700 bg-slate-900 p-1 shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        alignClasses[align],
        className
      )}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
}

// DropdownMenuItem
interface DropdownMenuItemProps {
  className?: string;
  disabled?: boolean;
  onSelect?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function DropdownMenuItem({
  className,
  disabled,
  onSelect,
  onClick,
  children,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownContext();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    onClick?.(e);
    onSelect?.();
    setOpen(false);
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'text-slate-300 transition-colors',
        'hover:bg-slate-800 focus:bg-slate-800',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

// DropdownMenuSeparator
interface DropdownMenuSeparatorProps {
  className?: string;
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-slate-700', className)}
    />
  );
}

// DropdownMenuLabel
interface DropdownMenuLabelProps {
  className?: string;
  children: React.ReactNode;
}

function DropdownMenuLabel({ className, children }: DropdownMenuLabelProps) {
  return (
    <div
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-slate-400',
        className
      )}
    >
      {children}
    </div>
  );
}

// DropdownMenuSubTrigger — ouvre un sous-menu au clic sans fermer le menu principal
interface DropdownMenuSubTriggerProps {
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function DropdownMenuSubTrigger({
  className,
  disabled,
  onClick,
  children,
}: DropdownMenuSubTriggerProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    onClick?.(e);
    // Ne pas appeler setOpen(false) : le menu reste ouvert pour afficher le sous-contenu
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'text-slate-300 transition-colors',
        'hover:bg-slate-800 focus:bg-slate-800',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSubTrigger,
};

