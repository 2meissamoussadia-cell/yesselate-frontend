'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type Props = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

type State = { hasError: boolean; error?: unknown };

export class ClientErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className={cn('p-6', this.props.className)}>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5">
          <div className="text-sm font-medium text-slate-200">
            {this.props.title ?? 'Une erreur est survenue'}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            La page a rencontré un problème inattendu. Rechargez, ou réessayez l'action.
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Réessayer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200"
              onClick={() => window.location.reload()}
            >
              Recharger
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

