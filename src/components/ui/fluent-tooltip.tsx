'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/cn';

/**
 * FluentTooltip - Style Windows 11
 * Tooltip avec effet mica/acrylic et animations fluides
 */

const FluentTooltipProvider = TooltipPrimitive.Provider;

const FluentTooltip = TooltipPrimitive.Root;

const FluentTooltipTrigger = TooltipPrimitive.Trigger;

const FluentTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-lg px-3 py-1.5 text-xs',
      'bg-[rgb(var(--surface)/0.95)] backdrop-blur-md',
      'border border-[rgb(var(--border)/0.6)]',
      'text-[rgb(var(--text))]',
      'shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
      'animate-in fade-in-0 zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'data-[side=bottom]:slide-in-from-top-2',
      'data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2',
      'data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
FluentTooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { FluentTooltip, FluentTooltipTrigger, FluentTooltipContent, FluentTooltipProvider };

