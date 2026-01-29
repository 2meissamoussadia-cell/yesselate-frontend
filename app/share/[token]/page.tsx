/**
 * Page publique de partage sécurisé (lien 7 jours).
 * Client : voit uniquement son/ses chantier(s). Associé : voit tout.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Chantier {
  id: string;
  nom: string;
  prestation: string;
  avancement: number;
  risque: string;
}

interface ShareData {
  role: string;
  expiresAt: string;
  chantiers: Chantier[];
  scope?: string;
}

export default function ShareTokenPage() {
  const params = useParams();
  const token = params?.token as string;
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Lien invalide');
      setLoading(false);
      return;
    }
    fetch(`/api/share/${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Lien expiré ou invalide' : 'Erreur');
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-center max-w-md">
          <h1 className="text-lg font-semibold text-slate-200 mb-2">Lien de partage</h1>
          <p className="text-slate-400 text-sm">{error || 'Données indisponibles.'}</p>
          <p className="text-slate-500 text-xs mt-3">Ce lien a peut-être expiré (durée 7 jours).</p>
        </div>
      </div>
    );
  }

  const isClient = data.role === 'client';
  const expiresAt = new Date(data.expiresAt);
  const isExpired = expiresAt.getTime() < Date.now();

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="rounded-xl border border-amber-800/50 bg-slate-900/80 p-6 text-center max-w-md">
          <h1 className="text-lg font-semibold text-amber-200 mb-2">Lien expiré</h1>
          <p className="text-slate-400 text-sm">Ce lien de partage n’est plus valide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-4xl mx-auto p-6">
        <header className="border-b border-slate-800 pb-4 mb-6">
          <h1 className="text-xl font-semibold text-slate-50">
            Partage sécurisé {isClient ? '(vue client)' : '(vue associé)'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Valide jusqu’au {expiresAt.toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
          </p>
        </header>

        <section>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
            Chantiers
          </h2>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Id</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Prestation</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-300">Avancement</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Risque</th>
                </tr>
              </thead>
              <tbody>
                {data.chantiers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono text-slate-400">{c.id}</td>
                    <td className="py-3 px-4">{c.nom}</td>
                    <td className="py-3 px-4 text-slate-400">{c.prestation}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={cn(
                          'font-medium',
                          c.avancement >= 80 ? 'text-emerald-400' : c.avancement >= 50 ? 'text-amber-400' : 'text-slate-400'
                        )}
                      >
                        {c.avancement} %
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded',
                          c.risque === 'faible' && 'bg-emerald-500/20 text-emerald-300',
                          c.risque === 'moyen' && 'bg-amber-500/20 text-amber-300',
                          c.risque === 'élevé' && 'bg-red-500/20 text-red-300'
                        )}
                      >
                        {c.risque}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.chantiers.length === 0 && (
            <p className="text-slate-500 text-sm py-6 text-center">Aucun chantier à afficher.</p>
          )}
        </section>
      </div>
    </div>
  );
}
