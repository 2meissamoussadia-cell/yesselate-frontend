'use client';

import { useCallback, useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { useChantiersList } from '@/lib/hooks/useChantiers';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 300;

export function SmartSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data, isLoading } = useChantiersList({
    take: 10,
    ...(debouncedQuery ? {} : { take: 5 }),
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const chantiers = data?.items ?? [];
  const filteredChantiers = debouncedQuery
    ? chantiers.filter(
        (c) =>
          c.nom.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          (typeof c.client === 'object' && c.client?.nom?.toLowerCase().includes(debouncedQuery.toLowerCase()))
      )
    : chantiers.slice(0, 5);

  const run = useCallback((id: string) => {
    setOpen(false);
    setQuery('');
    window.location.href = `/chantiers/${id}`;
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
        )}
        aria-label="Recherche (Cmd+K)"
        data-command-trigger
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">Recherche…</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Recherche intelligente"
        className={cn(
          'fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2',
          'rounded-lg border bg-card shadow-lg',
          'overflow-hidden animate-fade-in'
        )}
      >
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Chantiers, clients, phase…"
            className="flex h-11 w-full bg-transparent py-3 pl-2 text-sm outline-none placeholder:text-muted-foreground"
            data-command-input
          />
          <kbd className="hidden h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline-flex">
            ESC
          </kbd>
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto p-1">
          {isLoading && (
            <Command.Loading className="py-6 text-center text-sm text-muted-foreground">
              Chargement…
            </Command.Loading>
          )}
          {!isLoading && filteredChantiers.length === 0 && (
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              Aucun résultat.
            </Command.Empty>
          )}
          <Command.Group heading="Chantiers" className="text-xs text-muted-foreground">
            {filteredChantiers.map((c) => (
              <Command.Item
                key={c.id}
                value={`chantier-${c.id}-${c.nom}`}
                onSelect={() => run(c.id)}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                data-command-item
              >
                <span className="font-medium">{c.nom}</span>
                {typeof c.client === 'object' && c.client?.nom && (
                  <span className="text-muted-foreground">— {c.client.nom}</span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
