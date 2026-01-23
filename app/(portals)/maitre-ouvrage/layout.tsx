import type { ReactNode } from 'react';
import { BMOAppShell } from '@/components/bmo/BMOAppShell';
import { FluentProviderClient } from '@/components/shared/FluentProviderClient';

export default function MaitreOuvrageLayout({ children }: { children: ReactNode }) {
  return (
    <FluentProviderClient>
      <BMOAppShell>
      {/* Skip link (accessibilité clavier) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:rounded focus:bg-black focus:px-3 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>

      {/* Zone de scroll: doit s'adapter au layout parent (header déjà présent dans BMOLayout) */}
      <div className="w-full flex-1 min-h-0 overflow-hidden flex flex-col bg-[rgb(var(--bg))]">
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          className="
            flex-1 min-h-0
            overflow-y-auto overscroll-contain scrollbar-gutter-stable scrollbar-subtle
            pb-[env(safe-area-inset-bottom)]
            focus:outline-none
            bg-[rgb(var(--bg))]
          "
          style={{
            // évite les sauts de layout quand la scrollbar apparaît/disparaît
            scrollbarGutter: 'stable',
          }}
        >
          {children}
        </main>
      </div>
      </BMOAppShell>
    </FluentProviderClient>
  );
}
