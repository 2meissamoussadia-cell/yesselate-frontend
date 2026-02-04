'use client';

/**
 * QuickActionsBar (mode config) — Barre d'actions config-driven avec dropdown.
 * Complément de QuickActionsBar pour usage avec ModuleConfig.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface QuickActionConfig {
  id: string;
  label: string;
  icon?: keyof typeof Icons;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  shortcut?: string;
  requiresSelection?: boolean;
  confirmDialog?: boolean;
  dropdown?: QuickActionConfig[];
  description?: string;
}

export interface QuickActionsPrimaryConfig extends QuickActionConfig {
  dropdown?: QuickActionConfig[];
}

interface QuickActionsBarConfigProps {
  primaryAction?: QuickActionsPrimaryConfig;
  secondaryActions?: QuickActionConfig[];
  onActionClick: (actionId: string) => void;
  selectedCount?: number;
  className?: string;
}

function getIcon(iconName?: keyof typeof Icons) {
  if (!iconName) return null;
  const Icon = Icons[iconName] as LucideIcon | undefined;
  return Icon ? <Icon className="w-4 h-4" /> : null;
}

export function QuickActionsBarConfig({
  primaryAction,
  secondaryActions = [],
  onActionClick,
  selectedCount = 0,
  className,
}: QuickActionsBarConfigProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const renderAction = (action: QuickActionConfig, isPrimary = false) => {
    const isDisabled = action.requiresSelection && selectedCount === 0;
    const Icon = action.icon ? (Icons[action.icon] as LucideIcon) : null;

    if (action.dropdown && action.dropdown.length > 0) {
      return (
        <DropdownMenu
          key={action.id}
          open={openDropdown === action.id}
          onOpenChange={(open) => setOpenDropdown(open ? action.id : null)}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant={(action.variant as 'default' | 'outline' | 'ghost' | 'destructive') || (isPrimary ? 'default' : 'outline')}
              size="sm"
              disabled={isDisabled}
              className={cn(isPrimary && 'font-medium')}
            >
              {Icon && <Icon className="w-4 h-4 mr-2" />}
              {action.label}
              <Icons.ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {action.dropdown.map((subAction, idx) => {
              const SubIcon = subAction.icon ? (Icons[subAction.icon] as LucideIcon) : null;
              return (
                <div key={subAction.id}>
                  {idx > 0 && subAction.description && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => {
                      onActionClick(subAction.id);
                      setOpenDropdown(null);
                    }}
                    disabled={subAction.requiresSelection && selectedCount === 0}
                  >
                    <div className="flex items-start gap-3 w-full">
                      {SubIcon && <SubIcon className="w-4 h-4 mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{subAction.label}</div>
                        {subAction.description && (
                          <div className="text-xs text-slate-500 mt-0.5">{subAction.description}</div>
                        )}
                      </div>
                      {subAction.shortcut && (
                        <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                          {subAction.shortcut}
                        </kbd>
                      )}
                    </div>
                  </DropdownMenuItem>
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        key={action.id}
        variant={(action.variant as 'default' | 'outline' | 'ghost' | 'destructive') || (isPrimary ? 'default' : 'outline')}
        size="sm"
        disabled={isDisabled}
        onClick={() => onActionClick(action.id)}
        className={cn(isPrimary && 'font-medium')}
      >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {action.label}
        {action.shortcut && (
          <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 dark:bg-slate-800 rounded">{action.shortcut}</kbd>
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {primaryAction && renderAction(primaryAction, true)}
        {secondaryActions.length > 0 && (
          <>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              {secondaryActions.map((action) => renderAction(action))}
            </div>
          </>
        )}
      </div>
      {selectedCount > 0 && (
        <Badge variant="secondary" className="ml-auto">
          {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}
