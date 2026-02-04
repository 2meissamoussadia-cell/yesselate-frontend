/**
 * Gouvernance — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function GovernancePage() {
  redirect('/maitre-ouvrage/governance/outlook');
}
