'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Trash2, Check, Save } from 'lucide-react';

type SavedViewState = {
  activeView: string;
  selectedBureau: string;
  selectedProject: string;
  advancedFilters: Record<string, any>;
  selectedBureaux: string[];
};

type SavedView = {
  id: string;
  name: string;
  createdAt: number;
  state: SavedViewState;
};

const STORAGE_KEY = 'bmo.analytics.savedViews.v1';

function safeParse(json: string | null): SavedView[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v) => v && typeof v === 'object')
      .map((v) => ({
        id: String((v as any).id ?? ''),
        name: String((v as any).name ?? 'Vue'),
        createdAt: Number((v as any).createdAt ?? Date.now()),
        state: {
          activeView: String((v as any)?.state?.activeView ?? 'overview'),
          selectedBureau: String((v as any)?.state?.selectedBureau ?? 'ALL'),
          selectedProject: String((v as any)?.state?.selectedProject ?? 'ALL'),
          advancedFilters: (v as any)?.state?.advancedFilters && typeof (v as any).state.advancedFilters === 'object' ? (v as any).state.advancedFilters : {},
          selectedBureaux: Array.isArray((v as any)?.state?.selectedBureaux) ? (v as any).state.selectedBureaux.map(String) : [],
        },
      }))
      .filter((v) => v.id);
  } catch {
    return [];
  }
}

function createId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `view_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export function SavedViews({
  current,
  onApply,
}: {
  current: SavedViewState;
  onApply: (state: SavedViewState) => void;
}) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [views, setViews] = useState<SavedView[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setViews(safeParse(localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const persist = (next: SavedView[]) => {
    setViews(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const canSave = useMemo(() => name.trim().length >= 2, [name]);

  const saveCurrent = () => {
    const label = name.trim();
    if (label.length < 2) {
      addToast('Nom de vue trop court (min. 2 caractères).', 'warning');
      return;
    }
    const next: SavedView[] = [
      {
        id: createId(),
        name: label,
        createdAt: Date.now(),
        state: {
          activeView: current.activeView,
          selectedBureau: current.selectedBureau,
          selectedProject: current.selectedProject,
          advancedFilters: current.advancedFilters ?? {},
          selectedBureaux: Array.isArray(current.selectedBureaux) ? current.selectedBureaux : [],
        },
      },
      ...views,
    ].slice(0, 20);
    persist(next);
    setName('');
    addToast('Vue sauvegardée.', 'success');
  };

  const apply = (v: SavedView) => {
    onApply(v.state);
    setIsOpen(false);
    addToast(`Vue appliquée : ${v.name}`, 'success');
  };

  const remove = (id: string) => {
    const next = views.filter((v) => v.id !== id);
    persist(next);
    addToast('Vue supprimée.', 'info');
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen((s) => !s)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="gap-2"
      >
        <Bookmark className="w-4 h-4" />
        Vues
        {views.length > 0 && (
          <Badge variant="gray" className="ml-1">
            {views.length}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card
          className={cn(
            'absolute top-full right-0 mt-2 w-[420px] z-50 shadow-xl',
            'bg-slate-800 border-slate-700'
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Vues sauvegardées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de la vue (ex: DG - Trimestre - BF/BM)"
                aria-label="Nom de la vue à sauvegarder"
                className={cn(
                  'flex-1 px-3 py-2 rounded text-xs border',
                  'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                )}
              />
              <Button size="sm" onClick={saveCurrent} disabled={!canSave} className="gap-2">
                <Save className="w-4 h-4" />
                Sauver
              </Button>
            </div>

            {views.length === 0 ? (
              <div className={cn('p-3 rounded border text-xs', 'border-slate-700 text-slate-300')}>
                Aucune vue enregistrée. Sauvegardez une configuration de filtres/onglets pour la rappeler en 1 clic.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {views.map((v) => (
                  <div
                    key={v.id}
                    className={cn(
                      'p-3 rounded border flex items-start justify-between gap-3',
                      'border-slate-700 hover:bg-slate-700/30'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{v.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {new Date(v.createdAt).toLocaleString('fr-FR')} • onglet: {v.state.activeView}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {v.state.advancedFilters?.period && <Badge variant="info">{String(v.state.advancedFilters.period)}</Badge>}
                        {Array.isArray(v.state.selectedBureaux) && v.state.selectedBureaux.length > 0 && (
                          <Badge variant="gray">{v.state.selectedBureaux.length} bureau{v.state.selectedBureaux.length > 1 ? 'x' : ''}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => apply(v)} className="gap-2">
                        <Check className="w-4 h-4" />
                        Appliquer
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(v.id)} aria-label={`Supprimer la vue ${v.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


