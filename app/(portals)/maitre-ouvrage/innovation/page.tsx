/**
 * Phase 4 — Innovation : hub Vue 3D, IoT, traçabilité
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Activity, Shield, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/maitre-ouvrage/innovation/vue-3d', label: 'Vue 3D / Visite virtuelle', icon: Box, desc: 'Scène 3D chantier (Three.js), fondation AR/VR' },
  { href: '/maitre-ouvrage/innovation/iot', label: 'IoT & capteurs', icon: Activity, desc: 'Température, humidité, équipements (mock)' },
  { href: '/maitre-ouvrage/parametres/api-webhooks', label: 'API & Webhooks', icon: Shield, desc: 'Clé API, webhooks, traçabilité' },
];

export default function InnovationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Innovation (Phase 4)</h1>
        <p className="text-sm text-slate-400 mt-1">
          Vue 3D, IoT, blockchain traçabilité, multi-tenancy — fondations et démos.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-xl border border-slate-700/50 bg-slate-800/30 p-6',
                'hover:border-sky-500/50 hover:bg-slate-800/50 transition-colors',
                'flex flex-col gap-3'
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-sky-400" />
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </div>
              <h2 className="font-semibold text-slate-200">{item.label}</h2>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
