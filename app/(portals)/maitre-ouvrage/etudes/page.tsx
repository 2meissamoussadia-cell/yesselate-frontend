/**
 * Études — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function EtudesPage() {
  redirect('/maitre-ouvrage/etudes/outlook');
}
