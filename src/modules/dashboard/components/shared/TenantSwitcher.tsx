/**
 * Phase 4 — Multi-tenancy : sélecteur de tenant (header)
 */

'use client';

import React, { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTenantStore } from '@/lib/stores/tenantStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function TenantSwitcher({ className }: { className?: string }) {
  const { currentTenant, tenants, setCurrentTenant } = useTenantStore();
  const [open, setOpen] = useState(false);

  const current = currentTenant();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center gap-2 text-slate-400 hover:text-slate-200 min-w-0 max-w-[180px]',
            className
          )}
          aria-label="Changer de tenant"
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{current?.name ?? 'Tenant'}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {tenants.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => {
              setCurrentTenant(t.id);
              setOpen(false);
            }}
            className={cn(current?.id === t.id && 'bg-slate-800 text-slate-100')}
          >
            {t.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
