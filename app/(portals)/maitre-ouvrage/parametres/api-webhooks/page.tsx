/**
 * Phase 3 #24 — API publique & Webhooks
 * Page Paramètres > API & Webhooks : clé API, liste des webhooks, ajout d'un webhook
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Key, Webhook, Plus, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type WebhookRow = {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered: string | null;
};

export default function ApiWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch('/api/webhooks');
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks ?? []);
      }
    } catch {
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleCopyApiKey = useCallback(() => {
    navigator.clipboard.writeText('ys_live_••••••••••••••••••••');
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  }, []);

  const handleAddWebhook = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/webhooks/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim() || 'Nouveau webhook',
          url: newUrl.trim(),
          events: ['calendar.event.created', 'analytics.alert.triggered'],
        }),
      });
      if (res.ok) {
        setNewUrl('');
        setNewName('');
        fetchWebhooks();
      }
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  }, [newUrl, newName, fetchWebhooks]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8 px-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">API & Webhooks</h1>
        <p className="mt-1 text-sm text-slate-400">
          Clé API et webhooks pour intégrer des systèmes externes (Phase 3 #24).
        </p>
      </div>

      {/* Clé API */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-200">
          <Key className="h-5 w-5 text-amber-400" />
          Clé API
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Utilisez cette clé pour authentifier les requêtes vers l&apos;API publique (headers <code className="rounded bg-slate-800 px-1 text-xs">Authorization: Bearer &lt;clé&gt;</code>).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-slate-800 px-4 py-2 font-mono text-sm text-slate-300">
            ys_live_••••••••••••••••••••
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyApiKey}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            {apiKeyCopied ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
            {apiKeyCopied ? 'Copié' : 'Copier'}
          </Button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Régénération et documentation complète disponibles dans la version entreprise.
        </p>
      </section>

      {/* Webhooks */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-200">
          <Webhook className="h-5 w-5 text-sky-400" />
          Webhooks
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Recevez des notifications HTTP (POST) lorsque des événements se produisent (création d&apos;événement, alerte, délégation, etc.).
        </p>

        <form onSubmit={handleAddWebhook} className="mt-6 flex flex-wrap gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
          <input
            type="text"
            placeholder="Nom du webhook"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 w-48"
          />
          <input
            type="url"
            placeholder="https://votre-serveur.com/webhook"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500"
          />
          <Button type="submit" disabled={adding || !newUrl.trim()} size="sm" className="bg-sky-600 hover:bg-sky-500">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </form>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Chargement...</p>
        ) : webhooks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucun webhook configuré.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {webhooks.map((wh) => (
              <li
                key={wh.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4',
                  wh.active ? 'border-slate-600 bg-slate-800/30' : 'border-slate-700/50 bg-slate-800/20 opacity-75'
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-200">{wh.name}</p>
                  <p className="truncate text-xs text-slate-400">{wh.url}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Événements : {wh.events.join(', ')} • Dernier déclenchement : {wh.lastTriggered ?? '—'}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    wh.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600 text-slate-400'
                  )}
                >
                  {wh.active ? 'Actif' : 'Inactif'}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-slate-500">
          <Link href="/api/webhooks" className="text-sky-400 hover:underline inline-flex items-center gap-1">
            Recevoir des webhooks (POST) <ExternalLink className="h-3 w-3" />
          </Link>
          {' — '}
          Événements supportés : calendar.event.*, delegation.*, analytics.alert.triggered, demande.*
        </p>
      </section>
    </div>
  );
}
