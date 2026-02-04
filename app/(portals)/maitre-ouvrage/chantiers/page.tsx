/**
 * Chantiers — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function ChantiersPage() {
  redirect('/maitre-ouvrage/chantiers/outlook');
}
