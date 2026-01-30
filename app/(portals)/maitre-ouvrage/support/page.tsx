'use client';

/**
 * Aide & Support — Route canonique sidebar BMO (/maitre-ouvrage/support).
 * Tutoriels, documentation, fil conducteur phases 0→10.
 */

import { BusinessWindow } from '@/components/ui/BusinessWindow';
import { OnboardingModule } from '@/components/onboarding';

export default function SupportPage() {
  return (
    <BusinessWindow title="Aide & Support">
      <p className="text-sm text-slate-400 mb-4">
        Tutoriels vidéo, documentation intégrée et support. Fil conducteur BTP phases 0→10.
      </p>
      <OnboardingModule />
    </BusinessWindow>
  );
}
