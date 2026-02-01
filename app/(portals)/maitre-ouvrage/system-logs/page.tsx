'use client';

import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { systemLogs } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import {
  SystemLogsKPIBar,
  SystemLogsCommandPalette,
  SystemLogsModals,
  SystemLogsDetailPanel,
  systemLogsCategories,
} from '@/components/features/bmo/system-logs/command-center';
// New 3-level navigation module
import {
  SystemLogsSidebar,
  SystemLogsSubNavigation,
  SystemLogsContentRouter,
  type SystemLogsMainCategory,
} from '@/modules/system-logs';
import { Terminal, Search, Bell, ChevronLeft, MoreHorizontal, Download, FileCheck } from 'lucide-react';
import { useSystemLogsCommandCenterStore } from '@/lib/stores/systemLogsCommandCenterStore';

/* --------------------------------------------
   TYPES (tolérants: tes logs peuvent avoir + de champs)
-------------------------------------------- */

type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical' | 'security' | string;
type LogCategory = 'auth' | 'data' | 'system' | 'api' | 'security' | 'audit' | 'user_action' | string;

type LinkedEntity = { type: string; id: string };

type SystemLog = {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  source: string;
  message: string;
  userId?: string;
  ip?: string;
  sessionId?: string;
  details?: Record<string, any>;
  linkedEntity?: LinkedEntity;
  hash?: string; // hash stocké (si présent)
  [k: string]: any;
};

type DerivedLog = SystemLog & {
  tsMs: number;
  dayKey: string | null;
  severity: number; // 0..100
  fingerprint: string; // dédup/corrélation
};

type IncidentStatus = 'open' | 'triage' | 'mitigated' | 'closed';

type Incident = {
  id: string;
  title: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  tags: string[];
  logIds: string[];
  notes: { at: string; by: string; text: string }[];
  raci: { A: string; R: string; C: string; I: string };
};

/* --------------------------------------------
   CONFIG UI (pas de classes tailwind dynamiques)
-------------------------------------------- */

const ACTOR = {
  userId: 'USR-001',
  userName: 'A. DIALLO',
  userRole: 'Directeur Général',
} as const;

const LEVEL_CONFIG: Record<
  string,
  { icon: string; variant: 'default' | 'info' | 'warning' | 'destructive' | 'success' }
> = {
  debug: { icon: '🔧', variant: 'default' },
  info: { icon: 'ℹ️', variant: 'info' },
  warning: { icon: '⚠️', variant: 'warning' },
  error: { icon: '❌', variant: 'destructive' },
  critical: { icon: '🚨', variant: 'destructive' },
  security: { icon: '🔐', variant: 'warning' },
};

const CATEGORY_ICONS: Record<string, string> = {
  auth: '🔑',
  data: '📊',
  system: '⚙️',
  api: '🔌',
  security: '🛡️',
  audit: '📋',
  user_action: '👤',
};

const LEVEL_STYLES: Record<string, { chip: string; left: string; kpi: string }> = {
  debug: { chip: 'bg-slate-500/8 border-slate-500/20', left: 'border-l-slate-400/60', kpi: 'text-slate-300/80' },
  info: { chip: 'bg-blue-400/8 border-blue-400/20', left: 'border-l-blue-400/60', kpi: 'text-blue-300/80' },
  warning: { chip: 'bg-amber-400/8 border-amber-400/20', left: 'border-l-amber-400/60', kpi: 'text-amber-300/80' },
  error: { chip: 'bg-red-400/8 border-red-400/20', left: 'border-l-red-400/60', kpi: 'text-red-300/80' },
  critical: { chip: 'bg-red-400/8 border-red-400/20', left: 'border-l-red-400/60', kpi: 'text-red-300/80' },
  security: { chip: 'bg-purple-400/8 border-purple-400/20', left: 'border-l-purple-400/60', kpi: 'text-purple-300/80' },
};

const SAFE_DEFAULT_LEVEL = 'info';

/* --------------------------------------------
   UTILS (date, stringify canonique, hash, query parsing)
-------------------------------------------- */

function parseTsMs(ts: string): number {
  const direct = Date.parse(ts);
  if (!Number.isNaN(direct)) return direct;
  // tente "YYYY-MM-DD HH:mm:ss" => ISO-ish
  const patched = Date.parse(ts.replace(' ', 'T'));
  if (!Number.isNaN(patched)) return patched;
  return 0;
}

function dateKey(ts: string): string | null {
  const m = ts?.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function todayKeyLocal(): string {
  return new Date().toLocaleDateString('fr-CA'); // YYYY-MM-DD
}

function stableStringify(value: any): string {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'string') return JSON.stringify(value);
  if (t === 'number' || t === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (t === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(String(value));
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return 'NO_WEBCRYPTO';
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function canonicalLogPayload(log: SystemLog) {
  return {
    v: 2,
    id: log.id,
    timestamp: log.timestamp,
    level: log.level,
    category: log.category,
    source: log.source,
    message: log.message,
    userId: log.userId ?? null,
    ip: log.ip ?? null,
    sessionId: log.sessionId ?? null,
    linkedEntity: log.linkedEntity ?? null,
    details: log.details ?? null,
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function inferRACI(log: SystemLog) {
  const lvl = String(log.level || '').toLowerCase();
  const cat = String(log.category || '').toLowerCase();

  if (lvl === 'security' || cat === 'security' || cat === 'auth') {
    return { A: 'DG', R: 'RSSI', C: 'Juridique/DSI', I: 'DAF' };
  }
  if (cat === 'audit') {
    return { A: 'DG', R: 'Audit interne', C: 'Juridique', I: 'Directions' };
  }
  if (cat === 'system' || cat === 'api' || cat === 'data') {
    return { A: 'DSI', R: 'DevOps', C: 'Chef de projet', I: 'DG/DAF' };
  }
  return { A: 'DG', R: 'Exploitation', C: 'DSI', I: 'Directions' };
}

/**
 * Score de sévérité (0..100) : triage auto.
 * L'idée: "best practice" = objectiver (même si c'est heuristique).
 */
function computeSeverity(log: SystemLog): number {
  const level = String(log.level || SAFE_DEFAULT_LEVEL).toLowerCase();
  const cat = String(log.category || '').toLowerCase();
  const msg = String(log.message || '').toLowerCase();

  let base =
    level === 'debug' ? 5 :
    level === 'info' ? 15 :
    level === 'warning' ? 35 :
    level === 'error' ? 65 :
    level === 'critical' ? 85 :
    level === 'security' ? 80 : 20;

  if (cat === 'security' || cat === 'auth') base += 10;
  if (cat === 'audit') base += 5;

  // mots clés (très utilisés dans les consoles pro)
  const keywords = [
    { k: 'failed', w: 8 },
    { k: 'denied', w: 10 },
    { k: 'unauthorized', w: 12 },
    { k: 'forbidden', w: 12 },
    { k: 'sql', w: 8 },
    { k: 'injection', w: 14 },
    { k: 'xss', w: 12 },
    { k: 'exfil', w: 18 },
    { k: 'leak', w: 14 },
    { k: 'breach', w: 20 },
    { k: 'token', w: 8 },
    { k: 'expired', w: 6 },
    { k: 'timeout', w: 8 },
    { k: 'panic', w: 18 },
    { k: 'corrupt', w: 16 },
  ];
  for (const it of keywords) {
    if (msg.includes(it.k)) base += it.w;
  }

  // présence d'IP / session / entité liée => plus "actionnable"
  if (log.ip) base += 2;
  if (log.sessionId) base += 2;
  if (log.linkedEntity) base += 3;

  return clamp(base, 0, 100);
}

function buildFingerprint(log: SystemLog): string {
  // fingerprint stable (utile pour dédup + corrélation)
  const lvl = String(log.level || '').toLowerCase();
  const cat = String(log.category || '').toLowerCase();
  const src = String(log.source || '').toLowerCase();
  const msg = String(log.message || '').toLowerCase().slice(0, 220);
  const ent = log.linkedEntity ? `${log.linkedEntity.type}#${log.linkedEntity.id}` : '';
  return `${lvl}|${cat}|${src}|${ent}|${msg}`;
}

/* -------------------------
   Query language (simple mais puissant)
   - tokens, "phrases"
   - field:value  (level:, category:, source:, user:, ip:, session:, entity:)
   - -token  (NOT)
   - OR via "||"
-------------------------- */

type QueryToken =
  | { kind: 'term'; value: string; neg?: boolean }
  | { kind: 'phrase'; value: string; neg?: boolean }
  | { kind: 'field'; field: string; value: string; neg?: boolean }
  | { kind: 'or' };

function tokenizeQuery(q: string): QueryToken[] {
  const s = (q || '').trim();
  if (!s) return [];

  // split en conservant les phrases
  const tokens: string[] = [];
  let buf = '';
  let inQuote = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"') {
      inQuote = !inQuote;
      buf += ch;
      continue;
    }
    if (!inQuote && /\s/.test(ch)) {
      if (buf.trim()) tokens.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) tokens.push(buf.trim());

  const out: QueryToken[] = [];
  for (const raw0 of tokens) {
    if (raw0 === '||' || raw0.toUpperCase() === 'OR') {
      out.push({ kind: 'or' });
      continue;
    }

    let neg = false;
    let raw = raw0;
    if (raw.startsWith('-')) {
      neg = true;
      raw = raw.slice(1);
    }

    const fieldMatch = raw.match(/^([a-zA-Z_]+):(.*)$/);
    if (fieldMatch) {
      const field = fieldMatch[1].toLowerCase();
      let value = fieldMatch[2] ?? '';
      // strip quotes if any
      if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
        value = value.slice(1, -1);
      }
      out.push({ kind: 'field', field, value, neg });
      continue;
    }

    if (raw.startsWith('"') && raw.endsWith('"') && raw.length >= 2) {
      out.push({ kind: 'phrase', value: raw.slice(1, -1), neg });
    } else {
      out.push({ kind: 'term', value: raw, neg });
    }
  }

  return out;
}

function matchToken(log: DerivedLog, t: QueryToken): boolean {
  if (t.kind === 'or') return true;

  const hay = [
    log.message,
    log.source,
    log.level,
    log.category,
    log.userId ?? '',
    log.ip ?? '',
    log.sessionId ?? '',
    log.linkedEntity ? `${log.linkedEntity.type} ${log.linkedEntity.id}` : '',
    log.details ? stableStringify(log.details) : '',
  ]
    .join(' ')
    .toLowerCase();

  const applyNeg = (ok: boolean) => (t.neg ? !ok : ok);

  if (t.kind === 'term' || t.kind === 'phrase') {
    const needle = t.value.toLowerCase();
    const ok = hay.includes(needle);
    return applyNeg(ok);
  }

  // field
  const needle = (t.value || '').toLowerCase();
  const field = t.field;

  const fieldValue =
    field === 'level' ? String(log.level || '') :
    field === 'category' ? String(log.category || '') :
    field === 'source' ? String(log.source || '') :
    field === 'user' || field === 'userid' ? String(log.userId || '') :
    field === 'ip' ? String(log.ip || '') :
    field === 'session' || field === 'sessionid' ? String(log.sessionId || '') :
    field === 'entity' ? (log.linkedEntity ? `${log.linkedEntity.type}#${log.linkedEntity.id}` : '') :
    field === 'id' ? String(log.id || '') :
    field === 'day' ? String(log.dayKey || '') :
    field === 'sev' || field === 'severity' ? String(log.severity) :
    '';

  const ok = fieldValue.toLowerCase().includes(needle);
  return applyNeg(ok);
}

/**
 * Interprétation OR simple:
 * - segments séparés par OR/|| => (segment1) OR (segment2) OR ...
 * - dans un segment => AND implicite
 */
function matchQuery(log: DerivedLog, query: string): boolean {
  const toks = tokenizeQuery(query);
  if (!toks.length) return true;

  // split segments by OR
  const segments: QueryToken[][] = [];
  let cur: QueryToken[] = [];
  for (const t of toks) {
    if (t.kind === 'or') {
      if (cur.length) segments.push(cur);
      cur = [];
    } else {
      cur.push(t);
    }
  }
  if (cur.length) segments.push(cur);
  if (!segments.length) return true;

  for (const seg of segments) {
    let ok = true;
    for (const t of seg) {
      if (!matchToken(log, t)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function downloadTextFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, any>[]): string {
  const keysSet: Set<string> = rows.reduce<Set<string>>((set, r) => {
    Object.keys(r).forEach((k) => set.add(k));
    return set;
  }, new Set<string>());
  const keys = [...keysSet];
  const esc = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
}

function short(s: string, n = 16) {
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}

function randId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
}

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSave(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* --------------------------------------------
   DETECTION / SIGNALS (client-side)
   -> en prod: ce module devient côté backend
-------------------------------------------- */

type Alert = {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  reason: string;
  keys: { userId?: string; ip?: string; sessionId?: string; entity?: string };
  logIds: string[];
  createdAt: string;
};

function sevBadgeVariant(s: Alert['severity']): 'default' | 'info' | 'warning' | 'destructive' | 'success' {
  if (s === 'low') return 'default';
  if (s === 'medium') return 'info';
  if (s === 'high') return 'warning';
  return 'destructive';
}

function computeAlerts(logs: DerivedLog[]): Alert[] {
  // Fenêtres temporelles (ms)
  const W15 = 15 * 60 * 1000;
  const W10 = 10 * 60 * 1000;

  const now = Date.now();
  const recent = logs.filter((l) => l.tsMs > 0 && l.tsMs >= now - 7 * 24 * 3600 * 1000); // 7 jours

  // indexes
  const byUser = new Map<string, DerivedLog[]>();
  const byIp = new Map<string, DerivedLog[]>();
  const bySession = new Map<string, DerivedLog[]>();

  for (const l of recent) {
    if (l.userId) (byUser.get(l.userId) ?? byUser.set(l.userId, []).get(l.userId)!).push(l);
    if (l.ip) (byIp.get(l.ip) ?? byIp.set(l.ip, []).get(l.ip)!).push(l);
    if (l.sessionId) (bySession.get(l.sessionId) ?? bySession.set(l.sessionId, []).get(l.sessionId)!).push(l);
  }

  const alerts: Alert[] = [];

  // Règle 1: Auth failures en rafale
  const isAuthFail = (l: DerivedLog) =>
    String(l.category).toLowerCase() === 'auth' &&
    /failed|invalid|denied|unauthori|forbidden|bad password|mauvais|échec/i.test(String(l.message));

  for (const [user, arr] of byUser) {
    const sorted = [...arr].sort((a, b) => a.tsMs - b.tsMs);
    const windowed = sorted.filter((x) => x.tsMs >= now - W15 && isAuthFail(x));
    if (windowed.length >= 3) {
      alerts.push({
        id: randId('ALRT'),
        title: `Brute force probable (user ${user})`,
        severity: windowed.length >= 8 ? 'critical' : windowed.length >= 5 ? 'high' : 'medium',
        score: clamp(40 + windowed.length * 8, 0, 100),
        reason: `${windowed.length} échecs auth en < 15 min`,
        keys: { userId: user },
        logIds: windowed.map((x) => x.id),
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Règle 2: Erreurs API en rafale (source instable / incident prod)
  const isApiErr = (l: DerivedLog) =>
    String(l.category).toLowerCase() === 'api' &&
    ['error', 'critical'].includes(String(l.level).toLowerCase());

  const bySource = new Map<string, DerivedLog[]>();
  for (const l of recent) {
    const src = l.source || 'unknown';
    (bySource.get(src) ?? bySource.set(src, []).get(src)!).push(l);
  }
  for (const [src, arr] of bySource) {
    const windowed = arr.filter((x) => x.tsMs >= now - W10 && isApiErr(x));
    if (windowed.length >= 5) {
      alerts.push({
        id: randId('ALRT'),
        title: `Dégradation API (${src})`,
        severity: windowed.length >= 12 ? 'critical' : 'high',
        score: clamp(50 + windowed.length * 4, 0, 100),
        reason: `${windowed.length} erreurs API en < 10 min`,
        keys: {},
        logIds: windowed.map((x) => x.id),
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Règle 3: Security signal (export/dump sensible)
  const isExfil = (l: DerivedLog) =>
    (String(l.level).toLowerCase() === 'security' || String(l.category).toLowerCase() === 'security') &&
    /(export|dump|exfil|download|extract|leak|breach|token)/i.test(String(l.message));

  const exf = recent.filter(isExfil);
  for (const l of exf.slice(0, 10)) {
    alerts.push({
      id: randId('ALRT'),
      title: 'Signal sécurité (possible exfiltration)',
      severity: l.severity >= 90 ? 'critical' : 'high',
      score: l.severity,
      reason: `Mot-clé sensible détecté: "${short(l.message, 60)}"`,
      keys: { userId: l.userId, ip: l.ip, sessionId: l.sessionId },
      logIds: [l.id],
      createdAt: new Date().toISOString(),
    });
  }

  // Dédupe basique (même titre+user/ip)
  const seen = new Set<string>();
  return alerts
    .sort((a, b) => b.score - a.score)
    .filter((a) => {
      const k = `${a.title}|${a.keys.userId ?? ''}|${a.keys.ip ?? ''}|${a.reason}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 8);
}

/* --------------------------------------------
   PAGE
-------------------------------------------- */

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<string, Array<{ id: string; label: string; badge?: number | string; badgeType?: 'default' | 'warning' | 'critical' }>> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'highlights', label: 'Points clés', badge: 5 },
  ],
  'by-level': [
    { id: 'all', label: 'Tous' },
    { id: 'critical', label: 'Critiques', badge: 3, badgeType: 'critical' },
    { id: 'error', label: 'Erreurs', badge: 5, badgeType: 'warning' },
    { id: 'warning', label: 'Avertissements' },
    { id: 'info', label: 'Info' },
  ],
  'by-category': [
    { id: 'all', label: 'Toutes' },
    { id: 'auth', label: 'Auth' },
    { id: 'security', label: 'Sécurité', badge: 8, badgeType: 'warning' },
    { id: 'system', label: 'Système' },
    { id: 'api', label: 'API' },
    { id: 'audit', label: 'Audit' },
  ],
  security: [
    { id: 'all', label: 'Toutes' },
    { id: 'critical', label: 'Critiques', badge: 2, badgeType: 'critical' },
    { id: 'alerts', label: 'Alertes', badge: 6, badgeType: 'warning' },
    { id: 'resolved', label: 'Résolues' },
  ],
  incidents: [
    { id: 'all', label: 'Tous' },
    { id: 'open', label: 'Ouverts', badge: 3, badgeType: 'critical' },
    { id: 'triage', label: 'En triage' },
    { id: 'closed', label: 'Fermés' },
  ],
  correlation: [
    { id: 'all', label: 'Toutes' },
    { id: 'user', label: 'Par utilisateur' },
    { id: 'ip', label: 'Par IP' },
    { id: 'session', label: 'Par session' },
  ],
  integrity: [
    { id: 'all', label: 'Toutes' },
    { id: 'verified', label: 'Vérifiées' },
    { id: 'mismatch', label: 'Mismatch', badge: 0, badgeType: 'critical' },
  ],
  exports: [
    { id: 'all', label: 'Tous' },
    { id: 'json', label: 'JSON' },
    { id: 'csv', label: 'CSV' },
    { id: 'evidence', label: 'Evidence packs' },
  ],
  'advanced-search': [
    { id: 'all', label: 'Toutes' },
    { id: 'query', label: 'Query avancée' },
    { id: 'saved', label: 'Sauvegardées' },
  ],
};

function SystemLogsPageContent() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  // Store pour modals/navigation
  const { openModal, navigation, navigate, sidebarCollapsed, toggleSidebar, toggleCommandPalette } = useSystemLogsCommandCenterStore();

  // Navigation state local (pour compatibilité)
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');
  const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Quick filters
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all');

  // "SIEM-like" controls
  const [query, setQuery] = useState<string>('');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'severity'>('newest');
  const [timeRange, setTimeRange] = useState<'all' | '1h' | '24h' | '7d' | '30d'>('30d');
  const [dedupe, setDedupe] = useState<boolean>(true);
  const [redact, setRedact] = useState<boolean>(false);

  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Incidents (persist localStorage)
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  // Integrity caches
  const hashCacheRef = useRef<Map<string, string>>(new Map());
  const matchCacheRef = useRef<Map<string, boolean>>(new Map());

  const [integrityScan, setIntegrityScan] = useState<{
    running: boolean;
    scanned: number;
    total: number;
    ok: number;
    mismatch: number;
  }>({ running: false, scanned: 0, total: 0, ok: 0, mismatch: 0 });

  // Persistance navigation
  const { updateFilters, getFilters } = usePageNavigation('system-logs');

  // Charger les filtres sauvegardés
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;
      if (saved.selectedLogId) setSelectedLogId(saved.selectedLogId);
      if (saved.levelFilter) setLevelFilter(saved.levelFilter);
      if (saved.categoryFilter) setCategoryFilter(saved.categoryFilter);
      if (typeof saved.query === 'string') setQuery(saved.query);
      if (saved.sortMode) setSortMode(saved.sortMode);
      if (saved.timeRange) setTimeRange(saved.timeRange);
      if (typeof saved.dedupe === 'boolean') setDedupe(saved.dedupe);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder les filtres
  useEffect(() => {
    try {
      updateFilters?.({
        // selectedLogId n'est plus utilisé (modal overlay)
        levelFilter,
        categoryFilter,
        query,
        sortMode,
        timeRange,
        dedupe,
      });
    } catch {
      // silent
    }
  }, [selectedLogId, levelFilter, categoryFilter, query, sortMode, timeRange, dedupe, updateFilters]);

  // Load incidents
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? safeLoad<Incident[]>('bmo.systemlogs.incidents', []) : [];
    setIncidents(saved);
  }, []);

  useEffect(() => {
    safeSave('bmo.systemlogs.incidents', incidents);
  }, [incidents]);

  const rawLogs: SystemLog[] = (systemLogs as any) ?? [];

  const derivedLogs: DerivedLog[] = useMemo(() => {
    return rawLogs.map((l) => {
      const tsMs = parseTsMs(String(l.timestamp || ''));
      const d: DerivedLog = {
        ...(l as any),
        tsMs,
        dayKey: dateKey(String(l.timestamp || '')),
        severity: computeSeverity(l),
        fingerprint: buildFingerprint(l),
      };
      return d;
    });
  }, [rawLogs]);

  const now = Date.now();
  const rangeMs = useMemo(() => {
    if (timeRange === 'all') return Infinity;
    if (timeRange === '1h') return 1 * 3600 * 1000;
    if (timeRange === '24h') return 24 * 3600 * 1000;
    if (timeRange === '7d') return 7 * 24 * 3600 * 1000;
    return 30 * 24 * 3600 * 1000;
  }, [timeRange]);

  const filteredLogs: DerivedLog[] = useMemo(() => {
    const base = derivedLogs.filter((l) => {
      if (rangeMs !== Infinity && l.tsMs > 0 && l.tsMs < now - rangeMs) return false;
      if (levelFilter !== 'all' && String(l.level) !== String(levelFilter)) return false;
      if (categoryFilter !== 'all' && String(l.category) !== String(categoryFilter)) return false;
      if (!matchQuery(l, query)) return false;
      return true;
    });

    // Dedupe: on garde 1 par fingerprint (le plus récent)
    const deduped = dedupe
      ? Array.from(
          base
            .slice()
            .sort((a, b) => b.tsMs - a.tsMs)
            .reduce((m, l) => {
              if (!m.has(l.fingerprint)) m.set(l.fingerprint, l);
              return m;
            }, new Map<string, DerivedLog>())
            .values()
        )
      : base;

    if (sortMode === 'severity') return deduped.sort((a, b) => b.severity - a.severity || b.tsMs - a.tsMs);
    if (sortMode === 'oldest') return deduped.sort((a, b) => a.tsMs - b.tsMs);
    return deduped.sort((a, b) => b.tsMs - a.tsMs);
  }, [derivedLogs, levelFilter, categoryFilter, query, rangeMs, now, sortMode, dedupe]);

  const selectedLog = useMemo(() => {
    if (!selectedLogId) return null;
    return derivedLogs.find((l) => l.id === selectedLogId) ?? null;
  }, [selectedLogId, derivedLogs]);

  // Auto-clear selection if filtered out
  useEffect(() => {
    if (!selectedLogId) return;
    const ok = filteredLogs.some((l) => l.id === selectedLogId);
    if (!ok) setSelectedLogId(null);
  }, [filteredLogs, selectedLogId]);

  const stats = useMemo(() => {
    const total = derivedLogs.length;
    const today = derivedLogs.filter((l) => l.dayKey === todayKeyLocal()).length;
    const critical = derivedLogs.filter((l) => ['critical', 'error'].includes(String(l.level).toLowerCase())).length;
    const security = derivedLogs.filter((l) => String(l.level).toLowerCase() === 'security' || String(l.category).toLowerCase() === 'security').length;

    const sev90 = derivedLogs.filter((l) => l.severity >= 90).length;
    const sev70 = derivedLogs.filter((l) => l.severity >= 70).length;

    const openIncidents = incidents.filter((i) => i.status !== 'closed').length;

    return { total, today, critical, security, sev90, sev70, openIncidents };
  }, [derivedLogs, incidents]);

  // Auto-sync sidebar
  useAutoSyncCounts('system-logs', () => stats.critical + stats.sev90, { interval: 30000, immediate: true });

  const alerts = useMemo(() => computeAlerts(filteredLogs), [filteredLogs]);

  /* --------------------------------------------
     INTEGRITY (hash canonique + scan batch)
  -------------------------------------------- */

  async function computeCanonicalHash(log: SystemLog): Promise<string> {
    const cached = hashCacheRef.current.get(log.id);
    if (cached) return cached;

    const canonical = stableStringify(canonicalLogPayload(log));
    const h = await sha256Hex(canonical);
    hashCacheRef.current.set(log.id, h);
    return h;
  }

  async function verifyLogIntegrity(log: SystemLog): Promise<{ ok: boolean | null; computed: string; stored: string | null }> {
    const stored = (log.hash ?? null) as string | null;
    const computed = await computeCanonicalHash(log);
    if (!stored) return { ok: null, computed, stored };
    if (computed === 'NO_WEBCRYPTO') return { ok: null, computed, stored };
    return { ok: computed === stored, computed, stored };
  }

  async function runIntegrityScan() {
    const candidates = derivedLogs.filter((l) => !!l.hash);
    const total = candidates.length;

    setIntegrityScan({ running: true, scanned: 0, total, ok: 0, mismatch: 0 });

    addActionLog({
      ...ACTOR,
      module: 'system-logs',
      action: 'integrity_scan_start',
      targetId: 'ALL',
      targetType: 'SystemLogs',
      details: `Scan intégrité démarré (${total} logs avec hash)`,
    });

    let scanned = 0;
    let ok = 0;
    let mismatch = 0;

    const batchSize = 40;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);

      const res = await Promise.all(
        batch.map(async (l) => {
          const v = await verifyLogIntegrity(l);
          if (typeof v.ok === 'boolean') matchCacheRef.current.set(l.id, v.ok);
          return v;
        })
      );

      for (const r of res) {
        scanned++;
        if (r.ok === true) ok++;
        if (r.ok === false) mismatch++;
      }

      setIntegrityScan({ running: true, scanned, total, ok, mismatch });
    }

    setIntegrityScan({ running: false, scanned, total, ok, mismatch });

    addActionLog({
      ...ACTOR,
      module: 'system-logs',
      action: 'integrity_scan_end',
      targetId: 'ALL',
      targetType: 'SystemLogs',
      details: `Scan intégrité terminé: OK=${ok} | MISMATCH=${mismatch} | total=${total}`,
    });

    if (mismatch > 0) addToast(`🚨 Intégrité: ${mismatch} mismatch(s) détecté(s)`, 'error');
    else addToast('Intégrité: aucun mismatch détecté ✓', 'success');
  }

  /* --------------------------------------------
     CORRELATION (même user/ip/session/entity + fenêtre)
  -------------------------------------------- */

  const correlation = useMemo(() => {
    if (!selectedLog) return { related: [] as DerivedLog[], summary: '' };

    const W = 30 * 60 * 1000; // +/- 30 min
    const t0 = selectedLog.tsMs || 0;

    const related = derivedLogs
      .filter((l) => {
        if (l.id === selectedLog.id) return false;

        const within = t0 > 0 && l.tsMs > 0 ? Math.abs(l.tsMs - t0) <= W : false;

        const sameUser = selectedLog.userId && l.userId && l.userId === selectedLog.userId;
        const sameIp = selectedLog.ip && l.ip && l.ip === selectedLog.ip;
        const sameSession = selectedLog.sessionId && l.sessionId && l.sessionId === selectedLog.sessionId;
        const sameEntity =
          selectedLog.linkedEntity &&
          l.linkedEntity &&
          l.linkedEntity.type === selectedLog.linkedEntity.type &&
          l.linkedEntity.id === selectedLog.linkedEntity.id;

        // logique console pro: corrélation = (clé identique) OR (même fenêtre temporelle et même source)
        const sameSourceWindow = within && selectedLog.source && l.source && l.source === selectedLog.source;

        return sameUser || sameIp || sameSession || sameEntity || sameSourceWindow;
      })
      .sort((a, b) => b.tsMs - a.tsMs)
      .slice(0, 25);

    const s = [
      selectedLog.userId ? `user=${selectedLog.userId}` : null,
      selectedLog.ip ? `ip=${selectedLog.ip}` : null,
      selectedLog.sessionId ? `session=${short(selectedLog.sessionId, 18)}` : null,
      selectedLog.linkedEntity ? `entity=${selectedLog.linkedEntity.type}#${selectedLog.linkedEntity.id}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    return { related, summary: s || 'corrélation par fenêtre/source' };
  }, [selectedLog, derivedLogs]);

  /* --------------------------------------------
     INCIDENTS (case management)
  -------------------------------------------- */

  function createIncidentFromSelection() {
    if (!selectedLog) return;

    const raci = inferRACI(selectedLog);
    const id = randId('INC');
    const nowIso = new Date().toISOString();

    const titleBase =
      String(selectedLog.level).toLowerCase() === 'security'
        ? 'Incident Sécurité'
        : String(selectedLog.level).toLowerCase() === 'critical'
        ? 'Incident Critique'
        : 'Incident';

    const title = `${titleBase} — ${short(selectedLog.message, 64)}`;

    const inc: Incident = {
      id,
      title,
      status: 'triage',
      createdAt: nowIso,
      updatedAt: nowIso,
      assignee: raci.R,
      tags: [String(selectedLog.category)],
      logIds: [selectedLog.id, ...correlation.related.slice(0, 5).map((x) => x.id)],
      notes: [{ at: nowIso, by: `${ACTOR.userName} (${ACTOR.userRole})`, text: 'Incident créé depuis la console logs.' }],
      raci,
    };

    setIncidents((prev) => [inc, ...prev]);
    setActiveIncidentId(id);

    addActionLog({
      ...ACTOR,
      module: 'system-logs',
      action: 'incident_create',
      targetId: id,
      targetType: 'Incident',
      details: `Incident créé ${id} | "${title}" | RACI A=${raci.A} R=${raci.R} C=${raci.C} I=${raci.I} | logs=${inc.logIds.length}`,
    });

    addToast(`Incident ${id} créé (triage)`, 'success');
  }

  function updateIncident(id: string, patch: Partial<Incident>) {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i))
    );
  }

  const activeIncident = useMemo(() => {
    if (!activeIncidentId) return null;
    return incidents.find((i) => i.id === activeIncidentId) ?? null;
  }, [activeIncidentId, incidents]);

  function addIncidentNote(id: string, text: string) {
    if (!text.trim()) return;
    const at = new Date().toISOString();
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, notes: [{ at, by: `${ACTOR.userName} (${ACTOR.userRole})`, text }, ...i.notes], updatedAt: at }
          : i
      )
    );
  }

  /* --------------------------------------------
     EXPORTS (JSON evidence pack + CSV)
  -------------------------------------------- */

  async function exportFiltered(mode: 'json' | 'csv' | 'jsonl') {
    const exportedAt = new Date().toISOString();
    const entries = await Promise.all(
      filteredLogs.map(async (l) => {
        const computedHash = await computeCanonicalHash(l);
        const storedHash = l.hash ?? null;
        const match = storedHash && computedHash !== 'NO_WEBCRYPTO' ? computedHash === storedHash : null;
        return { ...canonicalLogPayload(l), storedHash, computedHash, hashMatch: match, severity: l.severity };
      })
    );

    const chainHash = await sha256Hex(entries.map((e) => e.computedHash).join('|'));

    addActionLog({
      ...ACTOR,
      module: 'system-logs',
      action: 'export',
      targetId: 'ALL',
      targetType: 'SystemLogs',
      details: `Export (${mode}) ${entries.length} entrées | level=${levelFilter} cat=${categoryFilter} range=${timeRange} | chainHash=${short(chainHash, 18)}`,
    });

    if (mode === 'csv') {
      const rows = entries.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        level: e.level,
        category: e.category,
        source: e.source,
        userId: e.userId,
        ip: e.ip,
        sessionId: e.sessionId,
        entity: e.linkedEntity ? `${e.linkedEntity.type}#${e.linkedEntity.id}` : '',
        severity: (e as any).severity,
        message: e.message,
        hashMatch: (e as any).hashMatch,
      }));
      downloadTextFile(`system-logs_${exportedAt.replace(/[:.]/g, '-')}.csv`, toCsv(rows), 'text/csv');
      addToast('Export CSV généré', 'success');
      return;
    }

    if (mode === 'jsonl') {
      const jsonl = entries.map((e) => JSON.stringify(e)).join('\n');
      downloadTextFile(`system-logs_${exportedAt.replace(/[:.]/g, '-')}.jsonl`, jsonl, 'application/json');
      addToast('Export JSONL généré', 'success');
      return;
    }

    const bundle = {
      meta: {
        schema: 'BMO.SystemLogs.Export',
        version: 2,
        exportedAt,
        exportedBy: ACTOR,
        filters: { level: levelFilter, category: categoryFilter, timeRange, query, sortMode, dedupe },
        counts: { filtered: entries.length, total: derivedLogs.length },
        chainHash,
      },
      entries,
    };

    downloadTextFile(`system-logs_${exportedAt.replace(/[:.]/g, '-')}.json`, JSON.stringify(bundle, null, 2), 'application/json');
    addToast('Export JSON généré (avec chainHash)', 'success');
  }

  async function exportEvidencePack() {
    if (!selectedLog) return;

    const exportedAt = new Date().toISOString();
    const focus = selectedLog;
    const raci = inferRACI(focus);

    const focusHash = await computeCanonicalHash(focus);
    const focusVerify = await verifyLogIntegrity(focus);

    const related = correlation.related;

    const relatedEntries = await Promise.all(
      [focus, ...related].map(async (l) => {
        const computedHash = await computeCanonicalHash(l);
        const storedHash = l.hash ?? null;
        const match = storedHash && computedHash !== 'NO_WEBCRYPTO' ? computedHash === storedHash : null;
        return { ...canonicalLogPayload(l), storedHash, computedHash, hashMatch: match, severity: l.severity };
      })
    );

    // chain proof: tri chronologique + chainHash incremental
    const chronological = [...relatedEntries].sort((a: any, b: any) => parseTsMs(a.timestamp) - parseTsMs(b.timestamp));

    let prev = 'GENESIS';
    const chain = [];
    for (const e of chronological) {
      const link = await sha256Hex(`${prev}|${e.computedHash}`);
      chain.push({ id: e.id, prev, computedHash: e.computedHash, link });
      prev = link;
    }
    const chainHead = chain.length ? chain[chain.length - 1].link : 'GENESIS';

    const pack = {
      meta: {
        schema: 'BMO.EvidencePack',
        version: 1,
        exportedAt,
        exportedBy: ACTOR,
        raci,
        note: 'Paquet de preuve (audit) : payload canonique + hash + chaînage. En prod: signer ce manifest (clé privée) et stocker en WORM.',
      },
      focus: {
        id: focus.id,
        verify: focusVerify,
        computedHash: focusHash,
        storedHash: focus.hash ?? null,
      },
      correlation: {
        summary: correlation.summary,
        relatedCount: related.length,
      },
      entries: relatedEntries,
      chainProof: {
        genesis: 'GENESIS',
        head: chainHead,
        links: chain,
      },
    };

    addActionLog({
      ...ACTOR,
      module: 'system-logs',
      action: 'export_evidence_pack',
      targetId: focus.id,
      targetType: 'SystemLog',
      details: `EvidencePack exporté pour ${focus.id} | related=${related.length} | chainHead=${short(chainHead, 18)} | RACI A=${raci.A} R=${raci.R}`,
    });

    downloadTextFile(`evidence_${focus.id}_${exportedAt.replace(/[:.]/g, '-')}.json`, JSON.stringify(pack, null, 2), 'application/json');
    addToast('Evidence pack généré (preuve + chaînage)', 'success');
  }

  /* --------------------------------------------
     UI HELPERS
  -------------------------------------------- */

  function maskIp(ip?: string) {
    if (!ip) return '';
    const parts = ip.split('.');
    if (parts.length !== 4) return ip;
    return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  }

  function renderId(value?: string) {
    if (!value) return '—';
    return redact ? short(value, 10) : value;
  }

  const selectedLevelKey = selectedLog ? String(selectedLog.level || SAFE_DEFAULT_LEVEL).toLowerCase() : SAFE_DEFAULT_LEVEL;
  const selectedConfig = LEVEL_CONFIG[selectedLevelKey] || LEVEL_CONFIG[SAFE_DEFAULT_LEVEL];
  const selectedStyle = LEVEL_STYLES[selectedLevelKey] || LEVEL_STYLES[SAFE_DEFAULT_LEVEL];

  // "virtualisation" soft: affiche 200 puis "load more"
  const [limit, setLimit] = useState(200);
  useEffect(() => setLimit(200), [levelFilter, categoryFilter, query, timeRange, sortMode, dedupe]);

  const visibleLogs = filteredLogs.slice(0, limit);

  // Computed values
  const currentCategoryLabel = useMemo(() => {
    return systemLogsCategories.find((c) => c.id === activeCategory)?.label || 'System Logs';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setActiveSubCategory('all');
  }, []);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
  }, []);

  // Helper pour ouvrir un log dans la modal avec navigation prev/next
  const handleOpenLogModal = useCallback((log: DerivedLog) => {
    const currentIndex = visibleLogs.findIndex(l => l.id === log.id);
    const prevLog = currentIndex > 0 ? visibleLogs[currentIndex - 1] : null;
    const nextLog = currentIndex < visibleLogs.length - 1 ? visibleLogs[currentIndex + 1] : null;

    openModal('log-detail', {
      logId: log.id,
      logData: log,
      onNext: nextLog ? () => handleOpenLogModal(nextLog) : undefined,
      onPrevious: prevLog ? () => handleOpenLogModal(prevLog) : undefined,
      canNavigateNext: !!nextLog,
      canNavigatePrevious: !!prevLog,
    });
  }, [visibleLogs, openModal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((v) => !v);
        return;
      }

      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        setFullscreen((v) => !v);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* --------------------------------------------
     RENDER
  -------------------------------------------- */

  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation */}
      {/* Sidebar Navigation - 3-level */}
      <SystemLogsSidebar
        activeCategory={activeCategory as SystemLogsMainCategory}
        activeSubCategory={activeSubCategory}
        collapsed={sidebarCollapsed}
        stats={{}}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebar}
        onOpenCommandPalette={() => setCommandPaletteOpen((v) => !v)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Title */}
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Console Observabilité & Sécurité</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen((v) => !v)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* Export */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportFiltered('json')}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Exporter JSON"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Integrity Scan */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runIntegrityScan()}
              disabled={integrityScan.running}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Scanner l'intégrité"
            >
              <FileCheck className="h-4 w-4" />
            </Button>

            {/* More Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Sub Navigation */}
        <SystemLogsSubNavigation
          mainCategory={activeCategory as SystemLogsMainCategory}
          subCategory={activeSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        <SystemLogsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed((v) => !v)}
          onRefresh={() => {
            // Refresh logic
          }}
          stats={{
            ...stats,
            filtered: filteredLogs.length,
          }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto p-4">
            <div className="space-y-3 sm:space-y-4">
      {/* Header / Console controls responsive */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
            🧠 Console Observabilité & Sécurité
            <Badge variant="info" className="text-[10px]">{stats.total} logs</Badge>
            <Badge variant="default" className="text-[10px]">{stats.today} aujourd'hui</Badge>
            {integrityScan.total > 0 && (
              <Badge variant={integrityScan.mismatch > 0 ? 'destructive' : 'success'} className="text-[10px]">
                Intégrité: {integrityScan.mismatch > 0 ? `${integrityScan.mismatch} mismatch` : 'OK'}
              </Badge>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Recherche avancée, corrélation, incidents, preuve d'intégrité, exports "audit-grade".
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={() => exportFiltered('json')} className="flex-1 sm:flex-none text-xs sm:text-sm">
            📦 JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportFiltered('csv')} className="flex-1 sm:flex-none text-xs sm:text-sm">
            📄 CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportFiltered('jsonl')} className="flex-1 sm:flex-none text-xs sm:text-sm">
            🧾 JSONL
          </Button>
          <Button variant="default" size="sm" onClick={() => runIntegrityScan()} disabled={integrityScan.running} className="flex-1 sm:flex-none text-xs sm:text-sm">
            {integrityScan.running ? `🔍 ${integrityScan.scanned}/${integrityScan.total}` : '🔍 Scan'}
          </Button>
        </div>
      </div>

      {/* Query bar responsive */}
      <Card className="border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-start">
            <div className="flex-1 min-w-0 w-full sm:min-w-[260px]">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query… ex: level:security user:USR-001"
                className="w-full text-xs sm:text-sm"
              />
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                Champs: <span className="font-mono">level:</span> <span className="font-mono">category:</span> <span className="font-mono">source:</span>{' '}
                <span className="font-mono">user:</span> <span className="font-mono">ip:</span> <span className="font-mono">session:</span>{' '}
                <span className="font-mono">entity:</span> • Négation: <span className="font-mono">-token</span> • OR: <span className="font-mono">||</span>
              </p>
            </div>

            <div className="flex gap-2 flex-wrap items-center w-full sm:w-auto">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className={cn(
                  'rounded px-2 py-2 text-xs sm:text-sm border flex-1 sm:flex-none sm:w-auto',
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                )}
              >
                <option value="all">Tout</option>
                <option value="1h">1h</option>
                <option value="24h">24h</option>
                <option value="7d">7j</option>
                <option value="30d">30j</option>
              </select>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
                className={cn(
                  'rounded px-2 py-2 text-xs sm:text-sm border flex-1 sm:flex-none sm:w-auto',
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                )}
              >
                <option value="newest">Tri: récent</option>
                <option value="oldest">Tri: ancien</option>
                <option value="severity">Tri: sévérité</option>
              </select>

              <Button size="sm" variant={dedupe ? 'default' : 'secondary'} onClick={() => setDedupe((v) => !v)} className="flex-1 sm:flex-none text-xs">
                🧬 Dédup {dedupe ? 'ON' : 'OFF'}
              </Button>

              <Button size="sm" variant={redact ? 'warning' : 'secondary'} onClick={() => setRedact((v) => !v)} className="flex-1 sm:flex-none text-xs">
                🕶️ {redact ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>

          {/* Quick filters (level/category) responsive */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-3">
            <div className="flex gap-1 flex-wrap items-center">
              <span className="text-xs text-slate-400 self-center mr-2">Niveau:</span>
              {(['all', 'debug', 'info', 'warning', 'error', 'critical', 'security'] as const).map((lvl) => (
                <Button
                  key={lvl}
                  size="sm"
                  variant={levelFilter === lvl ? 'default' : 'secondary'}
                  onClick={() => setLevelFilter(lvl)}
                  className="text-[10px] sm:text-xs"
                >
                  {lvl === 'all' ? 'Tous' : (LEVEL_CONFIG[lvl]?.icon ?? '•')} {lvl !== 'all' && <span className="hidden sm:inline">{lvl}</span>}
                </Button>
              ))}
            </div>

            <div className="flex gap-1 flex-wrap items-center">
              <span className="text-xs text-slate-400 self-center mr-2">Catégorie:</span>
              {(['all', 'auth', 'data', 'system', 'api', 'security', 'audit', 'user_action'] as const).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={categoryFilter === cat ? 'default' : 'secondary'}
                  onClick={() => setCategoryFilter(cat)}
                  className="text-[10px] sm:text-xs"
                >
                  {cat === 'all' ? 'Toutes' : (CATEGORY_ICONS[cat] ?? '🏷️')} {cat !== 'all' && <span className="hidden sm:inline">{cat.replace('_', ' ')}</span>}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI row responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="bg-blue-400/8 border-blue-400/20"><CardContent className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-slate-400">Filtrés</p>
          <p className="text-lg sm:text-xl font-bold text-blue-300/80">{filteredLogs.length}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">dedupe={String(dedupe)}</p>
        </CardContent></Card>

        <Card className="bg-red-400/8 border-red-400/20"><CardContent className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-slate-400">Critiques (global)</p>
          <p className="text-lg sm:text-xl font-bold text-red-300/80">{stats.critical}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">error+critical</p>
        </CardContent></Card>

        <Card className="bg-purple-400/8 border-purple-400/20"><CardContent className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-slate-400">Sécurité (global)</p>
          <p className="text-lg sm:text-xl font-bold text-purple-300/80">{stats.security}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">security level/cat</p>
        </CardContent></Card>

        <Card className="bg-amber-400/8 border-amber-400/20"><CardContent className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-slate-400">Sev ≥ 70</p>
          <p className="text-lg sm:text-xl font-bold text-amber-300/80">{stats.sev70}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">triage</p>
        </CardContent></Card>

        <Card className="bg-red-400/8 border-red-400/20"><CardContent className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-slate-400">Sev ≥ 90</p>
          <p className="text-lg sm:text-xl font-bold text-red-300/80">{stats.sev90}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">urgence</p>
        </CardContent></Card>

        <Card className="bg-emerald-400/8 border-emerald-400/20"><CardContent className="p-2 sm:p-3">
          <p className="text-[9px] sm:text-[10px] text-slate-400">Incidents ouverts</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-300/80">{stats.openIncidents}</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400">case mgmt</p>
        </CardContent></Card>
      </div>

      {/* Alerts strip responsive */}
      {alerts.length > 0 && (
        <Card className="border-slate-700/50">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <span className="text-base sm:text-lg">🚨</span>
              <p className="font-bold text-sm sm:text-base">Alertes détectées</p>
              <Badge variant="info" className="text-[10px]">{alerts.length}</Badge>
              <p className="text-[10px] sm:text-xs text-slate-400 ml-auto">Client-side rules (brancher backend en prod)</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {alerts.map((a) => (
                <Button
                  key={a.id}
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    // navigation rapide : injecte une query
                    const parts = [
                      a.keys.userId ? `user:${a.keys.userId}` : null,
                      a.keys.ip ? `ip:${a.keys.ip}` : null,
                      a.keys.sessionId ? `session:${a.keys.sessionId}` : null,
                    ].filter(Boolean);
                    setQuery(parts.join(' ') || a.title);
                    addToast(`Query appliquée depuis alerte: ${a.title}`, 'info');
                  }}
                  className="text-[10px] sm:text-xs"
                >
                  <Badge variant={sevBadgeVariant(a.severity)} className="mr-1 sm:mr-2 text-[9px]">{a.severity}</Badge>
                  <span className="hidden sm:inline">{a.title}</span>
                  <span className="sm:hidden">{short(a.title, 20)}</span>
                  <span className="ml-1 sm:ml-2 text-slate-400">({a.score})</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main grid responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Logs list */}
        <div className="lg:col-span-2 space-y-2">
          {visibleLogs.length > 0 ? (
            visibleLogs.map((log) => {
              const lvl = String(log.level || SAFE_DEFAULT_LEVEL).toLowerCase();
              const cfg = LEVEL_CONFIG[lvl] || LEVEL_CONFIG[SAFE_DEFAULT_LEVEL];
              const styles = LEVEL_STYLES[lvl] || LEVEL_STYLES[SAFE_DEFAULT_LEVEL];
              const selected = selectedLogId === log.id;

              const integrity = matchCacheRef.current.get(log.id);
              const integrityBadge =
                typeof integrity === 'boolean' ? (
                  <Badge variant={integrity ? 'success' : 'destructive'} className="text-[9px]">{integrity ? 'intègre' : 'mismatch'}</Badge>
                ) : log.hash ? (
                  <Badge variant="warning" className="text-[9px]">hash</Badge>
                ) : null;

              return (
                <Card
                  key={log.id}
                  className={cn(
                    'cursor-pointer transition-all border-l-4',
                    styles.left,
                    selected ? 'ring-2 ring-blue-400/60' : 'hover:border-blue-400/30'
                  )}
                  onClick={() => handleOpenLogModal(log)}
                >
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-base sm:text-lg">{cfg.icon}</span>
                        <Badge variant={cfg.variant} className="text-[9px] sm:text-[10px]">{String(log.level)}</Badge>
                        <Badge variant="default" className="text-[9px] sm:text-[10px]">
                          {CATEGORY_ICONS[String(log.category)] || '🏷️'} <span className="hidden sm:inline">{String(log.category)}</span>
                        </Badge>
                        <Badge variant="info" className="font-mono text-[9px]">sev {log.severity}</Badge>
                        {integrityBadge}
                        <span className="font-mono text-[9px] sm:text-xs text-slate-400">{log.source}</span>
                      </div>
                      <span className="font-mono text-[9px] sm:text-xs text-slate-400">{log.timestamp}</span>
                    </div>

                    <p className="text-xs sm:text-sm">{log.message}</p>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 text-[10px] sm:text-xs text-slate-400">
                      {log.userId && <span>👤 {renderId(log.userId)}</span>}
                      {log.ip && <span>🌐 {redact ? maskIp(log.ip) : log.ip}</span>}
                      {log.sessionId && <span>🧩 {renderId(log.sessionId)}</span>}
                      {log.linkedEntity && (
                        <span>🔗 {log.linkedEntity.type}:{renderId(log.linkedEntity.id)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card><CardContent className="p-8 text-center text-slate-400">
              <span className="text-2xl block mb-2">🔍</span>
              Aucun log ne matche les filtres / query
            </CardContent></Card>
          )}

          {filteredLogs.length > limit && (
            <Button variant="secondary" className="w-full text-xs sm:text-sm" onClick={() => setLimit((n) => n + 200)}>
              Charger +200 (actuel {limit}/{filteredLogs.length})
            </Button>
          )}
        </div>

        {/* Details / Correlation / Incident */}
        <div className="lg:col-span-1">
          {selectedLog ? (
            <Card className="sticky top-4">
              <CardContent className="p-3 sm:p-4">
                <div className="mb-3 pb-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-xl sm:text-2xl">{selectedConfig.icon}</span>
                    <Badge variant={selectedConfig.variant} className="text-[9px] sm:text-[10px]">{String(selectedLog.level)}</Badge>
                    <Badge variant="default" className="text-[9px] sm:text-[10px]">{String(selectedLog.category)}</Badge>
                    <Badge variant="info" className="text-[9px] sm:text-[10px]">sev {selectedLog.severity}</Badge>
                    {selectedLog.hash && <Badge variant="warning" className="text-[9px]">hash</Badge>}
                    <span className="ml-auto font-mono text-[9px] sm:text-xs text-blue-300/80">{selectedLog.id}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2">{selectedLog.message}</p>

                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button size="sm" className="flex-1 text-xs" onClick={() => createIncidentFromSelection()}>
                      🧨 Créer incident
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => exportEvidencePack()}>
                      🧾 Evidence pack
                    </Button>
                  </div>
                </div>

                {/* Details blocks */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className={cn('p-2 sm:p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Métadonnées</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                      <div>
                        <p className="text-slate-400">Source</p>
                        <p className="font-mono">{selectedLog.source}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Timestamp</p>
                        <p className="font-mono">{selectedLog.timestamp}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Utilisateur</p>
                        <p>{selectedLog.userId ? renderId(selectedLog.userId) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">IP</p>
                        <p className="font-mono">{selectedLog.ip ? (redact ? maskIp(selectedLog.ip) : selectedLog.ip) : '—'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-400">Session</p>
                        <p className="font-mono text-[9px] sm:text-xs truncate">{selectedLog.sessionId ? renderId(selectedLog.sessionId) : '—'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                    <div className={cn('p-2 sm:p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Détails</p>
                      <pre className="text-[9px] sm:text-xs font-mono overflow-x-auto">{JSON.stringify(selectedLog.details, null, 2)}</pre>
                    </div>
                  )}

                  {selectedLog.linkedEntity && (
                    <div className={cn('p-2 sm:p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Entité liée</p>
                      <Badge variant="info" className="text-[9px] sm:text-[10px]">
                        {selectedLog.linkedEntity.type}: {renderId(selectedLog.linkedEntity.id)}
                      </Badge>
                    </div>
                  )}

                  {/* Correlation */}
                  <div className="p-2 sm:p-3 rounded border border-slate-700/50">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                      <span>🧵</span>
                      <p className="font-bold text-xs sm:text-sm">Corrélation</p>
                      <Badge variant="default" className="text-[9px]">{correlation.related.length}</Badge>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-2">{correlation.summary}</p>

                    <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                      {correlation.related.map((l) => {
                        const lvl = String(l.level || SAFE_DEFAULT_LEVEL).toLowerCase();
                        const cfg = LEVEL_CONFIG[lvl] || LEVEL_CONFIG[SAFE_DEFAULT_LEVEL];
                        return (
                          <button
                            key={l.id}
                            className={cn(
                              'w-full text-left rounded border px-2 py-2 text-[10px] sm:text-xs transition',
                              darkMode ? 'border-slate-700 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-gray-50'
                            )}
                            onClick={() => setSelectedLogId(l.id)}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span>{cfg.icon}</span>
                              <Badge variant={cfg.variant} className="text-[9px]">{String(l.level)}</Badge>
                              <Badge variant="info" className="text-[9px]">sev {l.severity}</Badge>
                              <span className="ml-auto font-mono text-[9px] text-slate-400">{l.timestamp}</span>
                            </div>
                            <p className="text-slate-300 mt-1">{short(l.message, 120)}</p>
                          </button>
                        );
                      })}
                      {correlation.related.length === 0 && (
                        <p className="text-[10px] sm:text-xs text-slate-400">Aucune corrélation évidente (selon les clés disponibles).</p>
                      )}
                    </div>
                  </div>

                  {/* Integrity quick verify */}
                  <div className={cn('p-2 sm:p-3 rounded', selectedStyle.chip, 'border')}>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 mb-2">🔐 Intégrité (canonique)</p>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={async () => {
                          const v = await verifyLogIntegrity(selectedLog);
                          if (typeof v.ok === 'boolean') matchCacheRef.current.set(selectedLog.id, v.ok);

                          addActionLog({
                            ...ACTOR,
                            module: 'system-logs',
                            action: 'verify_hash',
                            targetId: selectedLog.id,
                            targetType: 'SystemLog',
                            details:
                              v.ok === true
                                ? `Vérification hash OK (${selectedLog.id})`
                                : v.ok === false
                                ? `Vérification hash MISMATCH 🚨 (${selectedLog.id})`
                                : `Vérification hash non concluante (${selectedLog.id})`,
                          });

                          if (v.ok === true) addToast('Hash vérifié ✓ (intègre)', 'success');
                          else if (v.ok === false) addToast('Hash MISMATCH 🚨 (altération possible)', 'error');
                          else addToast('Hash non vérifiable (pas de hash ou crypto indisponible)', 'warning');
                        }}
                      >
                        🔍 Vérifier hash
                      </Button>

                      <Button size="sm" variant="secondary" className="flex-1 text-xs" onClick={() => exportEvidencePack()}>
                        🧾 Export preuve
                      </Button>
                    </div>

                    <p className="font-mono text-[9px] sm:text-[10px] break-all mt-2 text-slate-300">
                      hash stocké: {selectedLog.hash || '—'}
                    </p>
                  </div>

                  {/* Incident panel */}
                  <div className="p-2 sm:p-3 rounded border border-slate-700/50">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                      <span>🧷</span>
                      <p className="font-bold text-xs sm:text-sm">Incidents</p>
                      <Badge variant="default" className="text-[9px]">{incidents.length}</Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <select
                        value={activeIncidentId ?? ''}
                        onChange={(e) => setActiveIncidentId(e.target.value || null)}
                        className={cn(
                          'flex-1 rounded px-2 py-2 text-xs sm:text-sm border',
                          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                        )}
                      >
                        <option value="">— Sélectionner —</option>
                        {incidents.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.id} • {i.status} • {short(i.title, 34)}
                          </option>
                        ))}
                      </select>
                      <Button size="sm" variant="secondary" onClick={() => createIncidentFromSelection()} className="text-xs">
                        + Créer
                      </Button>
                    </div>

                    {activeIncident ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Badge variant={activeIncident.status === 'closed' ? 'success' : activeIncident.status === 'triage' ? 'warning' : 'info'} className="text-[9px]">
                            {activeIncident.status}
                          </Badge>
                          <Badge variant="default" className="text-[9px]">logs {activeIncident.logIds.length}</Badge>
                          <Badge variant="info" className="text-[9px]">R={activeIncident.assignee ?? '—'}</Badge>
                          <span className="ml-auto font-mono text-[9px] text-slate-400">{activeIncident.updatedAt}</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300">{activeIncident.title}</p>

                        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                          {(['open', 'triage', 'mitigated', 'closed'] as const).map((st) => (
                            <Button
                              key={st}
                              size="sm"
                              variant={activeIncident.status === st ? 'default' : 'secondary'}
                              onClick={() => {
                                updateIncident(activeIncident.id, { status: st });
                                addToast(`Incident ${activeIncident.id} → ${st}`, 'info');
                              }}
                              className="text-[10px] sm:text-xs flex-1 sm:flex-none"
                            >
                              {st}
                            </Button>
                          ))}
                        </div>

                        <div className={cn('p-2 rounded', darkMode ? 'bg-slate-800/40' : 'bg-gray-50')}>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1">RACI</p>
                          <p className="text-[10px] sm:text-xs text-slate-300">
                            A={activeIncident.raci.A} • R={activeIncident.raci.R} • C={activeIncident.raci.C} • I={activeIncident.raci.I}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            placeholder="Ajouter une note…"
                            className={cn(
                              'flex-1 rounded px-2 py-2 text-xs sm:text-sm border',
                              darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                            )}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const v = (e.currentTarget.value || '').trim();
                                if (!v) return;
                                addIncidentNote(activeIncident.id, v);
                                e.currentTarget.value = '';
                                addToast('Note ajoutée', 'success');
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const payload = {
                                ...activeIncident,
                                exportedAt: new Date().toISOString(),
                              };
                              downloadTextFile(`incident_${activeIncident.id}.json`, JSON.stringify(payload, null, 2), 'application/json');
                              addToast('Incident exporté (JSON)', 'success');
                            }}
                            className="text-xs"
                          >
                            Export
                          </Button>
                        </div>

                        <div className="max-h-[160px] overflow-auto pr-1 space-y-2">
                          {activeIncident.notes.slice(0, 20).map((n, idx) => (
                            <div key={idx} className={cn('p-2 rounded border', darkMode ? 'border-slate-700' : 'border-slate-200')}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] sm:text-[10px] text-slate-400">{n.by}</span>
                                <span className="font-mono text-[9px] text-slate-400">{n.at}</span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-slate-300 mt-1">{n.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-slate-400">Aucun incident sélectionné. Crée-en un depuis un log important.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-6 sm:p-8 text-center">
                <span className="text-3xl sm:text-4xl mb-4 block">🧠</span>
                <p className="text-slate-300 font-bold text-xs sm:text-sm">Sélectionne un log</p>
                <p className="text-slate-400 text-[10px] sm:text-sm mt-2">
                  Ensuite tu as la corrélation, l'incident, et l'evidence pack.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

              {/* Footer hint responsive */}
              <Card className="border-slate-700/50">
                <CardContent className="p-2 sm:p-3 text-[10px] sm:text-xs text-slate-400">
                  🧪 Pro tip: utilise la query comme une console pro. Exemple: <span className="font-mono">category:auth "failed" user:USR-001</span> •
                  <span className="font-mono"> level:critical || level:security</span> • <span className="font-mono">entity:Invoice#INV-2025-001</span>.
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Total: {stats.total} logs</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">Aujourd'hui: {stats.today}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              Critiques: {stats.critical} • Sécurité: {stats.security}
            </span>
            {integrityScan.total > 0 && (
              <>
                <span className="text-slate-700">•</span>
                <span className={cn(
                  'text-xs',
                  integrityScan.mismatch > 0 ? 'text-red-400' : 'text-emerald-400'
                )}>
                  Intégrité: {integrityScan.mismatch > 0 ? `${integrityScan.mismatch} mismatch` : 'OK'}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Connecté</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Command Palette */}
      <SystemLogsCommandPalette />

      {/* Modals */}
      <SystemLogsModals />

      {/* Detail Panel */}
      <SystemLogsDetailPanel />
    </div>
  );
}

function SystemLogsFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

export default function SystemLogsPage() {
  return (
    <Suspense fallback={<SystemLogsFallback />}>
      <SystemLogsPageContent />
    </Suspense>
  );
}
