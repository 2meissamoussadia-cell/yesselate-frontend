/**
 * Autorisations — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function AutorisationsPage() {
  redirect('/maitre-ouvrage/autorisations/outlook');
}
