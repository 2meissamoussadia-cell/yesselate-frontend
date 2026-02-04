/**
 * Qualité — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function QualitePage() {
  redirect('/maitre-ouvrage/qualite/outlook');
}
