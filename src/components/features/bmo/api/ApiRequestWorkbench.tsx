'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type EndpointLike = {
  id: string;
  name: string;
  method: string;
  path: string;
  avgResponseTime?: number;
  errorRate?: number;
};

type SavedRequest = {
  id: string;
  name: string;
  createdAt: number;
  endpointId: string;
  method: string;
  path: string;
  baseUrl: string;
  query: string;
  headersText: string;
  bodyText: string;
};

type ExecHistoryItem = {
  id: string;
  createdAt: number;
  endpointId: string;
  status: number;
  durationMs: number;
  responseBytes: number;
  request: {
    baseUrl: string;
    query: string;
    headersText: string;
    bodyText: string;
    method: string;
    path: string;
  };
  curl: string;
};

const STORAGE_SAVED = 'bmo.api.savedRequests.v1';
const STORAGE_HISTORY = 'bmo.api.execHistory.v1';

function createId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function safeCopy(text: string) {
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  );
}

function parseHeaders(headersText: string): Record<string, string> {
  const raw = headersText.trim();
  if (!raw) return {};
  // JSON
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj as any)) out[String(k)] = String(v);
      return out;
    }
  } catch {
    // ignore
  }

  // Lines "Key: Value"
  const out: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    if (!k) continue;
    out[k] = v;
  }
  return out;
}

function buildCurl(args: {
  method: string;
  url: string;
  headers: Record<string, string>;
  bodyText: string;
}): string {
  const m = String(args.method || 'GET').toUpperCase();
  const parts: string[] = ['curl', '-X', m, `'${args.url.replace(/'/g, "'\\''")}'`];
  for (const [k, v] of Object.entries(args.headers)) {
    parts.push('-H', `'${String(k).replace(/'/g, "'\\''")}: ${String(v).replace(/'/g, "'\\''")}'`);
  }
  const body = args.bodyText?.trim();
  if (body && !['GET', 'HEAD'].includes(m)) {
    parts.push('--data', `'${body.replace(/'/g, "'\\''")}'`);
  }
  return parts.join(' ');
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ApiRequestWorkbench({ endpoint }: { endpoint: EndpointLike }) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const mountedRef = useRef(false);

  const [saved, setSaved] = useState<SavedRequest[]>([]);
  const [history, setHistory] = useState<ExecHistoryItem[]>([]);

  const [templateName, setTemplateName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('NONE');

  const [baseUrl, setBaseUrl] = useState('https://api.yesselate.local');
  const [query, setQuery] = useState('');
  const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}');
  const [bodyText, setBodyText] = useState('{\n  \n}');

  useEffect(() => {
    setSaved(() => {
      const arr = safeParse<any>(localStorage.getItem(STORAGE_SAVED), []);
      return Array.isArray(arr) ? (arr as SavedRequest[]) : [];
    });
    setHistory(() => {
      const arr = safeParse<any>(localStorage.getItem(STORAGE_HISTORY), []);
      return Array.isArray(arr) ? (arr as ExecHistoryItem[]) : [];
    });
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    try {
      localStorage.setItem(STORAGE_SAVED, JSON.stringify(saved.slice(0, 50)));
    } catch {
      // ignore
    }
  }, [saved]);

  useEffect(() => {
    if (!mountedRef.current) return;
    try {
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history.slice(0, 200)));
    } catch {
      // ignore
    }
  }, [history]);

  const endpointSaved = useMemo(() => saved.filter((s) => s.endpointId === endpoint.id), [saved, endpoint.id]);
  const endpointHistory = useMemo(() => history.filter((h) => h.endpointId === endpoint.id).slice(0, 8), [history, endpoint.id]);

  const url = useMemo(() => {
    const b = baseUrl.replace(/\/+$/, '');
    const p = endpoint.path.startsWith('/') ? endpoint.path : `/${endpoint.path}`;
    const q = query.trim();
    const qs = q ? (q.startsWith('?') ? q : `?${q}`) : '';
    return `${b}${p}${qs}`;
  }, [baseUrl, endpoint.path, query]);

  const curl = useMemo(() => {
    const headers = parseHeaders(headersText);
    return buildCurl({ method: endpoint.method, url, headers, bodyText });
  }, [endpoint.method, url, headersText, bodyText]);

  const saveTemplate = () => {
    const name = templateName.trim();
    if (name.length < 2) return addToast('Nom du modèle trop court (min. 2 caractères).', 'warning');
    const next: SavedRequest = {
      id: createId(),
      name,
      createdAt: Date.now(),
      endpointId: endpoint.id,
      method: endpoint.method,
      path: endpoint.path,
      baseUrl,
      query,
      headersText,
      bodyText,
    };
    setSaved((prev) => [next, ...prev].slice(0, 50));
    setTemplateName('');
    setSelectedTemplateId(next.id);
    addToast('Modèle de requête sauvegardé.', 'success');
  };

  const applyTemplate = (id: string) => {
    const tpl = saved.find((s) => s.id === id);
    if (!tpl) return;
    setBaseUrl(tpl.baseUrl || baseUrl);
    setQuery(tpl.query || '');
    setHeadersText(tpl.headersText || '');
    setBodyText(tpl.bodyText || '');
    addToast(`Modèle appliqué : ${tpl.name}`, 'info');
  };

  const deleteTemplate = (id: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId('NONE');
    addToast('Modèle supprimé.', 'info');
  };

  const simulateRun = async (overrides?: Partial<Pick<SavedRequest, 'baseUrl' | 'query' | 'headersText' | 'bodyText'>>) => {
    const avg = Number(endpoint.avgResponseTime ?? 250);
    const errRate = clamp(Number(endpoint.errorRate ?? 0), 0, 100);

    const jitter = 0.25 + Math.random() * 0.35;
    const duration = Math.max(30, Math.round(avg * (1 - jitter + Math.random() * jitter)));
    const isError = Math.random() * 100 < errRate;
    const status = isError ? (Math.random() < 0.5 ? 500 : 502) : 200;
    const responseBytes = Math.round(400 + Math.random() * 4200);

    const req = {
      baseUrl: overrides?.baseUrl ?? baseUrl,
      query: overrides?.query ?? query,
      headersText: overrides?.headersText ?? headersText,
      bodyText: overrides?.bodyText ?? bodyText,
      method: endpoint.method,
      path: endpoint.path,
    };

    addToast(`Exécution ${endpoint.method} ${endpoint.path}…`, 'info');
    await new Promise((r) => setTimeout(r, Math.min(duration, 800)));

    const headers = parseHeaders(req.headersText);
    const finalUrl = (() => {
      const b = req.baseUrl.replace(/\/+$/, '');
      const p = req.path.startsWith('/') ? req.path : `/${req.path}`;
      const q = req.query.trim();
      const qs = q ? (q.startsWith('?') ? q : `?${q}`) : '';
      return `${b}${p}${qs}`;
    })();
    const finalCurl = buildCurl({ method: req.method, url: finalUrl, headers, bodyText: req.bodyText });

    const item: ExecHistoryItem = {
      id: createId(),
      createdAt: Date.now(),
      endpointId: endpoint.id,
      status,
      durationMs: duration,
      responseBytes,
      request: req,
      curl: finalCurl,
    };

    setHistory((prev) => [item, ...prev].slice(0, 200));
    addToast(
      status >= 400 ? `❌ ${status} • ${duration}ms` : `✅ ${status} • ${duration}ms`,
      status >= 400 ? 'error' : 'success'
    );
  };

  const copyCurl = async (text: string) => {
    const ok = await safeCopy(text);
    addToast(ok ? 'cURL copié' : 'Impossible de copier (clipboard)', ok ? 'success' : 'warning');
  };

  const reRun = (h: ExecHistoryItem) => {
    setBaseUrl(h.request.baseUrl);
    setQuery(h.request.query);
    setHeadersText(h.request.headersText);
    setBodyText(h.request.bodyText);
    void simulateRun({
      baseUrl: h.request.baseUrl,
      query: h.request.query,
      headersText: h.request.headersText,
      bodyText: h.request.bodyText,
    });
  };

  return (
    <div className="space-y-3">
      <div className={cn('p-3 rounded border', darkMode ? 'border-slate-700 bg-slate-900/20' : 'border-gray-200 bg-gray-50')}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-400">🧪 Workbench (requêtes)</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => copyCurl(curl)} className="h-7 px-2 text-xs">
              📋 cURL
            </Button>
            <Button size="sm" variant="info" onClick={() => void simulateRun()} className="h-7 px-2 text-xs">
              ▶️ Exécuter
            </Button>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400">Base URL</label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className={cn('w-full px-2 py-1.5 rounded text-xs border', darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300')}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Query (a=1&b=2)</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn('w-full px-2 py-1.5 rounded text-xs border', darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300')}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400">Headers (JSON ou lignes "Key: Value")</label>
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              rows={4}
              className={cn(
                'w-full px-2 py-1.5 rounded text-xs font-mono border',
                darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'
              )}
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400">Body (JSON)</label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={5}
              className={cn(
                'w-full px-2 py-1.5 rounded text-xs font-mono border',
                darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'
              )}
            />
          </div>

          <div className="text-[10px] text-slate-400 font-mono break-all">
            URL: <span className="text-slate-300">{url}</span>
          </div>
        </div>
      </div>

      <Card className={cn(darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-200')}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400">💾 Modèles sauvegardés</p>
            <Badge variant="gray">{endpointSaved.length}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <select
              className={cn('flex-1 px-2 py-1.5 rounded text-xs border', darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300')}
              value={selectedTemplateId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedTemplateId(id);
                if (id !== 'NONE') applyTemplate(id);
              }}
            >
              <option value="NONE">Choisir un modèle…</option>
              {endpointSaved.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (selectedTemplateId !== 'NONE') deleteTemplate(selectedTemplateId);
              }}
              disabled={selectedTemplateId === 'NONE'}
              className="h-8 px-2 text-xs"
              title="Supprimer le modèle sélectionné"
            >
              🗑️
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Nom du modèle (ex: PROD auth)"
              className={cn('flex-1 px-2 py-1.5 rounded text-xs border', darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300')}
            />
            <Button size="sm" onClick={saveTemplate} disabled={templateName.trim().length < 2} className="h-8 px-2 text-xs">
              Sauver
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-gray-200')}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400">🕒 Historique (cet endpoint)</p>
            <Badge variant="gray">{endpointHistory.length}</Badge>
          </div>

          {endpointHistory.length === 0 ? (
            <div className="text-xs text-slate-400 py-2">Aucune exécution enregistrée.</div>
          ) : (
            <div className="space-y-2">
              {endpointHistory.map((h) => (
                <div
                  key={h.id}
                  className={cn(
                    'p-2 rounded border flex items-start justify-between gap-2',
                    darkMode ? 'border-slate-700' : 'border-gray-200'
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={h.status >= 400 ? 'urgent' : 'success'}>{h.status}</Badge>
                      <span className="text-[10px] text-slate-400 font-mono">{h.durationMs}ms</span>
                      <span className="text-[10px] text-slate-400 font-mono">{Math.round(h.responseBytes / 1024)}KB</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(h.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => reRun(h)} className="h-7 px-2 text-xs">
                      Relancer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void copyCurl(h.curl)} className="h-7 px-2 text-xs">
                      cURL
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


