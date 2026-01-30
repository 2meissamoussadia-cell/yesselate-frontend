"use client";

/**
 * BtpSecurityWidget — Widget Sécurité SAP BTP (contrôle d'accès, logs, vulnérabilités, conformité).
 * À afficher dans Administration / Sécurité ou onglet Cockpit DG.
 */

import { ShieldCheck, AlertTriangle, UserCheck } from "lucide-react";

interface BtpSecurityWidgetProps {
  /** Nombre d'événements critiques à analyser (ex. jour) */
  criticalEventsCount?: number;
  /** Score de conformité globale (0–100) */
  compliancePercent?: number;
}

export function BtpSecurityWidget({
  criticalEventsCount = 3,
  compliancePercent = 92,
}: BtpSecurityWidgetProps) {
  return (
    <section className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 text-xs text-slate-200">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">Sécurité SAP BTP</h2>
        </div>
        <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200">
          Conformité globale : {compliancePercent} %
        </span>
      </header>

      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-slate-400 shrink-0" />
          <span>Contrôles d'accès : rôles BTP alignés avec BMO (least privilege).</span>
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
          <span>Chiffrement activé (TLS, stockage chiffré) pour toutes les destinations.</span>
        </li>
        <li className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            Journalisation & audit : {criticalEventsCount} événement(s) critique(s) à analyser
            aujourd&apos;hui.
          </span>
        </li>
      </ul>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 text-[0.7rem]"
        >
          Ouvrir les logs BTP
        </button>
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 text-[0.7rem]"
        >
          Revue des rôles
        </button>
      </div>
    </section>
  );
}
