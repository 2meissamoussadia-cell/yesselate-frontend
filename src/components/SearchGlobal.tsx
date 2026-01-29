'use client';

/**
 * Recherche globale (Cmd/Ctrl+K) - chantiers, clients, ouvriers, validations, documents.
 * Fuzzy matching via API, résultats groupés, navigation clavier, recherches récentes.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchGlobalStore } from '@/lib/stores/searchGlobalStore';
import { isMac } from '@/lib/utils';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const PLACEHOLDER = 'Rechercher chantiers, clients, ouvriers...';
const EMPTY_MESSAGE = "Aucun résultat. Essayez d'autres mots-clés.";

export interface SearchResultItem {
  id: string;
  type: 'chantier' | 'client' | 'ouvrier' | 'validation' | 'document';
  title: string;
  meta: string;
  href: string;
  icon: string;
}

interface SearchApiResponse {
  query: string;
  results: SearchResultItem[];
  groups: {
    chantiers: SearchResultItem[];
    clients: SearchResultItem[];
    ouvriers: SearchResultItem[];
    validations: SearchResultItem[];
    documents: SearchResultItem[];
  };
  total: number;
  summary: Record<string, number>;
}

async function fetchSearch(q: string): Promise<SearchApiResponse> {
  const params = new URLSearchParams({ q, limitPerType: '10', limitTotal: '50' });
  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? 'Erreur recherche');
  }
  return res.json();
}

const GROUP_LABELS: Record<string, string> = {
  chantiers: 'Chantiers',
  clients: 'Clients',
  ouvriers: 'Ouvriers',
  validations: 'Validations',
  documents: 'Documents',
};

export function SearchGlobal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { recent, addRecent } = useSearchGlobalStore();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search-global', debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: 30_000,
  });

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

  const onSelect = useCallback(
    (item: SearchResultItem) => {
      addRecent({
        query: debouncedQuery || item.title,
        type: item.type,
        id: item.id,
        title: item.title,
        href: item.href,
      });
      setOpen(false);
      setQuery('');
      router.push(item.href);
    },
    [addRecent, debouncedQuery, router]
  );

  const showRecent = !debouncedQuery || debouncedQuery.length < MIN_QUERY_LENGTH;
  const groups = data?.groups;
  const hasResults = groups && Object.values(groups).some((arr) => arr.length > 0);
  const loading = isLoading || (isFetching && debouncedQuery.length >= MIN_QUERY_LENGTH);

  const shortcut = isMac() ? '⌘' : 'Ctrl';
  const footerShortcuts = useMemo(
    () => [
      { keys: `${shortcut}K`, label: 'Ouvrir' },
      { keys: '↑↓', label: 'Naviguer' },
      { keys: 'Entrée', label: 'Sélectionner' },
      { keys: 'Échap', label: 'Fermer' },
    ],
    [shortcut]
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Recherche globale"
        className={cn(
          'fixed z-[101] flex flex-col overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-2xl',
          'left-1/2 top-[10%] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2',
          'h-[85dvh] max-h-[85dvh] sm:h-auto sm:max-h-[80vh]',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] px-3">
          <Search className="h-4 w-4 shrink-0 text-[rgb(var(--muted))]" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder={PLACEHOLDER}
            className="flex h-12 w-full bg-transparent py-3 pl-1 text-sm outline-none placeholder:text-[rgb(var(--muted))]"
            autoFocus
          />
          <kbd className="hidden h-6 select-none items-center rounded border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-2 font-mono text-[10px] sm:inline-flex">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[50vh] min-h-[120px] overflow-y-auto p-2">
          {loading && (
            <Command.Loading className="py-8 text-center text-sm text-[rgb(var(--muted))]">
              Recherche en cours…
            </Command.Loading>
          )}

          {!loading && showRecent && recent.length > 0 && (
            <Command.Group heading="Recherches récentes" className="mb-2">
              {recent.slice(0, 5).map((r, i) => (
                <Command.Item
                  key={`recent-${r.type}-${r.id}-${r.at}`}
                  value={`recent-${r.type}-${r.id}-${r.title}`}
                  onSelect={() => {
                    setOpen(false);
                    setQuery('');
                    router.push(r.href);
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-[rgb(var(--surface-2))]"
                >
                  <span className="text-base opacity-80">{r.type === 'chantier' ? '🏗️' : r.type === 'client' ? '👤' : r.type === 'ouvrier' ? '👷' : r.type === 'validation' ? '✅' : '📄'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.title}</div>
                    <div className="truncate text-xs text-[rgb(var(--muted))]">{r.href}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {!loading && debouncedQuery.length >= MIN_QUERY_LENGTH && !hasResults && (
            <div className="py-8 text-center text-sm text-[rgb(var(--muted))]">
              {EMPTY_MESSAGE}
            </div>
          )}

          {!loading && groups && hasResults && (
            <>
              {(['chantiers', 'clients', 'ouvriers', 'validations', 'documents'] as const).map(
                (key) => {
                  const items = groups[key];
                  if (!items?.length) return null;
                  return (
                    <Command.Group
                      key={key}
                      heading={`${GROUP_LABELS[key]} (${items.length})`}
                      className="mb-2 text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted))]"
                    >
                      {items.map((item) => (
                        <Command.Item
                          key={`${item.type}-${item.id}`}
                          value={`${item.type}-${item.id}-${item.title}-${item.meta}`}
                          onSelect={() => onSelect(item)}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-[rgb(var(--surface-2))]"
                        >
                          <span className="text-base">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{item.title}</div>
                            <div className="truncate text-xs text-[rgb(var(--muted))]">{item.meta}</div>
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                }
              )}
            </>
          )}
        </Command.List>

        <div className="flex flex-wrap items-center gap-3 border-t border-[rgb(var(--border))] px-3 py-2 text-[10px] text-[rgb(var(--muted))]">
          {footerShortcuts.map((s) => (
            <span key={s.label} className="flex items-center gap-1">
              <kbd className="rounded border border-[rgb(var(--border))] bg-[rgb(var(--surface-2))] px-1.5 py-0.5 font-mono">
                {s.keys}
              </kbd>
              <span>{s.label}</span>
            </span>
          ))}
        </div>
      </Command.Dialog>
    </>
  );
}
