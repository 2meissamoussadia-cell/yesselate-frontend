'use client';

/**
 * OnboardingModule — Onboarding & formation (tutoriels, documentation, support).
 * Formation personnalisée par profil DG, MOA, MOE, OPC.
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Video, BookOpen, HelpCircle } from 'lucide-react';

export interface OnboardingModuleProps {
  className?: string;
}

const tutorials = [
  { label: "Introduction à l'ERP BTP", href: '#' },
  { label: "Utilisation du cockpit DG", href: '#' },
  { label: "Gestion des chantiers et programmes", href: '#' },
  { label: "Alertes et arbitrages", href: '#' },
  { label: "Documents et contrats", href: '#' },
];

const documentation = [
  { label: 'Guide utilisateur', href: '#' },
  { label: 'FAQ', href: '#' },
  { label: 'Raccourcis clavier', href: '#' },
];

export function OnboardingModule({ className }: OnboardingModuleProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-semibold text-slate-100">
        Onboarding & Formation
      </h3>
      <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 space-y-4">
        <section>
          <h4 className="text-xs font-medium text-slate-100 flex items-center gap-2">
            <Video className="h-4 w-4 text-slate-400" aria-hidden />
            Tutoriels vidéo
          </h4>
          <ul className="mt-2 space-y-1.5">
            {tutorials.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="text-xs font-medium text-slate-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" aria-hidden />
            Documentation
          </h4>
          <ul className="mt-2 space-y-1.5">
            {documentation.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="text-xs font-medium text-slate-100 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-slate-400" aria-hidden />
            Support
          </h4>
          <p className="mt-2 text-xs text-slate-400">
            Contactez le support technique ou utilisez le chatbot d’aide depuis l’interface.
          </p>
        </section>
      </div>
    </div>
  );
}
