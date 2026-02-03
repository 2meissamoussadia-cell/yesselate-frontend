/**
 * HTTP helpers for Pilotage module APIs
 * - Consistent error handling
 * - Typed JSON parsing
 */
export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
} & T;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export type FetchJsonOptions = RequestInit & {
  signal?: AbortSignal;
  /** Query params (serialisés en query string). Les tableaux sont envoyés en répétant la clé. */
  params?: Record<string, string | number | boolean | undefined | string[]>;
};

export function buildApiUrl(endpoint: string, params?: FetchJsonOptions['params']): string {
  const base = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (!params || Object.keys(params).length === 0) return base;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => sp.append(k, String(item)));
    } else {
      sp.set(k, String(v));
    }
  }
  const qs = sp.toString();
  return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
}

function buildUrl(endpoint: string, params?: FetchJsonOptions['params']): string {
  return buildApiUrl(endpoint, params);
}

export async function fetchJson<T>(
  endpoint: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const { params, ...init } = options;
  const url = buildUrl(endpoint, params);

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  const text = await res.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const msg =
      (payload && typeof payload === 'object' && 'error' in payload && typeof (payload as any).error === 'string'
        ? (payload as any).error
        : `HTTP ${res.status}`) || `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload as T;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}


