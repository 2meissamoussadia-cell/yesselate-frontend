'use client';

import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FluentButton } from '@/components/ui/fluent-button';

export interface PageUnderConstructionProps {
  title: string;
  description?: string;
  expectedDate?: string;
}

export function PageUnderConstruction({ 
  title, 
  description = "Cette page est en cours de développement.", 
  expectedDate 
}: PageUnderConstructionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0a] dark:via-[#141414] dark:to-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6">
            <Construction className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            {title}
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
            {description}
          </p>
          
          {expectedDate && (
            <p className="text-sm text-slate-400 dark:text-slate-400 mb-8">
              Disponibilité prévue : {expectedDate}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/maitre-ouvrage">
              <FluentButton variant="secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au portail
              </FluentButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

