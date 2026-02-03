'use client';

/**
 * UserRoleManager — Gestion des rôles et permissions (ERP BTP).
 * DG, MOA, MOE, OPC, Administrateur, Lecteur — attribution et audit.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type RoleId = 'DG' | 'MOA' | 'MOE' | 'OPC' | 'Administrateur' | 'Lecteur';

export interface UserWithRole {
  id: string;
  name: string;
  role: RoleId;
}

export interface UserRoleManagerProps {
  users?: UserWithRole[];
  onRoleChange?: (userId: string, role: RoleId) => void;
  className?: string;
}

const ROLES: { value: RoleId; label: string }[] = [
  { value: 'DG', label: 'DG' },
  { value: 'MOA', label: 'MOA' },
  { value: 'MOE', label: 'MOE' },
  { value: 'OPC', label: 'OPC' },
  { value: 'Administrateur', label: 'Administrateur' },
  { value: 'Lecteur', label: 'Lecteur' },
];

const defaultUsers: UserWithRole[] = [
  { id: '1', name: 'A. DIALLO', role: 'DG' },
  { id: '2', name: 'M. KONE', role: 'MOA' },
  { id: '3', name: 'S. TOURE', role: 'MOE' },
  { id: '4', name: 'K. BAMBA', role: 'OPC' },
  { id: '5', name: 'Admin Système', role: 'Administrateur' },
  { id: '6', name: 'L. OUATTARA', role: 'Lecteur' },
];

export function UserRoleManager({
  users = defaultUsers,
  onRoleChange,
  className,
}: UserRoleManagerProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-slate-100">
        Gestion des rôles
      </h3>
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 overflow-hidden">
        <header className="px-4 py-2 border-b border-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Utilisateurs et rôles
          </span>
          <span className="text-xs text-slate-400">Actions</span>
        </header>
        <div className="p-4 space-y-0">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-2 border-b border-slate-800/60 last:border-b-0"
            >
              <span className="text-sm text-slate-100">{u.name}</span>
              <Select
                value={u.role}
                onValueChange={(value: string) => onRoleChange?.(u.id, value as RoleId)}
              >
                <SelectTrigger
                  className={cn(
                    'text-xs rounded border border-slate-700 bg-slate-900 text-slate-100',
                    'px-2 py-1.5 min-w-[140px] h-8',
                    'focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 focus:ring-offset-slate-900'
                  )}
                  aria-label={`Rôle de ${u.name}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
