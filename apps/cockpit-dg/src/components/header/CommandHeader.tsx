'use client';

import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import { AiBriefing } from './AiBriefing';
import { SmartSearch } from './SmartSearch';
import { VoiceCommands } from './VoiceCommands';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Dashboard 360°' },
  { href: '/chantiers', label: 'Chantiers' },
  { href: '/workflow', label: 'Workflow' },
];

export function CommandHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      )}
    >
      <div className="flex h-[80px] items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground hover:opacity-90"
        >
          <span className="text-lg">NICE RÉNOVATION</span>
          <span className="hidden text-muted-foreground sm:inline">— Cockpit DG</span>
        </Link>

        {/* AI Briefing */}
        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <AiBriefing />
        </div>

        {/* Right: Search, Voice, Notifications, User */}
        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          <SmartSearch />
          <VoiceCommands />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-danger-foreground">
              0
            </span>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Menu utilisateur" asChild>
            <Link href="/login">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile: briefing below */}
      <div className="flex border-t px-4 py-2 md:hidden">
        <AiBriefing />
      </div>

      {/* Nav */}
      <nav className="flex border-t px-4 py-2">
        <div className="flex gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-auto rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Connexion
          </Link>
        </div>
      </nav>
    </header>
  );
}
