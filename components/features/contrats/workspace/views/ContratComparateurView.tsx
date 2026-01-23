'use client';

import React, { useMemo, useState } from 'react';
import { contractsToSign } from '@/lib/data';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  GitCompare,
  Plus,
  X,
  ArrowLeftRight,
  Check,
  Minus,
  AlertTriangle,
} from 'lucide-react';

// Utils
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const raw = String(v ?? '').replace(/\s/g, '').replace(/FCFA|XOF/gi, '').replace(/[^\d,.-]/g, '');
  return Number(raw.replace(/,/g, '')) || 0;
};

const formatFCFA = (v: unknown): string => {
  const n = parseMoney(v);
  return `${n.toLocaleString('fr-FR')} F`;
};

export function ContratComparateurView({ tabId }: { tabId: string }) {
  const [selectedIds, setSelectedIds] = useState<[string | null, string | null]>([null, null]);

  const contracts = useMemo(() => contractsToSign, []);

  const contract1 = useMemo(() => {
    return selectedIds[0] ? contracts.find((c) => c.id === selectedIds[0]) : null;
  }, [contracts, selectedIds]);

  const contract2 = useMemo(() => {
    return selectedIds[1] ? contracts.find((c) => c.id === selectedIds[1]) : null;
  }, [contracts, selectedIds]);

  const comparison = useMemo(() => {
    if (!contract1 || !contract2) return null;

    const fields = [
      { key: 'type', label: 'Type' },
      { key: 'subject', label: 'Objet' },
      { key: 'partner', label: 'Partenaire' },
      { key: 'bureau', label: 'Bureau' },
      { key: 'preparedBy', label: 'Préparé par' },
      { key: 'amount', label: 'Montant', format: formatFCFA },
      { key: 'date', label: 'Date' },
      { key: 'expiry', label: 'Expiration' },
      { key: 'status', label: 'Statut' },
    ];

    return fields.map((f) => {
      const v1 = (contract1 as any)[f.key] ?? '—';
      const v2 = (contract2 as any)[f.key] ?? '—';
      const formatted1 = f.format ? f.format(v1) : String(v1);
      const formatted2 = f.format ? f.format(v2) : String(v2);
      const same = formatted1 === formatted2;

      return {
        ...f,
        value1: formatted1,
        value2: formatted2,
        same,
      };
    });
  }, [contract1, contract2]);

  const handleSelect = (index: 0 | 1, id: string) => {
    setSelectedIds((prev) => {
      const next = [...prev] as [string | null, string | null];
      next[index] = id;
      return next;
    });
  };

  const handleSwap = () => {
    setSelectedIds(([a, b]) => [b, a]);
  };

  const handleClear = (index: 0 | 1) => {
    setSelectedIds((prev) => {
      const next = [...prev] as [string | null, string | null];
      next[index] = null;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-500" />
            Comparateur de contrats
          </h2>
          <p className="text-sm text-slate-500">
            Comparez deux contrats côte à côte pour identifier les différences
          </p>
        </div>
        <FluentButton variant="secondary" size="sm" onClick={handleSwap} disabled={!contract1 || !contract2}>
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Inverser
        </FluentButton>
      </div>

      {/* Sélecteurs */}
      <div className="grid grid-cols-2 gap-6">
        {[0, 1].map((index) => {
          const selected = selectedIds[index as 0 | 1];
          const contract = index === 0 ? contract1 : contract2;

          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  Contrat {index + 1}
                </h3>
                {selected && (
                  <button
                    onClick={() => handleClear(index as 0 | 1)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              {contract ? (
                <div className="p-4 rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20">
                  <div className="font-mono font-bold text-purple-700 dark:text-purple-300">
                    {contract.id}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {contract.subject}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {(contract as any).partner}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <select
                    value=""
                    onChange={(e) => handleSelect(index as 0 | 1, e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  >
                    <option value="" disabled>Sélectionner un contrat...</option>
                    {contracts
                      .filter((c) => c.id !== selectedIds[index === 0 ? 1 : 0])
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} - {c.subject}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparaison */}
      {comparison ? (
        <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-1/4">
                  Champ
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-1/3">
                  {contract1?.id}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-16">
                  =?
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-1/3">
                  {contract2?.id}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
              {comparison.map((row) => (
                <tr
                  key={row.key}
                  className={cn(
                    'transition-colors',
                    !row.same && 'bg-amber-50/50 dark:bg-amber-900/10',
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-sm">{row.value1}</td>
                  <td className="px-4 py-3 text-center">
                    {row.same ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{row.value2}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Résumé */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/70 dark:border-slate-700">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{comparison.filter((r) => r.same).length} identiques</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>{comparison.filter((r) => !r.same).length} différents</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-200/70 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
          <GitCompare className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Sélectionnez deux contrats
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Utilisez les sélecteurs ci-dessus pour choisir les contrats à comparer
          </p>
        </div>
      )}
    </div>
  );
}

