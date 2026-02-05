'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * FluentDialog - Style Windows 11
 * Dialogue modal avec effet mica/acrylic
 */

const FluentDialog = DialogPrimitive.Root;

const FluentDialogTrigger = DialogPrimitive.Trigger;

const FluentDialogPortal = DialogPrimitive.Portal;

const FluentDialogClose = DialogPrimitive.Close;

const FluentDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
FluentDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const FluentDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <FluentDialogPortal>
    <FluentDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
        'rounded-xl border backdrop-blur-md',
        'bg-[rgb(var(--surface)/0.95)] dark:bg-[rgb(var(--surface)/0.95)]',
        'border-[rgb(var(--border)/0.6)]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.24)]',
        'duration-200',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-[rgb(var(--surface-2))] transition-colors">
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </FluentDialogPortal>
));
FluentDialogContent.displayName = DialogPrimitive.Content.displayName;

const FluentDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 p-6 pb-4',
      className
    )}
    {...props}
  />
);
FluentDialogHeader.displayName = 'FluentDialogHeader';

const FluentDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-row justify-end space-x-2 p-6 pt-4',
      className
    )}
    {...props}
  />
);
FluentDialogFooter.displayName = 'FluentDialogFooter';

const FluentDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      'text-[rgb(var(--text))]',
      className
    )}
    {...props}
  />
));
FluentDialogTitle.displayName = DialogPrimitive.Title.displayName;

const FluentDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[rgb(var(--muted))]', className)}
    {...props}
  />
));
FluentDialogDescription.displayName =
  DialogPrimitive.Description.displayName;

export {
  FluentDialog,
  FluentDialogPortal,
  FluentDialogOverlay,
  FluentDialogTrigger,
  FluentDialogClose,
  FluentDialogContent,
  FluentDialogHeader,
  FluentDialogFooter,
  FluentDialogTitle,
  FluentDialogDescription,
};

