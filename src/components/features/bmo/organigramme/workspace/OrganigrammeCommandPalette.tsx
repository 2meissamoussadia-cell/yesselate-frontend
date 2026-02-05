/**
 * Command Palette pour Organigramme
 * Recherche et navigation rapide
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganigrammeCommandCenterStore } from '@/lib/stores/organigrammeCommandCenterStore';

export function OrganigrammeCommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, globalSearch, setGlobalSearch } = useOrganigrammeCommandCenterStore();

  if (!commandPaletteOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={toggleCommandPalette}
      />
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-slate-900 border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCommandPalette}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="text-sm text-slate-400 text-center py-8">
              Recherche en cours de développement
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

