'use client';

/**
 * Aide & Support — Onboarding, tutoriels, documentation.
 */

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { OnboardingModule } from '@/components/onboarding';

export default function AidePage() {
  return (
    <PageTemplate
      title="Aide & Support"
      description="Tutoriels vidéo, documentation intégrée et support."
    >
      <div className="space-y-6">
        <OnboardingModule />
      </div>
    </PageTemplate>
  );
}
