/**
 * Foncier — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function FoncierPage() {
  redirect('/maitre-ouvrage/foncier/outlook');
}
