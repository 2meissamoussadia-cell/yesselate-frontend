'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EtudesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <AlertCircle className="h-12 w-12 text-rose-500" />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Erreur chargement études
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
        {error.message}
      </p>
      <Button variant="outline" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
