/**
 * Demandes — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function DemandesPage() {
  redirect('/maitre-ouvrage/demandes/outlook');
}
